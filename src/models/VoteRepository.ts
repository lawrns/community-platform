/**
 * Vote Repository
 * Database operations for quadratic voting with Supabase support
 */

import Repository from './Repository';
import db from '../config/database';
import { supabase } from '../config/supabase';
import { config } from '../config/environment';
import { UserVote, VoteCredits, VoteCreditTransaction } from './index';
import logger from '../config/logger';

// Determine if we should use Supabase
const useSupabase = !!config.SUPABASE_URL && !!config.SUPABASE_ANON_KEY;

/**
 * Repository for vote operations
 */
export default class VoteRepository extends Repository<UserVote> {
  protected tableName = 'user_votes';
  
  /**
   * Cast a quadratic vote on content, tool, or review
   */
  async quadraticVote(
    userId: number,
    targetId: number,
    targetType: 'content' | 'tool' | 'review',
    voteWeight: number,
    voteType: 1 | -1
  ): Promise<any> {
    try {
      if (useSupabase) {
        // Call the database function to handle quadratic voting
        const { data, error } = await supabase.rpc('handle_quadratic_vote', {
          p_user_id: userId,
          p_target_id: targetId,
          p_target_type: targetType,
          p_vote_weight: voteWeight,
          p_vote_type: voteType
        });
        
        if (error) {
          logger.error('Error casting quadratic vote:', error);
          throw new Error(`Failed to cast vote: ${error.message}`);
        }
        
        return data;
      } else {
        // For direct database connection
        const result = await db.query(
          `SELECT handle_quadratic_vote($1, $2, $3, $4, $5) as result`,
          [userId, targetId, targetType, voteWeight, voteType]
        );
        
        return result.rows[0].result;
      }
    } catch (error) {
      logger.error('Error in quadraticVote:', error);
      throw error;
    }
  }
  
  /**
   * Remove a quadratic vote
   */
  async removeQuadraticVote(
    userId: number,
    targetId: number,
    targetType: 'content' | 'tool' | 'review'
  ): Promise<any> {
    try {
      if (useSupabase) {
        // Call the database function to handle vote removal
        const { data, error } = await supabase.rpc('remove_quadratic_vote', {
          p_user_id: userId,
          p_target_id: targetId,
          p_target_type: targetType
        });
        
        if (error) {
          logger.error('Error removing quadratic vote:', error);
          throw new Error(`Failed to remove vote: ${error.message}`);
        }
        
        return data;
      } else {
        // For direct database connection
        const result = await db.query(
          `SELECT remove_quadratic_vote($1, $2, $3) as result`,
          [userId, targetId, targetType]
        );
        
        return result.rows[0].result;
      }
    } catch (error) {
      logger.error('Error in removeQuadraticVote:', error);
      throw error;
    }
  }
  
  /**
   * Get a user's vote credits
   */
  async getUserVoteCredits(userId: number): Promise<VoteCredits | null> {
    try {
      if (useSupabase) {
        const { data, error } = await supabase
          .from('vote_credits')
          .select('*')
          .eq('user_id', userId)
          .single();
          
        if (error && error.code !== 'PGRST116') {
          logger.error('Error fetching vote credits:', error);
          throw new Error(`Failed to get vote credits: ${error.message}`);
        }
        
        return data as VoteCredits || null;
      } else {
        const result = await db.query(
          `SELECT * FROM vote_credits WHERE user_id = $1`,
          [userId]
        );
        
        return result.rows.length ? result.rows[0] as VoteCredits : null;
      }
    } catch (error) {
      logger.error('Error in getUserVoteCredits:', error);
      throw error;
    }
  }
  
