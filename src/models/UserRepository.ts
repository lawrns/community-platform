/**
 * User Repository
 * Database operations for users with Supabase support
 */

import Repository from './Repository';
import { User } from './index';
import db from '../config/database';
import { supabase } from '../config/supabase';
import { config } from '../config/environment';
import { executeQuery, rawQuery } from '../utils/supabaseUtils';

// Determine if we should use Supabase
const useSupabase = !!config.SUPABASE_URL && !!config.SUPABASE_ANON_KEY;

/**
 * Repository for user operations
 */
export default class UserRepository extends Repository<User> {
  protected tableName = 'users';
  
  /**
   * Find content by user
   */
  async findContentByUser(userId: number, limit: number = 20, offset: number = 0, type?: string): Promise<any[]> {
    try {
      let query = `SELECT * FROM content WHERE author_id = $1`;
      const params = [userId];
      
      if (type) {
        query += ` AND type = $2`;
        params.push(type as any);
      }
      
      query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit, offset);
      
      const result = await db.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('Error finding content by user:', error);
      return [];
    }
  }

  /**
   * Find a user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    if (useSupabase) {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('email', email)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error finding user by email:', error);
      }
      
      return data as User || null;
    } else {
      const result = await db.query(
        `SELECT * FROM ${this.tableName} WHERE email = $1`,
        [email]
      );
      
      return result.rows.length ? result.rows[0] as User : null;
    }
  }

  /**
   * Find a user by username
   */
  async findByUsername(username: string): Promise<User | null> {
    if (useSupabase) {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('username', username)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error finding user by username:', error);
      }
      
      return data as User || null;
    } else {
      const result = await db.query(
        `SELECT * FROM ${this.tableName} WHERE username = $1`,
        [username]
      );
      
      return result.rows.length ? result.rows[0] as User : null;
    }
  }

  /**
   * Find a user by authentication provider ID
   * @deprecated Use findByProviderAndProviderId instead
   */
  async findByAuthProviderId(provider: string, providerUserId: string): Promise<User | null> {
    if (useSupabase) {
      // For Supabase Auth, we can get the user directly from auth.users
      if (provider === 'supabase') {
        // First get the auth user
        const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(providerUserId);
        
        if (authError || !authUser) {
          console.error('Error finding auth user:', authError);
          return null;
        }
        
        // Then get the corresponding user from our users table
        const { data, error } = await supabase
          .from(this.tableName)
          .select('*')
          .eq('email', authUser.user.email)
          .single();
          
        if (error && error.code !== 'PGRST116') {
          console.error('Error finding user by provider ID:', error);
        }
        
        return data as User || null;
      } else {
        // For other providers
        const { data, error } = await supabase
          .from(this.tableName)
          .select('*')
          .eq('auth_provider', provider)
          .eq('auth_provider_id', providerUserId)
          .single();
        
        if (error && error.code !== 'PGRST116') {
          console.error('Error finding user by provider ID:', error);
        }
        
        return data as User || null;
      }
    } else {
      const result = await db.query(
        `SELECT * FROM ${this.tableName} WHERE auth_provider = $1 AND auth_provider_id = $2`,
        [provider, providerUserId]
      );
      
      return result.rows.length ? result.rows[0] as User : null;
    }
  }
  
  /**
   * Find a user by provider and provider ID
   */
  async findByProviderAndProviderId(provider: string, providerId: string): Promise<User | null> {
    return this.findByAuthProviderId(provider, providerId);
  }

  /**
   * Update user reputation
   */
  async updateReputation(userId: number | string, change: number, reason: string, contentId?: number | string): Promise<void> {
    if (useSupabase) {
      const { error } = await supabase.rpc('update_user_reputation', {
        user_id: userId,
        reputation_change: change,
        change_reason: reason,
        content_id: contentId || null
      });
      
      if (error) {
        console.error('Error updating reputation:', error);
        throw new Error(`Failed to update reputation: ${error.message}`);
      }
    } else {
      await db.query(
        `SELECT update_user_reputation($1, $2, $3, $4)`,
        [userId, change, reason, contentId]
      );
    }
  }

  /**
   * Get user reputation history
   */
  async getReputationHistory(userId: number | string, limit: number = 20, offset: number = 0): Promise<any[]> {
    if (useSupabase) {
      const { data, error } = await supabase
        .from('reputation_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (error) {
        console.error('Error getting reputation history:', error);
        throw new Error(`Failed to get reputation history: ${error.message}`);
      }
      
      return data || [];
    } else {
      const result = await db.query(
        `SELECT * FROM reputation_history 
         WHERE user_id = $1 
         ORDER BY created_at DESC 
         LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
      );
      
      return result.rows;
    }
  }

  /**
   * Check if a user has a specific privilege
   */
  async hasPrivilege(userId: number | string, privilege: string): Promise<boolean> {
    if (useSupabase) {
      const { data, error } = await supabase.rpc('user_has_privilege', {
        p_user_id: userId,
        p_privilege: privilege
      });
      
      if (error) {
        console.error('Error checking privilege:', error);
        throw new Error(`Failed to check privilege: ${error.message}`);
      }
      
      return !!data;
    } else {
      const result = await db.query(
        `SELECT user_has_privilege($1, $2) AS has_privilege`,
        [userId, privilege]
      );
      
      return result.rows[0].has_privilege;
    }
  }

  /**
   * Get user badges
   */
  async getBadges(userId: number | string): Promise<any[]> {
    if (useSupabase) {
      const { data, error } = await supabase
        .from('badges')
        .select(`
          *,
          user_badges!inner(*)
        `)
        .eq('user_badges.user_id', userId)
        .order('user_badges.awarded_at', { ascending: false });
      
      if (error) {
        console.error('Error getting user badges:', error);
        throw new Error(`Failed to get user badges: ${error.message}`);
      }
      
      return data || [];
    } else {
      const result = await db.query(
        `SELECT b.* 
         FROM badges b
         JOIN user_badges ub ON b.id = ub.badge_id
         WHERE ub.user_id = $1
         ORDER BY ub.awarded_at DESC`,
        [userId]
      );
      
      return result.rows;
    }
  }

  /**
   * Get user statistics
   */
  async getStats(userId: number | string): Promise<any> {
    if (useSupabase) {
      // We can use a Supabase function for this or run individual queries
      const { data, error } = await supabase.rpc('get_user_stats', {
        p_user_id: userId
      });
      
      if (error) {
        console.error('Error getting user stats:', error);
        
        // Fallback to individual queries if the RPC function fails
        const questionCountPromise = supabase
          .from('content')
          .select('*', { count: 'exact', head: true })
          .eq('author_id', userId)
          .eq('type', 'question');
          
        const answerCountPromise = supabase
          .from('content')
          .select('*', { count: 'exact', head: true })
          .eq('author_id', userId)
          .eq('type', 'answer');
          
        const postCountPromise = supabase
          .from('content')
          .select('*', { count: 'exact', head: true })
          .eq('author_id', userId)
          .eq('type', 'post');
          
        const acceptedAnswersPromise = supabase
          .from('content')
          .select('*', { count: 'exact', head: true })
          .eq('author_id', userId)
          .eq('type', 'answer')
          .eq('is_accepted', true);
          
        const reviewCountPromise = supabase
          .from('tool_reviews')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);
          
        const badgeCountPromise = supabase
          .from('user_badges')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);
        
        const [
          questionCount,
          answerCount,
          postCount,
          acceptedAnswers,
          reviewCount,
          badgeCount
        ] = await Promise.all([
          questionCountPromise,
          answerCountPromise,
          postCountPromise,
          acceptedAnswersPromise,
          reviewCountPromise,
          badgeCountPromise
        ]);
        
        return {
          question_count: questionCount.count || 0,
          answer_count: answerCount.count || 0,
          post_count: postCount.count || 0,
          accepted_answers: acceptedAnswers.count || 0,
          review_count: reviewCount.count || 0,
          badge_count: badgeCount.count || 0
        };
      }
      
      return data;
    } else {
      const result = await db.query(
        `SELECT 
           (SELECT COUNT(*) FROM content WHERE author_id = $1 AND type = 'question') AS question_count,
           (SELECT COUNT(*) FROM content WHERE author_id = $1 AND type = 'answer') AS answer_count,
           (SELECT COUNT(*) FROM content WHERE author_id = $1 AND type = 'post') AS post_count,
           (SELECT COUNT(*) FROM content WHERE author_id = $1 AND type = 'answer' AND is_accepted = true) AS accepted_answers,
           (SELECT COUNT(*) FROM tool_reviews WHERE user_id = $1) AS review_count,
           (SELECT COUNT(*) FROM user_badges WHERE user_id = $1) AS badge_count
         `,
        [userId]
      );
      
      return result.rows[0];
    }
  }
}