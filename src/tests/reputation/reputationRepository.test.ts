import { Database } from '../../config/database';
import { ReputationRepository, ReputationReason, PrivilegeType } from '../../models/ReputationRepository';
import { BadgeRepository } from '../../models/BadgeRepository';

// Mock the database and badge repository
jest.mock('../../config/database');
jest.mock('../../models/BadgeRepository');

describe('ReputationRepository', () => {
  let reputationRepository: ReputationRepository;
  const mockDb = {
    query: jest.fn(),
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    // @ts-ignore - mock implementation
    Database.getInstance.mockReturnValue(mockDb);
    // Create a new repository instance for each test
    reputationRepository = new ReputationRepository(Database.getInstance());
    
    // Mock the BadgeRepository.checkAllBadges method
    jest.spyOn(BadgeRepository.prototype, 'checkAllBadges').mockResolvedValue([]);
  });
  
  describe('updateReputation', () => {
    it('should update user reputation and call checkAllBadges', async () => {
      const userId = 1;
      const change = 10;
      const reason = ReputationReason.UPVOTE;
      const contentId = 2;
      
      mockDb.query.mockResolvedValueOnce({ rows: [] });
      
      await reputationRepository.updateReputation(userId, change, reason, contentId);
      
      expect(mockDb.query).toHaveBeenCalledWith(
        'SELECT update_user_reputation($1, $2, $3, $4)',
        [userId, change, reason, contentId]
      );
      
      expect(BadgeRepository.prototype.checkAllBadges).toHaveBeenCalledWith(userId);
    });
    
    it('should handle errors gracefully', async () => {
      const userId = 1;
      const change = 10;
      const reason = ReputationReason.UPVOTE;
      
      const mockError = new Error('Database error');
      mockDb.query.mockRejectedValueOnce(mockError);
      
      console.error = jest.fn(); // Mock console.error to prevent test output noise
      
      await expect(reputationRepository.updateReputation(userId, change, reason))
        .rejects.toThrow('Error updating reputation: Database error');
        
      expect(console.error).toHaveBeenCalledWith('Error updating reputation', mockError);
    });
  });
  
  describe('getReputationHistory', () => {
    it('should retrieve reputation history with default limit and offset', async () => {
      const userId = 1;
      const mockHistory = [
        { id: 1, user_id: userId, change: 10, reason: 'upvote', content_id: 2, created_at: new Date().toISOString() },
        { id: 2, user_id: userId, change: 15, reason: 'accepted_answer', content_id: 3, created_at: new Date().toISOString() }
      ];
      
      mockDb.query.mockResolvedValueOnce({ rows: mockHistory });
      
      const result = await reputationRepository.getReputationHistory(userId);
      
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('FROM reputation_history'),
        [userId, 20, 0]
      );
      
      expect(result).toEqual(mockHistory);
    });
    
    it('should retrieve reputation history with custom limit and offset', async () => {
      const userId = 1;
      const limit = 5;
      const offset = 10;
      const mockHistory = [
        { id: 11, user_id: userId, change: 5, reason: 'upvote', content_id: 20, created_at: new Date().toISOString() }
      ];
      
      mockDb.query.mockResolvedValueOnce({ rows: mockHistory });
      
      const result = await reputationRepository.getReputationHistory(userId, limit, offset);
      
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('FROM reputation_history'),
        [userId, limit, offset]
      );
      
      expect(result).toEqual(mockHistory);
    });
  });
  
  describe('hasPrivilege', () => {
    it('should return true when user has the privilege', async () => {
      const userId = 1;
      const privilege = PrivilegeType.UPVOTE;
      
      mockDb.query.mockResolvedValueOnce({ rows: [{ has_privilege: true }] });
      
      const result = await reputationRepository.hasPrivilege(userId, privilege);
      
      expect(mockDb.query).toHaveBeenCalledWith(
        'SELECT user_has_privilege($1, $2) as has_privilege',
        [userId, privilege]
      );
      
      expect(result).toBe(true);
    });
    
    it('should return false when user does not have the privilege', async () => {
      const userId = 1;
      const privilege = PrivilegeType.MODERATION_TOOLS;
      
      mockDb.query.mockResolvedValueOnce({ rows: [{ has_privilege: false }] });
      
      const result = await reputationRepository.hasPrivilege(userId, privilege);
      
      expect(mockDb.query).toHaveBeenCalledWith(
        'SELECT user_has_privilege($1, $2) as has_privilege',
        [userId, privilege]
      );
      
      expect(result).toBe(false);
    });
  });
  
  describe('getUserPrivileges', () => {
    it('should return the list of privileges a user has based on reputation', async () => {
      const userId = 1;
      
      // Mock a user with 1000 reputation
      mockDb.query.mockResolvedValueOnce({ rows: [{ reputation: 1000 }] });
      
      const result = await reputationRepository.getUserPrivileges(userId);
      
      expect(mockDb.query).toHaveBeenCalledWith(
        'SELECT reputation FROM users WHERE id = $1',
        [userId]
      );
      
      // Check that the user has the appropriate privileges
      expect(result).toContain(PrivilegeType.CREATE_POST);
      expect(result).toContain(PrivilegeType.UPVOTE);
      expect(result).toContain(PrivilegeType.COMMENT);
      expect(result).toContain(PrivilegeType.FLAG_CONTENT);
      expect(result).toContain(PrivilegeType.DOWNVOTE);
      expect(result).toContain(PrivilegeType.EDIT_OTHERS);
      expect(result).not.toContain(PrivilegeType.MODERATION_TOOLS);
      expect(result).not.toContain(PrivilegeType.TRUSTED_USER);
    });
    
    it('should return an empty array when user not found', async () => {
      const userId = 999;
      
      mockDb.query.mockResolvedValueOnce({ rows: [] });
      
      const result = await reputationRepository.getUserPrivileges(userId);
      
      expect(result).toEqual([]);
    });
  });
  
  describe('reputation point awards', () => {
    it('should award correct points for content upvotes based on content type', async () => {
      const contentId = 1;
      const authorId = 2;
      
      // Test for question upvote
      mockDb.query.mockResolvedValueOnce({ rows: [{ type: 'question' }] });
      mockDb.query.mockResolvedValueOnce({ rows: [] }); // updateReputation query result
      
      await reputationRepository.awardUpvotePoints(contentId, authorId);
      
      expect(mockDb.query).toHaveBeenCalledTimes(2);
      expect(mockDb.query).toHaveBeenNthCalledWith(2, 
        'SELECT update_user_reputation($1, $2, $3, $4)',
        [authorId, 5, ReputationReason.UPVOTE, contentId]
      );
      
      // Reset mocks
      jest.clearAllMocks();
      
      // Test for answer upvote
      mockDb.query.mockResolvedValueOnce({ rows: [{ type: 'answer' }] });
      mockDb.query.mockResolvedValueOnce({ rows: [] }); // updateReputation query result
      
      await reputationRepository.awardUpvotePoints(contentId, authorId);
      
      expect(mockDb.query).toHaveBeenCalledTimes(2);
      expect(mockDb.query).toHaveBeenNthCalledWith(2, 
        'SELECT update_user_reputation($1, $2, $3, $4)',
        [authorId, 10, ReputationReason.UPVOTE, contentId]
      );
    });
    
    it('should award correct points for accepted answers', async () => {
      const answerId = 1;
      const answerAuthorId = 2;
      
      mockDb.query.mockResolvedValueOnce({ rows: [] }); // updateReputation query result
      
      await reputationRepository.awardAcceptedAnswerPoints(answerId, answerAuthorId);
      
      expect(mockDb.query).toHaveBeenCalledWith(
        'SELECT update_user_reputation($1, $2, $3, $4)',
        [answerAuthorId, 15, ReputationReason.ACCEPTED_ANSWER, answerId]
      );
    });
  });
  
  describe('getReputationStats', () => {
    it('should return complete reputation statistics', async () => {
      const userId = 1;
      
      // Mock database responses
      mockDb.query.mockResolvedValueOnce({ rows: [{ reputation: 1250 }] });
      mockDb.query.mockResolvedValueOnce({ 
        rows: [
          { reason: 'upvote', total: '800' },
          { reason: 'accepted_answer', total: '450' }
        ] 
      });
      mockDb.query.mockResolvedValueOnce({ rows: [{ rank: 15 }] });
      mockDb.query.mockResolvedValueOnce({ rows: [{ percentile: 92.5 }] });
      
      const stats = await reputationRepository.getReputationStats(userId);
      
      expect(stats).toEqual({
        total: 1250,
        byReason: {
          upvote: 800,
          accepted_answer: 450
        },
        rank: 15,
        percentile: 92.5
      });
      
      expect(mockDb.query).toHaveBeenCalledTimes(4);
    });
  });
});