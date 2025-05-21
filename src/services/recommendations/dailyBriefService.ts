/**
 * Daily Brief Service
 * Creates personalized AI-powered daily briefs based on user interests and activity
 */

import { OpenAI } from 'openai';
import { dailyBriefRepository } from '../../models/DailyBriefRepository';
import { recommendationService } from './recommendationService';
import { embeddingService } from '../search/embeddingService';
import { emailService } from '../email/emailService';
import logger from '../../config/logger';
import env from '../../config/environment';
import db from '../../config/database';
import { BriefItem, DailyBrief, UserBriefPreferences } from '../../models/DailyBriefRepository';

class DailyBriefService {
  private openai: OpenAI;
  private aiModel: string = 'gpt-4-turbo';

  constructor() {
    if (!env.OPENAI_API_KEY) {
      logger.warn('OpenAI API key not provided. AI-powered briefs will not work correctly.');
    }

    this.openai = new OpenAI({
      apiKey: env.OPENAI_API_KEY
    });
  }

  /**
   * Generate a daily brief for a user
   */
  async generateBrief(userId: string): Promise<DailyBrief | null> {
    try {
      logger.info(`Generating daily brief for user ${userId}`);

      // Get user preferences for their brief
      const preferences = await dailyBriefRepository.getUserBriefPreferences(userId);
      
      // Skip if user has disabled briefs
      if (!preferences.enabled) {
        logger.info(`User ${userId} has disabled daily briefs`);
        return null;
      }

      // Get user's recommended content based on their interests
      const items = await this.collectBriefItems(userId, preferences);
      
      if (items.length === 0) {
        logger.info(`No relevant items found for user ${userId}'s brief`);
        return null;
      }

      // Generate an AI summary of the collected items
      const [title, summary] = await this.generateBriefSummary(items);

      // Create the brief in the database
      const brief = await dailyBriefRepository.createBrief(
        userId,
        title,
        summary,
        { itemCount: items.length }
      );

      // Add items to the brief
      const briefItems = items.map((item, index) => ({
        brief_id: brief.id,
        content_type: item.contentType,
        content_id: item.contentId,
        title: item.title,
        summary: item.summary,
        relevance_score: item.relevanceScore,
        position: index,
        metadata: item.metadata || {}
      }));

      await dailyBriefRepository.addBriefItems(briefItems);

      // Send email if user has opted in for email delivery
      if (preferences.email_delivery) {
        await this.sendBriefEmail(userId, brief, briefItems);
      }

      logger.info(`Daily brief generated successfully for user ${userId}`);
      return brief;
    } catch (error) {
      logger.error(`Error generating daily brief for user ${userId}:`, error);
      return null;
    }
  }

  /**
   * Collect items for the daily brief based on user preferences and interests
   */
  private async collectBriefItems(
    userId: string, 
    preferences: UserBriefPreferences
  ): Promise<Array<{
    contentType: string;
    contentId: string;
    title: string;
    body?: string;
    summary: string;
    relevanceScore: number;
    metadata?: Record<string, any>;
  }>> {
    try {
      const numericUserId = parseInt(userId);
      const maxItems = preferences.max_items || 10;
      const contentTypes = preferences.content_types || ['tools', 'topics', 'discussions'];
      
      // Get personalized recommendations from recommendation service
      const recommendedContent = await recommendationService.getRecommendations(numericUserId, {
        limit: Math.max(10, maxItems),
        includeContentTypes: ['post', 'question', 'tutorial'],
        freshContentRatio: 0.3
      });
      
      // Convert the recommended content to brief items
      const contentItems = recommendedContent.map(content => ({
        contentType: 'content',
        contentId: content.id,
        title: content.title,
        body: content.body,
        summary: '', // Will be filled by AI
        relevanceScore: 1.0,
        metadata: {
          author: content.author_name,
          tags: content.tags,
          upvotes: content.upvotes,
          type: content.type
        }
      }));
      
      // If tools are enabled, get recommended tools
      let toolItems: any[] = [];
      if (contentTypes.includes('tools')) {
        // Get popular or relevant tools
        const tools = await this.getRelevantTools(numericUserId, Math.floor(maxItems / 4));
        toolItems = tools.map(tool => ({
          contentType: 'tool',
          contentId: tool.id,
          title: tool.name,
          body: tool.description,
          summary: '', // Will be filled by AI
          relevanceScore: 0.9,
          metadata: {
            logo_url: tool.logo_url,
            website_url: tool.website_url,
            features: tool.features,
            tags: tool.tags
          }
        }));
      }
      
      // If topics are enabled, get active topics
      let topicItems: any[] = [];
      if (contentTypes.includes('topics')) {
        // Get active or trending topics
        const topics = await this.getActiveTrendingTopics(Math.floor(maxItems / 5));
        topicItems = topics.map(topic => ({
          contentType: 'topic',
          contentId: topic.id,
          title: topic.name,
          body: topic.description,
          summary: '', // Will be filled by AI
          relevanceScore: 0.8,
          metadata: {
            slug: topic.slug,
            post_count: topic.post_count
          }
        }));
      }
      
      // Combine all items and sort by relevance
      let allItems = [...contentItems, ...toolItems, ...topicItems];
      allItems.sort((a, b) => b.relevanceScore - a.relevanceScore);
      
      // Limit to max items
      allItems = allItems.slice(0, maxItems);
      
      // Generate summaries for all items using AI
      const summaries = await this.generateItemSummaries(allItems);
      
      // Add summaries to items
      allItems = allItems.map((item, index) => ({
        ...item,
        summary: summaries[index] || 'No summary available.'
      }));
      
      return allItems;
    } catch (error) {
      logger.error('Error collecting brief items:', error);
      return [];
    }
  }

