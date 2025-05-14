/**
 * Topic Hierarchy Service Tests
 * Tests for topic hierarchy management functionality
 */

import topicHierarchyService from '../../services/topics/topicHierarchyService';
import { topicRepository } from '../../models/repositories';
import cache from '../../config/cache';

// Mock dependencies
jest.mock('../../models/repositories', () => ({
  topicRepository: {
    findById: jest.fn(),
    findBySlug: jest.fn(),
    findChildren: jest.fn(),
    getHierarchy: jest.fn(),
    getBreadcrumbs: jest.fn(),
    create: jest.fn(),
    moveToParent: jest.fn(),
    delete: jest.fn(),
    query: jest.fn(),
  },
}));

jest.mock('../../config/cache', () => ({
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
}));

describe('TopicHierarchyService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateSlug', () => {
    it('should convert topic name to a valid slug', () => {
      expect(topicHierarchyService.generateSlug('Machine Learning')).toBe('machine-learning');
      expect(topicHierarchyService.generateSlug('AI & ML')).toBe('ai-ml');
      expect(topicHierarchyService.generateSlug('Node.js')).toBe('nodejs');
    });
  });

  describe('getFullHierarchy', () => {
    it('should return hierarchy from cache if available', async () => {
      const mockHierarchy = [
        {
          id: 1,
          name: 'AI',
          children: [
            { id: 2, name: 'Machine Learning', children: [] },
            { id: 3, name: 'Computer Vision', children: [] },
          ],
        },
      ];
      
      (cache.get as jest.Mock).mockResolvedValue(mockHierarchy);
      
      const result = await topicHierarchyService.getFullHierarchy();
      
      expect(result).toEqual(mockHierarchy);
      expect(cache.get).toHaveBeenCalledWith('topic_hierarchy');
      expect(topicRepository.getHierarchy).not.toHaveBeenCalled();
    });

    it('should fetch hierarchy from repository if not in cache', async () => {
      const mockHierarchy = [
        {
          id: 1,
          name: 'AI',
          children: [
            { id: 2, name: 'Machine Learning', children: [] },
            { id: 3, name: 'Computer Vision', children: [] },
          ],
        },
      ];
      
      (cache.get as jest.Mock).mockResolvedValue(null);
      (topicRepository.getHierarchy as jest.Mock).mockResolvedValue(mockHierarchy);
      
      const result = await topicHierarchyService.getFullHierarchy();
      
      expect(result).toEqual(mockHierarchy);
      expect(cache.get).toHaveBeenCalledWith('topic_hierarchy');
      expect(topicRepository.getHierarchy).toHaveBeenCalled();
      expect(cache.set).toHaveBeenCalledWith('topic_hierarchy', mockHierarchy, 3600);
    });
  });

  describe('getBreadcrumbs', () => {
    it('should return breadcrumb trail for a topic', async () => {
      const mockBreadcrumbs = [
        { id: 1, name: 'AI' },
        { id: 2, name: 'Machine Learning' },
        { id: 5, name: 'Neural Networks' },
      ];
      
      (topicRepository.getBreadcrumbs as jest.Mock).mockResolvedValue(mockBreadcrumbs);
      
      const result = await topicHierarchyService.getBreadcrumbs(5);
      
      expect(result).toEqual(mockBreadcrumbs);
      expect(topicRepository.getBreadcrumbs).toHaveBeenCalledWith(5);
    });
  });

  describe('createTopic', () => {
    it('should create a new topic with optional parent', async () => {
      const mockTopic = {
        id: 4,
        name: 'Deep Learning',
        slug: 'deep-learning',
        parent_id: 2,
      };
      
      (topicRepository.findBySlug as jest.Mock).mockResolvedValue(null);
      (topicRepository.findById as jest.Mock).mockResolvedValue({ id: 2, name: 'Machine Learning' });
      (topicRepository.create as jest.Mock).mockResolvedValue(mockTopic);
      
      const result = await topicHierarchyService.createTopic('Deep Learning', 'Neural networks and deep learning', 2);
      
      expect(result).toEqual(mockTopic);
      expect(topicRepository.findBySlug).toHaveBeenCalledWith('deep-learning');
      expect(topicRepository.findById).toHaveBeenCalledWith(2);
      expect(topicRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Deep Learning',
        slug: 'deep-learning',
        description: 'Neural networks and deep learning',
        parent_id: 2,
      }));
      expect(cache.del).toHaveBeenCalledWith('topic_hierarchy');
    });

    it('should throw error if topic with same slug exists', async () => {
      (topicRepository.findBySlug as jest.Mock).mockResolvedValue({
        id: 4,
        name: 'Deep Learning',
        slug: 'deep-learning',
      });
      
      await expect(
        topicHierarchyService.createTopic('Deep Learning')
      ).rejects.toThrow('A topic with this name already exists');
      
      expect(topicRepository.create).not.toHaveBeenCalled();
    });

    it('should throw error if parent topic does not exist', async () => {
      (topicRepository.findBySlug as jest.Mock).mockResolvedValue(null);
      (topicRepository.findById as jest.Mock).mockResolvedValue(null);
      
      await expect(
        topicHierarchyService.createTopic('Deep Learning', 'Description', 999)
      ).rejects.toThrow('Parent topic not found');
      
      expect(topicRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('moveTopic', () => {
    it('should move a topic to a new parent', async () => {
      const mockTopic = {
        id: 5,
        name: 'Neural Networks',
        parent_id: 4, // New parent
      };
      
      (topicRepository.moveToParent as jest.Mock).mockResolvedValue(mockTopic);
      
      const result = await topicHierarchyService.moveTopic(5, 4);
      
      expect(result).toEqual(mockTopic);
      expect(topicRepository.moveToParent).toHaveBeenCalledWith(5, 4);
      expect(cache.del).toHaveBeenCalledWith('topic_hierarchy');
    });

    it('should handle errors from repository', async () => {
      (topicRepository.moveToParent as jest.Mock).mockRejectedValue(
        new Error('Cannot move a topic to one of its descendants')
      );
      
      await expect(
        topicHierarchyService.moveTopic(1, 5)
      ).rejects.toThrow('Cannot move a topic to one of its descendants');
    });
  });

  describe('deleteTopic', () => {
    it('should delete a topic with no children and no content', async () => {
      (topicRepository.findById as jest.Mock).mockResolvedValue({ id: 5, name: 'Neural Networks' });
      (topicRepository.findChildren as jest.Mock).mockResolvedValue([]);
      (topicRepository.query as jest.Mock).mockResolvedValue({ rows: [{ count: '0' }] });
      (topicRepository.delete as jest.Mock).mockResolvedValue(true);
      
      const result = await topicHierarchyService.deleteTopic(5);
      
      expect(result).toBe(true);
      expect(topicRepository.delete).toHaveBeenCalledWith(5);
      expect(cache.del).toHaveBeenCalledWith('topic_hierarchy');
    });

    it('should throw error if topic has children', async () => {
      (topicRepository.findById as jest.Mock).mockResolvedValue({ id: 2, name: 'Machine Learning' });
      (topicRepository.findChildren as jest.Mock).mockResolvedValue([
        { id: 5, name: 'Neural Networks' },
      ]);
      
      await expect(
        topicHierarchyService.deleteTopic(2)
      ).rejects.toThrow('Cannot delete a topic with children');
      
      expect(topicRepository.delete).not.toHaveBeenCalled();
    });

    it('should throw error if topic has associated content', async () => {
      (topicRepository.findById as jest.Mock).mockResolvedValue({ id: 5, name: 'Neural Networks' });
      (topicRepository.findChildren as jest.Mock).mockResolvedValue([]);
      (topicRepository.query as jest.Mock).mockResolvedValue({ rows: [{ count: '10' }] });
      
      await expect(
        topicHierarchyService.deleteTopic(5)
      ).rejects.toThrow('Cannot delete a topic that is used by 10 content items');
      
      expect(topicRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('getAllDescendants', () => {
    it('should return all descendants of a topic', async () => {
      const mockChildren = [
        { id: 5, name: 'Neural Networks' },
        { id: 6, name: 'Supervised Learning' },
      ];
      
      const mockGrandchildren = [
        { id: 7, name: 'CNNs' },
        { id: 8, name: 'RNNs' },
      ];
      
      (topicRepository.findChildren as jest.Mock)
        .mockResolvedValueOnce(mockChildren)
        .mockResolvedValueOnce(mockGrandchildren)
        .mockResolvedValueOnce([]);
      
      const result = await topicHierarchyService.getAllDescendants(2);
      
      // Should include both children and grandchildren
      expect(result).toEqual(expect.arrayContaining([
        ...mockChildren,
        ...mockGrandchildren,
      ]));
      
      expect(topicRepository.findChildren).toHaveBeenCalledWith(2);
      expect(topicRepository.findChildren).toHaveBeenCalledWith(5);
      expect(topicRepository.findChildren).toHaveBeenCalledWith(6);
    });
  });

  describe('getTopicsWithContentCounts', () => {
    it('should return topics with their content counts', async () => {
      const mockTopics = [
        { id: 1, name: 'AI', content_count: '15' },
        { id: 2, name: 'Machine Learning', content_count: '10' },
        { id: 3, name: 'Computer Vision', content_count: '5' },
      ];
      
      (topicRepository.query as jest.Mock).mockResolvedValue({
        rows: mockTopics,
      });
      
      const result = await topicHierarchyService.getTopicsWithContentCounts();
      
      expect(result).toEqual(mockTopics);
      expect(topicRepository.query).toHaveBeenCalledWith(
        expect.stringContaining('content_count')
      );
    });
  });
});