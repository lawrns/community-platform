/**
 * Scheduled Jobs for Notification System
 * Sets up cron jobs for periodic tasks like email digests
 */

import cron from 'node-cron';
import { notificationService } from './notificationService';
import logger from '../../config/logger';
import env from '../../config/environment';

/**
 * Schedule Manager for notification-related tasks
 */
export class NotificationScheduler {
  private dailyDigestJob: cron.ScheduledTask | null = null;
  private weeklyDigestJob: cron.ScheduledTask | null = null;
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
    // Cron format: second(0-59) minute(0-59) hour(0-23) day(1-31) month(1-12) weekday(0-6)
    this.dailyDigestJob = cron.schedule('0 0 8 * * *', async () => {
      logger.info('Running daily notification digest job');
      try {
        await notificationService.sendDailyDigestEmails();
        logger.info('Daily digest job completed successfully');
      } catch (error) {
        logger.error('Error running daily digest job:', error);
      }
    });

    // Schedule weekly digest emails to run at 9:00 AM every Monday
    this.weeklyDigestJob = cron.schedule('0 0 9 * * 1', async () => {
      logger.info('Running weekly notification digest job');
      try {
        await notificationService.sendWeeklyDigestEmails();
        logger.info('Weekly digest job completed successfully');
      } catch (error) {
        logger.error('Error running weekly digest job:', error);
      }
    });

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
   * Manually trigger the daily digest job for testing
   */
  async triggerDailyDigest(): Promise<void> {
    logger.info('Manually triggering daily notification digest');
    try {
      await notificationService.sendDailyDigestEmails();
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
      await notificationService.sendWeeklyDigestEmails();
      logger.info('Manual weekly digest completed successfully');
    } catch (error) {
      logger.error('Error running manual weekly digest:', error);
      throw error;
    }
  }
}

// Create and export scheduler instance
export const notificationScheduler = new NotificationScheduler();