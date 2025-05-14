import { Server as SocketIOServer } from 'socket.io';
import { Server } from 'http';
import { notificationRepository } from '../../models/NotificationRepository';
import { emailService } from '../email/emailService';
import { logger } from '../../config/logger';
import { NotificationType } from '../../models';
import UserRepository from '../../models/UserRepository';
import { supabase } from '../../config/supabase';
import { config } from '../../config/environment';

/**
 * Service for handling notification generation and delivery
 */
export class NotificationService {
  private io: SocketIOServer | null = null;
  private connectedUsers: Map<number, string[]> = new Map(); // userId -> socket ids
  private useSupabase: boolean = !!config.SUPABASE_URL && !!config.SUPABASE_ANON_KEY;

  /**
   * Initialize the notification service with a socket.io server
   */
  initialize(server: Server): void {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL || '*',
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    this.setupSocketHandlers();
    logger.info('NotificationService initialized with WebSocket support');
  }

  /**
   * Set up socket.io event handlers
   */
  private setupSocketHandlers(): void {
    if (!this.io) {
      return;
    }

    this.io.on('connection', (socket) => {
      logger.debug(`Socket connected: ${socket.id}`);

      // Authenticate the socket connection
      socket.on('authenticate', (userId: number) => {
        logger.debug(`Socket ${socket.id} authenticated for user ${userId}`);
        
        // Store connection for later use
        const userSockets = this.connectedUsers.get(userId) || [];
        userSockets.push(socket.id);
        this.connectedUsers.set(userId, userSockets);
        
        // Join a room specific to this user
        socket.join(`user:${userId}`);
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        logger.debug(`Socket disconnected: ${socket.id}`);
        
        // Remove socket from connectedUsers
        for (const [userId, sockets] of this.connectedUsers.entries()) {
          const updatedSockets = sockets.filter(id => id !== socket.id);
          if (updatedSockets.length === 0) {
            this.connectedUsers.delete(userId);
          } else {
            this.connectedUsers.set(userId, updatedSockets);
          }
        }
      });
    });
  }

  /**
   * Create and send a notification
   */
  async createNotification(
    userId: number,
    type: NotificationType,
    content: Record<string, any>,
    options: { 
      sendEmail?: boolean, 
      immediate?: boolean 
    } = {}
  ): Promise<void> {
    try {
      // Check if user wants to receive this notification type
      const shouldSendInApp = await notificationRepository.shouldNotify(userId, type, 'inApp');
      
      if (!shouldSendInApp) {
        logger.debug(`User ${userId} has opted out of in-app notifications for type ${type}`);
        return;
      }
      
      // Create notification in database
      const notification = await notificationRepository.createNotification(userId, type, content);
      
      // Send real-time notification if user is connected
      if (this.io && this.connectedUsers.has(userId)) {
        this.io.to(`user:${userId}`).emit('notification', notification);
        logger.debug(`Sent real-time notification to user ${userId}`);
      }
      
      // Send email notification if requested and user has enabled it
      if (options.sendEmail) {
        const shouldSendEmail = await notificationRepository.shouldNotify(userId, type, 'email');
        
        if (shouldSendEmail && options.immediate) {
          await this.sendEmailNotification(userId, notification);
          logger.debug(`Sent immediate email notification to user ${userId}`);
        }
      }
    } catch (error) {
      logger.error('Error creating notification:', error);
    }
  }

  /**
   * Notify user of a new mention
   */
  async notifyMention(
    userId: number,
    mentionedBy: { id: number, username: string },
    contentId: number,
    contentType: string,
    contentPreview: string
  ): Promise<void> {
    await this.createNotification(
      userId,
      NotificationType.MENTION,
      {
        mentionedBy: {
          id: mentionedBy.id,
          username: mentionedBy.username
        },
        contentId,
        contentType,
        contentPreview
      },
      { sendEmail: true, immediate: true }
    );
  }

  /**
   * Notify user of a new comment
   */
  async notifyComment(
    userId: number,
    commentedBy: { id: number, username: string },
    contentId: number,
    contentType: string,
    commentPreview: string
  ): Promise<void> {
    await this.createNotification(
      userId,
      NotificationType.COMMENT,
      {
        commentedBy: {
          id: commentedBy.id,
          username: commentedBy.username
        },
        contentId,
        contentType,
        commentPreview
      },
      { sendEmail: true, immediate: false }
    );
  }