  /**
   * Get relevant tools for a user
   */
  private async getRelevantTools(userId: number, limit: number): Promise<any[]> {
    try {
      // Query to get tools based on user interests or trending tools
      const result = await db.query(`
        WITH user_interests AS (
          SELECT tag_id 
          FROM user_tag_follows
          WHERE user_id = $1
        ),
        tool_scores AS (
          SELECT 
            t.id,
            t.name,
            t.description,
            t.logo_url,
            t.website_url,
            t.features,
            t.upvotes,
            COUNT(DISTINCT tt.tag_id) FILTER (
              WHERE tt.tag_id IN (SELECT tag_id FROM user_interests)
            ) as interest_match,
            COUNT(DISTINCT r.id) as review_count,
            ARRAY(
              SELECT tag.name 
              FROM tags tag
              JOIN tool_tags tt ON tag.id = tt.tag_id
              WHERE tt.tool_id = t.id
            ) as tags
          FROM tools t
          LEFT JOIN tool_tags tt ON t.id = tt.tool_id
          LEFT JOIN tool_reviews r ON t.id = r.tool_id
          WHERE t.status = 'active'
          GROUP BY t.id
          ORDER BY 
            interest_match DESC,
            t.upvotes DESC,
            review_count DESC
          LIMIT $2
        )
        SELECT * FROM tool_scores
      `, [userId, limit]);
      
      return result.rows;
    } catch (error) {
      logger.error('Error getting relevant tools:', error);
      return [];
    }
  }

  /**
   * Get active or trending topics
   */
  private async getActiveTrendingTopics(limit: number): Promise<any[]> {
    try {
      // Query to get active topics with recent content
      const result = await db.query(`
        SELECT 
          t.id,
          t.name,
          t.slug,
          t.description,
          COUNT(DISTINCT c.id) as post_count,
          MAX(c.created_at) as latest_post
        FROM topics t
        JOIN content_topics ct ON t.id = ct.topic_id
        JOIN content c ON ct.content_id = c.id
        WHERE c.created_at > NOW() - INTERVAL '7 days'
        GROUP BY t.id
        ORDER BY post_count DESC, latest_post DESC
        LIMIT $1
      `, [limit]);
      
      return result.rows;
    } catch (error) {
      logger.error('Error getting active topics:', error);
      return [];
    }
  }

