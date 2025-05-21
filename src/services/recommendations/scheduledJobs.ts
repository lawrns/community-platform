/**
 * Scheduled Jobs for Daily Brief Generation
 * Sets up cron jobs for generating daily briefs
 */

import { CronJob } from 'cron';
import logger from '../../config/logger';
import { dailyBriefService } from './dailyBriefService';
import { dailyBriefRepository } from '../../models/DailyBriefRepository';

/**
 * Schedule Manager for daily brief generation
 */
export class DailyBriefScheduler {
  private generateBriefsJob: CronJob | null = null;
  private isRunning: boolean = false;

  /**
   * Initialize and start all scheduled jobs
   */
  start(): void {
    if (this.isRunning) {
      logger.warn('Daily brief scheduler is already running');
      return;
    }

    // Schedule brief generation to run every hour
    // Cron format: seconds minutes hours dayOfMonth month dayOfWeek
    this.generateBriefsJob = new CronJob(
      '0 0 * * * *', // Run at the top of every hour
      async () => {
        logger.info('Running daily brief generation job');
        try {
          await this.generateDailyBriefs();
          logger.info('Daily brief generation completed successfully');
        } catch (error) {
          logger.error('Error running daily brief generation:', error);
        }
      },
      // onComplete handler
      () => {
        logger.debug('Daily brief generation job completed');
      },
      true, // start
      'UTC' // timezone
    );

    // Mark as running
    this.isRunning = true;
    logger.info('Daily brief scheduler started successfully');
  }

  /**
   * Stop all scheduled jobs
   */
  stop(): void {
    if (!this.isRunning) {
      logger.warn('Daily brief scheduler is not running');
      return;
    }

    // Stop the scheduled jobs
    if (this.generateBriefsJob) {
      this.generateBriefsJob.stop();
      this.generateBriefsJob = null;
    }

    this.isRunning = false;
    logger.info('Daily brief scheduler stopped');
  }

  /**
   * Generate daily briefs for users based on their preferences
   */
  async generateDailyBriefs(): Promise<void> {
    try {
      // Get users who should receive a brief at the current time
      // This considers their timezone and preferred delivery time
      const userIds = await dailyBriefRepository.getUsersForBriefGeneration();
      
      logger.info(`Generating daily briefs for ${userIds.length} users`);
      
      let successCount = 0;
      let errorCount = 0;
      
      // Process each user
      for (const userId of userIds) {
        try {
          const brief = await dailyBriefService.generateBrief(userId);
          if (brief) {
            successCount++;
          }
        } catch (error) {
          logger.error(`Error generating brief for user ${userId}:`, error);
          errorCount++;
        }
      }
      
      logger.info(`Daily brief generation summary: ${successCount} succeeded, ${errorCount} failed`);
    } catch (error) {
      logger.error('Error processing daily brief generation:', error);
      throw error;
    }
  }

  /**
   * Manually trigger brief generation for a specific user
   */
  async triggerBriefGeneration(userId: string): Promise<boolean> {
    logger.info(`Manually triggering daily brief for user ${userId}`);
    try {
      const brief = await dailyBriefService.generateBrief(userId);
      return !!brief;
    } catch (error) {
      logger.error(`Error generating manual brief for user ${userId}:`, error);
      return false;
    }
  }

  /**
   * Manually trigger brief generation for all users
   */
  async triggerAllBriefs(): Promise<void> {
    logger.info('Manually triggering daily briefs for all users');
    try {
      await this.generateDailyBriefs();
      logger.info('Manual brief generation completed successfully');
    } catch (error) {
      logger.error('Error running manual brief generation:', error);
      throw error;
    }
  }
}

// Create and export scheduler instance
export const dailyBriefScheduler = new DailyBriefScheduler();