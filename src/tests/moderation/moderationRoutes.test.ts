/**
 * Moderation Routes Tests
 */

import request from 'supertest';
import express from 'express';
import moderationRoutes from '../../routes/api/moderation';
import { 
  moderationRepository, 
  flagRepository, 
  appealRepository,
  contentRepository 
} from '../../models/repositories';
import { authenticate, requireVerified, isModerator } from '../../middlewares/auth/authMiddleware';
import { ModerationActionType, FlagReason, FlagStatus, FlagType, AppealStatus } from '../../models';

// Mock repositories
jest.mock('../../models/repositories', () => ({
  moderationRepository: {
    checkForSpam: jest.fn(),
    createContentAction: jest.fn(),
    createUserAction: jest.fn(),
    findById: jest.fn(),
    findByEntity: jest.fn()
  },
  flagRepository: {
    flagContent: jest.fn(),
    flagUser: jest.fn(),
    findById: jest.fn(),
    findPending: jest.fn(),
    updateStatus: jest.fn(),
    countByStatus: jest.fn()
  },
  appealRepository: {
    createAppeal: jest.fn(),
    findById: jest.fn(),
    findByUser: jest.fn(),
    findPending: jest.fn(),
    approveAppeal: jest.fn(),
    rejectAppeal: jest.fn(),
    countByStatus: jest.fn()
  },
  contentRepository: {
    findById: jest.fn()
  }
}));

// Mock authentication middleware
jest.mock('../../middlewares/auth/authMiddleware', () => ({
  authenticate: jest.fn((req, res, next) => {
    req.user = { id: 1, email: 'user@example.com', name: 'Test User', verified: true };
    next();
  }),
  requireVerified: jest.fn((req, res, next) => next()),
  isModerator: jest.fn((req, res, next) => next())
}));

// Mock express-validator
jest.mock('express-validator', () => ({
  body: jest.fn().mockReturnThis(),
  param: jest.fn().mockReturnThis(),
  query: jest.fn().mockReturnThis(),
  withMessage: jest.fn().mockReturnThis(),
  isIn: jest.fn().mockReturnThis(),
  isNumeric: jest.fn().mockReturnThis(),
  isString: jest.fn().mockReturnThis(),
  optional: jest.fn().mockReturnThis(),
  trim: jest.fn().mockReturnThis(),
  isLength: jest.fn().mockReturnThis()
}));

