/**
 * Recommendation Service
 * Provides personalized content recommendations based on user behavior and preferences
 */

import { Database } from '../../config/database';
import logger from '../../config/logger';
import env from '../../config/environment';
import { embeddingService } from '../search/embeddingService';

// Constants for recommendation weighting
const WEIGHTS = {
  EXPLICIT_INTEREST: 10.0,  // Topics/tags user explicitly follows
  VIEW_HISTORY: 3.0,         // Content user has viewed
  INTERACTION: 5.0,          // Content user has interacted with (commented, upvoted)
  RECENCY: 2.0,              // More recent content
  POPULARITY: 1.5,           // Popular content (views, upvotes, comments)
  SIMILARITY: 4.0            // Semantic similarity to previously engaged content
};

// Interfaces
interface UserInterest {
  id: number;
  type: 'tag' | 'topic';
  strength: number;
}

interface RecommendationOptions {
  limit?: number;
  offset?: number;
  includeContentTypes?: string[];
  excludeIds?: number[];
  freshContentRatio?: number; // 0-1 ratio of content user hasn't seen
}

class RecommendationService {
  private db: Database;
  
  constructor() {
    this.db = Database.getInstance();
  }
  
  /**
   * Get user's explicit interests (topics and tags they follow)
   */
  async getUserExplicitInterests(userId: number): Promise<UserInterest[]> {
    try {
      // Get user's followed topics
      const followedTopics = await this.db.query(
        `SELECT topic_id as id FROM user_topic_follows WHERE user_id = $1`,
        [userId]
      );
      
      // Get user's followed tags
      const followedTags = await this.db.query(
        `SELECT tag_id as id FROM user_tag_follows WHERE user_id = $1`,
        [userId]
      );
      
      const interests: UserInterest[] = [
        ...followedTopics.rows.map(row => ({
          id: row.id,
          type: 'topic' as const,
          strength: WEIGHTS.EXPLICIT_INTEREST
        })),
        ...followedTags.rows.map(row => ({
          id: row.id,
          type: 'tag' as const,
          strength: WEIGHTS.EXPLICIT_INTEREST
        }))
      ];
      
      return interests;
    } catch (error) {
      logger.error('Error getting user explicit interests:', error);
      return [];
    }
  }
  
  /**
   * Get user's recently viewed content
   */
  async getUserViewHistory(userId: number, days: number = 30, limit: number = 50): Promise<number[]> {
    try {
      const result = await this.db.query(
        `SELECT content_id FROM user_content_views
         WHERE user_id = $1 AND viewed_at > NOW() - INTERVAL '${days} days'
         ORDER BY viewed_at DESC
         LIMIT $2`,
        [userId, limit]
      );
      
      return result.rows.map(row => row.content_id);
    } catch (error) {
      logger.error('Error getting user view history:', error);
      return [];
    }
  }
  
  /**
   * Get user's recent interactions (upvotes, comments, etc.)
   */
  async getUserInteractions(userId: number, days: number = 60, limit: number = 100): Promise<{id: number, interactionStrength: number}[]> {
    try {
      // Get content the user has interacted with (upvotes, comments, etc.)
      const result = await this.db.query(
        `SELECT 
           CASE 
             WHEN v.content_id IS NOT NULL THEN v.content_id
             WHEN c.parent_id IS NOT NULL THEN c.parent_id
             ELSE NULL
           END AS content_id,
           CASE
             WHEN v.content_id IS NOT NULL THEN ${WEIGHTS.INTERACTION} -- Upvotes
             WHEN c.id IS NOT NULL THEN ${WEIGHTS.INTERACTION * 1.5} -- Comments (higher weight)
             ELSE 0
           END AS interaction_strength
         FROM 
           (SELECT content_id, created_at FROM user_votes WHERE user_id = $1 AND content_id IS NOT NULL) v
           FULL OUTER JOIN 
           (SELECT id, parent_id, created_at FROM content WHERE author_id = $1 AND type = 'comment') c
           ON v.content_id = c.id
         WHERE 
           v.created_at > NOW() - INTERVAL '${days} days' OR 
           c.created_at > NOW() - INTERVAL '${days} days'
         ORDER BY interaction_strength DESC
         LIMIT $2`,
        [userId, limit]
      );
      
      return result.rows
        .filter(row => row.content_id !== null)
        .map(row => ({ 
          id: row.content_id, 
          interactionStrength: row.interaction_strength 
        }));
    } catch (error) {
      logger.error('Error getting user interactions:', error);
      return [];
    }
  }
  