  /**
   * Notify user of an upvote
   */
  async notifyUpvote(
    userId: number,
    contentId: number,
    contentType: string,
    contentTitle: string
  ): Promise<void> {
    await this.createNotification(
      userId,
      NotificationType.UPVOTE,
      {
        contentId,
        contentType,
        contentTitle
      }
    );
  }

  /**
   * Notify user of a new answer to their question
   */
  async notifyAnswer(
    userId: number,
    answeredBy: { id: number, username: string },
    questionId: number,
    questionTitle: string,
    answerId: number,
    answerPreview: string
  ): Promise<void> {
    await this.createNotification(
      userId,
      NotificationType.ANSWER,
      {
        answeredBy: {
          id: answeredBy.id,
          username: answeredBy.username
        },
        questionId,
        questionTitle,
        answerId,
        answerPreview
      },
      { sendEmail: true, immediate: false }
    );
  }

  /**
   * Notify user of a new follower
   */
  async notifyFollow(
    userId: number,
    follower: { id: number, username: string }
  ): Promise<void> {
    await this.createNotification(
      userId,
      NotificationType.FOLLOW,
      {
        follower: {
          id: follower.id,
          username: follower.username
        }
      },
      { sendEmail: true, immediate: true }
    );
  }

  /**
   * Notify user of a system event
   */
  async notifySystem(
    userId: number,
    title: string,
    message: string,
    action?: { text: string, url: string }
  ): Promise<void> {
    await this.createNotification(
      userId,
      NotificationType.SYSTEM,
      {
        title,
        message,
        action
      },
      { sendEmail: true, immediate: true }
    );
  }

  /**
   * Notify user of a badge award
   */
  async notifyBadgeAwarded(
    userId: number,
    badge: { id: number, name: string, description: string, level: string }
  ): Promise<void> {
    await this.createNotification(
      userId,
      NotificationType.BADGE,
      {
        badge
      },
      { sendEmail: true, immediate: true }
    );
  }

  /**
   * Send an immediate email notification
   */
  private async sendEmailNotification(userId: number, notification: any): Promise<void> {
    try {
      // Get user email
      const user = await this.getUserEmail(userId);
      if (!user || !user.email) {
        logger.warn(`Cannot send email notification: no email for user ${userId}`);
        return;
      }

      // Prepare email content based on notification type
      let subject = '';
      let template = '';
      let context = {};

      switch (notification.type) {
        case NotificationType.MENTION:
          subject = `${notification.content.mentionedBy.username} mentioned you`;
          template = 'mention';
          context = {
            username: user.username,
            mentionedBy: notification.content.mentionedBy.username,
            contentType: notification.content.contentType,
            contentPreview: notification.content.contentPreview,
            url: `${process.env.FRONTEND_URL}/view/${notification.content.contentId}`
          };
          break;

        case NotificationType.FOLLOW:
          subject = `${notification.content.follower.username} is now following you`;
          template = 'follow';
          context = {
            username: user.username,
            follower: notification.content.follower.username,
            url: `${process.env.FRONTEND_URL}/profile/${notification.content.follower.id}`
          };
          break;

        case NotificationType.BADGE:
          subject = `You've earned the ${notification.content.badge.name} badge!`;
          template = 'badge';
          context = {
            username: user.username,
            badgeName: notification.content.badge.name,
            badgeDescription: notification.content.badge.description,
            badgeLevel: notification.content.badge.level,
            url: `${process.env.FRONTEND_URL}/profile/${userId}#badges`
          };
          break;

        case NotificationType.SYSTEM:
          subject = notification.content.title;
          template = 'system';
          context = {
            username: user.username,
            title: notification.content.title,
            message: notification.content.message,
            action: notification.content.action
          };
          break;

        default:
          return; // Don't send email for other notification types
      }

      await emailService.sendTemplateEmail(
        user.email,
        subject,
        template,
        context
      );
    } catch (error) {
      logger.error('Error sending email notification:', error);
    }
  }

  /**
   * Get user email from the user repository
   */
  private async getUserEmail(userId: number): Promise<{ email: string, username: string } | null> {
    try {
      // Initialize user repository with the database instance
      const userRepository = new UserRepository();
      
      // Get user by ID
      const user = await userRepository.findById(userId);
      
      if (!user) {
        logger.warn(`Cannot find user with ID ${userId} for email notification`);
        return null;
      }
      
      return {
        email: user.email,
        username: user.username || user.name || 'User'
      };
    } catch (error) {
      logger.error('Error getting user email:', error);
      return null;
    }
  }

