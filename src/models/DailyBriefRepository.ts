import db from '../config/database';
import { supabase } from '../config/supabase';
import Repository from './Repository';
import { config } from '../config/environment';

/**
 * Types for daily brief entities
 */
export interface DailyBrief {
  id: string;
  user_id: string;
  title: string;
  summary: string;
  generated_at: Date;
  read_at?: Date;
  expired_at: Date;
  metadata?: Record<string, any>;
}

export interface BriefItem {
  id: string;
  brief_id: string;
  content_type: string;
  content_id: string;
  title: string;
  summary: string;
  relevance_score: number;
  position: number;
  metadata?: Record<string, any>;
}

export interface BriefInteraction {
  id: string;
  brief_id: string;
  item_id?: string;
  user_id: string;
  interaction_type: 'view' | 'click' | 'save' | 'share' | 'dismiss';
  created_at: Date;
  metadata?: Record<string, any>;
}

export interface UserBriefPreferences {
  user_id: string;
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  content_types: string[];
  preferred_time: string;
  preferred_timezone: string;
  max_items: number;
  email_delivery: boolean;
  last_updated: Date;
}

/**
 * Repository for managing daily briefs
 */
export class DailyBriefRepository extends Repository<DailyBrief> {
  protected tableName = 'daily_briefs';
  // Determine if we should use Supabase
  private useSupabase = !!config.SUPABASE_URL && !!config.SUPABASE_ANON_KEY;
  
  /**
   * Handle common errors in repository methods
   */
  private handleError(message: string, error: unknown): never {
    console.error(`${message}:`, error);
    throw new Error(`${message}: ${error instanceof Error ? error.message : String(error)}`);
  }

  /**
   * Create a new daily brief for a user
   */
  async createBrief(
    userId: string,
    title: string,
    summary: string,
    metadata?: Record<string, any>
  ): Promise<DailyBrief> {
    try {
      if (this.useSupabase) {
        const { data, error } = await supabase
          .from('daily_briefs')
          .insert({
            user_id: userId,
            title,
            summary,
            metadata: metadata || {}
          })
          .select('*')
          .single();

        if (error) throw error;
        return data as DailyBrief;
      } else {
        const result = await db.query(
          `INSERT INTO daily_briefs (user_id, title, summary, metadata, generated_at, expired_at)
           VALUES ($1, $2, $3, $4, NOW(), NOW() + INTERVAL '7 days')
           RETURNING *`,
          [userId, title, summary, JSON.stringify(metadata || {})]
        );
        return result.rows[0];
      }
    } catch (error) {
      return this.handleError('Error creating daily brief', error);
    }
  }

  /**
   * Add items to a daily brief
   */
  async addBriefItems(items: Omit<BriefItem, 'id'>[]): Promise<BriefItem[]> {
    if (!items.length) return [];
    
    try {
      if (this.useSupabase) {
        const { data, error } = await supabase
          .from('brief_items')
          .insert(items)
          .select('*');

        if (error) throw error;
        return data as BriefItem[];
      } else {
        // For PostgreSQL direct, we need to handle multiple inserts
        const values = items.map(item => `(
          '${item.brief_id}', 
          '${item.content_type}', 
          '${item.content_id}', 
          '${item.title.replace(/'/g, "''")}', 
          '${item.summary.replace(/'/g, "''")}', 
          ${item.relevance_score}, 
          ${item.position}, 
          '${JSON.stringify(item.metadata || {})}'
        )`).join(', ');
        
        const result = await db.query(
          `INSERT INTO brief_items 
           (brief_id, content_type, content_id, title, summary, relevance_score, position, metadata)
           VALUES ${values}
           RETURNING *`
        );
        return result.rows;
      }
    } catch (error) {
      return this.handleError('Error adding brief items', error);
    }
  }

  /**
   * Get the latest brief for a user
   */
  async getLatestBrief(userId: string): Promise<DailyBrief | null> {
    try {
      if (this.useSupabase) {
        const { data, error } = await supabase.rpc('get_latest_user_brief', {
          p_user_id: userId
        });

        if (error) throw error;
        return data && data.length > 0 ? data[0] : null;
      } else {
        const result = await db.query(
          `SELECT * FROM daily_briefs
           WHERE user_id = $1
           ORDER BY generated_at DESC
           LIMIT 1`,
          [userId]
        );
        return result.rows.length > 0 ? result.rows[0] : null;
      }
    } catch (error) {
      return this.handleError('Error getting latest brief', error);
    }
  }

