/**
 * Flag Repository Tests
 */

import { FlagRepository } from '../../models/moderation';
import { FlagType, FlagReason, FlagStatus } from '../../models';
import db from '../../config/database';

// Mock database
jest.mock('../../config/database', () => ({
  query: jest.fn(),
  transaction: jest.fn((callback) => callback({ query: jest.fn() }))
}));

describe('Flag Repository', () => {
  let flagRepo: FlagRepository;
  
  beforeEach(() => {
    flagRepo = new FlagRepository();
    
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup default mocks
    (db.query as jest.Mock).mockResolvedValue({ rows: [], rowCount: 0 });
  });
  
  describe('flagContent', () => {
    it('should create a flag for content', async () => {
      const mockFlag = {
        id: 1,
        type: FlagType.CONTENT,
        content_id: 5,
        reporter_id: 10,
        reason: FlagReason.SPAM,
        description: 'This is spam content',
        status: FlagStatus.PENDING,
        created_at: new Date(),
        updated_at: new Date()
      };
      
      // Mock create method
      jest.spyOn(flagRepo, 'create').mockResolvedValue(mockFlag);
      
      const result = await flagRepo.flagContent(
        5,
        10,
        FlagReason.SPAM,
        'This is spam content'
      );
      
      expect(flagRepo.create).toHaveBeenCalledWith(expect.objectContaining({
        type: FlagType.CONTENT,
        content_id: 5,
        reporter_id: 10,
        reason: FlagReason.SPAM,
        description: 'This is spam content',
        status: FlagStatus.PENDING
      }));
      
      expect(result).toEqual(mockFlag);
    });
  });
  
  describe('findPending', () => {
    it('should find pending flags with reporter information', async () => {
      const mockFlags = [
        {
          id: 1,
          type: FlagType.CONTENT,
          content_id: 5,
          reporter_id: 10,
          username: 'reporter1',
          name: 'Reporter One',
          avatar_url: 'https://example.com/avatar1.jpg',
          reason: FlagReason.SPAM,
          status: FlagStatus.PENDING,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 2,
          type: FlagType.USER,
          user_id: 20,
          reporter_id: 15,
          username: 'reporter2',
          name: 'Reporter Two',
          avatar_url: 'https://example.com/avatar2.jpg',
          reason: FlagReason.HARASSMENT,
          status: FlagStatus.PENDING,
          created_at: new Date(),
          updated_at: new Date()
        }
      ];
      
      // Mock query result
      (db.query as jest.Mock).mockResolvedValue({ rows: mockFlags });
      
      const result = await flagRepo.findPending(10, 0);
      
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE f.status = $1'),
        [FlagStatus.PENDING, 10, 0]
      );
      
      expect(result).toEqual(mockFlags);
    });
  });
  
  describe('updateStatus', () => {
    it('should update a flag status', async () => {
      const mockFlag = {
        id: 1,
        type: FlagType.CONTENT,
        content_id: 5,
        reporter_id: 10,
        reason: FlagReason.SPAM,
        status: FlagStatus.APPROVED,
        updated_at: new Date()
      };
      
      // Mock update method
      jest.spyOn(flagRepo, 'update').mockResolvedValue(mockFlag);
      
      const result = await flagRepo.updateStatus(1, FlagStatus.APPROVED);
      
      expect(flagRepo.update).toHaveBeenCalledWith(1, {
        status: FlagStatus.APPROVED,
        updated_at: expect.any(Date)
      });
      
      expect(result).toEqual(mockFlag);
    });
  });
  
  describe('findByStatus', () => {
    it('should find flags by status', async () => {
      const mockFlags = [
        {
          id: 1,
          type: FlagType.CONTENT,
          content_id: 5,
          reporter_id: 10,
          username: 'reporter1',
          name: 'Reporter One',
          reason: FlagReason.SPAM,
          status: FlagStatus.APPROVED,
          created_at: new Date()
        }
      ];
      
      // Mock query result
      (db.query as jest.Mock).mockResolvedValue({ rows: mockFlags });
      
      const result = await flagRepo.findByStatus(FlagStatus.APPROVED, 10, 0);
      
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE f.status = $1'),
        [FlagStatus.APPROVED, 10, 0]
      );
      
      expect(result).toEqual(mockFlags);
    });
  });
  
  describe('countByStatus', () => {
    it('should count flags by status', async () => {
      // Mock query result
      (db.query as jest.Mock).mockResolvedValue({ rows: [{ count: '25' }] });
      
      const result = await flagRepo.countByStatus(FlagStatus.PENDING);
      
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT COUNT(*) as count'),
        [FlagStatus.PENDING]
      );
      
      expect(result).toBe(25);
    });
  });
});