  /**
   * Send daily email digest for all users
   */
  async sendDailyDigestEmails(): Promise<void> {
    try {
      // This would typically be called by a scheduled job
      // Get all users who have opted for daily digests
      const users = await this.getUsersForDigest('daily');
      
      for (const user of users) {
        // Get notifications from the last 24 hours
        const since = new Date();
        since.setHours(since.getHours() - 24);
        
        const notifications = await notificationRepository.getDigestNotifications(user.id, since);
        
        if (notifications.length === 0) {
          continue; // No notifications to digest
        }
        
        // Group notifications by type
        const groupedNotifications = this.groupNotificationsByType(notifications);
        
        // Send the digest email
        await emailService.sendTemplateEmail(
          user.email,
          'Your Daily Notification Digest',
          'digest',
          {
            username: user.username,
            notifications: groupedNotifications,
            notificationCount: notifications.length,
            digestPeriod: 'daily',
            unsubscribeUrl: `${process.env.FRONTEND_URL}/settings/notifications`
          }
        );
        
        logger.info(`Sent daily digest to user ${user.id}`);
      }
    } catch (error) {
      logger.error('Error sending daily digest emails:', error);
    }
  }

  /**
   * Send weekly email digest for all users
   */
  async sendWeeklyDigestEmails(): Promise<void> {
    try {
      // Get all users who have opted for weekly digests
      const users = await this.getUsersForDigest('weekly');
      
      for (const user of users) {
        // Get notifications from the last 7 days
        const since = new Date();
        since.setDate(since.getDate() - 7);
        
        const notifications = await notificationRepository.getDigestNotifications(user.id, since);
        
        if (notifications.length === 0) {
          continue; // No notifications to digest
        }
        
        // Group notifications by type
        const groupedNotifications = this.groupNotificationsByType(notifications);
        
        // Send the digest email
        await emailService.sendTemplateEmail(
          user.email,
          'Your Weekly Notification Digest',
          'digest',
          {
            username: user.username,
            notifications: groupedNotifications,
            notificationCount: notifications.length,
            digestPeriod: 'weekly',
            unsubscribeUrl: `${process.env.FRONTEND_URL}/settings/notifications`
          }
        );
        
        logger.info(`Sent weekly digest to user ${user.id}`);
      }
    } catch (error) {
      logger.error('Error sending weekly digest emails:', error);
    }
  }

  /**
   * Get users who have opted for a specific digest frequency
   */
  private async getUsersForDigest(frequency: string): Promise<Array<{ id: number, email: string, username: string }>> {
    try {
      // Initialize user repository
      const userRepository = new UserRepository();
      
      // Query users with the right notification preferences
      let userIds: number[] = [];
      
      if (this.useSupabase) {
        // Using Supabase
        const { data, error } = await supabase
          .from('user_settings')
          .select('user_id')
          .contains('notification_preferences', { 
            email: { 
              enabled: true,
              digest: frequency 
            }
          });
          
        if (error) {
          logger.error(`Error finding users for ${frequency} digest:`, error);
          return [];
        }
        
        userIds = data.map(row => row.user_id);
      } else {
        // Using direct database query
        const query = `
          SELECT user_id 
          FROM user_settings 
          WHERE notification_preferences->>'email'->'enabled' = 'true'
          AND notification_preferences->>'email'->'digest' = $1
        `;
        
        const result = await userRepository.query(query, [frequency]);
        userIds = result.rows.map(row => row.user_id);
      }
      
      // Now fetch the actual user details for these IDs
      const users: Array<{ id: number, email: string, username: string }> = [];
      
      for (const userId of userIds) {
        const user = await userRepository.findById(userId);
        if (user && user.email) {
          users.push({
            id: userId,
            email: user.email,
            username: user.username || user.name || 'User'
          });
        }
      }
      
      logger.info(`Found ${users.length} users for ${frequency} digest`);
      return users;
    } catch (error) {
      logger.error(`Error getting users for ${frequency} digest:`, error);
      return [];
    }
  }

  /**
   * Group notifications by type for email digest
   */
  private groupNotificationsByType(notifications: any[]): Record<string, any[]> {
    const grouped: Record<string, any[]> = {};
    
    for (const notification of notifications) {
      if (!grouped[notification.type]) {
        grouped[notification.type] = [];
      }
      
      grouped[notification.type].push(notification);
    }
    
    return grouped;
  }
}

// Create and export an instance of the NotificationService
export const notificationService = new NotificationService();