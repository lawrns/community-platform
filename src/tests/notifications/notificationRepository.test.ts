/**
 * Test suite for the NotificationRepository
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { NotificationRepository } from '../../models/NotificationRepository';
import { Database } from '../../config/database';
import { supabase } from '../../config/supabase';
import { NotificationType } from '../../models';

// Mock dependencies
jest.mock('../../config/database');
jest.mock('../../config/supabase');
jest.mock('../../utils/errorHandler');

describe('NotificationRepository', () => {
  let notificationRepository: NotificationRepository;
  let mockDb;
  
  beforeEach(() => {
    // Reset all mocks
    jest.resetAllMocks();
    
    // Create mock database
    mockDb = {
      query: jest.fn()
    };
    
    // Mock Database.getInstance to return our mock
    (Database.getInstance as jest.Mock).mockReturnValue(mockDb);
    
    // Create a new instance of NotificationRepository for each test
    notificationRepository = new NotificationRepository(mockDb);
    
    // For testing, set useSupabase to false by default
    (notificationRepository as any).useSupabase = false;
  });
  
  describe('with direct database connection', () => {
    it('should create a notification', async () => {
      // Mock database query to return a notification
      mockDb.query.mockResolvedValue({
        rows: [{
          id: 1,
          user_id: 1,
          type: NotificationType.MENTION,
          content: { test: 'content' },
          is_read: false,
          created_at: new Date()
        }]
      });
      
      const result = await notificationRepository.createNotification(
        1,
        NotificationType.MENTION,
        { test: 'content' }
      );
      
      // Verify query was called with the right parameters
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO notifications'),
        [1, NotificationType.MENTION, JSON.stringify({ test: 'content' }), false]
      );
      
      // Verify the result
      expect(result).toEqual({
        id: 1,
        user_id: 1,
        type: NotificationType.MENTION,
        content: { test: 'content' },
        is_read: false,
        created_at: expect.any(Date)
      });
    });
    
    it('should get user notifications', async () => {
      // Mock database query to return notifications
      mockDb.query.mockResolvedValue({
        rows: [
          {
            id: 1,
            user_id: 1,
            type: NotificationType.MENTION,
            content: { test: 'content1' },
            is_read: false,
            created_at: new Date()
          },
          {
            id: 2,
            user_id: 1,
            type: NotificationType.COMMENT,
            content: { test: 'content2' },
            is_read: false,
            created_at: new Date()
          }
        ]
      });
      
      const result = await notificationRepository.getUserNotifications(1);
      
      // Verify query was called with the right parameters
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM notifications'),
        [1, 20, 0]
      );
      
      // Verify the result
      expect(result.length).toBe(2);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(2);
    });
    
    it('should get notification count', async () => {
      // Mock database query to return count
      mockDb.query.mockResolvedValue({
        rows: [{ count: '5' }]
      });
      
      const result = await notificationRepository.getNotificationCount(1);
      
      // Verify query was called with the right parameters
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT COUNT(*) FROM notifications'),
        [1]
      );
      
      // Verify the result
      expect(result).toBe(5);
    });
    
    it('should mark notifications as read', async () => {
      // Mock database query
      mockDb.query.mockResolvedValue({ rows: [] });
      
      await notificationRepository.markAsRead([1, 2, 3]);
      
      // Verify query was called with the right parameters
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE notifications'),
        [[1, 2, 3]]
      );
    });
    
    it('should return empty array if no notifications to mark', async () => {
      await notificationRepository.markAsRead([]);
      
      // Verify query was not called
      expect(mockDb.query).not.toHaveBeenCalled();
    });
    
    it('should mark all notifications as read for a user', async () => {
      // Mock database query
      mockDb.query.mockResolvedValue({ rows: [] });
      
      await notificationRepository.markAllAsRead(1);
      
      // Verify query was called with the right parameters
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE notifications'),
        [1]
      );
    });
    
    it('should delete a notification', async () => {
      // Mock database query
      mockDb.query.mockResolvedValue({ rows: [] });
      
      await notificationRepository.deleteNotification(1);
      
      // Verify query was called with the right parameters
      expect(mockDb.query).toHaveBeenCalledWith(
        'DELETE FROM notifications WHERE id = $1',
        [1]
      );
    });
    
    it('should get digest notifications since a date', async () => {
      // Mock database query to return notifications
      mockDb.query.mockResolvedValue({
        rows: [
          {
            id: 1,
            user_id: 1,
            type: NotificationType.MENTION,
            content: { test: 'content' },
            is_read: false,
            created_at: new Date()
          }
        ]
      });
      
      const since = new Date();
      const result = await notificationRepository.getDigestNotifications(1, since);
      
      // Verify query was called with the right parameters
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM notifications'),
        [1, since]
      );
      
      // Verify the result
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(1);
    });
  });
  
  describe('with Supabase connection', () => {
    beforeEach(() => {
      // Set useSupabase to true for these tests
      (notificationRepository as any).useSupabase = true;
      
      // Mock Supabase from, select, etc. functions
      const mockSupabaseChain = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockReturnThis(),
        single: jest.fn().mockReturnThis()
      };
      
      // Setup Supabase mock
      (supabase as any) = mockSupabaseChain;
    });
    
    it('should create a notification with Supabase', async () => {
      // Mock Supabase response
      (supabase.from().insert().select().single as jest.Mock).mockResolvedValue({
        data: {
          id: 1,
          user_id: 1,
          type: NotificationType.MENTION,
          content: { test: 'content' },
          is_read: false,
          created_at: new Date().toISOString()
        },
        error: null
      });
      
      const result = await notificationRepository.createNotification(
        1,
        NotificationType.MENTION,
        { test: 'content' }
      );
      
      // Verify Supabase from was called with the right table
      expect(supabase.from).toHaveBeenCalledWith('notifications');
      
      // Verify insert was called with the right data
      expect(supabase.from().insert).toHaveBeenCalledWith({
        user_id: 1,
        type: NotificationType.MENTION,
        content: { test: 'content' },
        is_read: false
      });
      
      // Verify the result
      expect(result).toEqual({
        id: 1,
        user_id: 1,
        type: NotificationType.MENTION,
        content: { test: 'content' },
        is_read: false,
        created_at: expect.any(String)
      });
    });
    
    it('should handle errors when creating a notification', async () => {
      // Mock Supabase to return an error
      (supabase.from().insert().select().single as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Test error' }
      });
      
      // Spy on the handleError method
      const handleErrorSpy = jest.spyOn(notificationRepository as any, 'handleError');
      
      await notificationRepository.createNotification(
        1,
        NotificationType.MENTION,
        { test: 'content' }
      );
      
      // Verify handleError was called
      expect(handleErrorSpy).toHaveBeenCalled();
    });
  });
});