  /**
   * Get content recommendations for a user based on their interests and behavior
   */
  async getRecommendations(
    userId: number, 
    options: RecommendationOptions = {}
  ): Promise<any[]> {
    const {
      limit = 20,
      offset = 0,
      includeContentTypes = ['post', 'question', 'tutorial'],
      excludeIds = [],
      freshContentRatio = 0.3
    } = options;

    try {
      // Collect user interest data
      const [explicitInterests, viewHistory, interactions] = await Promise.all([
        this.getUserExplicitInterests(userId),
        this.getUserViewHistory(userId),
        this.getUserInteractions(userId)
      ]);
      
      // If we have no data, fall back to trending content
      if (explicitInterests.length === 0 && viewHistory.length === 0 && interactions.length === 0) {
        logger.info(`User ${userId} has no history/interests, using trending content`);
        return this.getTrendingContent(limit, offset, includeContentTypes, excludeIds);
      }
      
      // Calculate the number of fresh vs. personalized recommendations
      const freshCount = Math.floor(limit * freshContentRatio);
      const personalizedCount = limit - freshCount;
      
      // Build our recommendation query based on collected data
      let query = `
        WITH content_scores AS (
          SELECT
            c.id,
            c.title,
            c.type,
            c.author_id,
            c.created_at,
            c.upvotes,
            c.views,
            COALESCE(SUM(CASE
      `;
      
      // Add scoring for topics
      if (explicitInterests.filter(i => i.type === 'topic').length > 0) {
        query += `
              WHEN ct.topic_id IN (${explicitInterests
                .filter(i => i.type === 'topic')
                .map(i => i.id)
                .join(',')}) THEN ${WEIGHTS.EXPLICIT_INTEREST}
        `;
      }
      
      // Add scoring for tags
      if (explicitInterests.filter(i => i.type === 'tag').length > 0) {
        query += `
              WHEN ctg.tag_id IN (${explicitInterests
                .filter(i => i.type === 'tag')
                .map(i => i.id)
                .join(',')}) THEN ${WEIGHTS.EXPLICIT_INTEREST}
        `;
      }
      
      // Add view history scoring
      if (viewHistory.length > 0) {
        query += `
              WHEN c.id IN (
                SELECT DISTINCT c2.id 
                FROM content c2
                LEFT JOIN content_tags ctg2 ON c2.id = ctg2.content_id
                LEFT JOIN content_topics ct2 ON c2.id = ct2.content_id
                WHERE 
                  (ctg2.tag_id IN (
                    SELECT ctg3.tag_id 
                    FROM content_tags ctg3 
                    WHERE ctg3.content_id IN (${viewHistory.join(',')})
                  ) OR
                  ct2.topic_id IN (
                    SELECT ct3.topic_id 
                    FROM content_topics ct3 
                    WHERE ct3.content_id IN (${viewHistory.join(',')})
                  ))
                  AND c2.id NOT IN (${viewHistory.join(',')})
              ) THEN ${WEIGHTS.VIEW_HISTORY}
        `;
      }
      
      // Add interaction scoring
      if (interactions.length > 0) {
        const interactionScores = interactions.map(i => 
          `WHEN c.id = ${i.id} THEN ${i.interactionStrength}`
        ).join('\n');
        
        if (interactionScores) {
          query += interactionScores;
        }
      }
      
      // Add recency score
      query += `
              ELSE 0
            END), 0) +
            -- Recency score (higher for newer content)
            ${WEIGHTS.RECENCY} * (1.0 - EXTRACT(EPOCH FROM (NOW() - c.created_at)) / (86400 * 30)) +
            -- Popularity score
            ${WEIGHTS.POPULARITY} * (LOG(GREATEST(c.upvotes, 1)) + LOG(GREATEST(c.views, 1)) * 0.5) AS score
          FROM 
            content c
            LEFT JOIN content_topics ct ON c.id = ct.content_id
            LEFT JOIN content_tags ctg ON c.id = ctg.content_id
          WHERE 
            c.status = 'published'
            ${includeContentTypes.length > 0 ? `AND c.type IN (${includeContentTypes.map(t => `'${t}'`).join(',')})` : ''}
            ${excludeIds.length > 0 ? `AND c.id NOT IN (${excludeIds.join(',')})` : ''}
            ${viewHistory.length > 0 ? `AND c.id NOT IN (${viewHistory.join(',')})` : ''}
          GROUP BY c.id
        )
        SELECT 
          cs.*,
          ARRAY(
            SELECT t.name 
            FROM tags t
            JOIN content_tags ct ON t.id = ct.tag_id
            WHERE ct.content_id = cs.id
          ) AS tags,
          u.username,
          u.name AS author_name,
          u.avatar_url
        FROM 
          content_scores cs
          JOIN users u ON cs.author_id = u.id
        ORDER BY 
          cs.score DESC
        LIMIT $1 OFFSET $2
      `;
      
      const result = await this.db.query(query, [personalizedCount, offset]);
      
      // If we need fresh content, add it
      let recommendedContent = result.rows;
      
      if (freshCount > 0) {
        const freshContent = await this.getFreshContent(
          freshCount, 
          0, 
          includeContentTypes, 
          [...excludeIds, ...viewHistory, ...recommendedContent.map(c => c.id)]
        );
        
        recommendedContent = [...recommendedContent, ...freshContent];
      }
      
      return recommendedContent;
    } catch (error) {
      logger.error('Error getting recommendations:', error);
      // Fall back to trending content on error
      return this.getTrendingContent(limit, offset, includeContentTypes, excludeIds);
    }
  }
  