  /**
   * Generate AI summaries for brief items
   */
  private async generateItemSummaries(items: any[]): Promise<string[]> {
    try {
      if (!env.OPENAI_API_KEY) {
        return items.map(() => 'Summary not available.');
      }
      
      // Create prompts for each item
      const itemTexts = items.map(item => {
        const contentType = item.contentType;
        const title = item.title;
        const body = item.body?.substring(0, 1000) || ''; // Limit length
        
        if (contentType === 'tool') {
          const features = Array.isArray(item.metadata?.features) 
            ? item.metadata.features.join(', ') 
            : (typeof item.metadata?.features === 'object' 
              ? Object.values(item.metadata?.features || {}).join(', ') 
              : '');
          
          const tags = Array.isArray(item.metadata?.tags)
            ? item.metadata.tags.join(', ')
            : '';
            
          return `Tool: ${title}\nDescription: ${body}\nFeatures: ${features}\nTags: ${tags}`;
        } 
        else if (contentType === 'topic') {
          return `Topic: ${title}\nDescription: ${body}\nRecent posts: ${item.metadata?.post_count || 0}`;
        }
        else {
          // Content
          const author = item.metadata?.author || 'Unknown';
          const type = item.metadata?.type || 'post';
          const tags = Array.isArray(item.metadata?.tags)
            ? item.metadata.tags.join(', ')
            : '';
            
          return `${type.charAt(0).toUpperCase() + type.slice(1)}: ${title}\nAuthor: ${author}\nContent: ${body}\nTags: ${tags}`;
        }
      });
      
      // Set up the batch processing of summaries
      const summaries: string[] = [];
      const batchSize = 5; // Process in small batches to avoid token limits
      
      for (let i = 0; i < itemTexts.length; i += batchSize) {
        const batch = itemTexts.slice(i, i + batchSize);
        
        const response = await this.openai.chat.completions.create({
          model: this.aiModel,
          messages: [
            {
              role: 'system',
              content: `You are an AI assistant that creates concise, informative summaries 
              of content for a personalized daily brief. Keep summaries to 1-2 sentences and 
              focus on the most relevant information and why it might be interesting.`
            },
            {
              role: 'user',
              content: `Create brief summaries (1-2 sentences each) for the following items. 
              Include only the summary text with no prefixes or explanations.
              
              ${batch.map((text, idx) => `ITEM ${i + idx + 1}:\n${text}`).join('\n\n')}`
            }
          ],
          temperature: 0.7,
        });
        
        // Extract the summaries
        const content = response.choices[0].message.content || '';
        
        // Split the content into separate summaries
        const batchSummaries = this.splitSummaries(content, batch.length);
        summaries.push(...batchSummaries);
      }
      
      return summaries;
    } catch (error) {
      logger.error('Error generating item summaries:', error);
      // Return placeholder summaries
      return items.map(item => {
        if (item.contentType === 'tool') {
          return `A helpful tool for developers working with ${item.title.toLowerCase()}.`;
        } else if (item.contentType === 'topic') {
          return `An active topic with recent discussions about ${item.title.toLowerCase()}.`;
        } else {
          return `A ${item.metadata?.type || 'post'} about ${item.title.toLowerCase()}.`;
        }
      });
    }
  }

  /**
   * Split content into separate summaries
   */
  private splitSummaries(content: string, count: number): string[] {
    // Attempt to split by ITEM n: patterns
    const itemPattern = /ITEM\s+\d+\s*:\s*/i;
    if (content.match(itemPattern)) {
      const parts = content.split(itemPattern).filter(p => p.trim());
      if (parts.length === count) {
        return parts.map(p => p.trim());
      }
    }
    
    // Attempt to split by blank lines
    const lines = content.split(/\n{2,}/);
    if (lines.length === count) {
      return lines.map(l => l.trim());
    }
    
    // Attempt to split by numeric markers
    const numericPattern = /^\s*\d+\s*[.:\)]\s*/;
    if (content.split(numericPattern).length > 1) {
      const parts = content.split(/\n/).filter(l => l.trim());
      const summaries: string[] = [];
      let currentSummary = '';
      
      for (const part of parts) {
        if (part.match(numericPattern)) {
          if (currentSummary) {
            summaries.push(currentSummary.trim());
          }
          currentSummary = part.replace(numericPattern, '');
        } else {
          currentSummary += ' ' + part;
        }
      }
      
      if (currentSummary) {
        summaries.push(currentSummary.trim());
      }
      
      if (summaries.length === count) {
        return summaries;
      }
    }
    
    // If all parsing attempts fail, just split evenly
    const avgLength = Math.floor(content.length / count);
    const summaries: string[] = [];
    
    for (let i = 0; i < count; i++) {
      const start = i * avgLength;
      const end = i === count - 1 ? content.length : (i + 1) * avgLength;
      summaries.push(content.substring(start, end).trim());
    }
    
