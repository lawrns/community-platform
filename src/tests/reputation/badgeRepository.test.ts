import { Database } from '../../config/database';
import { BadgeRepository } from '../../models/BadgeRepository';
import { BadgeLevel } from '../../models/index';

// Mock the database
jest.mock('../../config/database');

describe('BadgeRepository', () => {
  let badgeRepository: BadgeRepository;
  const mockDb = {
    query: jest.fn(),
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    // @ts-ignore - mock implementation
    Database.getInstance.mockReturnValue(mockDb);
    // Create a new repository instance for each test
    badgeRepository = new BadgeRepository(Database.getInstance());
  });
  
  describe('createBadge', () => {
    it('should create a new badge', async () => {
      const newBadge = {
        name: 'Test Badge',
        description: 'A test badge',
        icon_url: 'https://example.com/badge.png',
        level: BadgeLevel.SILVER
      };
      
      const mockCreatedBadge = {
        id: 11,
        name: 'Test Badge',
        description: 'A test badge',
        icon_url: 'https://example.com/badge.png',
        level: BadgeLevel.SILVER,
        created_at: new Date().toISOString()
      };
      
      mockDb.query.mockResolvedValueOnce({ rows: [mockCreatedBadge] });
      
      const result = await badgeRepository.createBadge(newBadge);
      
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO badges'),
        [newBadge.name, newBadge.description, newBadge.icon_url, newBadge.level]
      );
      
      expect(result).toEqual(mockCreatedBadge);
    });
  });
  
  describe('getAllBadges', () => {
    it('should retrieve all badges ordered by level', async () => {
      const mockBadges = [
        { id: 1, name: 'Gold Badge', level: BadgeLevel.GOLD },
        { id: 2, name: 'Silver Badge', level: BadgeLevel.SILVER },
        { id: 3, name: 'Bronze Badge', level: BadgeLevel.BRONZE }
      ];
      
      mockDb.query.mockResolvedValueOnce({ rows: mockBadges });
      
      const result = await badgeRepository.getAllBadges();
      
      expect(mockDb.query).toHaveBeenCalledWith(expect.stringContaining('SELECT * FROM badges ORDER BY'));
      expect(result).toEqual(mockBadges);
    });
  });
  
  describe('getBadgeById', () => {
    it('should retrieve a badge by ID', async () => {
      const badgeId = 1;
      const mockBadge = { 
        id: badgeId, 
        name: 'Test Badge', 
        description: 'A test badge',
        level: BadgeLevel.GOLD
      };
      
      mockDb.query.mockResolvedValueOnce({ rows: [mockBadge] });
      
      const result = await badgeRepository.getBadgeById(badgeId);
      
      expect(mockDb.query).toHaveBeenCalledWith(
        'SELECT * FROM badges WHERE id = $1',
        [badgeId]
      );
      
      expect(result).toEqual(mockBadge);
    });
    
    it('should return null if badge not found', async () => {
      const badgeId = 999;
      
      mockDb.query.mockResolvedValueOnce({ rows: [] });
      
      const result = await badgeRepository.getBadgeById(badgeId);
      
      expect(result).toBeNull();
    });
  });
  
  describe('awardBadge', () => {
    it('should award a badge to a user', async () => {
      const userId = 1;
      const badgeId = 2;
      const awardedAt = new Date().toISOString();
      
      const mockUserBadge = { 
        user_id: userId, 
        badge_id: badgeId, 
        awarded_at: awardedAt
      };
      
      // Mock getUserBadge to return null (user doesn't have the badge)
      mockDb.query.mockResolvedValueOnce({ rows: [] });
      // Mock the insert query
      mockDb.query.mockResolvedValueOnce({ rows: [mockUserBadge] });
      
      const result = await badgeRepository.awardBadge(userId, badgeId);
      
      expect(mockDb.query).toHaveBeenNthCalledWith(2, 
        expect.stringContaining('INSERT INTO user_badges'),
        [userId, badgeId]
      );
      
      expect(result).toEqual(mockUserBadge);
    });
    
    it('should not award a badge if the user already has it', async () => {
      const userId = 1;
      const badgeId = 2;
      const awardedAt = new Date().toISOString();
      
      const mockExistingBadge = { 
        user_id: userId, 
        badge_id: badgeId, 
        awarded_at: awardedAt
      };
      
      // Mock getUserBadge to return an existing badge
      mockDb.query.mockResolvedValueOnce({ rows: [mockExistingBadge] });
      
      const result = await badgeRepository.awardBadge(userId, badgeId);
      
      // The insert query should not be called
      expect(mockDb.query).toHaveBeenCalledTimes(1);
      
      expect(result).toEqual(mockExistingBadge);
    });
  });
  
  describe('getUserBadges', () => {
    it('should retrieve all badges for a user', async () => {
      const userId = 1;
      const mockUserBadges = [
        { id: 1, name: 'Badge 1', level: BadgeLevel.BRONZE, awarded_at: new Date().toISOString() },
        { id: 2, name: 'Badge 2', level: BadgeLevel.SILVER, awarded_at: new Date().toISOString() }
      ];
      
      mockDb.query.mockResolvedValueOnce({ rows: mockUserBadges });
      
      const result = await badgeRepository.getUserBadges(userId);
      
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('FROM badges b JOIN user_badges ub ON b.id = ub.badge_id'),
        [userId]
      );
      
      expect(result).toEqual(mockUserBadges);
    });
  });
  
  describe('checkAndAwardBadge', () => {
    it('should check eligibility and award badge if eligible', async () => {
      const userId = 1;
      const badgeKey = 'first_post';
      
      // Mock getUserBadge to return null (user doesn't have the badge)
      mockDb.query.mockResolvedValueOnce({ rows: [] });
      // Mock the eligibility check query (user has a post)
      mockDb.query.mockResolvedValueOnce({ rows: [{ count: '1' }] });
      // Mock the award query
      mockDb.query.mockResolvedValueOnce({ rows: [{ user_id: userId, badge_id: 2 }] });
      
      const result = await badgeRepository.checkAndAwardBadge(userId, badgeKey);
      
      expect(result).toBe(true);
      expect(mockDb.query).toHaveBeenCalledTimes(3);
    });
    
    it('should return false if user already has the badge', async () => {
      const userId = 1;
      const badgeKey = 'first_post';
      
      // Mock getUserBadge to return an existing badge
      mockDb.query.mockResolvedValueOnce({ rows: [{ user_id: userId, badge_id: 2 }] });
      
      const result = await badgeRepository.checkAndAwardBadge(userId, badgeKey);
      
      expect(result).toBe(false);
      // Only the getUserBadge query should be called
      expect(mockDb.query).toHaveBeenCalledTimes(1);
    });
    
    it('should return false if user is not eligible for the badge', async () => {
      const userId = 1;
      const badgeKey = 'first_post';
      
      // Mock getUserBadge to return null (user doesn't have the badge)
      mockDb.query.mockResolvedValueOnce({ rows: [] });
      // Mock the eligibility check query (user has no posts)
      mockDb.query.mockResolvedValueOnce({ rows: [{ count: '0' }] });
      
      const result = await badgeRepository.checkAndAwardBadge(userId, badgeKey);
      
      expect(result).toBe(false);
      expect(mockDb.query).toHaveBeenCalledTimes(2);
    });
  });
  
  describe('checkAllBadges', () => {
    it('should check all badges and return the ones awarded', async () => {
      const userId = 1;
      
      // Set up mocks for each badge check
      // Mock the welcome badge (eligible)
      mockDb.query.mockResolvedValueOnce({ rows: [] }); // No existing badge
      mockDb.query.mockResolvedValueOnce({ rows: [{ exists: true }] }); // Eligible
      mockDb.query.mockResolvedValueOnce({ rows: [{ user_id: userId, badge_id: 1 }] }); // Award
      
      // Mock the first_post badge (not eligible)
      mockDb.query.mockResolvedValueOnce({ rows: [] }); // No existing badge
      mockDb.query.mockResolvedValueOnce({ rows: [{ count: '0' }] }); // Not eligible
      
      // Mock the remaining badge checks (all not eligible for brevity)
      for (let i = 0; i < 8; i++) {
        mockDb.query.mockResolvedValueOnce({ rows: [] }); // No existing badge
        mockDb.query.mockResolvedValueOnce({ rows: [{ count: '0' }] }); // Not eligible
      }
      
      const result = await badgeRepository.checkAllBadges(userId);
      
      expect(result).toEqual([1]); // Only welcome badge was awarded
      expect(mockDb.query).toHaveBeenCalledTimes(21); // 10 badge checks with 2 queries each plus 1 award
    });
  });
});