  /**
   * Get trending content (when we don't have enough user data)
   */
  async getTrendingContent(
    limit: number = 20, 
    offset: number = 0,
    contentTypes: string[] = ['post', 'question', 'tutorial'],
    excludeIds: number[] = []
  ): Promise<any[]> {
    try {
      const contentTypesClause = contentTypes.length > 0
        ? `AND c.type IN (${contentTypes.map(t => `'${t}'`).join(',')})`
        : '';
        
      const excludeClause = excludeIds.length > 0
        ? `AND c.id NOT IN (${excludeIds.join(',')})`
        : '';
      
      const result = await this.db.query(
        `SELECT 
          c.*,
          ARRAY(
            SELECT t.name 
            FROM tags t
            JOIN content_tags ct ON t.id = ct.tag_id
            WHERE ct.content_id = c.id
          ) AS tags,
          u.username,
          u.name AS author_name,
          u.avatar_url
         FROM content c
         JOIN users u ON c.author_id = u.id
         WHERE c.status = 'published'
         ${contentTypesClause}
         ${excludeClause}
         ORDER BY (c.upvotes * 3 + c.views) DESC, c.created_at DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      );
      
      return result.rows;
    } catch (error) {
      logger.error('Error getting trending content:', error);
      return [];
    }
  }
  
  /**
   * Get fresh content (newest content for discovery)
   */
  async getFreshContent(
    limit: number = 10, 
    offset: number = 0,
    contentTypes: string[] = ['post', 'question', 'tutorial'],
    excludeIds: number[] = []
  ): Promise<any[]> {
    try {
      const contentTypesClause = contentTypes.length > 0
        ? `AND c.type IN (${contentTypes.map(t => `'${t}'`).join(',')})`
        : '';
        
      const excludeClause = excludeIds.length > 0
        ? `AND c.id NOT IN (${excludeIds.join(',')})`
        : '';
      
      const result = await this.db.query(
        `SELECT 
          c.*,
          ARRAY(
            SELECT t.name 
            FROM tags t
            JOIN content_tags ct ON t.id = ct.tag_id
            WHERE ct.content_id = c.id
          ) AS tags,
          u.username,
          u.name AS author_name,
          u.avatar_url
         FROM content c
         JOIN users u ON c.author_id = u.id
         WHERE c.status = 'published'
         ${contentTypesClause}
         ${excludeClause}
         ORDER BY c.created_at DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      );
      
      return result.rows;
    } catch (error) {
      logger.error('Error getting fresh content:', error);
      return [];
    }
  }
  
