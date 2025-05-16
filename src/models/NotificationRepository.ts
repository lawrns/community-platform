import db from '../config/database';
import { supabase } from '../config/supabase';
import { Notification } from './index';
import Repository from './Repository';
import { config } from '../config/environment';

// Define notification types
export enum NotificationType {
  MENTION = 'mention',
  COMMENT = 'comment',
  FOLLOW = 'follow',
  LIKE = 'like',
  ANSWER = 'answer',
  BADGE = 'badge',
  SYSTEM = 'system'
}

/**
 * Repository for managing notifications
 */
export class NotificationRepository extends Repository<Notification> {
  protected tableName = 'notifications';
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
   * Create a new notification for a user
   */
  async createNotification(
    userId: number, 
    type: NotificationType, 
    content: Record<string, any>
  ): Promise<Notification> {
    try {
      if (this.useSupabase) {
        const { data, error } = await supabase
          .from('notifications')
          .insert({
            user_id: userId,
            type,
            content,
            is_read: false
          })
          .select('*')
          .single();

        if (error) throw error;
        return data as Notification;
      } else {
        const result = await db.query(
          `INSERT INTO notifications (user_id, type, content, is_read, created_at)
           VALUES ($1, $2, $3, $4, NOW())
           RETURNING *`,
          [userId, type, JSON.stringify(content), false]
        );
        return result.rows[0];
      }
    } catch (error) {
      return this.handleError('Error creating notification', error);
    }
  }