  /**
   * Get a brief with its items
   */
  async getBriefWithItems(briefId: string): Promise<{ brief: DailyBrief, items: BriefItem[] } | null> {
    try {
      if (this.useSupabase) {
        // First get the brief
        const { data: briefData, error: briefError } = await supabase
          .from('daily_briefs')
          .select('*')
          .eq('id', briefId)
          .single();

        if (briefError) throw briefError;
        if (!briefData) return null;

        // Then get the items
        const { data: itemsData, error: itemsError } = await supabase
          .from('brief_items')
          .select('*')
          .eq('brief_id', briefId)
          .order('position', { ascending: true });

        if (itemsError) throw itemsError;

        return {
          brief: briefData as DailyBrief,
          items: itemsData as BriefItem[] || []
        };
      } else {
        // Get the brief
        const briefResult = await db.query(
          `SELECT * FROM daily_briefs WHERE id = $1`,
          [briefId]
        );
        
        if (briefResult.rows.length === 0) return null;
        
        // Get the items
        const itemsResult = await db.query(
          `SELECT * FROM brief_items
           WHERE brief_id = $1
           ORDER BY position ASC`,
          [briefId]
        );
        
        return {
          brief: briefResult.rows[0],
          items: itemsResult.rows
        };
      }
    } catch (error) {
      return this.handleError('Error getting brief with items', error);
    }
  }

  /**
   * Mark a brief as read
   */
  async markAsRead(briefId: string, userId: string): Promise<void> {
    try {
      if (this.useSupabase) {
        const { error } = await supabase.rpc('mark_brief_as_read', {
          p_brief_id: briefId,
          p_user_id: userId
        });

        if (error) throw error;
      } else {
        await db.query(
          `UPDATE daily_briefs
           SET read_at = NOW()
           WHERE id = $1 AND user_id = $2`,
          [briefId, userId]
        );
        
        // Add a view interaction
        await db.query(
          `INSERT INTO brief_interactions
           (brief_id, user_id, interaction_type)
           VALUES ($1, $2, 'view')`,
          [briefId, userId]
        );
      }
    } catch (error) {
      return this.handleError('Error marking brief as read', error);
    }
  }

  /**
   * Record an interaction with a brief item
   */
  async recordItemInteraction(
    itemId: string,
    userId: string,
    interactionType: 'click' | 'save' | 'share' | 'dismiss'
  ): Promise<void> {
    try {
      if (this.useSupabase) {
        const { error } = await supabase.rpc('record_brief_item_interaction', {
          p_item_id: itemId,
          p_user_id: userId,
          p_interaction_type: interactionType
        });

        if (error) throw error;
      } else {
        // Get the brief_id from the item
        const briefResult = await db.query(
          `SELECT brief_id FROM brief_items WHERE id = $1`,
          [itemId]
        );
        
        if (briefResult.rows.length === 0) {
          throw new Error(`Item with ID ${itemId} not found`);
        }
        
        const briefId = briefResult.rows[0].brief_id;
        
        // Insert the interaction
        await db.query(
          `INSERT INTO brief_interactions
           (brief_id, item_id, user_id, interaction_type)
           VALUES ($1, $2, $3, $4)`,
          [briefId, itemId, userId, interactionType]
        );
      }
    } catch (error) {
      return this.handleError('Error recording item interaction', error);
    }
  }