  /**
   * Generate embeddings for user's content interests
   * Used for semantic similarity recommendations
   */
  async generateUserInterestEmbedding(userId: number): Promise<number[] | null> {
    try {
      // Get user's interactions and views
      const [viewHistory, interactions] = await Promise.all([
        this.getUserViewHistory(userId, 60, 30),
        this.getUserInteractions(userId, 90, 50)
      ]);
      
      if (viewHistory.length === 0 && interactions.length === 0) {
        logger.info(`User ${userId} has no history/interactions for interest embedding`);
        return null;
      }
      
      // Get the content details
      const contentIds = [...new Set([
        ...viewHistory, 
        ...interactions.map(i => i.id)
      ])];
      
      if (contentIds.length === 0) {
        return null;
      }
      
      const contentResult = await this.db.query(
        `SELECT id, title, body FROM content WHERE id IN (${contentIds.join(',')})`,
        []
      );
      
      if (contentResult.rows.length === 0) {
        return null;
      }
      
      // Combine titles and bodies, weighted by interaction strength
      let combinedText = contentResult.rows.map(row => {
        const interaction = interactions.find(i => i.id === row.id);
        const weight = interaction ? interaction.interactionStrength : 1;
        
        // Repeat content based on weight to influence embedding
        const repeats = Math.ceil(weight);
        return Array(repeats).fill(`${row.title}\n${row.body.substring(0, 1000)}`).join('\n\n');
      }).join('\n\n');
      
      // Generate embedding
      const embedding = await embeddingService.generateEmbedding(combinedText);
      return embedding;
    } catch (error) {
      logger.error('Error generating user interest embedding:', error);
      return null;
    }
  }
  
  /**
   * Get similar content based on user's interest embedding
   */
  async getSimilarContent(
    userInterestEmbedding: number[],
    limit: number = 20,
    offset: number = 0,
    contentTypes: string[] = ['post', 'question', 'tutorial'],
    excludeIds: number[] = []
  ): Promise<any[]> {
    try {
      if (!env.VECTOR_SEARCH_ENABLED) {
        logger.info('Vector search is not enabled, falling back to trending content');
        return this.getTrendingContent(limit, offset, contentTypes, excludeIds);
      }
      
      // Convert embedding array to Postgres vector format
      const pgVector = `[${userInterestEmbedding.join(',')}]`;
      
      const contentTypesClause = contentTypes.length > 0
        ? `AND c.type IN (${contentTypes.map(t => `'${t}'`).join(',')})`
        : '';
        
      const excludeClause = excludeIds.length > 0
        ? `AND c.id NOT IN (${excludeIds.join(',')})`
        : '';
      
      const result = await this.db.query(
        `SELECT 
          c.*,
          ARRAY(
            SELECT t.name 
            FROM tags t
            JOIN content_tags ct ON t.id = ct.tag_id
            WHERE ct.content_id = c.id
          ) AS tags,
          u.username,
          u.name AS author_name,
          u.avatar_url,
          (c.body_vector <#> $1) as similarity
         FROM content c
         JOIN users u ON c.author_id = u.id
         WHERE c.status = 'published'
         AND c.body_vector IS NOT NULL
         ${contentTypesClause}
         ${excludeClause}
         ORDER BY similarity ASC
         LIMIT $2 OFFSET $3`,
        [pgVector, limit, offset]
      );
      
      return result.rows;
    } catch (error) {
      logger.error('Error getting similar content:', error);
      return this.getTrendingContent(limit, offset, contentTypes, excludeIds);
    }
  }
  
  /**
   * Record that a user viewed content (for improving recommendations)
   */
  async recordContentView(userId: number, contentId: number): Promise<void> {
    try {
      await this.db.query(
        `INSERT INTO user_content_views (user_id, content_id, viewed_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (user_id, content_id) 
         DO UPDATE SET viewed_at = NOW(), view_count = user_content_views.view_count + 1`,
        [userId, contentId]
      );
    } catch (error) {
      logger.error('Error recording content view:', error);
    }
  }
}

// Export singleton instance
export const recommendationService = new RecommendationService();