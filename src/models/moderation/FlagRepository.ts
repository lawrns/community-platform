/**
 * Flag Repository
 * Database operations for user-reported flags
 */

import Repository from '../Repository';
import { Flag, FlagReason, FlagStatus, FlagType } from '../index';
import db from '../../config/database';

/**
 * Repository for content flags
 */
export default class FlagRepository extends Repository<Flag> {
  protected tableName = 'flags';

  /**
   * Find flags with reporter information
   */
  async findWithReporter(id: number): Promise<any | null> {
    const result = await db.query(
      `SELECT f.*, u.username, u.name, u.avatar_url 
       FROM ${this.tableName} f
       JOIN users u ON f.reporter_id = u.id
       WHERE f.id = $1`,
      [id]
    );
    
    return result.rows.length ? result.rows[0] : null;
  }

  /**
   * Find flags by entity
   */
  async findByEntity(
    type: FlagType, 
    entityId: number, 
    limit: number = 20, 
    offset: number = 0
  ): Promise<Flag[]> {
    const columnName = `${type}_id`;
    
    const result = await db.query(
      `SELECT f.*, u.username, u.name, u.avatar_url 
       FROM ${this.tableName} f
       JOIN users u ON f.reporter_id = u.id
       WHERE f.type = $1 AND f.${columnName} = $2
       ORDER BY f.created_at DESC
       LIMIT $3 OFFSET $4`,
      [type, entityId, limit, offset]
    );
    
    return result.rows;
  }

  /**
   * Find pending flags
   */
  async findPending(limit: number = 20, offset: number = 0): Promise<Flag[]> {
    const result = await db.query(
      `SELECT f.*, u.username, u.name, u.avatar_url 
       FROM ${this.tableName} f
       JOIN users u ON f.reporter_id = u.id
       WHERE f.status = $1
       ORDER BY f.created_at ASC
       LIMIT $2 OFFSET $3`,
      [FlagStatus.PENDING, limit, offset]
    );
    
    return result.rows;
  }

  /**
   * Flag content
   */
  async flagContent(
    contentId: number,
    reporterId: number,
    reason: FlagReason,
    description?: string
  ): Promise<Flag> {
    return this.create({
      type: FlagType.CONTENT,
      content_id: contentId,
      reporter_id: reporterId,
      reason,
      description,
      status: FlagStatus.PENDING,
      created_at: new Date(),
      updated_at: new Date()
    });
  }

  /**
   * Flag user
   */
  async flagUser(
    userId: number,
    reporterId: number,
    reason: FlagReason,
    description?: string
  ): Promise<Flag> {
    return this.create({
      type: FlagType.USER,
      user_id: userId,
      reporter_id: reporterId,
      reason,
      description,
      status: FlagStatus.PENDING,
      created_at: new Date(),
      updated_at: new Date()
    });
  }

  /**
   * Flag tool
   */
  async flagTool(
    toolId: number,
    reporterId: number,
    reason: FlagReason,
    description?: string
  ): Promise<Flag> {
    return this.create({
      type: FlagType.TOOL,
      tool_id: toolId,
      reporter_id: reporterId,
      reason,
      description,
      status: FlagStatus.PENDING,
      created_at: new Date(),
      updated_at: new Date()
    });
  }

  /**
   * Flag review
   */
  async flagReview(
    reviewId: number,
    reporterId: number,
    reason: FlagReason,
    description?: string
  ): Promise<Flag> {
    return this.create({
      type: FlagType.REVIEW,
      review_id: reviewId,
      reporter_id: reporterId,
      reason,
      description,
      status: FlagStatus.PENDING,
      created_at: new Date(),
      updated_at: new Date()
    });
  }

  /**
   * Flag comment
   */
  async flagComment(
    commentId: number,
    reporterId: number,
    reason: FlagReason,
    description?: string
  ): Promise<Flag> {
    return this.create({
      type: FlagType.COMMENT,
      comment_id: commentId,
      reporter_id: reporterId,
      reason,
      description,
      status: FlagStatus.PENDING,
      created_at: new Date(),
      updated_at: new Date()
    });
  }

  /**
   * Update flag status
   */
  async updateStatus(id: number, status: FlagStatus): Promise<Flag | null> {
    return this.update(id, {
      status,
      updated_at: new Date()
    });
  }

  /**
   * Get flags by status
   */
  async findByStatus(
    status: FlagStatus, 
    limit: number = 20, 
    offset: number = 0
  ): Promise<Flag[]> {
    const result = await db.query(
      `SELECT f.*, u.username, u.name, u.avatar_url 
       FROM ${this.tableName} f
       JOIN users u ON f.reporter_id = u.id
       WHERE f.status = $1
       ORDER BY f.created_at ASC
       LIMIT $2 OFFSET $3`,
      [status, limit, offset]
    );
    
    return result.rows;
  }

  /**
   * Count flags by status
   */
  async countByStatus(status: FlagStatus): Promise<number> {
    const result = await db.query(
      `SELECT COUNT(*) as count FROM ${this.tableName} WHERE status = $1`,
      [status]
    );
    
    return parseInt(result.rows[0].count);
  }
}