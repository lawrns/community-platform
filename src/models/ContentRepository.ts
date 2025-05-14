/**
 * Content Repository
 * Database operations for content (questions, answers, posts, etc.)
 */

import Repository from './Repository';
import { Content, ContentType, ContentStatus, ContentVersion, ModerationActionType } from './index';
import db from '../config/database';
import { moderationRepository } from './repositories';
import { generateContentEmbedding } from '../services/search/embeddingHooks';

/**
 * Repository for content operations
 */
export default class ContentRepository extends Repository<Content> {
  protected tableName = 'content';

  /**
   * Find content by type
   */
  async findByType(type: ContentType, limit: number = 20, offset: number = 0): Promise<Content[]> {
    const result = await db.query(
      `SELECT * FROM ${this.tableName} 
       WHERE type = $1 AND status = 'published'
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [type, limit, offset]
    );
    
    return result.rows as Content[];
  }

  /**
   * Find content with author information
   */
  async findWithAuthor(id: number): Promise<any | null> {
    const result = await db.query(
      `SELECT c.*, u.username, u.name, u.avatar_url, u.reputation 
       FROM ${this.tableName} c
       JOIN users u ON c.author_id = u.id
       WHERE c.id = $1`,
      [id]
    );
    
    return result.rows.length ? result.rows[0] : null;
  }

  /**
   * Find questions with answers
   */
  async findQuestionWithAnswers(questionId: number): Promise<any | null> {
    // First get the question
    const questionResult = await this.findWithAuthor(questionId);
    
    if (!questionResult) {
      return null;
    }
    
    // Then get the answers
    const answersResult = await db.query(
      `SELECT c.*, u.username, u.name, u.avatar_url, u.reputation 
       FROM ${this.tableName} c
       JOIN users u ON c.author_id = u.id
       WHERE c.parent_id = $1 AND c.type = 'answer' AND c.status = 'published'
       ORDER BY c.is_accepted DESC, c.upvotes DESC, c.created_at ASC`,
      [questionId]
    );
    
    // Return combined result
    return {
      question: questionResult,
      answers: answersResult.rows
    };
  }

  /**
   * Get tags for content
   */
  async getTags(contentId: number): Promise<any[]> {
    const result = await db.query(
      `SELECT t.* 
       FROM tags t
       JOIN content_tags ct ON t.id = ct.tag_id
       WHERE ct.content_id = $1`,
      [contentId]
    );
    
    return result.rows;
  }

  /**
   * Get topics for content
   */
  async getTopics(contentId: number): Promise<any[]> {
    const result = await db.query(
      `SELECT t.* 
       FROM topics t
       JOIN content_topics ct ON t.id = ct.topic_id
       WHERE ct.content_id = $1`,
      [contentId]
    );
    
    return result.rows;
  }

  /**
   * Add tags to content
   */
  async addTags(contentId: number, tagIds: number[]): Promise<void> {
    // Use a transaction to ensure all tags are added successfully
    await db.transaction(async (client) => {
      for (const tagId of tagIds) {
        await client.query(
          `INSERT INTO content_tags (content_id, tag_id, created_at)
           VALUES ($1, $2, NOW())
           ON CONFLICT (content_id, tag_id) DO NOTHING`,
          [contentId, tagId]
        );
      }
    });
  }

  /**
   * Update tags for content (remove existing and add new ones)
   */
  async updateTags(contentId: number, tagIds: number[]): Promise<void> {
    await db.transaction(async (client) => {
      // Remove existing tags
      await client.query(
        `DELETE FROM content_tags WHERE content_id = $1`,
        [contentId]
      );
      
      // Add new tags
      for (const tagId of tagIds) {
        await client.query(
          `INSERT INTO content_tags (content_id, tag_id, created_at)
           VALUES ($1, $2, NOW())`,
          [contentId, tagId]
        );
      }
    });
  }

  /**
   * Remove specific tags from content
   */
  async removeTags(contentId: number, tagIds: number[]): Promise<void> {
    if (tagIds.length === 0) return;
    
    const placeholders = tagIds.map((_, i) => `$${i + 2}`).join(', ');
    
    await db.query(
      `DELETE FROM content_tags 
       WHERE content_id = $1 AND tag_id IN (${placeholders})`,
      [contentId, ...tagIds]
    );
  }

  /**
   * Add topics to content
   */
  async addTopics(contentId: number, topicIds: number[]): Promise<void> {
    // Use a transaction to ensure all topics are added successfully
    await db.transaction(async (client) => {
      for (const topicId of topicIds) {
        await client.query(
          `INSERT INTO content_topics (content_id, topic_id, created_at)
           VALUES ($1, $2, NOW())
           ON CONFLICT (content_id, topic_id) DO NOTHING`,
          [contentId, topicId]
        );
      }
    });
  }

  /**
   * Update topics for content (remove existing and add new ones)
   */
  async updateTopics(contentId: number, topicIds: number[]): Promise<void> {
    await db.transaction(async (client) => {
      // Remove existing topics
      await client.query(
        `DELETE FROM content_topics WHERE content_id = $1`,
        [contentId]
      );
      
      // Add new topics
      for (const topicId of topicIds) {
        await client.query(
          `INSERT INTO content_topics (content_id, topic_id, created_at)
           VALUES ($1, $2, NOW())`,
          [contentId, topicId]
        );
      }
    });
  }

  /**
   * Remove specific topics from content
   */
  async removeTopics(contentId: number, topicIds: number[]): Promise<void> {
    if (topicIds.length === 0) return;
    
    const placeholders = topicIds.map((_, i) => `$${i + 2}`).join(', ');
    
    await db.query(
      `DELETE FROM content_topics 
       WHERE content_id = $1 AND topic_id IN (${placeholders})`,
      [contentId, ...topicIds]
    );
  }

  /**
   * Vote on content
   */
  async vote(userId: number, contentId: number, voteType: number): Promise<boolean> {
    const result = await db.query(
      `SELECT handle_content_vote($1, $2, $3) as success`,
      [userId, contentId, voteType]
    );
    
    return result.rows[0].success;
  }

  /**
   * Accept an answer
   */
  async acceptAnswer(answerId: number, questionAuthorId: number): Promise<boolean> {
    const result = await db.query(
      `SELECT accept_answer($1, $2) as success`,
      [answerId, questionAuthorId]
    );
    
    return result.rows[0].success;
  }

  /**
   * Create a draft content
   */
  async createDraft(data: Partial<Content>): Promise<Content> {
    // Ensure the status is set to draft
    const draftData = {
      ...data,
      status: ContentStatus.DRAFT,
      upvotes: 0,
      downvotes: 0,
      views: 0,
      is_accepted: false
    };
    
    // Create the draft content
    const content = await this.create(draftData);
    
    // Add the initial version
    await this.addVersion(
      content.id,
      1, // First version
      content.title || null,
      content.body,
      content.body_html,
      content.author_id
    );
    
    return content;
  }

  /**
   * Update draft content
   */
  async updateDraft(id: number, data: Partial<Content>, editorId: number, editComment?: string): Promise<Content | null> {
    // First check if this is a draft
    const existing = await this.findById(id);
    if (!existing || existing.status !== ContentStatus.DRAFT) {
      throw new Error('Content is not a draft');
    }
    
    // Get the current version number
    const versions = await this.getVersions(id);
    const nextVersion = versions.length + 1;
    
    // Update the content
    const updated = await this.update(id, {
      ...data,
      updated_at: new Date()
    });
    
    if (!updated) {
      throw new Error('Failed to update draft');
    }
    
    // Add a new version
    await this.addVersion(
      updated.id,
      nextVersion,
      updated.title || null,
      updated.body,
      updated.body_html,
      editorId,
      editComment
    );
    
    return updated;
  }

  /**
   * Publish draft content
   */
  async publishDraft(id: number): Promise<Content | null> {
    // First check if this is a draft
    const existing = await this.findById(id);
    if (!existing || existing.status !== ContentStatus.DRAFT) {
      throw new Error('Content is not a draft');
    }
    
    // Update the status to published
    const published = await this.update(id, {
      status: ContentStatus.PUBLISHED,
      updated_at: new Date()
    });
    
    // Generate embedding for search
    if (published) {
      generateContentEmbedding(published.id, published.body).catch(error => {
        console.error(`Error generating embedding for content ${published.id}:`, error);
      });
    }
    
    return published;
  }

  /**
   * Autosave content
   * For lightweight updates during editing
   */
  async autosaveContent(id: number, title: string | null, body: string, bodyHtml: string): Promise<boolean> {
    try {
      await db.query(
        `UPDATE ${this.tableName} 
         SET title = $2, body = $3, body_html = $4, updated_at = NOW() 
         WHERE id = $1`,
        [id, title, body, bodyHtml]
      );
      return true;
    } catch (error) {
      console.error('Autosave error:', error);
      return false;
    }
  }

  /**
   * Update content and create a new version
   */
  async updateContent(id: number, data: Partial<Content>, editorId: number, editComment?: string): Promise<Content | null> {
    // Get the current content
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error('Content not found');
    }
    
    // Get the current version number
    const versions = await this.getVersions(id);
    const nextVersion = versions.length + 1;
    
    // Update the content
    const updated = await this.update(id, {
      ...data,
      updated_at: new Date()
    });
    
    if (!updated) {
      throw new Error('Failed to update content');
    }
    
    // Add a new version
    await this.addVersion(
      updated.id,
      nextVersion,
      updated.title || null,
      updated.body,
      updated.body_html,
      editorId,
      editComment
    );
    
    // Generate new embedding if the body was updated
    if (updated && data.body && existing.status === ContentStatus.PUBLISHED) {
      generateContentEmbedding(updated.id, updated.body).catch(error => {
        console.error(`Error generating embedding for updated content ${updated.id}:`, error);
      });
    }
    
    return updated;
  }

  /**
   * Revert to a specific version
   */
  async revertToVersion(contentId: number, versionId: number, userId: number): Promise<Content | null> {
    // Get the version to revert to
    const versionResult = await db.query(
      `SELECT * FROM content_versions WHERE content_id = $1 AND id = $2`,
      [contentId, versionId]
    );
    
    if (!versionResult.rows.length) {
      throw new Error('Version not found');
    }
    
    const version = versionResult.rows[0];
    
    // Get the current version number
    const versions = await this.getVersions(contentId);
    const nextVersion = versions.length + 1;
    
    // Update the content with the version data
    const updated = await this.update(contentId, {
      title: version.title,
      body: version.body,
      body_html: version.body_html,
      updated_at: new Date()
    });
    
    if (!updated) {
      throw new Error('Failed to revert to version');
    }
    
    // Add a new version recording this revert
    await this.addVersion(
      contentId,
      nextVersion,
      version.title,
      version.body,
      version.body_html,
      userId,
      `Reverted to version ${version.version}`
    );
    
    return updated;
  }

  /**
   * Find all content by author
   */
  async findByAuthor(authorId: number, status?: ContentStatus, limit: number = 20, offset: number = 0): Promise<Content[]> {
    let query = `SELECT * FROM ${this.tableName} WHERE author_id = $1`;
    const params = [authorId];
    
    if (status) {
      query += ` AND status = $2`;
      params.push(status);
    }
    
    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);
    
    const result = await db.query(query, params);
    return result.rows as Content[];
  }

  /**
   * Find drafts by author
   */
  async findDrafts(authorId: number, limit: number = 20, offset: number = 0): Promise<Content[]> {
    return this.findByAuthor(authorId, ContentStatus.DRAFT, limit, offset);
  }

  /**
   * Soft delete content
   */
  async softDelete(id: number): Promise<boolean> {
    try {
      await this.update(id, { status: ContentStatus.DELETED });
      return true;
    } catch (error) {
      console.error('Soft delete error:', error);
      return false;
    }
  }

  /**
   * Restore deleted content
   */
  async restore(id: number): Promise<boolean> {
    try {
      await this.update(id, { status: ContentStatus.PUBLISHED });
      return true;
    } catch (error) {
      console.error('Restore error:', error);
      return false;
    }
  }

  /**
   * Hide content (for moderation)
   */
  async hideContent(id: number): Promise<boolean> {
    try {
      await this.update(id, { status: ContentStatus.HIDDEN });
      return true;
    } catch (error) {
      console.error('Hide content error:', error);
      return false;
    }
  }

  /**
   * Update content version
   */
  async addVersion(contentId: number, version: number, title: string | null, body: string, bodyHtml: string, editorId: number, editComment?: string): Promise<any> {
    const result = await db.query(
      `INSERT INTO content_versions (content_id, version, title, body, body_html, editor_id, edit_comment, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING *`,
      [contentId, version, title, body, bodyHtml, editorId, editComment]
    );
    
    return result.rows[0];
  }

  /**
   * Get content versions
   */
  async getVersions(contentId: number): Promise<any[]> {
    const result = await db.query(
      `SELECT cv.*, u.username, u.name
       FROM content_versions cv
       JOIN users u ON cv.editor_id = u.id
       WHERE cv.content_id = $1
       ORDER BY cv.version DESC`,
      [contentId]
    );
    
    return result.rows;
  }

  /**
   * Get specific version
   */
  async getVersion(contentId: number, versionNumber: number): Promise<ContentVersion | null> {
    const result = await db.query(
      `SELECT cv.*, u.username, u.name
       FROM content_versions cv
       JOIN users u ON cv.editor_id = u.id
       WHERE cv.content_id = $1 AND cv.version = $2`,
      [contentId, versionNumber]
    );
    
    return result.rows.length ? result.rows[0] : null;
  }

  /**
   * Increment view count
   */
  async incrementViews(contentId: number): Promise<void> {
    await db.query(
      `UPDATE ${this.tableName} SET views = views + 1 WHERE id = $1`,
      [contentId]
    );
  }

  /**
   * Search content
   */
  async search(query: string, limit: number = 20, offset: number = 0): Promise<any[]> {
    // This is a simple lexical search, vector search would be implemented separately
    const result = await db.query(
      `SELECT c.*, u.username, u.name
       FROM ${this.tableName} c
       JOIN users u ON c.author_id = u.id
       WHERE (c.title ILIKE $1 OR c.body ILIKE $1) AND c.status = 'published'
       ORDER BY c.created_at DESC
       LIMIT $2 OFFSET $3`,
      [`%${query}%`, limit, offset]
    );
    
    return result.rows;
  }

  /**
   * Vector search (semantic search)
   */
  async vectorSearch(embedding: number[], limit: number = 20, offset: number = 0, threshold: number = 0.75): Promise<any[]> {
    // Convert embedding array to Postgres vector format
    const pgVector = `[${embedding.join(',')}]`;
    
    // Use pgvector's cosine similarity operator (<#>) for semantic search
    // Lower score means more similar - we order by similarity ascending
    const result = await db.query(
      `SELECT c.*, u.username, u.name, u.avatar_url,
              (c.body_vector <#> $1) as similarity
       FROM ${this.tableName} c
       JOIN users u ON c.author_id = u.id
       WHERE c.body_vector IS NOT NULL 
         AND c.status = 'published'
         AND (c.body_vector <#> $1) < $4
       ORDER BY similarity ASC
       LIMIT $2 OFFSET $3`,
      [pgVector, limit, offset, 1 - threshold] // Convert threshold (0-1) to distance (1-0)
    );
    
    return result.rows;
  }

  /**
   * Find recent content
   */
  async findRecent(limit: number = 20, offset: number = 0): Promise<any[]> {
    const result = await db.query(
      `SELECT c.*, u.username, u.name, u.avatar_url
       FROM ${this.tableName} c
       JOIN users u ON c.author_id = u.id
       WHERE c.status = 'published'
       ORDER BY c.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    
    return result.rows;
  }

  /**
   * Find trending content (most viewed/upvoted recently)
   */
  async findTrending(days: number = 7, limit: number = 20, offset: number = 0): Promise<any[]> {
    const result = await db.query(
      `SELECT c.*, u.username, u.name, u.avatar_url
       FROM ${this.tableName} c
       JOIN users u ON c.author_id = u.id
       WHERE c.status = 'published' AND c.created_at > NOW() - INTERVAL '${days} days'
       ORDER BY (c.upvotes * 3 + c.views) DESC, c.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    
    return result.rows;
  }

  /**
   * Check if content is spam
   */
  async checkForSpam(content: Content): Promise<{ isSpam: boolean; score: number; reason?: string }> {
    // Use the moderation repository's spam detection
    return moderationRepository.checkForSpam(content.body, 'content');
  }

  /**
   * Hide content (moderation action)
   */
  async hideContent(id: number, moderatorId: number, reason?: string, flagId?: number): Promise<Content | null> {
    // First check if content exists
    const content = await this.findById(id);
    if (!content) {
      throw new Error('Content not found');
    }

    // Use transaction to update content and record moderation action
    return db.transaction(async (client) => {
      // Update content status
      const updated = await client.query(
        `UPDATE ${this.tableName} SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
        [ContentStatus.HIDDEN, id]
      );

      if (!updated.rows.length) {
        throw new Error('Failed to hide content');
      }

      // Create moderation action
      await moderationRepository.createContentAction(
        ModerationActionType.HIDE,
        id,
        moderatorId,
        reason,
        flagId
      );

      return updated.rows[0];
    });
  }

  /**
   * Unhide content (revert moderation action)
   */
  async unhideContent(id: number, moderatorId: number, reason?: string): Promise<Content | null> {
    // First check if content exists and is hidden
    const content = await this.findById(id);
    if (!content) {
      throw new Error('Content not found');
    }

    if (content.status !== ContentStatus.HIDDEN) {
      throw new Error('Content is not hidden');
    }

    // Use transaction to update content and record moderation action
    return db.transaction(async (client) => {
      // Update content status back to published
      const updated = await client.query(
        `UPDATE ${this.tableName} SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
        [ContentStatus.PUBLISHED, id]
      );

      if (!updated.rows.length) {
        throw new Error('Failed to unhide content');
      }

      // Create moderation action
      await moderationRepository.createContentAction(
        ModerationActionType.UNHIDE,
        id,
        moderatorId,
        reason
      );

      return updated.rows[0];
    });
  }

  /**
   * Get flagged content
   */
  async getFlaggedContent(limit: number = 20, offset: number = 0): Promise<any[]> {
    const result = await db.query(
      `SELECT c.*, u.username, u.name, u.avatar_url, 
              COUNT(f.id) AS flag_count
       FROM ${this.tableName} c
       JOIN users u ON c.author_id = u.id
       JOIN flags f ON f.content_id = c.id AND f.status = 'pending'
       GROUP BY c.id, u.username, u.name, u.avatar_url
       ORDER BY flag_count DESC, c.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    
    return result.rows;
  }

  /**
   * Delete content (moderation action - soft delete)
   */
  async moderationDelete(id: number, moderatorId: number, reason?: string, flagId?: number): Promise<Content | null> {
    // First check if content exists
    const content = await this.findById(id);
    if (!content) {
      throw new Error('Content not found');
    }

    // Use transaction to update content and record moderation action
    return db.transaction(async (client) => {
      // Update content status
      const updated = await client.query(
        `UPDATE ${this.tableName} SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
        [ContentStatus.DELETED, id]
      );

      if (!updated.rows.length) {
        throw new Error('Failed to delete content');
      }

      // Create moderation action
      await moderationRepository.createContentAction(
        ModerationActionType.DELETE,
        id,
        moderatorId,
        reason,
        flagId
      );

      return updated.rows[0];
    });
  }

  /**
   * Undelete content (revert moderation action)
   */
  async moderationUndelete(id: number, moderatorId: number, reason?: string): Promise<Content | null> {
    // First check if content exists and is deleted
    const content = await this.findById(id);
    if (!content) {
      throw new Error('Content not found');
    }

    if (content.status !== ContentStatus.DELETED) {
      throw new Error('Content is not deleted');
    }

    // Use transaction to update content and record moderation action
    return db.transaction(async (client) => {
      // Update content status back to published
      const updated = await client.query(
        `UPDATE ${this.tableName} SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
        [ContentStatus.PUBLISHED, id]
      );

      if (!updated.rows.length) {
        throw new Error('Failed to undelete content');
      }

      // Create moderation action
      await moderationRepository.createContentAction(
        ModerationActionType.UNDELETE,
        id,
        moderatorId,
        reason
      );

      return updated.rows[0];
    });
  }
}