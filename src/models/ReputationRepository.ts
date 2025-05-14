import { Database } from '../config/database';
import { supabase } from '../config/supabase';
import { Repository } from './Repository';
import { badgeRepository } from './BadgeRepository';

/**
 * Reputation change reasons
 */
export enum ReputationReason {
  UPVOTE = 'upvote',
  DOWNVOTE = 'downvote',
  ACCEPTED_ANSWER = 'accepted_answer',
  ACCEPT_ANSWER = 'accept_answer',
  BOUNTY_OFFERED = 'bounty_offered',
  BOUNTY_RECEIVED = 'bounty_received',
  EDIT_APPROVED = 'edit_approved',
  POST_FLAGGED = 'post_flagged',
  VOTE_REVERSAL = 'vote_reversal',
  VOTE_REMOVED = 'vote_removed',
  CONTENT_REMOVED = 'content_removed',
  ADMIN_ADJUSTMENT = 'admin_adjustment',
  TOOL_REVIEW = 'tool_review'
}

/**
 * Privilege types
 */
export enum PrivilegeType {
  CREATE_POST = 'create_post',
  COMMENT = 'comment',
  UPVOTE = 'upvote',
  DOWNVOTE = 'downvote',
  FLAG_CONTENT = 'flag_content',
  EDIT_OTHERS = 'edit_others',
  MODERATION_TOOLS = 'moderation_tools',
  TRUSTED_USER = 'trusted_user'
}

/**
 * Reputation tiers
 */
export const REPUTATION_TIERS = {
  CREATE_POST: 1,
  UPVOTE: 15,
  COMMENT: 50,
  FLAG_CONTENT: 50,
  DOWNVOTE: 125,
  EDIT_OTHERS: 1000,
  MODERATION_TOOLS: 2000,
  TRUSTED_USER: 5000
};

/**
 * Reputation points for different actions
 */
export const REPUTATION_POINTS = {
  QUESTION_UPVOTE: 5,
  QUESTION_DOWNVOTE: -2,
  ANSWER_UPVOTE: 10,
  ANSWER_DOWNVOTE: -2,
  OTHER_UPVOTE: 2,
  OTHER_DOWNVOTE: -1,
  ACCEPTED_ANSWER: 15,
  ACCEPT_ANSWER: 2,
  TOOL_REVIEW: 3
};

/**
 * Interface for a reputation history entry
 */
export interface ReputationHistory {
  id: number;
  user_id: number;
  change: number;
  reason: string;
  content_id?: number;
  created_at: string;
}

/**
 * Repository for managing user reputation
 */
export class ReputationRepository extends Repository {
  /**
   * Update a user's reputation
   */
  async updateReputation(
    userId: number, 
    change: number, 
    reason: ReputationReason, 
    contentId?: number
  ): Promise<void> {
    try {
      if (this.useSupabase) {
        const { error } = await supabase.rpc('update_user_reputation', {
          user_id_param: userId,
          change_param: change,
          reason_param: reason,
          content_id_param: contentId || null
        });
        
        if (error) throw error;
      } else {
        await this.db.query(
          `SELECT update_user_reputation($1, $2, $3, $4)`,
          [userId, change, reason, contentId || null]
        );
      }

      // After reputation update, check for badge eligibility
      await badgeRepository.checkAllBadges(userId);
    } catch (error) {
      this.handleError('Error updating reputation', error);
    }
  }

