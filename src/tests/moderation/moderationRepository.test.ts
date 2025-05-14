/**
 * Moderation Repository Tests
 */

import { ModerationRepository, FlagRepository, AppealRepository } from '../../models/moderation';
import { ModerationActionType, ModerationActionStatus, FlagType } from '../../models';
import db from '../../config/database';

// Mock database
jest.mock('../../config/database', () => ({
  query: jest.fn(),
  transaction: jest.fn((callback) => callback({ query: jest.fn() }))
}));

describe('Moderation Repository', () => {
  let moderationRepo: ModerationRepository;
  
  beforeEach(() => {
    moderationRepo = new ModerationRepository();
    
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup default mocks
    (db.query as jest.Mock).mockResolvedValue({ rows: [], rowCount: 0 });
  });
  
  describe('createContentAction', () => {
    it('should create a moderation action for content', async () => {
      const mockAction = {
        id: 1,
        action_type: ModerationActionType.HIDE,
        moderator_id: 1,
        content_id: 2,
        reason: 'Spam content',
        status: ModerationActionStatus.COMPLETED,
        ai_detected: false,
        created_at: new Date(),
        updated_at: new Date()
      };
      
      // Mock create method
      jest.spyOn(moderationRepo, 'create').mockResolvedValue(mockAction);
      
      const result = await moderationRepo.createContentAction(
        ModerationActionType.HIDE,
        2,
        1,
        'Spam content'
      );
      
      expect(moderationRepo.create).toHaveBeenCalledWith(expect.objectContaining({
        action_type: ModerationActionType.HIDE,
        moderator_id: 1,
        content_id: 2,
        reason: 'Spam content',
        status: ModerationActionStatus.COMPLETED,
        ai_detected: false
      }));
      
      expect(result).toEqual(mockAction);
    });
    
    it('should include AI details when provided', async () => {
      const mockAction = {
        id: 1,
        action_type: ModerationActionType.HIDE,
        moderator_id: 0,
        content_id: 2,
        reason: 'AI detected spam',
        status: ModerationActionStatus.COMPLETED,
        ai_detected: true,
        ai_score: 0.95,
        ai_reason: 'Contains spam patterns',
        created_at: new Date(),
        updated_at: new Date()
      };
      
      // Mock create method
      jest.spyOn(moderationRepo, 'create').mockResolvedValue(mockAction);
      
      const result = await moderationRepo.createContentAction(
        ModerationActionType.HIDE,
        2,
        0,
        'AI detected spam',
        undefined,
        { detected: true, score: 0.95, reason: 'Contains spam patterns' }
      );
      
      expect(moderationRepo.create).toHaveBeenCalledWith(expect.objectContaining({
        action_type: ModerationActionType.HIDE,
        moderator_id: 0,
        content_id: 2,
        reason: 'AI detected spam',
        status: ModerationActionStatus.COMPLETED,
        ai_detected: true,
        ai_score: 0.95,
        ai_reason: 'Contains spam patterns'
      }));
      
      expect(result).toEqual(mockAction);
    });
  });
  
  describe('revertAction', () => {
    it('should revert a moderation action', async () => {
      const mockAction = {
        id: 1,
        action_type: ModerationActionType.HIDE,
        moderator_id: 1,
        content_id: 2,
        status: ModerationActionStatus.COMPLETED,
        created_at: new Date(),
        updated_at: new Date()
      };
      
      const revertedAction = {
        ...mockAction,
        status: ModerationActionStatus.REVERTED,
        reverted_at: new Date(),
        reverted_by_id: 2
      };
      
      // Mock methods
      jest.spyOn(moderationRepo, 'findById').mockResolvedValue(mockAction);
      jest.spyOn(moderationRepo, 'update').mockResolvedValue(revertedAction);
      jest.spyOn(moderationRepo, 'addToAuditLog').mockResolvedValue();
      
      const result = await moderationRepo.revertAction(1, 2, 'Reverting action');
      
      expect(moderationRepo.findById).toHaveBeenCalledWith(1);
      expect(moderationRepo.update).toHaveBeenCalledWith(1, expect.objectContaining({
        status: ModerationActionStatus.REVERTED,
        reverted_by_id: 2
      }));
      expect(moderationRepo.addToAuditLog).toHaveBeenCalledWith(expect.objectContaining({
        action_id: 1,
        actor_id: 2,
        action: 'revert',
        details: { reason: 'Reverting action' }
      }));
      
      expect(result).toEqual(revertedAction);
    });
    
    it('should throw error if action is already reverted', async () => {
      const mockAction = {
        id: 1,
        action_type: ModerationActionType.HIDE,
        moderator_id: 1,
        content_id: 2,
        status: ModerationActionStatus.REVERTED,
        created_at: new Date(),
        updated_at: new Date(),
        reverted_at: new Date(),
        reverted_by_id: 3
      };
      
      // Mock findById method
      jest.spyOn(moderationRepo, 'findById').mockResolvedValue(mockAction);
      
      await expect(moderationRepo.revertAction(1, 2, 'Reverting action'))
        .rejects.toThrow('Moderation action already reverted');
      
      expect(moderationRepo.findById).toHaveBeenCalledWith(1);
      expect(moderationRepo.update).not.toHaveBeenCalled();
    });
  });
  
  describe('checkForSpam', () => {
    // Mock environment import
    beforeEach(() => {
      jest.mock('../../config/environment', () => ({
        default: {
          AI_MODERATION_ENABLED: false,
          OPENAI_API_KEY: undefined
        }
      }));
    });

    it('should detect spam content with high score using pattern matching', async () => {
      (db.query as jest.Mock).mockResolvedValue({ rows: [] });
      
      const content = 'Buy now! Limited time offer! Discount! Click here for free offer! Satisfaction guaranteed! MONEY BACK! LIMITED TIME!!!';
      const result = await moderationRepo.checkForSpam(content, FlagType.CONTENT);
      
      expect(result.isSpam).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(0.8); // Higher threshold for >95% precision
      expect(result.reason).toContain('spam');
      
      // Check that the spam check was logged
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO spam_checks'),
        expect.arrayContaining([FlagType.CONTENT, content, expect.any(Number), true, expect.any(String)])
      );
    });
    
    it('should not detect normal content as spam', async () => {
      (db.query as jest.Mock).mockResolvedValue({ rows: [] });
      
      const content = 'This is a normal post about programming. I am working on a React application and need help with state management.';
      const result = await moderationRepo.checkForSpam(content, FlagType.CONTENT);
      
      expect(result.isSpam).toBe(false);
      expect(result.score).toBeLessThan(0.8); // Higher threshold for >95% precision
      expect(result.reason).toBeUndefined();
      
      // Check that the spam check was logged
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO spam_checks'),
        expect.arrayContaining([FlagType.CONTENT, content, expect.any(Number), false, undefined])
      );
    });
    
    it('should detect spam based on text characteristics, not just patterns', async () => {
      (db.query as jest.Mock).mockResolvedValue({ rows: [] });
      
      const content = 'CHECK THIS OUT NOW!!! AMAZING OFFER!!! $50 $100 $200 DEALS!!! https://example.com/deal1 https://example.com/deal2 https://example.com/deal3 CLICK NOW!!!';
      const result = await moderationRepo.checkForSpam(content, FlagType.CONTENT);
      
      expect(result.isSpam).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(0.8);
      expect(result.reason).toBeDefined();
      
      // Check that the spam check was logged
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO spam_checks'),
        expect.arrayContaining([FlagType.CONTENT, content, expect.any(Number), true, expect.any(String)])
      );
    });
    
    it('should handle errors gracefully', async () => {
      // Mock a database error
      (db.query as jest.Mock).mockRejectedValue(new Error('Database error'));
      
      // Mock console.error to prevent test output pollution
      jest.spyOn(console, 'error').mockImplementation(() => {});
      
      const content = 'Some content to test error handling';
      const result = await moderationRepo.checkForSpam(content, FlagType.CONTENT);
      
      // Should return conservative result on error
      expect(result.isSpam).toBe(false);
      expect(result.score).toBe(0);
      expect(console.error).toHaveBeenCalled();
    });
  });
});