  /**
   * Get all notifications for a user
   */
  async getUserNotifications(
    userId: number,
    limit: number = 20,
    offset: number = 0,
    includeRead: boolean = false
  ): Promise<Notification[]> {
    try {
      if (this.useSupabase) {
        let query = supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (!includeRead) {
          query = query.eq('is_read', false);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data as Notification[];
      } else {
        const whereClause = includeRead 
          ? 'WHERE user_id = $1' 
          : 'WHERE user_id = $1 AND is_read = false';
          
        const result = await db.query(
          `SELECT * FROM notifications
           ${whereClause}
           ORDER BY created_at DESC
           LIMIT $2 OFFSET $3`,
          [userId, limit, offset]
        );
        return result.rows;
      }
    } catch (error) {
      return this.handleError('Error getting user notifications', error);
    }
  }

  /**
   * Get notification count for a user
   */
  async getNotificationCount(userId: number, unreadOnly: boolean = true): Promise<number> {
    try {
      if (this.useSupabase) {
        let query = supabase
          .from('notifications')
          .select('id', { count: 'exact' })
          .eq('user_id', userId);

        if (unreadOnly) {
          query = query.eq('is_read', false);
        }

        const { count, error } = await query;

        if (error) throw error;
        return count || 0;
      } else {
        const whereClause = unreadOnly 
          ? 'WHERE user_id = $1 AND is_read = false' 
          : 'WHERE user_id = $1';
          
        const result = await db.query(
          `SELECT COUNT(*) FROM notifications ${whereClause}`,
          [userId]
        );
        return parseInt(result.rows[0].count);
      }
    } catch (error) {
      return this.handleError('Error getting notification count', error);
    }
  }

  /**
   * Mark notifications as read
   */
  async markAsRead(notificationIds: number[]): Promise<void> {
    if (!notificationIds.length) return;
    
    try {
      if (this.useSupabase) {
        const { error } = await supabase
          .from('notifications')
          .update({ is_read: true })
          .in('id', notificationIds);

        if (error) throw error;
      } else {
        await db.query(
          `UPDATE notifications 
           SET is_read = true 
           WHERE id = ANY($1)`,
          [notificationIds]
        );
      }
    } catch (error) {
      return this.handleError('Error marking notifications as read', error);
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: number): Promise<void> {
    try {
      if (this.useSupabase) {
        const { error } = await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('user_id', userId)
          .eq('is_read', false);

        if (error) throw error;
      } else {
        await db.query(
          `UPDATE notifications 
           SET is_read = true 
           WHERE user_id = $1 AND is_read = false`,
          [userId]
        );
      }
    } catch (error) {
      return this.handleError('Error marking all notifications as read', error);
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: number): Promise<void> {
    try {
      if (this.useSupabase) {
        const { error } = await supabase
          .from('notifications')
          .delete()
          .eq('id', notificationId);

        if (error) throw error;
      } else {
        await db.query(
          'DELETE FROM notifications WHERE id = $1',
          [notificationId]
        );
      }
    } catch (error) {
      return this.handleError('Error deleting notification', error);
    }
  }

  /**
   * Delete all notifications for a user
   */
  async deleteAllNotifications(userId: number): Promise<void> {
    try {
      if (this.useSupabase) {
        const { error } = await supabase
          .from('notifications')
          .delete()
          .eq('user_id', userId);

        if (error) throw error;
      } else {
        await db.query(
          'DELETE FROM notifications WHERE user_id = $1',
          [userId]
        );
      }
    } catch (error) {
      return this.handleError('Error deleting all notifications', error);
    }
  }
  
  /**
   * Find notifications for a user
   */
  async findByUser(userId: number, limit: number = 20, offset: number = 0): Promise<Notification[]> {
    try {
      if (this.useSupabase) {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (error) throw error;
        return data || [];
      } else {
        const result = await db.query(
          'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
          [userId, limit, offset]
        );
        return result.rows;
      }
    } catch (error) {
      return this.handleError('Error finding notifications for user', error);
    }
  }
  
  /**
   * Count unread notifications for a user
   */
  async countUnread(userId: number): Promise<number> {
    try {
      if (this.useSupabase) {
        const { count, error } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('is_read', false);

        if (error) throw error;
        return count || 0;
      } else {
        const result = await db.query(
          'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = false',
          [userId]
        );
        return parseInt(result.rows[0].count);
      }
    } catch (error) {
      return this.handleError('Error counting unread notifications', error);
    }
  }

  /**
   * Get notifications for email digest
   * Returns notifications created since the specified time
   */
  async getDigestNotifications(
    userId: number,
    since: Date
  ): Promise<Notification[]> {
    try {
      if (this.useSupabase) {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .gte('created_at', since.toISOString())
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data as Notification[];
      } else {
        const result = await db.query(
          `SELECT * FROM notifications
           WHERE user_id = $1 AND created_at >= $2
           ORDER BY created_at DESC`,
          [userId, since]
        );
        return result.rows;
      }
    } catch (error) {
      return this.handleError('Error getting digest notifications', error);
    }
  }

  /**
   * Get user notification preferences
   * Returns default preferences if none are set
   */
  async getUserNotificationPreferences(userId: number): Promise<Record<string, any>> {
    try {
      const defaultPreferences = {
        inApp: true,
        email: {
          enabled: true,
          digest: 'daily', // 'daily', 'weekly', 'never'
          immediateFor: ['mention', 'follow']
        },
        types: {
          mention: true,
          comment: true,
          upvote: true,
          answer: true,
          follow: true,
          system: true,
          badge: true
        }
      };

      if (this.useSupabase) {
        const { data, error } = await supabase
          .from('user_settings')
          .select('notification_preferences')
          .eq('user_id', userId)
          .single();

        if (error) {
          if (error.code === 'PGRST116') { // Not found
            // Create default settings
            await supabase
              .from('user_settings')
              .insert({
                user_id: userId,
                notification_preferences: defaultPreferences
              });
            return defaultPreferences;
          }
          throw error;
        }
        
        return data?.notification_preferences || defaultPreferences;
      } else {
        const result = await db.query(
          'SELECT notification_preferences FROM user_settings WHERE user_id = $1',
          [userId]
        );

        if (result.rows.length === 0) {
          // Create default settings
          await db.query(
            `INSERT INTO user_settings (user_id, notification_preferences)
             VALUES ($1, $2)`,
            [userId, JSON.stringify(defaultPreferences)]
          );
          return defaultPreferences;
        }

        return result.rows[0].notification_preferences;
      }
    } catch (error) {
      this.handleError('Error getting notification preferences', error);
      return {
        inApp: true,
        email: {
          enabled: true,
          digest: 'daily',
          immediateFor: ['mention', 'follow']
        },
        types: {
          mention: true,
          comment: true,
          upvote: true,
          answer: true,
          follow: true,
          system: true,
          badge: true
        }
      };
    }
  }

  /**
   * Update user notification preferences
   */
  async updateNotificationPreferences(
    userId: number,
    preferences: Record<string, any>
  ): Promise<void> {
    try {
      if (this.useSupabase) {
        const { error } = await supabase
          .from('user_settings')
          .update({
            notification_preferences: preferences,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        if (error) throw error;
      } else {
        await db.query(
          `UPDATE user_settings
           SET notification_preferences = $1, updated_at = NOW()
           WHERE user_id = $2`,
          [JSON.stringify(preferences), userId]
        );
      }
    } catch (error) {
      return this.handleError('Error updating notification preferences', error);
    }
  }

  /**
   * Check if a user should receive a notification of a certain type
   * Takes into account their notification preferences
   */
  async shouldNotify(
    userId: number,
    type: NotificationType,
    channel: 'inApp' | 'email' = 'inApp'
  ): Promise<boolean> {
    try {
      const preferences = await this.getUserNotificationPreferences(userId);
      
      // Check if user has opted out of all notifications
      if (!preferences) return true; // Default to sending if no preferences set
      
      // Check if user has opted out of this channel
      if (channel === 'inApp' && preferences.inApp === false) return false;
      if (channel === 'email' && (!preferences.email || preferences.email.enabled === false)) return false;
      
      // Check if user has opted out of this notification type
      if (preferences.types && preferences.types[type] === false) return false;
      
      // For email, check if it should be immediate or part of digest
      if (channel === 'email' && preferences.email) {
        const immediateTypes = preferences.email.immediateFor || [];
        if (!immediateTypes.includes(type)) return false;
      }
      
      return true;
    } catch (error) {
      this.handleError('Error checking notification preferences', error);
      return true; // Default to sending notification if error
    }
  }
}

// Create and export an instance of the NotificationRepository
export const notificationRepository = new NotificationRepository();