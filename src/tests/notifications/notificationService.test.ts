/**
 * Test suite for the NotificationService
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { NotificationService } from '../../services/notifications/notificationService';
import { notificationRepository } from '../../models/NotificationRepository';
import { emailService } from '../../services/email/emailService';
import { createServer } from 'http';
import { NotificationType } from '../../models';

// Mock dependencies
jest.mock('../../models/NotificationRepository');
jest.mock('../../services/email/emailService');
jest.mock('../../config/logger');
jest.mock('socket.io');

describe('NotificationService', () => {
  let notificationService: NotificationService;
  let mockServer;
  
  beforeEach(() => {
    // Reset all mocks
    jest.resetAllMocks();
    
    // Create a new instance of NotificationService for each test
    notificationService = new NotificationService();
    
    // Create a mock HTTP server
    mockServer = createServer();
    
    // Initialize the service
    notificationService.initialize(mockServer);
  });
  
  afterEach(() => {
    // Clean up any open connections
    mockServer.close();
  });
  
  it('should create a notification', async () => {
    // Mock notificationRepository.shouldNotify to return true
    (notificationRepository.shouldNotify as jest.Mock).mockResolvedValue(true);
    
    // Mock notificationRepository.createNotification to return a notification
    (notificationRepository.createNotification as jest.Mock).mockResolvedValue({
      id: 1,
      user_id: 1,
      type: NotificationType.MENTION,
      content: { test: 'content' },
      is_read: false,
      created_at: new Date().toISOString()
    });
    
    await notificationService.createNotification(
      1, 
      NotificationType.MENTION,
      { test: 'content' }
    );
    
    // Verify that shouldNotify was called
    expect(notificationRepository.shouldNotify).toHaveBeenCalledWith(
      1, 
      NotificationType.MENTION, 
      'inApp'
    );
    
    // Verify that createNotification was called
    expect(notificationRepository.createNotification).toHaveBeenCalledWith(
      1, 
      NotificationType.MENTION, 
      { test: 'content' }
    );
  });
  
  it('should not create a notification if user opted out', async () => {
    // Mock notificationRepository.shouldNotify to return false
    (notificationRepository.shouldNotify as jest.Mock).mockResolvedValue(false);
    
    await notificationService.createNotification(
      1, 
      NotificationType.MENTION,
      { test: 'content' }
    );
    
    // Verify that shouldNotify was called
    expect(notificationRepository.shouldNotify).toHaveBeenCalledWith(
      1, 
      NotificationType.MENTION, 
      'inApp'
    );
    
    // Verify that createNotification was NOT called
    expect(notificationRepository.createNotification).not.toHaveBeenCalled();
  });
  
  it('should send email notification if requested and user has enabled email notifications', async () => {
    // Setup mocks for repository
    (notificationRepository.shouldNotify as jest.Mock)
      .mockImplementation((userId, type, channel) => {
        if (channel === 'inApp') return Promise.resolve(true);
        if (channel === 'email') return Promise.resolve(true);
        return Promise.resolve(false);
      });
    
    // Mock createNotification
    (notificationRepository.createNotification as jest.Mock).mockResolvedValue({
      id: 1,
      user_id: 1,
      type: NotificationType.MENTION,
      content: { 
        mentionedBy: { id: 2, username: 'mentioner' },
        contentId: 123,
        contentType: 'post',
        contentPreview: 'Mentioned you in this post'
      },
      is_read: false,
      created_at: new Date().toISOString()
    });
    
    // Mock the private getUserEmail method directly on the instance
    notificationService['getUserEmail'] = jest.fn().mockResolvedValue({
      email: 'user@example.com',
      username: 'user'
    });
    
    // Mock emailService.sendTemplateEmail
    (emailService.sendTemplateEmail as jest.Mock).mockResolvedValue(true);
    
    // Call the notification method with email option
    await notificationService.notifyMention(
      1,
      { id: 2, username: 'mentioner' },
      123,
      'post',
      'Mentioned you in this post'
    );
    
    // Verify email notification was sent
    expect(emailService.sendTemplateEmail).toHaveBeenCalled();
  });
  
  it('should not send email notification if user has disabled email notifications', async () => {
    // Setup mocks for repository
    (notificationRepository.shouldNotify as jest.Mock)
      .mockImplementation((userId, type, channel) => {
        if (channel === 'inApp') return Promise.resolve(true);
        if (channel === 'email') return Promise.resolve(false);
        return Promise.resolve(false);
      });
    
    // Mock createNotification
    (notificationRepository.createNotification as jest.Mock).mockResolvedValue({
      id: 1,
      user_id: 1,
      type: NotificationType.MENTION,
      content: { 
        mentionedBy: { id: 2, username: 'mentioner' },
        contentId: 123,
        contentType: 'post',
        contentPreview: 'Mentioned you in this post'
      },
      is_read: false,
      created_at: new Date().toISOString()
    });
    
    // Call the notification method with email option
    await notificationService.notifyMention(
      1,
      { id: 2, username: 'mentioner' },
      123,
      'post',
      'Mentioned you in this post'
    );
    
    // Verify email notification was not sent
    expect(emailService.sendTemplateEmail).not.toHaveBeenCalled();
  });
  
  it('should send a daily digest email', async () => {
    // Mock the private getUsersForDigest method
    notificationService['getUsersForDigest'] = jest.fn().mockResolvedValue([
      { id: 1, email: 'user1@example.com', username: 'user1' },
      { id: 2, email: 'user2@example.com', username: 'user2' }
    ]);
    
    // Mock getDigestNotifications for the first user
    (notificationRepository.getDigestNotifications as jest.Mock).mockResolvedValueOnce([
      {
        id: 1,
        user_id: 1,
        type: NotificationType.MENTION,
        content: { mentionedBy: { username: 'mentioner' } },
        is_read: false,
        created_at: new Date().toISOString()
      }
    ]);
    
    // Mock getDigestNotifications for the second user - no notifications
    (notificationRepository.getDigestNotifications as jest.Mock).mockResolvedValueOnce([]);
    
    // Mock groupNotificationsByType
    notificationService['groupNotificationsByType'] = jest.fn().mockReturnValue({
      [NotificationType.MENTION]: [
        {
          id: 1,
          user_id: 1,
          type: NotificationType.MENTION,
          content: { mentionedBy: { username: 'mentioner' } },
          is_read: false,
          created_at: new Date().toISOString()
        }
      ]
    });
    
    // Mock emailService.sendTemplateEmail
    (emailService.sendTemplateEmail as jest.Mock).mockResolvedValue(true);
    
    // Call the daily digest method
    await notificationService.sendDailyDigestEmails();
    
    // Verify getUsersForDigest was called with the right frequency
    expect(notificationService['getUsersForDigest']).toHaveBeenCalledWith('daily');
    
    // Verify getDigestNotifications was called for each user
    expect(notificationRepository.getDigestNotifications).toHaveBeenCalledTimes(2);
    
    // Verify sendTemplateEmail was called for users with notifications
    expect(emailService.sendTemplateEmail).toHaveBeenCalledTimes(1);
    
    // Check that it was called with the right parameters
    expect(emailService.sendTemplateEmail).toHaveBeenCalledWith(
      'user1@example.com',
      'Your Daily Notification Digest',
      'digest',
      expect.objectContaining({
        username: 'user1',
        notificationCount: 1,
        digestPeriod: 'daily'
      })
    );
  });
  
  it('should send a weekly digest email', async () => {
    // Mock the private getUsersForDigest method
    notificationService['getUsersForDigest'] = jest.fn().mockResolvedValue([
      { id: 1, email: 'user1@example.com', username: 'user1' }
    ]);
    
    // Mock getDigestNotifications
    (notificationRepository.getDigestNotifications as jest.Mock).mockResolvedValue([
      {
        id: 1,
        user_id: 1,
        type: NotificationType.COMMENT,
        content: { commentedBy: { username: 'commenter' } },
        is_read: false,
        created_at: new Date().toISOString()
      }
    ]);
    
    // Mock groupNotificationsByType
    notificationService['groupNotificationsByType'] = jest.fn().mockReturnValue({
      [NotificationType.COMMENT]: [
        {
          id: 1,
          user_id: 1,
          type: NotificationType.COMMENT,
          content: { commentedBy: { username: 'commenter' } },
          is_read: false,
          created_at: new Date().toISOString()
        }
      ]
    });
    
    // Mock emailService.sendTemplateEmail
    (emailService.sendTemplateEmail as jest.Mock).mockResolvedValue(true);
    
    // Call the weekly digest method
    await notificationService.sendWeeklyDigestEmails();
    
    // Verify getUsersForDigest was called with the right frequency
    expect(notificationService['getUsersForDigest']).toHaveBeenCalledWith('weekly');
    
    // Verify sendTemplateEmail was called with the right parameters
    expect(emailService.sendTemplateEmail).toHaveBeenCalledWith(
      'user1@example.com',
      'Your Weekly Notification Digest',
      'digest',
      expect.objectContaining({
        username: 'user1',
        notificationCount: 1,
        digestPeriod: 'weekly'
      })
    );
  });
});