  /**
   * Get a user's reputation history
   */
  async getReputationHistory(
    userId: number, 
    limit: number = 20, 
    offset: number = 0
  ): Promise<ReputationHistory[]> {
    try {
      if (this.useSupabase) {
        const { data, error } = await supabase
          .from('reputation_history')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);
        
        if (error) throw error;
        return data as ReputationHistory[];
      } else {
        const result = await this.db.query(
          `SELECT * FROM reputation_history 
           WHERE user_id = $1 
           ORDER BY created_at DESC 
           LIMIT $2 OFFSET $3`,
          [userId, limit, offset]
        );
        return result.rows;
      }
    } catch (error) {
      this.handleError('Error getting reputation history', error);
    }
  }

  /**
   * Check if a user has a specific privilege
   */
  async hasPrivilege(userId: number, privilege: PrivilegeType): Promise<boolean> {
    try {
      if (this.useSupabase) {
        const { data, error } = await supabase.rpc('user_has_privilege', {
          user_id_param: userId,
          privilege_param: privilege
        });
        
        if (error) throw error;
        return data as boolean;
      } else {
        const result = await this.db.query(
          `SELECT user_has_privilege($1, $2) as has_privilege`,
          [userId, privilege]
        );
        return result.rows[0].has_privilege;
      }
    } catch (error) {
      this.handleError('Error checking privilege', error);
      return false;
    }
  }

  /**
   * Get all privileges a user has access to
   */
  async getUserPrivileges(userId: number): Promise<PrivilegeType[]> {
    try {
      // Get user's reputation
      let userRep: number;
      
      if (this.useSupabase) {
        const { data, error } = await supabase
          .from('users')
          .select('reputation')
          .eq('id', userId)
          .single();
        
        if (error) throw error;
        userRep = data.reputation;
      } else {
        const result = await this.db.query(
          'SELECT reputation FROM users WHERE id = $1',
          [userId]
        );
        
        if (result.rows.length === 0) {
          throw new Error(`User with ID ${userId} not found`);
        }
        
        userRep = result.rows[0].reputation;
      }

      // Determine privileges based on reputation
      const privileges: PrivilegeType[] = [];
      
      if (userRep >= REPUTATION_TIERS.CREATE_POST) privileges.push(PrivilegeType.CREATE_POST);
      if (userRep >= REPUTATION_TIERS.UPVOTE) privileges.push(PrivilegeType.UPVOTE);
      if (userRep >= REPUTATION_TIERS.COMMENT) privileges.push(PrivilegeType.COMMENT);
      if (userRep >= REPUTATION_TIERS.FLAG_CONTENT) privileges.push(PrivilegeType.FLAG_CONTENT);
      if (userRep >= REPUTATION_TIERS.DOWNVOTE) privileges.push(PrivilegeType.DOWNVOTE);
      if (userRep >= REPUTATION_TIERS.EDIT_OTHERS) privileges.push(PrivilegeType.EDIT_OTHERS);
      if (userRep >= REPUTATION_TIERS.MODERATION_TOOLS) privileges.push(PrivilegeType.MODERATION_TOOLS);
      if (userRep >= REPUTATION_TIERS.TRUSTED_USER) privileges.push(PrivilegeType.TRUSTED_USER);
      
      return privileges;
    } catch (error) {
      this.handleError('Error getting user privileges', error);
      return [];
    }
  }

  /**
   * Award reputation points for an upvote
   */
  async awardUpvotePoints(contentId: number, authorId: number): Promise<void> {
    try {
      // Determine content type to assign correct points
      let contentType: string;
      let points: number;
      
      if (this.useSupabase) {
        const { data, error } = await supabase
          .from('content')
          .select('type')
          .eq('id', contentId)
          .single();
        
        if (error) throw error;
        contentType = data.type;
      } else {
        const result = await this.db.query(
          'SELECT type FROM content WHERE id = $1',
          [contentId]
        );
        
        if (result.rows.length === 0) {
          throw new Error(`Content with ID ${contentId} not found`);
        }
        
        contentType = result.rows[0].type;
      }
      
      // Assign points based on content type
      switch (contentType) {
        case 'question':
          points = REPUTATION_POINTS.QUESTION_UPVOTE;
          break;
        case 'answer':
          points = REPUTATION_POINTS.ANSWER_UPVOTE;
          break;
        default:
          points = REPUTATION_POINTS.OTHER_UPVOTE;
      }
      
      // Update reputation
      await this.updateReputation(authorId, points, ReputationReason.UPVOTE, contentId);
    } catch (error) {
      this.handleError('Error awarding upvote points', error);
    }
  }

  /**
   * Award reputation points for a downvote
   */
  async awardDownvotePoints(contentId: number, authorId: number): Promise<void> {
    try {
      // Determine content type to assign correct points
      let contentType: string;
      let points: number;
      
      if (this.useSupabase) {
        const { data, error } = await supabase
          .from('content')
          .select('type')
          .eq('id', contentId)
          .single();
        
        if (error) throw error;
        contentType = data.type;
      } else {
        const result = await this.db.query(
          'SELECT type FROM content WHERE id = $1',
          [contentId]
        );
        
        if (result.rows.length === 0) {
          throw new Error(`Content with ID ${contentId} not found`);
        }
        
        contentType = result.rows[0].type;
      }
      
      // Assign points based on content type
      switch (contentType) {
        case 'question':
          points = REPUTATION_POINTS.QUESTION_DOWNVOTE;
          break;
        case 'answer':
          points = REPUTATION_POINTS.ANSWER_DOWNVOTE;
          break;
        default:
          points = REPUTATION_POINTS.OTHER_DOWNVOTE;
      }
      
      // Update reputation
      await this.updateReputation(authorId, points, ReputationReason.DOWNVOTE, contentId);
    } catch (error) {
      this.handleError('Error awarding downvote points', error);
    }
  }

  /**
   * Award reputation points for an accepted answer
   */
  async awardAcceptedAnswerPoints(answerId: number, answerAuthorId: number): Promise<void> {
    try {
      await this.updateReputation(
        answerAuthorId,
        REPUTATION_POINTS.ACCEPTED_ANSWER,
        ReputationReason.ACCEPTED_ANSWER,
        answerId
      );
    } catch (error) {
      this.handleError('Error awarding accepted answer points', error);
    }
  }

  /**
   * Award reputation points for accepting an answer
   */
  async awardAcceptAnswerPoints(userId: number, answerId: number): Promise<void> {
    try {
      await this.updateReputation(
        userId,
        REPUTATION_POINTS.ACCEPT_ANSWER,
        ReputationReason.ACCEPT_ANSWER,
        answerId
      );
    } catch (error) {
      this.handleError('Error awarding accept answer points', error);
    }
  }

  /**
   * Award reputation points for submitting a tool review
   */
  async awardToolReviewPoints(userId: number, reviewId: number): Promise<void> {
    try {
      await this.updateReputation(
        userId,
        REPUTATION_POINTS.TOOL_REVIEW,
        ReputationReason.TOOL_REVIEW,
        reviewId
      );
    } catch (error) {
      this.handleError('Error awarding tool review points', error);
    }
  }

  /**
   * Get reputation stats for a user
   */
  async getReputationStats(userId: number): Promise<{
    total: number;
    byReason: Record<string, number>;
    rank: number;
    percentile: number;
  }> {
    try {
      // Get total reputation
      let totalReputation: number;
      
      if (this.useSupabase) {
        const { data, error } = await supabase
          .from('users')
          .select('reputation')
          .eq('id', userId)
          .single();
        
        if (error) throw error;
        totalReputation = data.reputation;
      } else {
        const result = await this.db.query(
          'SELECT reputation FROM users WHERE id = $1',
          [userId]
        );
        
        if (result.rows.length === 0) {
          throw new Error(`User with ID ${userId} not found`);
        }
        
        totalReputation = result.rows[0].reputation;
      }
      
      // Get breakdown by reason
      let breakdownByReason: Record<string, number> = {};
      
      if (this.useSupabase) {
        const { data, error } = await supabase
          .from('reputation_history')
          .select('reason, change')
          .eq('user_id', userId);
        
        if (error) throw error;
        
        for (const entry of data) {
          if (!breakdownByReason[entry.reason]) {
            breakdownByReason[entry.reason] = 0;
          }
          breakdownByReason[entry.reason] += entry.change;
        }
      } else {
        const result = await this.db.query(
          `SELECT reason, SUM(change) as total
           FROM reputation_history
           WHERE user_id = $1
           GROUP BY reason`,
          [userId]
        );
        
        for (const row of result.rows) {
          breakdownByReason[row.reason] = parseInt(row.total);
        }
      }
      
      // Get user rank
      let rank: number;
      
      if (this.useSupabase) {
        const { data, error } = await supabase.rpc('get_user_reputation_rank', {
          user_id_param: userId
        });
        
        if (error) throw error;
        rank = data;
      } else {
        const result = await this.db.query(
          `SELECT COUNT(*) + 1 as rank
           FROM users
           WHERE reputation > (SELECT reputation FROM users WHERE id = $1)`,
          [userId]
        );
        
        rank = parseInt(result.rows[0].rank);
      }
      
      // Get percentile
      let percentile: number;
      
      if (this.useSupabase) {
        const { data, error } = await supabase.rpc('get_user_reputation_percentile', {
          user_id_param: userId
        });
        
        if (error) throw error;
        percentile = data;
      } else {
        const result = await this.db.query(
          `SELECT 
             (COUNT(*) FILTER (WHERE reputation <= (SELECT reputation FROM users WHERE id = $1)) * 100.0 / COUNT(*))::numeric(5,2) as percentile
           FROM users
           WHERE reputation > 0`,
          [userId]
        );
        
        percentile = parseFloat(result.rows[0].percentile);
      }
      
      return {
        total: totalReputation,
        byReason: breakdownByReason,
        rank,
        percentile
      };
    } catch (error) {
      this.handleError('Error getting reputation stats', error);
    }
  }
}

// Create and export an instance of the ReputationRepository
export const reputationRepository = new ReputationRepository(Database.getInstance());