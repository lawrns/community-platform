/**
 * Test suite for the NotificationScheduler
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { NotificationScheduler } from '../../services/notifications/scheduledJobs';
import { notificationService } from '../../services/notifications/notificationService';
import cron from 'node-cron';

// Mock dependencies
jest.mock('../../services/notifications/notificationService');
jest.mock('../../config/logger');
jest.mock('node-cron');

describe('NotificationScheduler', () => {
  let scheduler: NotificationScheduler;
  
  beforeEach(() => {
    // Reset all mocks
    jest.resetAllMocks();
    
    // Mock cron.schedule to return a mock task
    (cron.schedule as jest.Mock).mockReturnValue({
      stop: jest.fn()
    });
    
    // Create a new instance of NotificationScheduler for each test
    scheduler = new NotificationScheduler();
  });
  
  it('should start the scheduler and create cron jobs', () => {
    // Start the scheduler
    scheduler.start();
    
    // Verify cron.schedule was called twice (daily and weekly)
    expect(cron.schedule).toHaveBeenCalledTimes(2);
    
    // Check first call for daily job
    expect(cron.schedule).toHaveBeenNthCalledWith(
      1,
      '0 0 8 * * *',
      expect.any(Function)
    );
    
    // Check second call for weekly job
    expect(cron.schedule).toHaveBeenNthCalledWith(
      2,
      '0 0 9 * * 1',
      expect.any(Function)
    );
  });
  
  it('should not start the scheduler if it is already running', () => {
    // Start the scheduler
    scheduler.start();
    
    // Reset the mock to check if it's called again
    jest.resetAllMocks();
    
    // Try to start again
    scheduler.start();
    
    // Verify cron.schedule was not called
    expect(cron.schedule).not.toHaveBeenCalled();
  });
  
  it('should stop the scheduler and cancel cron jobs', () => {
    // Setup mock cron tasks
    const mockDailyTask = { stop: jest.fn() };
    const mockWeeklyTask = { stop: jest.fn() };
    
    // Mock cron.schedule to return our mock tasks
    (cron.schedule as jest.Mock)
      .mockReturnValueOnce(mockDailyTask)
      .mockReturnValueOnce(mockWeeklyTask);
    
    // Start the scheduler
    scheduler.start();
    
    // Stop the scheduler
    scheduler.stop();
    
    // Verify stop was called on both cron tasks
    expect(mockDailyTask.stop).toHaveBeenCalled();
    expect(mockWeeklyTask.stop).toHaveBeenCalled();
  });
  
  it('should not stop the scheduler if it is not running', () => {
    // Setup mock tasks
    const mockTask = { stop: jest.fn() };
    (cron.schedule as jest.Mock).mockReturnValue(mockTask);
    
    // Stop the scheduler without starting
    scheduler.stop();
    
    // Verify stop was not called
    expect(mockTask.stop).not.toHaveBeenCalled();
  });
  
  it('should manually trigger the daily digest', async () => {
    // Mock notificationService.sendDailyDigestEmails
    (notificationService.sendDailyDigestEmails as jest.Mock).mockResolvedValue(undefined);
    
    // Trigger daily digest
    await scheduler.triggerDailyDigest();
    
    // Verify sendDailyDigestEmails was called
    expect(notificationService.sendDailyDigestEmails).toHaveBeenCalled();
  });
  
  it('should manually trigger the weekly digest', async () => {
    // Mock notificationService.sendWeeklyDigestEmails
    (notificationService.sendWeeklyDigestEmails as jest.Mock).mockResolvedValue(undefined);
    
    // Trigger weekly digest
    await scheduler.triggerWeeklyDigest();
    
    // Verify sendWeeklyDigestEmails was called
    expect(notificationService.sendWeeklyDigestEmails).toHaveBeenCalled();
  });
  
  it('should handle errors when manually triggering the daily digest', async () => {
    // Mock notificationService.sendDailyDigestEmails to throw an error
    (notificationService.sendDailyDigestEmails as jest.Mock).mockRejectedValue(new Error('Test error'));
    
    // Trigger daily digest and expect it to throw
    await expect(scheduler.triggerDailyDigest()).rejects.toThrow('Test error');
  });
  
  it('should handle errors when manually triggering the weekly digest', async () => {
    // Mock notificationService.sendWeeklyDigestEmails to throw an error
    (notificationService.sendWeeklyDigestEmails as jest.Mock).mockRejectedValue(new Error('Test error'));
    
    // Trigger weekly digest and expect it to throw
    await expect(scheduler.triggerWeeklyDigest()).rejects.toThrow('Test error');
  });
});