  /**
   * Get briefs for a user
   */
  async getUserBriefs(
    userId: string,
    limit: number = 10,
    offset: number = 0,
    includeExpired: boolean = false
  ): Promise<DailyBrief[]> {
    try {
      const now = new Date().toISOString();
      
      if (this.useSupabase) {
        let query = supabase
          .from('daily_briefs')
          .select('*')
          .eq('user_id', userId)
          .order('generated_at', { ascending: false })
          .range(offset, offset + limit - 1);
          
        if (!includeExpired) {
          query = query.gte('expired_at', now);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data as DailyBrief[] || [];
      } else {
        const whereClause = includeExpired
          ? 'WHERE user_id = $1'
          : `WHERE user_id = $1 AND expired_at >= NOW()`;
          
        const result = await db.query(
          `SELECT * FROM daily_briefs
           ${whereClause}
           ORDER BY generated_at DESC
           LIMIT $2 OFFSET $3`,
          [userId, limit, offset]
        );
        return result.rows;
      }
    } catch (error) {
      return this.handleError('Error getting user briefs', error);
    }
  }

  /**
   * Get user brief preferences
   * Creates default preferences if none exist
   */
  async getUserBriefPreferences(userId: string): Promise<UserBriefPreferences> {
    try {
      const defaultPreferences: UserBriefPreferences = {
        user_id: userId,
        enabled: true,
        frequency: 'daily',
        content_types: ['tools', 'topics', 'discussions'],
        preferred_time: '08:00:00',
        preferred_timezone: 'UTC',
        max_items: 10,
        email_delivery: true,
        last_updated: new Date()
      };

      if (this.useSupabase) {
        const { data, error } = await supabase
          .from('user_brief_preferences')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (error) {
          if (error.code === 'PGRST116') { // Not found
            // Create default preferences
            const { data: insertedData, error: insertError } = await supabase
              .from('user_brief_preferences')
              .insert(defaultPreferences)
              .select()
              .single();
              
            if (insertError) throw insertError;
            return insertedData as UserBriefPreferences;
          }
          throw error;
        }
        
        return data as UserBriefPreferences;
      } else {
        const result = await db.query(
          'SELECT * FROM user_brief_preferences WHERE user_id = $1',
          [userId]
        );

        if (result.rows.length === 0) {
          // Create default preferences
          const insertResult = await db.query(
            `INSERT INTO user_brief_preferences 
             (user_id, enabled, frequency, content_types, preferred_time, 
              preferred_timezone, max_items, email_delivery, last_updated)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
             RETURNING *`,
            [
              userId,
              defaultPreferences.enabled,
              defaultPreferences.frequency,
              JSON.stringify(defaultPreferences.content_types),
              defaultPreferences.preferred_time,
              defaultPreferences.preferred_timezone,
              defaultPreferences.max_items,
              defaultPreferences.email_delivery
            ]
          );
          return insertResult.rows[0];
        }

        return result.rows[0];
      }
    } catch (error) {
      return this.handleError('Error getting brief preferences', error);
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
      if (this.useSupabase) {
        const { data, error } = await supabase
          .from('user_brief_preferences')
          .update({
            ...preferences,
            last_updated: new Date().toISOString()
          })
          .eq('user_id', userId)
          .select()
          .single();

        if (error) throw error;
        return data as UserBriefPreferences;
      } else {
        // Build the update query dynamically based on the provided preferences
        const updates: string[] = [];
        const values: any[] = [];
        let paramCounter = 1;
        
        for (const [key, value] of Object.entries(preferences)) {
          if (key === 'user_id') continue; // Skip user_id
          
          updates.push(`${key} = $${paramCounter}`);
          values.push(key === 'content_types' ? JSON.stringify(value) : value);
          paramCounter++;
        }
        
        // Add last_updated
        updates.push(`last_updated = NOW()`);
        
        // Add userId at the end
        values.push(userId);
        
        const result = await db.query(
          `UPDATE user_brief_preferences
           SET ${updates.join(', ')}
           WHERE user_id = $${paramCounter}
           RETURNING *`,
          values
        );
        
        return result.rows[0];
      }
    } catch (error) {
      return this.handleError('Error updating brief preferences', error);
    }
  }

  /**
   * Get users who should receive a brief at the current time
   * Based on their preferences and timezone
   */
  async getUsersForBriefGeneration(): Promise<string[]> {
    try {
      if (this.useSupabase) {
        const { data, error } = await supabase.rpc('get_users_for_brief_generation');

        if (error) throw error;
        return data || [];
      } else {
        // This is a complex query involving timezones, so we execute it directly
        const result = await db.query(`
          WITH timezone_users AS (
            SELECT 
              user_id,
              preferred_timezone,
              preferred_time,
              frequency
            FROM user_brief_preferences
            WHERE enabled = true
          )
          SELECT 
            user_id
          FROM timezone_users
          WHERE 
            -- For daily briefs
            (
              frequency = 'daily' AND
              EXTRACT(HOUR FROM NOW() AT TIME ZONE preferred_timezone) = EXTRACT(HOUR FROM preferred_time::time) AND
              EXTRACT(MINUTE FROM NOW() AT TIME ZONE preferred_timezone) BETWEEN 0 AND 10
            )
            OR 
            -- For weekly briefs - assuming we want to deliver on Mondays
            (
              frequency = 'weekly' AND
              EXTRACT(DOW FROM NOW() AT TIME ZONE preferred_timezone) = 1 AND -- Monday
              EXTRACT(HOUR FROM NOW() AT TIME ZONE preferred_timezone) = EXTRACT(HOUR FROM preferred_time::time) AND
              EXTRACT(MINUTE FROM NOW() AT TIME ZONE preferred_timezone) BETWEEN 0 AND 10
            )
            OR 
            -- For monthly briefs - first day of month
            (
              frequency = 'monthly' AND
              EXTRACT(DAY FROM NOW() AT TIME ZONE preferred_timezone) = 1 AND -- First day of month
              EXTRACT(HOUR FROM NOW() AT TIME ZONE preferred_timezone) = EXTRACT(HOUR FROM preferred_time::time) AND
              EXTRACT(MINUTE FROM NOW() AT TIME ZONE preferred_timezone) BETWEEN 0 AND 10
            )
        `);
        
        return result.rows.map(row => row.user_id);
      }
    } catch (error) {
      return this.handleError('Error getting users for brief generation', error);
    }
  }
  
  /**
   * Get brief interaction statistics
   * Useful for analyzing which content is most engaging
   */
  async getBriefStats(
    startDate: Date,
    endDate: Date = new Date()
  ): Promise<any> {
    try {
      if (this.useSupabase) {
        const { data, error } = await supabase.rpc('get_brief_stats', {
          p_start_date: startDate.toISOString(),
          p_end_date: endDate.toISOString()
        });

        if (error) throw error;
        return data;
      } else {
        const result = await db.query(`
          WITH brief_views AS (
            SELECT 
              brief_id,
              COUNT(*) as view_count
            FROM brief_interactions
            WHERE 
              interaction_type = 'view' AND
              created_at BETWEEN $1 AND $2
            GROUP BY brief_id
          ),
          item_interactions AS (
            SELECT 
              bi.brief_id,
              bi.content_type,
              COUNT(*) as interaction_count,
              COUNT(*) FILTER (WHERE bi.interaction_type = 'click') as click_count,
              COUNT(*) FILTER (WHERE bi.interaction_type = 'save') as save_count,
              COUNT(*) FILTER (WHERE bi.interaction_type = 'share') as share_count
            FROM brief_interactions bi
            JOIN brief_items bit ON bi.item_id = bit.id
            WHERE 
              bi.interaction_type IN ('click', 'save', 'share') AND
              bi.created_at BETWEEN $1 AND $2
            GROUP BY bi.brief_id, bit.content_type
          )
          SELECT 
            db.id as brief_id,
            db.title,
            db.generated_at,
            COALESCE(bv.view_count, 0) as view_count,
            COALESCE(ii.interaction_count, 0) as interaction_count,
            COALESCE(ii.click_count, 0) as click_count,
            COALESCE(ii.save_count, 0) as save_count,
            COALESCE(ii.share_count, 0) as share_count,
            CASE 
              WHEN COALESCE(bv.view_count, 0) > 0 
              THEN COALESCE(ii.interaction_count, 0)::float / COALESCE(bv.view_count, 1) 
              ELSE 0 
            END as engagement_rate
          FROM daily_briefs db
          LEFT JOIN brief_views bv ON db.id = bv.brief_id
          LEFT JOIN item_interactions ii ON db.id = ii.brief_id
          WHERE db.generated_at BETWEEN $1 AND $2
          ORDER BY db.generated_at DESC
        `, [startDate, endDate]);
        
        return result.rows;
      }
    } catch (error) {
      return this.handleError('Error getting brief statistics', error);
    }
  }
}

// Create and export an instance of the DailyBriefRepository
export const dailyBriefRepository = new DailyBriefRepository();