    return summaries;
  }

  /**
   * Generate a title and overall summary for the daily brief
   */
  private async generateBriefSummary(
    items: Array<{
      contentType: string;
      contentId: string;
      title: string;
      summary: string;
      relevanceScore: number;
      metadata?: Record<string, any>;
    }>
  ): Promise<[string, string]> {
    try {
      if (!env.OPENAI_API_KEY) {
        return ['Your Daily Brief', 'A collection of content based on your interests and activity.'];
      }
      
      // Create a summary of all items
      const itemsList = items.map(item => 
        `${item.contentType.toUpperCase()}: ${item.title}
        Summary: ${item.summary}`
      ).join('\n\n');
      
      // Count the types of content
      const contentTypeCounts = items.reduce((counts, item) => {
        counts[item.contentType] = (counts[item.contentType] || 0) + 1;
        return counts;
      }, {} as Record<string, number>);
      
      // Create a prompt for the AI to generate a title and overall summary
      const response = await this.openai.chat.completions.create({
        model: this.aiModel,
        messages: [
          {
            role: 'system',
            content: `You are an AI assistant that creates engaging, personalized daily briefs. 
            Based on a collection of items, create an interesting title and a concise summary 
            that highlights the most important aspects and connections between items.`
          },
          {
            role: 'user',
            content: `Here's a collection of items for a user's daily brief:
            
            ${itemsList}
            
            Content breakdown: ${Object.entries(contentTypeCounts)
              .map(([type, count]) => `${count} ${type}${count > 1 ? 's' : ''}`)
              .join(', ')}
            
            Please generate:
            1. An engaging, personalized title for this daily brief (15 words or less)
            2. A concise overall summary (2-3 sentences) that highlights key themes and why these items might be interesting
            
            Format your response exactly as:
            TITLE: [Your title here]
            SUMMARY: [Your summary here]`
          }
        ],
        temperature: 0.7,
      });
      
      const content = response.choices[0].message.content || '';
      
      // Extract title and summary
      const titleMatch = content.match(/TITLE:\s*(.*)/i);
      const summaryMatch = content.match(/SUMMARY:\s*([\s\S]*)/i);
      
      const title = titleMatch ? titleMatch[1].trim() : 'Your Daily Brief';
      const summary = summaryMatch ? summaryMatch[1].trim() : 'A collection of content based on your interests and activity.';
      
      return [title, summary];
    } catch (error) {
      logger.error('Error generating brief summary:', error);
      return ['Your Daily Brief', 'A collection of content based on your interests and activity.'];
    }
  }

  /**
   * Send an email with the daily brief
   */
  private async sendBriefEmail(
    userId: string,
    brief: DailyBrief,
    items: Omit<BriefItem, 'id'>[]
  ): Promise<boolean> {
    try {
      // Get user details
      const userResult = await db.query(
        'SELECT email, name, username FROM users WHERE id = $1',
        [userId]
      );
      
      if (userResult.rows.length === 0 || !userResult.rows[0].email) {
        logger.warn(`Cannot send brief email: User ${userId} not found or has no email`);
        return false;
      }
      
      const user = userResult.rows[0];
      
      // Format items for the email template
      const formattedItems = items.map(item => {
        // Create a URL based on content type
        let url = `${env.FRONTEND_URL}/`;
        
        if (item.content_type === 'tool') {
          url += `tools/${item.content_id}`;
        } else if (item.content_type === 'topic') {
          url += `topics/${item.content_id}`;
        } else {
          url += `view/${item.content_id}`;
        }
        
        return {
          title: item.title,
          summary: item.summary,
          url,
          contentType: item.content_type,
          metadata: item.metadata
        };
      });
      
      // Send the email
      await emailService.sendTemplateEmail(
        user.email,
        brief.title,
        'digest', // Using the existing digest template
        {
          name: user.name,
          briefTitle: brief.title,
          briefSummary: brief.summary,
          items: formattedItems,
          count: formattedItems.length,
          profileUrl: `${env.FRONTEND_URL}/profile/${user.username}`,
          settingsUrl: `${env.FRONTEND_URL}/settings/notifications`,
          briefId: brief.id,
          generatedDate: brief.generated_at.toDateString()
        }
      );
      
      logger.info(`Daily brief email sent to user ${userId}`);
      return true;
    } catch (error) {
      logger.error('Error sending brief email:', error);
      return false;
    }
  }

  /**
   * Get existing brief for a user
   */
  async getUserBrief(userId: string): Promise<{ brief: DailyBrief, items: BriefItem[] } | null> {
    try {
      const brief = await dailyBriefRepository.getLatestBrief(userId);
      
      if (!brief) {
        return null;
      }
      
      const fullBrief = await dailyBriefRepository.getBriefWithItems(brief.id);
      return fullBrief;
    } catch (error) {
      logger.error(`Error getting brief for user ${userId}:`, error);
      return null;
    }
  }

  /**
   * Mark a brief as read
   */
  async markBriefAsRead(briefId: string, userId: string): Promise<boolean> {
    try {
      await dailyBriefRepository.markAsRead(briefId, userId);
      return true;
    } catch (error) {
      logger.error(`Error marking brief ${briefId} as read:`, error);
      return false;
    }
  }

  /**
   * Record an interaction with a brief item
   */
  async recordItemInteraction(
    itemId: string,
    userId: string,
    interactionType: 'click' | 'save' | 'share' | 'dismiss'
  ): Promise<boolean> {
    try {
      await dailyBriefRepository.recordItemInteraction(itemId, userId, interactionType);
      return true;
    } catch (error) {
      logger.error(`Error recording item interaction for ${itemId}:`, error);
      return false;
    }
  }

  /**
   * Update user brief preferences
   */
  async updateBriefPreferences(
    userId: string,
    preferences: Partial<UserBriefPreferences>
  ): Promise<UserBriefPreferences> {
    try {
      return await dailyBriefRepository.updateBriefPreferences(userId, preferences);
    } catch (error) {
      logger.error(`Error updating brief preferences for user ${userId}:`, error);
      throw error;
    }
  }
}

// Create and export a singleton instance
export const dailyBriefService = new DailyBriefService();