  /**
   * Get credit transaction history for a user
   */
  async getVoteCreditHistory(
    userId: number,
    limit: number = 20,
    offset: number = 0
  ): Promise<{ transactions: VoteCreditTransaction[], total: number }> {
    try {
      if (useSupabase) {
        // Get transactions
        const { data, error, count } = await supabase
          .from('vote_credit_transactions')
          .select('*', { count: 'exact' })
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);
          
        if (error) {
          logger.error('Error fetching vote credit history:', error);
          throw new Error(`Failed to get vote credit history: ${error.message}`);
        }
        
        return {
          transactions: data as VoteCreditTransaction[] || [],
          total: count || 0
        };
      } else {
        // Get transactions
        const result = await db.query(
          `SELECT * FROM vote_credit_transactions 
           WHERE user_id = $1 
           ORDER BY created_at DESC 
           LIMIT $2 OFFSET $3`,
          [userId, limit, offset]
        );
        
        // Get total count
        const countResult = await db.query(
          `SELECT COUNT(*) as total FROM vote_credit_transactions WHERE user_id = $1`,
          [userId]
        );
        
        return {
          transactions: result.rows as VoteCreditTransaction[],
          total: parseInt(countResult.rows[0].total)
        };
      }
    } catch (error) {
      logger.error('Error in getVoteCreditHistory:', error);
      throw error;
    }
  }
  
  /**
   * Get all votes by a user
   */
  async getUserVotes(
    userId: number,
    targetType?: 'content' | 'tool' | 'review',
    limit: number = 20,
    offset: number = 0
  ): Promise<{ votes: UserVote[], total: number }> {
    try {
      let query;
      let params: any[] = [userId, limit, offset];
      
      if (useSupabase) {
        let supabaseQuery = supabase
          .from('user_votes')
          .select('*', { count: 'exact' })
          .eq('user_id', userId);
          
        if (targetType === 'content') {
          supabaseQuery = supabaseQuery.not('content_id', 'is', null);
        } else if (targetType === 'tool') {
          supabaseQuery = supabaseQuery.not('tool_id', 'is', null);
        } else if (targetType === 'review') {
          supabaseQuery = supabaseQuery.not('review_id', 'is', null);
        }
        
        const { data, error, count } = await supabaseQuery
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);
          
        if (error) {
          logger.error('Error fetching user votes:', error);
          throw new Error(`Failed to get user votes: ${error.message}`);
        }
        
        return {
          votes: data as UserVote[] || [],
          total: count || 0
        };
      } else {
        if (targetType === 'content') {
          query = `
            SELECT * FROM user_votes 
            WHERE user_id = $1 AND content_id IS NOT NULL
            ORDER BY created_at DESC 
            LIMIT $2 OFFSET $3
          `;
        } else if (targetType === 'tool') {
          query = `
            SELECT * FROM user_votes 
            WHERE user_id = $1 AND tool_id IS NOT NULL
            ORDER BY created_at DESC 
            LIMIT $2 OFFSET $3
          `;
        } else if (targetType === 'review') {
          query = `
            SELECT * FROM user_votes 
            WHERE user_id = $1 AND review_id IS NOT NULL
            ORDER BY created_at DESC 
            LIMIT $2 OFFSET $3
          `;
        } else {
          query = `
            SELECT * FROM user_votes 
            WHERE user_id = $1
            ORDER BY created_at DESC 
            LIMIT $2 OFFSET $3
          `;
        }
        
        const result = await db.query(query, params);
        
        // Get total count
        let countQuery;
        
        if (targetType === 'content') {
          countQuery = `
            SELECT COUNT(*) as total FROM user_votes 
            WHERE user_id = $1 AND content_id IS NOT NULL
          `;
        } else if (targetType === 'tool') {
          countQuery = `
            SELECT COUNT(*) as total FROM user_votes 
            WHERE user_id = $1 AND tool_id IS NOT NULL
          `;
        } else if (targetType === 'review') {
          countQuery = `
            SELECT COUNT(*) as total FROM user_votes 
            WHERE user_id = $1 AND review_id IS NOT NULL
          `;
        } else {
          countQuery = `
            SELECT COUNT(*) as total FROM user_votes 
            WHERE user_id = $1
          `;
        }
        
        const countResult = await db.query(countQuery, [userId]);
        
        return {
          votes: result.rows as UserVote[],
          total: parseInt(countResult.rows[0].total)
        };
      }
    } catch (error) {
      logger.error('Error in getUserVotes:', error);
      throw error;
    }
  }
  
  /**
   * Get a specific vote
   */
  async getVote(
    userId: number,
    targetId: number,
    targetType: 'content' | 'tool' | 'review'
  ): Promise<UserVote | null> {
    try {
      let query;
      let params: any[] = [userId, targetId];
      
      if (useSupabase) {
        let supabaseQuery = supabase
          .from('user_votes')
          .select('*')
          .eq('user_id', userId);
          
        if (targetType === 'content') {
          supabaseQuery = supabaseQuery.eq('content_id', targetId);
        } else if (targetType === 'tool') {
          supabaseQuery = supabaseQuery.eq('tool_id', targetId);
        } else if (targetType === 'review') {
          supabaseQuery = supabaseQuery.eq('review_id', targetId);
        }
        
        const { data, error } = await supabaseQuery.single();
          
        if (error && error.code !== 'PGRST116') {
          logger.error('Error fetching vote:', error);
          throw new Error(`Failed to get vote: ${error.message}`);
        }
        
        return data as UserVote || null;
      } else {
        if (targetType === 'content') {
          query = `
            SELECT * FROM user_votes 
            WHERE user_id = $1 AND content_id = $2
          `;
        } else if (targetType === 'tool') {
          query = `
            SELECT * FROM user_votes 
            WHERE user_id = $1 AND tool_id = $2
          `;
        } else if (targetType === 'review') {
          query = `
            SELECT * FROM user_votes 
            WHERE user_id = $1 AND review_id = $2
          `;
        } else {
          throw new Error('Invalid target type');
        }
        
        const result = await db.query(query, params);
        
        return result.rows.length ? result.rows[0] as UserVote : null;
      }
    } catch (error) {
      logger.error('Error in getVote:', error);
      throw error;
    }
  }
}