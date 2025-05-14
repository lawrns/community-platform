/**
 * Appeal Repository
 * Database operations for moderation appeals
 */

import Repository from '../Repository';
import { Appeal, AppealStatus } from '../index';
import db from '../../config/database';

/**
 * Repository for moderation appeals
 */
export default class AppealRepository extends Repository<Appeal> {
  protected tableName = 'appeals';

  /**
   * Find appeal with user and moderator information
   */
  async findWithDetails(id: number): Promise<any | null> {
    const result = await db.query(
      `SELECT a.*, 
              u.username, u.name, u.avatar_url,
              m.username as moderator_username, m.name as moderator_name
       FROM ${this.tableName} a
       JOIN users u ON a.user_id = u.id
       LEFT JOIN users m ON a.moderator_id = m.id
       WHERE a.id = $1`,
      [id]
    );
    
    return result.rows.length ? result.rows[0] : null;
  }

  /**
   * Find appeals by user
   */
  async findByUser(
    userId: number,
    limit: number = 20,
    offset: number = 0
  ): Promise<Appeal[]> {
    const result = await db.query(
      `SELECT a.*, ma.action_type, ma.content_id, ma.user_id as target_user_id
       FROM ${this.tableName} a
       JOIN moderation_actions ma ON a.moderation_action_id = ma.id
       WHERE a.user_id = $1
       ORDER BY a.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    
    return result.rows;
  }

  /**
   * Find pending appeals
   */
  async findPending(limit: number = 20, offset: number = 0): Promise<Appeal[]> {
    const result = await db.query(
      `SELECT a.*, u.username, u.name, u.avatar_url,
              ma.action_type, ma.reason as action_reason, ma.ai_detected
       FROM ${this.tableName} a
       JOIN users u ON a.user_id = u.id
       JOIN moderation_actions ma ON a.moderation_action_id = ma.id
       WHERE a.status = $1
       ORDER BY a.created_at ASC
       LIMIT $2 OFFSET $3`,
      [AppealStatus.PENDING, limit, offset]
    );
    
    return result.rows;
  }

  /**
   * Create appeal
   */
  async createAppeal(
    moderationActionId: number,
    userId: number,
    reason: string
  ): Promise<Appeal> {
    return this.create({
      moderation_action_id: moderationActionId,
      user_id: userId,
      reason,
      status: AppealStatus.PENDING,
      created_at: new Date(),
      updated_at: new Date()
    });
  }

  /**
   * Approve appeal
   */
  async approveAppeal(
    id: number,
    moderatorId: number,
    notes?: string
  ): Promise<Appeal | null> {
    const result = await db.transaction(async (client) => {
      // Update appeal status
      const updated = await client.query(
        `UPDATE ${this.tableName} 
         SET status = $1, moderator_id = $2, moderator_notes = $3, resolved_at = NOW(), updated_at = NOW()
         WHERE id = $4
         RETURNING *`,
        [AppealStatus.APPROVED, moderatorId, notes, id]
      );
      
      if (!updated.rows.length) {
        return null;
      }
      
      // Get the moderation action
      const appeal = updated.rows[0];
      const actionQuery = await client.query(
        `SELECT * FROM moderation_actions WHERE id = $1`,
        [appeal.moderation_action_id]
      );
      
      if (!actionQuery.rows.length) {
        throw new Error('Moderation action not found');
      }
      
      const action = actionQuery.rows[0];
      
      // Revert the moderation action
      await client.query(
        `UPDATE moderation_actions 
         SET status = 'reverted', reverted_at = NOW(), reverted_by_id = $1, updated_at = NOW()
         WHERE id = $2`,
        [moderatorId, action.id]
      );
      
      // Add to audit log
      await client.query(
        `INSERT INTO moderation_audit_log (action_id, actor_id, action, details, created_at)
         VALUES ($1, $2, 'appeal_approved', $3, NOW())`,
        [action.id, moderatorId, { appeal_id: id, notes }]
      );
      
      return appeal;
    });
    
    return result;
  }

  /**
   * Reject appeal
   */
  async rejectAppeal(
    id: number,
    moderatorId: number,
    notes?: string
  ): Promise<Appeal | null> {
    const result = await db.transaction(async (client) => {
      // Update appeal status
      const updated = await client.query(
        `UPDATE ${this.tableName} 
         SET status = $1, moderator_id = $2, moderator_notes = $3, resolved_at = NOW(), updated_at = NOW()
         WHERE id = $4
         RETURNING *`,
        [AppealStatus.REJECTED, moderatorId, notes, id]
      );
      
      if (!updated.rows.length) {
        return null;
      }
      
      const appeal = updated.rows[0];
      
      // Add to audit log
      await client.query(
        `INSERT INTO moderation_audit_log (action_id, actor_id, action, details, created_at)
         VALUES ($1, $2, 'appeal_rejected', $3, NOW())`,
        [appeal.moderation_action_id, moderatorId, { appeal_id: id, notes }]
      );
      
      return appeal;
    });
    
    return result;
  }

  /**
   * Count appeals by status
   */
  async countByStatus(status: AppealStatus): Promise<number> {
    const result = await db.query(
      `SELECT COUNT(*) as count FROM ${this.tableName} WHERE status = $1`,
      [status]
    );
    
    return parseInt(result.rows[0].count);
  }
}