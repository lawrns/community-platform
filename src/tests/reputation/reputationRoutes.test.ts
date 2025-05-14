import request from 'supertest';
import express from 'express';
import { reputationRepository, PrivilegeType } from '../../models/ReputationRepository';
import { badgeRepository } from '../../models/BadgeRepository';
import reputationRoutes from '../../routes/api/users/reputation';
import { authenticate, requireVerified } from '../../middlewares/auth/authMiddleware';

// Mock the repositories
jest.mock('../../models/ReputationRepository');
jest.mock('../../models/BadgeRepository');
// Mock the auth middleware
jest.mock('../../middlewares/auth/authMiddleware');

describe('Reputation API Routes', () => {
  let app: express.Application;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock auth middleware to set req.user
    (authenticate as jest.Mock).mockImplementation((req, res, next) => {
      req.user = { id: 1, isAdmin: false, isModerator: false };
      next();
    });
    
    (requireVerified as jest.Mock).mockImplementation((req, res, next) => {
      next();
    });
    
    // Create express app and use reputation routes
    app = express();
    app.use(express.json());
    app.use('/api/users', reputationRoutes);
  });
  
  describe('GET /api/users/:userId/reputation/history', () => {
    it('should return reputation history for the user', async () => {
      const userId = 1;
      const mockHistory = [
        { id: 1, user_id: userId, change: 10, reason: 'upvote', created_at: new Date().toISOString() },
        { id: 2, user_id: userId, change: 15, reason: 'accepted_answer', created_at: new Date().toISOString() }
      ];
      
      // Mock repository method
      (reputationRepository.getReputationHistory as jest.Mock).mockResolvedValue(mockHistory);
      
      const response = await request(app).get(`/api/users/${userId}/reputation/history`);
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: mockHistory
      });
      
      expect(reputationRepository.getReputationHistory).toHaveBeenCalledWith(userId, 20, 0);
    });
    
    it('should reject if user is not authorized to view history', async () => {
      const userId = 2; // Different from authenticated user (1)
      
      const response = await request(app).get(`/api/users/${userId}/reputation/history`);
      
      expect(response.status).toBe(403);
      expect(response.body).toEqual({
        error: 'Unauthorized to view this user\'s reputation history'
      });
      
      expect(reputationRepository.getReputationHistory).not.toHaveBeenCalled();
    });
    
    it('should allow admin to view any user\'s history', async () => {
      // Set authenticated user as admin
      (authenticate as jest.Mock).mockImplementation((req, res, next) => {
        req.user = { id: 1, isAdmin: true, isModerator: false };
        next();
      });
      
      const userId = 2; // Different from authenticated user
      const mockHistory = [
        { id: 1, user_id: userId, change: 10, reason: 'upvote', created_at: new Date().toISOString() }
      ];
      
      // Mock repository method
      (reputationRepository.getReputationHistory as jest.Mock).mockResolvedValue(mockHistory);
      
      const response = await request(app).get(`/api/users/${userId}/reputation/history`);
      
      expect(response.status).toBe(200);
      expect(reputationRepository.getReputationHistory).toHaveBeenCalled();
    });
  });
  
  describe('GET /api/users/:userId/reputation/stats', () => {
    it('should return reputation statistics for the user', async () => {
      const userId = 1;
      const mockStats = {
        total: 1250,
        byReason: {
          upvote: 800,
          accepted_answer: 450
        },
        rank: 15,
        percentile: 92.5
      };
      
      // Mock repository method
      (reputationRepository.getReputationStats as jest.Mock).mockResolvedValue(mockStats);
      
      const response = await request(app).get(`/api/users/${userId}/reputation/stats`);
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: mockStats
      });
      
      expect(reputationRepository.getReputationStats).toHaveBeenCalledWith(userId);
    });
  });
  
  describe('GET /api/users/:userId/privileges', () => {
    it('should return user privileges and thresholds', async () => {
      const userId = 1;
      const mockPrivileges = [
        PrivilegeType.CREATE_POST,
        PrivilegeType.UPVOTE,
        PrivilegeType.COMMENT
      ];
      
      // Mock repository method
      (reputationRepository.getUserPrivileges as jest.Mock).mockResolvedValue(mockPrivileges);
      
      const response = await request(app).get(`/api/users/${userId}/privileges`);
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: {
          privileges: mockPrivileges,
          thresholds: expect.objectContaining({
            [PrivilegeType.CREATE_POST]: 1,
            [PrivilegeType.UPVOTE]: 15,
            [PrivilegeType.DOWNVOTE]: 125,
            [PrivilegeType.TRUSTED_USER]: 5000
          })
        }
      });
      
      expect(reputationRepository.getUserPrivileges).toHaveBeenCalledWith(userId);
    });
  });
  
  describe('GET /api/users/:userId/badges', () => {
    it('should return badges for the user', async () => {
      const userId = 1;
      const mockBadges = [
        { id: 1, name: 'First Post', level: 'BRONZE', awarded_at: new Date().toISOString() },
        { id: 2, name: 'Helpful', level: 'SILVER', awarded_at: new Date().toISOString() }
      ];
      
      // Mock repository method
      (badgeRepository.getUserBadges as jest.Mock).mockResolvedValue(mockBadges);
      
      const response = await request(app).get(`/api/users/${userId}/badges`);
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: mockBadges
      });
      
      expect(badgeRepository.getUserBadges).toHaveBeenCalledWith(userId);
    });
  });
  
  describe('POST /api/users/:userId/badges/check', () => {
    it('should check and award eligible badges', async () => {
      const userId = 1;
      const mockAwardedBadges = [2, 5];
      const mockNewBadges = [
        { id: 2, name: 'First Post', level: 'BRONZE' },
        { id: 5, name: 'Helpful', level: 'SILVER' }
      ];
      
      // Mock repository methods
      (badgeRepository.checkAllBadges as jest.Mock).mockResolvedValue(mockAwardedBadges);
      (badgeRepository.getBadgeById as jest.Mock)
        .mockResolvedValueOnce(mockNewBadges[0])
        .mockResolvedValueOnce(mockNewBadges[1]);
      
      const response = await request(app).post(`/api/users/${userId}/badges/check`);
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: {
          awardedCount: 2,
          newBadges: mockNewBadges
        }
      });
      
      expect(badgeRepository.checkAllBadges).toHaveBeenCalledWith(userId);
      expect(badgeRepository.getBadgeById).toHaveBeenCalledTimes(2);
    });
    
    it('should reject if user is not authorized to check badges', async () => {
      const userId = 2; // Different from authenticated user (1)
      
      const response = await request(app).post(`/api/users/${userId}/badges/check`);
      
      expect(response.status).toBe(403);
      expect(response.body).toEqual({
        error: 'Unauthorized to check badges for this user'
      });
      
      expect(badgeRepository.checkAllBadges).not.toHaveBeenCalled();
    });
    
    it('should allow admin to check badges for any user', async () => {
      // Set authenticated user as admin
      (authenticate as jest.Mock).mockImplementation((req, res, next) => {
        req.user = { id: 1, isAdmin: true, isModerator: false };
        next();
      });
      
      const userId = 2; // Different from authenticated user
      const mockAwardedBadges = [3];
      const mockNewBadges = [
        { id: 3, name: 'Expert', level: 'GOLD' }
      ];
      
      // Mock repository methods
      (badgeRepository.checkAllBadges as jest.Mock).mockResolvedValue(mockAwardedBadges);
      (badgeRepository.getBadgeById as jest.Mock).mockResolvedValue(mockNewBadges[0]);
      
      const response = await request(app).post(`/api/users/${userId}/badges/check`);
      
      expect(response.status).toBe(200);
      expect(badgeRepository.checkAllBadges).toHaveBeenCalledWith(userId);
    });
  });
});