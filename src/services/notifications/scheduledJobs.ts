/**
 * Scheduled Jobs for Notification System
 * Sets up cron jobs for periodic tasks like email digests
 */

import { CronJob } from 'cron';
import NotificationService from './notificationService';
import logger from '../../config/logger';
import env from '../../config/environment';
import UserRepository from '../../models/UserRepository';

// Create singleton instance
const notificationService = new NotificationService();

/**
 * Schedule Manager for notification-related tasks
 */
export class NotificationScheduler {
  private dailyDigestJob: CronJob | null = null;
  private weeklyDigestJob: CronJob | null = null;
  private isRunning: boolean = false;

  /**
   * Initialize and start all scheduled jobs
   */
  start(): void {
    if (this.isRunning) {
      logger.warn('Notification scheduler is already running');
      return;
    }

    // Schedule daily digest emails to run at 8:00 AM every day
    // Cron format: seconds minutes hours dayOfMonth month dayOfWeek
    this.dailyDigestJob = new CronJob(
      '0 0 8 * * *',
      async () => {
        logger.info('Running daily notification digest job');
        try {
          await this.sendDailyDigestEmails();
          logger.info('Daily digest job completed successfully');
        } catch (error) {
          logger.error('Error running daily digest job:', error);
        }
      },
      // onComplete handler
      () => {
        logger.debug('Daily digest job completed');
      },
      true, // start
      'UTC' // timezone
    );

    // Schedule weekly digest emails to run at 9:00 AM every Monday
    this.weeklyDigestJob = new CronJob(
      '0 0 9 * * 1',
      async () => {
        logger.info('Running weekly notification digest job');
        try {
          await this.sendWeeklyDigestEmails();
          logger.info('Weekly digest job completed successfully');
        } catch (error) {
          logger.error('Error running weekly digest job:', error);
        }
      },
      // onComplete handler
      () => {
        logger.debug('Weekly digest job completed');
      },
      true, // start
      'UTC' // timezone
    );

    // Mark as running
    this.isRunning = true;
    logger.info('Notification scheduler started successfully');
  }

  /**
   * Stop all scheduled jobs
   */
  stop(): void {
    if (!this.isRunning) {
      logger.warn('Notification scheduler is not running');
      return;
    }

    // Stop the scheduled jobs
    if (this.dailyDigestJob) {
      this.dailyDigestJob.stop();
      this.dailyDigestJob = null;
    }

    if (this.weeklyDigestJob) {
      this.weeklyDigestJob.stop();
      this.weeklyDigestJob = null;
    }

    this.isRunning = false;
    logger.info('Notification scheduler stopped');
  }

  /**
   * Send daily digest emails to all users who have opted in
   */
  async sendDailyDigestEmails(): Promise<void> {
    try {
      // Find users who have opted in to daily digests
      const userRepo = new UserRepository();
      const users = await userRepo.findAll();
      
      let sentCount = 0;
      let errorCount = 0;
      
      // Process each user
      for (const user of users) {
        try {
          // For now, send to all users. In a real app, check user preferences
          const success = await notificationService.sendDigest(user.id);
          if (success) {
            sentCount++;
          }
        } catch (error) {
          logger.error(`Error sending digest to user ${user.id}:`, error);
          errorCount++;
        }
      }
      
      logger.info(`Daily digest summary: sent ${sentCount} emails, ${errorCount} errors`);
    } catch (error) {
      logger.error('Error processing daily digests:', error);
      throw error;
    }
  }
  
  /**
   * Send weekly digest emails to all users who have opted in
   */
  async sendWeeklyDigestEmails(): Promise<void> {
    try {
      // Find users who have opted in to weekly digests
      const userRepo = new UserRepository();
      const users = await userRepo.findAll();
      
      let sentCount = 0;
      let errorCount = 0;
      
      // Process each user
      for (const user of users) {
        try {
          // For now, send to all users. In a real app, check user preferences
          const success = await notificationService.sendDigest(user.id);
          if (success) {
            sentCount++;
          }
        } catch (error) {
          logger.error(`Error sending weekly digest to user ${user.id}:`, error);
          errorCount++;
        }
      }
      
      logger.info(`Weekly digest summary: sent ${sentCount} emails, ${errorCount} errors`);
    } catch (error) {
      logger.error('Error processing weekly digests:', error);
      throw error;
    }
  }

  /**
   * Manually trigger the daily digest job for testing
   */
  async triggerDailyDigest(): Promise<void> {
    logger.info('Manually triggering daily notification digest');
    try {
      await this.sendDailyDigestEmails();
      logger.info('Manual daily digest completed successfully');
    } catch (error) {
      logger.error('Error running manual daily digest:', error);
      throw error;
    }
  }

  /**
   * Manually trigger the weekly digest job for testing
   */
  async triggerWeeklyDigest(): Promise<void> {
    logger.info('Manually triggering weekly notification digest');
    try {
      await this.sendWeeklyDigestEmails();
      logger.info('Manual weekly digest completed successfully');
    } catch (error) {
      logger.error('Error running manual weekly digest:', error);
      throw error;
    }
  }
}

// Create and export scheduler instance
export const notificationScheduler = new NotificationScheduler();