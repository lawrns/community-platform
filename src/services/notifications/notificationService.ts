import { Server as SocketIOServer } from 'socket.io';
import { Server } from 'http';
import { NotificationRepository } from '../../models/NotificationRepository';
import { emailService } from '../email/emailService';
import logger from '../../config/logger';
import { User } from '../../models';

// Create repository instance
const notificationRepository = new NotificationRepository();

// Define NotificationType enum (to replace the import)
export enum NotificationType {
  MENTION = 'mention',
  COMMENT = 'comment',
  FOLLOW = 'follow',
  LIKE = 'like',
  ANSWER = 'answer',
  BADGE = 'badge',
  SYSTEM = 'system'
}

import UserRepository from '../../models/UserRepository';
import { supabase } from '../../config/supabase';
import { config } from '../../config/environment';

/**
 * Service for handling notification generation and delivery
 */
class NotificationService {
  private io: SocketIOServer | null = null;
  private connectedUsers: Map<number, string[]> = new Map(); // userId -> socket ids
  private useSupabase: boolean = !!config.SUPABASE_URL && !!config.SUPABASE_ANON_KEY;

  /**
   * Initialize the notification service with a socket.io server
   */
  initialize(server: Server): void {
    // Initialize Socket.IO server
    this.io = new SocketIOServer(server, {
      cors: {
        origin: config.FRONTEND_URL,
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    // Set up connection handling
    this.io.on('connection', (socket: any) => {
      logger.info(`Socket connected: ${socket.id}`);

      // Handle authentication
      socket.on('authenticate', async (token: string) => {
        try {
          // Verify token and get user ID
          const userId = await this.verifyToken(token);
          
          if (!userId) {
            socket.emit('auth_error', { message: 'Invalid authentication token' });
            return;
          }
          
          // Store user connection
          this.registerConnection(userId, socket.id);
          
          // Join user-specific room
          socket.join(`user:${userId}`);
          
          socket.emit('authenticated', { success: true });
          
          logger.info(`Socket ${socket.id} authenticated as user ${userId}`);
        } catch (error) {
          logger.error('Socket authentication error:', error);
          socket.emit('auth_error', { message: 'Authentication failed' });
        }
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        this.handleDisconnect(socket.id);
        logger.info(`Socket disconnected: ${socket.id}`);
      });
    });

    logger.info('Notification service initialized');
  }

  /**
   * Register a user connection
   */
  private registerConnection(userId: number, socketId: string): void {
    if (!this.connectedUsers.has(userId)) {
      this.connectedUsers.set(userId, []);
    }
    
    this.connectedUsers.get(userId)?.push(socketId);
  }

  /**
   * Handle socket disconnection
   */
  private handleDisconnect(socketId: string): void {
    // Find and remove the socket from connectedUsers
    for (const [userId, sockets] of this.connectedUsers.entries()) {
      const index = sockets.indexOf(socketId);
      
      if (index !== -1) {
        sockets.splice(index, 1);
        
        // Remove the entry if no sockets left
        if (sockets.length === 0) {
          this.connectedUsers.delete(userId);
        }
        
        break;
      }
    }
  }

  /**
   * Verify authentication token and return user ID
   */
  private async verifyToken(token: string): Promise<number | null> {
    try {
      // In a real implementation, this would validate the JWT
      // For now, we're just returning a placeholder user ID
      return 1; // Placeholder
    } catch (error) {
      logger.error('Token verification error:', error);
      return null;
    }
  }

  /**
   * Check if a user is currently connected
   */
  isUserConnected(userId: number): boolean {
    return this.connectedUsers.has(userId) && 
           (this.connectedUsers.get(userId)?.length ?? 0) > 0;
  }

  /**
   * Send a notification to a user
   */
  async sendNotification(
    userId: number,
    type: NotificationType,
    content: Record<string, any>,
    shouldEmail: boolean = false
  ): Promise<void> {
    try {
      // Create notification in database
      const notification = await notificationRepository.create({
        user_id: userId,
        type,
        content,
        is_read: false,
        created_at: new Date()
      });

      // Send real-time notification if user is connected
      if (this.io && this.isUserConnected(userId)) {
        this.io.to(`user:${userId}`).emit('notification', {
          id: notification.id,
          type,
          content,
          created_at: notification.created_at
        });
      }

      // Send email notification if requested and user is not connected
      if (shouldEmail && !this.isUserConnected(userId)) {
        await this.sendEmailNotification(userId, type, content);
      }
    } catch (error) {
      logger.error('Error sending notification:', error);
    }
  }

  /**
   * Send an email notification
   */
  private async sendEmailNotification(
    userId: number,
    type: NotificationType,
    content: Record<string, any>
  ): Promise<void> {
    try {
      // Get user details
      const userRepo = new UserRepository();
      const user = await userRepo.findById(userId);
      
      if (!user || !user.email) {
        logger.warn(`Cannot send email notification: User ${userId} not found or has no email`);
        return;
      }
      
      // Prepare email content based on notification type
      let subject = '';
      let message = '';
      let ctaText = '';
      let ctaUrl = '';
      
      switch (type) {
        case NotificationType.MENTION:
          subject = 'You were mentioned in a post';
          message = `${content.mentioner_name} mentioned you in a ${content.content_type}.`;
          ctaText = 'View Post';
          ctaUrl = `${config.FRONTEND_URL}/view/${content.content_id}`;
          break;
          
        case NotificationType.COMMENT:
          subject = 'New comment on your post';
          message = `${content.commenter_name} commented on your ${content.content_type}.`;
          ctaText = 'View Comment';
          ctaUrl = `${config.FRONTEND_URL}/view/${content.content_id}#comment-${content.comment_id}`;
          break;
          
        case NotificationType.FOLLOW:
          subject = 'You have a new follower';
          message = `${content.follower_name} is now following you.`;
          ctaText = 'View Profile';
          ctaUrl = `${config.FRONTEND_URL}/profile/${content.follower_username}`;
          break;
          
        case NotificationType.LIKE:
          subject = 'Someone liked your content';
          message = `${content.liker_name} liked your ${content.content_type}.`;
          ctaText = 'View Content';
          ctaUrl = `${config.FRONTEND_URL}/view/${content.content_id}`;
          break;
          
        case NotificationType.ANSWER:
          subject = 'Your question received an answer';
          message = `${content.answerer_name} answered your question.`;
          ctaText = 'View Answer';
          ctaUrl = `${config.FRONTEND_URL}/view/${content.question_id}#answer-${content.answer_id}`;
          break;
          
        case NotificationType.BADGE:
          subject = 'You earned a new badge';
          message = `Congratulations! You've earned the ${content.badge_name} badge.`;
          ctaText = 'View Your Badges';
          ctaUrl = `${config.FRONTEND_URL}/profile/${user.username}#badges`;
          break;
          
        case NotificationType.SYSTEM:
          subject = content.subject || 'System Notification';
          message = content.message || 'You have a new system notification.';
          if (content.cta_text && content.cta_url) {
            ctaText = content.cta_text;
            ctaUrl = content.cta_url;
          }
          break;
      }
      
      // Send email notification
      await emailService.sendNotificationEmail(
        user.email,
        user.name,
        subject,
        message,
        ctaText,
        ctaUrl
      );
      
      logger.info(`Email notification sent to user ${userId} (${type})`);
    } catch (error) {
      logger.error('Error sending email notification:', error);
    }
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(userId: number, notificationId: number): Promise<boolean> {
    try {
      await notificationRepository.update(notificationId, {
        is_read: true
      });
      
      return true;
    } catch (error) {
      logger.error('Error marking notification as read:', error);
      return false;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: number): Promise<boolean> {
    try {
      const notifications = await notificationRepository.findByUser(userId);
      
      for (const notification of notifications) {
        await notificationRepository.update(notification.id, {
          is_read: true
        });
      }
      
      return true;
    } catch (error) {
      logger.error('Error marking all notifications as read:', error);
      return false;
    }
  }

  /**
   * Get unread notification count for a user
   */
  async getUnreadCount(userId: number): Promise<number> {
    try {
      const count = await notificationRepository.countUnread(userId);
      return count;
    } catch (error) {
      logger.error('Error getting unread count:', error);
      return 0;
    }
  }

  /**
   * Send a batch notification to multiple users
   */
  async sendBatchNotification(
    userIds: number[],
    type: NotificationType,
    content: Record<string, any>,
    shouldEmail: boolean = false
  ): Promise<void> {
    try {
      // Filter out duplicates
      const uniqueUserIds = [...new Set(userIds)];
      
      // Create notifications in batch
      if (this.useSupabase) {
        const notificationsToInsert = uniqueUserIds.map(userId => ({
          user_id: userId,
          type,
          content,
          is_read: false,
          created_at: new Date()
        }));
        
        const { error } = await supabase
          .from('notifications')
          .insert(notificationsToInsert);
          
        if (error) {
          throw error;
        }
        
        // Get the created notifications
        const { data: notifications } = await supabase
          .from('notifications')
          .select('*')
          .in('user_id', uniqueUserIds)
          .eq('type', type)
          .order('created_at', { ascending: false })
          .limit(uniqueUserIds.length);
          
        // Send real-time notifications
        if (this.io && notifications) {
          for (const notification of notifications) {
            if (this.isUserConnected(notification.user_id)) {
              this.io.to(`user:${notification.user_id}`).emit('notification', {
                id: notification.id,
                type,
                content,
                created_at: notification.created_at
              });
            }
          }
        }
      } else {
        // Sequential creation if not using Supabase
        for (const userId of uniqueUserIds) {
          await this.sendNotification(userId, type, content, shouldEmail);
        }
      }
      
      // Send email notifications
      if (shouldEmail) {
        // Get users who should receive email (not connected)
        const emailRecipients = uniqueUserIds.filter(userId => !this.isUserConnected(userId));
        
        for (const userId of emailRecipients) {
          await this.sendEmailNotification(userId, type, content);
        }
      }
    } catch (error) {
      logger.error('Error sending batch notification:', error);
    }
  }

  /**
   * Send digest email with recent notifications
   */
  async sendDigest(userId: number): Promise<boolean> {
    try {
      // Get user details
      const userRepo = new UserRepository();
      const user = await userRepo.findById(userId);
      
      if (!user || !user.email) {
        logger.warn(`Cannot send digest: User ${userId} not found or has no email`);
        return false;
      }
      
      // Get recent unread notifications
      const unreadNotifications = await notificationRepository.findByUser(userId, 10);
      
      if (unreadNotifications.length === 0) {
        logger.info(`No unread notifications for user ${userId}, skipping digest`);
        return false;
      }
      
      // Format notifications for display
      const formattedNotifications = unreadNotifications.map((row: any) => {
        const { type, content, created_at } = row;
        let message = '';
        
        switch (type) {
          case NotificationType.MENTION:
            message = `${content.mentioner_name} mentioned you in a ${content.content_type}.`;
            break;
          case NotificationType.COMMENT:
            message = `${content.commenter_name} commented on your ${content.content_type}.`;
            break;
          case NotificationType.FOLLOW:
            message = `${content.follower_name} is now following you.`;
            break;
          case NotificationType.LIKE:
            message = `${content.liker_name} liked your ${content.content_type}.`;
            break;
          case NotificationType.ANSWER:
            message = `${content.answerer_name} answered your question.`;
            break;
          case NotificationType.BADGE:
            message = `You earned the ${content.badge_name} badge.`;
            break;
          case NotificationType.SYSTEM:
            message = content.message || 'System notification';
            break;
        }
        
        return {
          type,
          message,
          created_at
        };
      });
      
      // Send digest email template
      await emailService.sendTemplateEmail(
        user.email,
        'Your Daily Digest',
        'digest',
        {
          name: user.name,
          notifications: formattedNotifications,
          count: unreadNotifications.length,
          profileUrl: `${config.FRONTEND_URL}/profile/${user.username}`,
          settingsUrl: `${config.FRONTEND_URL}/settings/notifications`
        }
      );
      
      logger.info(`Digest email sent to user ${userId} with ${unreadNotifications.length} notifications`);
      return true;
    } catch (error) {
      logger.error('Error sending digest email:', error);
      return false;
    }
  }
}

// Export the class 
export default NotificationService;

// Create and export singleton instance
export const notificationService = new NotificationService();