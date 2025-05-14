/**
 * Tag Suggestion Service Tests
 * Tests for tag suggestion and validation functionality
 */

import tagSuggestionService from '../../services/tags/tagSuggestionService';
import { tagRepository } from '../../models/repositories';
import cache from '../../config/cache';

// Mock dependencies
jest.mock('../../models/repositories', () => ({
  tagRepository: {
    findByNamePrefix: jest.fn(),
    findSimilar: jest.fn(),
    findPopular: jest.fn(),
    createIfNotExists: jest.fn(),
    query: jest.fn(),
  },
}));

jest.mock('../../config/cache', () => ({
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
}));

describe('TagSuggestionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateSlug', () => {
    it('should convert tag name to a valid slug', () => {
      expect(tagSuggestionService.generateSlug('Machine Learning')).toBe('machine-learning');
      expect(tagSuggestionService.generateSlug('AI & ML')).toBe('ai-ml');
      expect(tagSuggestionService.generateSlug('C++')).toBe('c');
      expect(tagSuggestionService.generateSlug('Node.js')).toBe('nodejs');
    });
  });

  describe('getSuggestions', () => {
    it('should return suggestions based on prefix', async () => {
      const mockTags = [
        { id: 1, name: 'machine-learning' },
        { id: 2, name: 'machine-vision' },
      ];
      
      (tagRepository.findByNamePrefix as jest.Mock).mockResolvedValue(mockTags);
      
      const result = await tagSuggestionService.getSuggestions('mach', 5);
      
      expect(result).toEqual(mockTags);
      expect(tagRepository.findByNamePrefix).toHaveBeenCalledWith('mach', 5);
    });
  });

  describe('getSimilarTags', () => {
    it('should return similar tags for potential typos', async () => {
      const mockTags = [
        { id: 1, name: 'python', sim: 0.8 },
        { id: 2, name: 'pytorch', sim: 0.6 },
      ];
      
      (tagRepository.findSimilar as jest.Mock).mockResolvedValue(mockTags);
      
      const result = await tagSuggestionService.getSimilarTags('pyhton', 5);
      
      expect(result).toEqual(mockTags);
      expect(tagRepository.findSimilar).toHaveBeenCalledWith('pyhton', 5);
    });

    it('should return empty array for very short inputs', async () => {
      const result = await tagSuggestionService.getSimilarTags('a', 5);
      
      expect(result).toEqual([]);
      expect(tagRepository.findSimilar).not.toHaveBeenCalled();
    });
  });

  describe('getPopularTags', () => {
    it('should return popular tags from cache if available', async () => {
      const mockTags = [
        { id: 1, name: 'javascript', usage_count: 100 },
        { id: 2, name: 'python', usage_count: 80 },
      ];
      
      (cache.get as jest.Mock).mockResolvedValue(mockTags);
      
      const result = await tagSuggestionService.getPopularTags(10);
      
      expect(result).toEqual(mockTags);
      expect(cache.get).toHaveBeenCalledWith('popular_tags:10');
      expect(tagRepository.findPopular).not.toHaveBeenCalled();
    });

    it('should fetch popular tags from repository if not in cache', async () => {
      const mockTags = [
        { id: 1, name: 'javascript', usage_count: 100 },
        { id: 2, name: 'python', usage_count: 80 },
      ];
      
      (cache.get as jest.Mock).mockResolvedValue(null);
      (tagRepository.findPopular as jest.Mock).mockResolvedValue(mockTags);
      
      const result = await tagSuggestionService.getPopularTags(10);
      
      expect(result).toEqual(mockTags);
      expect(cache.get).toHaveBeenCalledWith('popular_tags:10');
      expect(tagRepository.findPopular).toHaveBeenCalledWith(10);
      expect(cache.set).toHaveBeenCalledWith('popular_tags:10', mockTags, 3600);
    });
  });

  describe('validateAndNormalizeTags', () => {
    it('should validate and normalize tags correctly', async () => {
      const mockSimilarTags = [
        { id: 3, name: 'javascript', sim: 0.8 },
      ];
      
      (tagRepository.findSimilar as jest.Mock).mockResolvedValue(mockSimilarTags);
      
      const result = await tagSuggestionService.validateAndNormalizeTags([
        'python',
        'Java',
        'javascrpt', // Typo
        'ai',
        'machine learning',
        'C#', // Invalid character
        'python', // Duplicate
        'verylongtagthatexceedsthethirtycharlimit' // Too long
      ]);
      
      expect(result.valid).toContain('python');
      expect(result.valid).toContain('Java');
      expect(result.valid).toContain('ai');
      expect(result.valid).toContain('machine learning');
      expect(result.valid).not.toContain('python'); // Duplicate should be removed
      
      expect(result.invalid).toContain('javascrpt');
      expect(result.invalid).toContain('C#');
      expect(result.invalid).toContain('verylongtagthatexceedsthethirtycharlimit');
      
      expect(result.suggestions).toContainEqual({
        original: 'javascrpt',
        suggestions: ['javascript']
      });
    });

    it('should enforce the maximum number of tags', async () => {
      const result = await tagSuggestionService.validateAndNormalizeTags([
        'tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6', 'tag7'
      ], 5);
      
      expect(result.valid.length).toBeLessThanOrEqual(5);
      expect(result.valid).toContain('tag1');
      expect(result.valid).toContain('tag5');
      expect(result.valid).not.toContain('tag6');
    });
  });

  describe('isValidTagName', () => {
    it('should validate tag names correctly', () => {
      // Valid tags
      expect(tagSuggestionService.isValidTagName('javascript')).toBe(true);
      expect(tagSuggestionService.isValidTagName('machine learning')).toBe(true);
      expect(tagSuggestionService.isValidTagName('C++')).toBe(true);
      
      // Invalid tags
      expect(tagSuggestionService.isValidTagName('a')).toBe(false); // Too short
      expect(tagSuggestionService.isValidTagName('C#')).toBe(false); // Invalid character
      expect(tagSuggestionService.isValidTagName('verylongtagthatexceedsthethirtycharlimit')).toBe(false); // Too long
    });
  });

  describe('createTagsFromNames', () => {
    it('should create tags from a list of names', async () => {
      const mockTags = [
        { id: 1, name: 'javascript', slug: 'javascript' },
        { id: 2, name: 'python', slug: 'python' },
      ];
      
      (tagRepository.createIfNotExists as jest.Mock)
        .mockResolvedValueOnce(mockTags[0])
        .mockResolvedValueOnce(mockTags[1]);
      
      const result = await tagSuggestionService.createTagsFromNames(['javascript', 'python']);
      
      expect(result).toEqual(mockTags);
      expect(tagRepository.createIfNotExists).toHaveBeenCalledTimes(2);
      expect(tagRepository.createIfNotExists).toHaveBeenCalledWith('javascript', 'javascript');
      expect(tagRepository.createIfNotExists).toHaveBeenCalledWith('python', 'python');
    });
  });

  describe('countTagUsage', () => {
    it('should count tag usage in content', async () => {
      (tagRepository.query as jest.Mock).mockResolvedValue({
        rows: [{ count: '42' }]
      });
      
      const result = await tagSuggestionService.countTagUsage(1);
      
      expect(result).toBe(42);
      expect(tagRepository.query).toHaveBeenCalledWith(
        expect.stringContaining('COUNT(*)'),
        [1]
      );
    });
  });
});