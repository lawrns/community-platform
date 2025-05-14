/**
 * Appeal Repository Tests
 */

import { AppealRepository } from '../../models/moderation';
import { AppealStatus } from '../../models';
import db from '../../config/database';

// Mock database
jest.mock('../../config/database', () => ({
  query: jest.fn(),
  transaction: jest.fn((callback) => callback({ query: jest.fn().mockResolvedValue({ rows: [] }) }))
}));

describe('Appeal Repository', () => {
  let appealRepo: AppealRepository;
  
  beforeEach(() => {
    appealRepo = new AppealRepository();
    
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup default mocks
    (db.query as jest.Mock).mockResolvedValue({ rows: [], rowCount: 0 });
  });
  
  describe('createAppeal', () => {
    it('should create an appeal', async () => {
      const mockAppeal = {
        id: 1,
        moderation_action_id: 5,
        user_id: 10,
        reason: 'The content was educational, not spam',
        status: AppealStatus.PENDING,
        created_at: new Date(),
        updated_at: new Date()
      };
      
      // Mock create method
      jest.spyOn(appealRepo, 'create').mockResolvedValue(mockAppeal);
      
      const result = await appealRepo.createAppeal(
        5,
        10,
        'The content was educational, not spam'
      );
      
      expect(appealRepo.create).toHaveBeenCalledWith(expect.objectContaining({
        moderation_action_id: 5,
        user_id: 10,
        reason: 'The content was educational, not spam',
        status: AppealStatus.PENDING
      }));
      
      expect(result).toEqual(mockAppeal);
    });
  });
  
  describe('findPending', () => {
    it('should find pending appeals with user information', async () => {
      const mockAppeals = [
        {
          id: 1,
          moderation_action_id: 5,
          user_id: 10,
          username: 'user1',
          name: 'User One',
          avatar_url: 'https://example.com/avatar1.jpg',
          reason: 'The content was educational, not spam',
          status: AppealStatus.PENDING,
          action_type: 'hide',
          action_reason: 'Contained spam',
          ai_detected: true,
          created_at: new Date()
        },
        {
          id: 2,
          moderation_action_id: 8,
          user_id: 15,
          username: 'user2',
          name: 'User Two',
          avatar_url: 'https://example.com/avatar2.jpg',
          reason: 'My account was wrongly suspended',
          status: AppealStatus.PENDING,
          action_type: 'suspend',
          action_reason: 'Multiple violations',
          ai_detected: false,
          created_at: new Date()
        }
      ];
      
      // Mock query result
      (db.query as jest.Mock).mockResolvedValue({ rows: mockAppeals });
      
      const result = await appealRepo.findPending(10, 0);
      
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE a.status = $1'),
        [AppealStatus.PENDING, 10, 0]
      );
      
      expect(result).toEqual(mockAppeals);
    });
  });
  
  describe('approveAppeal', () => {
    it('should approve an appeal and revert the moderation action', async () => {
      const mockAppeal = {
        id: 1,
        moderation_action_id: 5,
        user_id: 10,
        status: AppealStatus.APPROVED,
        moderator_id: 20,
        moderator_notes: 'Appeal approved, action reverted',
        resolved_at: new Date(),
        updated_at: new Date()
      };
      
      // Mock transaction result
      const mockQuery = jest.fn().mockImplementation((sql, params) => {
        if (sql.includes('UPDATE appeals')) {
          return { rows: [mockAppeal] };
        } else if (sql.includes('SELECT * FROM moderation_actions')) {
          return { rows: [{ id: 5, content_id: 15, moderator_id: 20 }] };
        }
        return { rows: [] };
      });
      
      (db.transaction as jest.Mock).mockImplementation((callback) => callback({ query: mockQuery }));
      
      const result = await appealRepo.approveAppeal(1, 20, 'Appeal approved, action reverted');
      
      // Check appeal was updated
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE appeals'),
        [AppealStatus.APPROVED, 20, 'Appeal approved, action reverted', 1]
      );
      
      // Check moderation action query
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM moderation_actions'),
        [5]
      );
      
      // Check moderation action was reverted
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE moderation_actions'),
        [20, 5]
      );
      
      // Check audit log was created
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO moderation_audit_log'),
        [5, 20, 'appeal_approved', { appeal_id: 1, notes: 'Appeal approved, action reverted' }]
      );
      
      expect(result).toEqual(mockAppeal);
    });
  });
  
  describe('rejectAppeal', () => {
    it('should reject an appeal', async () => {
      const mockAppeal = {
        id: 1,
        moderation_action_id: 5,
        user_id: 10,
        status: AppealStatus.REJECTED,
        moderator_id: 20,
        moderator_notes: 'Appeal rejected, action stands',
        resolved_at: new Date(),
        updated_at: new Date()
      };
      
      // Mock transaction result
      const mockQuery = jest.fn().mockImplementation((sql, params) => {
        if (sql.includes('UPDATE appeals')) {
          return { rows: [mockAppeal] };
        }
        return { rows: [] };
      });
      
      (db.transaction as jest.Mock).mockImplementation((callback) => callback({ query: mockQuery }));
      
      const result = await appealRepo.rejectAppeal(1, 20, 'Appeal rejected, action stands');
      
      // Check appeal was updated
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE appeals'),
        [AppealStatus.REJECTED, 20, 'Appeal rejected, action stands', 1]
      );
      
      // Check audit log was created
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO moderation_audit_log'),
        [5, 20, 'appeal_rejected', { appeal_id: 1, notes: 'Appeal rejected, action stands' }]
      );
      
      expect(result).toEqual(mockAppeal);
    });
  });
  
  describe('countByStatus', () => {
    it('should count appeals by status', async () => {
      // Mock query result
      (db.query as jest.Mock).mockResolvedValue({ rows: [{ count: '15' }] });
      
      const result = await appealRepo.countByStatus(AppealStatus.PENDING);
      
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT COUNT(*) as count'),
        [AppealStatus.PENDING]
      );
      
      expect(result).toBe(15);
    });
  });
});