describe('Moderation Routes', () => {
  let app: express.Application;
  
  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/moderation', moderationRoutes);
    
    // Reset mocks
    jest.clearAllMocks();
  });
  
  describe('POST /flag/content/:id', () => {
    it('should flag content and return success', async () => {
      // Mock repository responses
      (contentRepository.findById as jest.Mock).mockResolvedValue({ 
        id: 5, 
        author_id: 2, 
        body: 'Test content' 
      });
      
      (flagRepository.flagContent as jest.Mock).mockResolvedValue({ 
        id: 1,
        content_id: 5,
        reporter_id: 1,
        reason: FlagReason.SPAM
      });
      
      (moderationRepository.checkForSpam as jest.Mock).mockResolvedValue({
        isSpam: false,
        score: 0.2
      });
      
      const response = await request(app)
        .post('/api/moderation/flag/content/5')
        .send({
          reason: 'spam',
          description: 'This appears to be spam content'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(contentRepository.findById).toHaveBeenCalledWith(5);
      expect(flagRepository.flagContent).toHaveBeenCalledWith(
        5, 1, 'spam', 'This appears to be spam content'
      );
      expect(moderationRepository.checkForSpam).toHaveBeenCalled();
    });
    
    it('should automatically hide content detected as spam with high confidence', async () => {
      // Mock repository responses
      (contentRepository.findById as jest.Mock).mockResolvedValue({ 
        id: 5, 
        author_id: 2, 
        body: 'Buy now limited offer!' 
      });
      
      (flagRepository.flagContent as jest.Mock).mockResolvedValue({ 
        id: 1,
        content_id: 5,
        reporter_id: 1,
        reason: FlagReason.SPAM
      });
      
      (moderationRepository.checkForSpam as jest.Mock).mockResolvedValue({
        isSpam: true,
        score: 0.9,
        reason: 'Contains spam patterns'
      });
      
      const response = await request(app)
        .post('/api/moderation/flag/content/5')
        .send({
          reason: 'spam',
          description: 'This appears to be spam content'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(moderationRepository.createContentAction).toHaveBeenCalledWith(
        ModerationActionType.HIDE,
        5,
        0, // System user ID
        'Automatically detected as spam',
        1, // Flag ID
        { detected: true, score: 0.9, reason: 'Contains spam patterns' }
      );
      expect(flagRepository.updateStatus).toHaveBeenCalledWith(1, FlagStatus.APPROVED);
    });
  });
  
  describe('GET /queue', () => {
    it('should return pending flags and counts for moderators', async () => {
      (flagRepository.findPending as jest.Mock).mockResolvedValue([
        { id: 1, type: FlagType.CONTENT, content_id: 5, reason: FlagReason.SPAM },
        { id: 2, type: FlagType.USER, user_id: 10, reason: FlagReason.HARASSMENT }
      ]);
      
      (flagRepository.countByStatus as jest.Mock).mockResolvedValue(5);
      (appealRepository.countByStatus as jest.Mock).mockResolvedValue(3);
      
      const response = await request(app).get('/api/moderation/queue');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.flags).toHaveLength(2);
      expect(response.body.data.counts).toEqual({
        pendingFlags: 5,
        pendingAppeals: 3
      });
    });
  });
  
  describe('POST /flag/:id/resolve', () => {
    it('should resolve a flag and take moderation action', async () => {
      (flagRepository.findById as jest.Mock).mockResolvedValue({
        id: 1,
        type: FlagType.CONTENT,
        content_id: 5,
        status: FlagStatus.PENDING
      });
      
      const response = await request(app)
        .post('/api/moderation/flag/1/resolve')
        .send({
          status: 'approved',
          action_type: 'hide',
          reason: 'Contains prohibited content'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(moderationRepository.createContentAction).toHaveBeenCalledWith(
        'hide',
        5,
        1, // Moderator ID (from req.user)
        'Contains prohibited content',
        1 // Flag ID
      );
      expect(flagRepository.updateStatus).toHaveBeenCalledWith(1, FlagStatus.APPROVED);
    });
  });
  
  describe('POST /appeal', () => {
    it('should submit an appeal for a moderation action', async () => {
      (moderationRepository.findById as jest.Mock).mockResolvedValue({
        id: 5,
        action_type: ModerationActionType.HIDE,
        content_id: 10,
        status: 'completed'
      });
      
      (contentRepository.findById as jest.Mock).mockResolvedValue({
        id: 10,
        author_id: 1 // Same as authenticated user
      });
      
      (appealRepository.findByUser as jest.Mock).mockResolvedValue([]);
      
      (appealRepository.createAppeal as jest.Mock).mockResolvedValue({
        id: 1,
        moderation_action_id: 5,
        user_id: 1,
        reason: 'The content was educational, not spam'
      });
      
      const response = await request(app)
        .post('/api/moderation/appeal')
        .send({
          moderation_action_id: 5,
          reason: 'The content was educational, not spam'
        });
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(appealRepository.createAppeal).toHaveBeenCalledWith(
        5, 1, 'The content was educational, not spam'
      );
    });
  });
  
  describe('POST /appeal/:id/resolve', () => {
    it('should approve an appeal and revert the action', async () => {
      (appealRepository.findById as jest.Mock).mockResolvedValue({
        id: 1,
        moderation_action_id: 5,
        status: AppealStatus.PENDING
      });
      
      (appealRepository.approveAppeal as jest.Mock).mockResolvedValue({
        id: 1,
        status: AppealStatus.APPROVED,
        moderator_id: 1
      });
      
      const response = await request(app)
        .post('/api/moderation/appeal/1/resolve')
        .send({
          status: 'approved',
          notes: 'Appeal approved, action reverted'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(appealRepository.approveAppeal).toHaveBeenCalledWith(
        1, 1, 'Appeal approved, action reverted'
      );
    });
    
    it('should reject an appeal', async () => {
      (appealRepository.findById as jest.Mock).mockResolvedValue({
        id: 1,
        moderation_action_id: 5,
        status: AppealStatus.PENDING
      });
      
      (appealRepository.rejectAppeal as jest.Mock).mockResolvedValue({
        id: 1,
        status: AppealStatus.REJECTED,
        moderator_id: 1
      });
      
      const response = await request(app)
        .post('/api/moderation/appeal/1/resolve')
        .send({
          status: 'rejected',
          notes: 'Appeal rejected, action stands'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(appealRepository.rejectAppeal).toHaveBeenCalledWith(
        1, 1, 'Appeal rejected, action stands'
      );
    });
  });
});