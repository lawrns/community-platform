/**
 * Tag Suggestion Service
 * Provides functionality for tag suggestions, similarity matching, and validation
 */

import slugify from 'slugify';
import { tagRepository } from '../../models/repositories';
import cache from '../../config/cache';

/**
 * Cache TTL for popular tags (1 hour)
 */
const POPULAR_TAGS_CACHE_TTL = 3600;

/**
 * Tag Suggestion Service class
 */
class TagSuggestionService {
  /**
   * Generate a slug from a tag name
   */
  generateSlug(name: string): string {
    return slugify(name, {
      lower: true,
      strict: true,
      replacement: '-',
    });
  }

  /**
   * Get suggestions based on a prefix
   * For autocomplete functionality
   */
  async getSuggestions(prefix: string, limit: number = 10): Promise<any[]> {
    return tagRepository.findByNamePrefix(prefix, limit);
  }

  /**
   * Get similar tags for a given tag name
   * Used to suggest corrections for typos
   */
  async getSimilarTags(name: string, limit: number = 5): Promise<any[]> {
    // Clean up the name
    const cleanName = name.trim().toLowerCase();
    if (cleanName.length < 2) {
      return [];
    }

    return tagRepository.findSimilar(cleanName, limit);
  }

  /**
   * Get popular tags (cached)
   */
  async getPopularTags(limit: number = 20): Promise<any[]> {
    // Try to get from cache first
    const cacheKey = `popular_tags:${limit}`;
    const cachedTags = await cache.get<any[]>(cacheKey);
    
    if (cachedTags) {
      return cachedTags;
    }
    
    // Get from database
    const tags = await tagRepository.findPopular(limit);
    
    // Store in cache
    await cache.set(cacheKey, tags, POPULAR_TAGS_CACHE_TTL);
    
    return tags;
  }

  /**
   * Validate and normalize tags
   * - Ensures tags meet the length and character requirements
   * - Deduplicates tags
   * - Enforces the maximum tag limit
   * - Suggests corrections for possible typos
   */
  async validateAndNormalizeTags(
    tagNames: string[],
    maxTags: number = 5
  ): Promise<{
    valid: string[];
    invalid: string[];
    suggestions: { original: string; suggestions: string[] }[];
  }> {
    // Remove duplicates and empty tags
    const uniqueTagNames = [...new Set(tagNames)]
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
    
    // Enforce maximum tag limit
    const limitedTagNames = uniqueTagNames.slice(0, maxTags);
    
    const valid: string[] = [];
    const invalid: string[] = [];
    const suggestions: { original: string; suggestions: string[] }[] = [];
    
    // Process each tag
    for (const tagName of limitedTagNames) {
      // Check if tag meets requirements
      if (this.isValidTagName(tagName)) {
        valid.push(tagName);
      } else {
        invalid.push(tagName);
      }
    }
    
    // Generate suggestions for invalid tags
    for (const invalidTag of invalid) {
      const similarTags = await this.getSimilarTags(invalidTag);
      if (similarTags.length > 0) {
        suggestions.push({
          original: invalidTag,
          suggestions: similarTags.map(tag => tag.name),
        });
      }
    }
    
    return {
      valid,
      invalid,
      suggestions,
    };
  }

  /**
   * Check if a tag name is valid
   * - Must be between 2 and 30 characters
   * - Must only contain alphanumeric characters, spaces, hyphens, and plus signs
   */
  isValidTagName(name: string): boolean {
    if (name.length < 2 || name.length > 30) {
      return false;
    }
    
    // Check if contains only allowed characters
    const validTagRegex = /^[a-zA-Z0-9\-\+ ]+$/;
    return validTagRegex.test(name);
  }

  /**
   * Create tags from a list of names
   * - Creates tags that don't exist
   * - Returns all tag objects
   */
  async createTagsFromNames(tagNames: string[]): Promise<any[]> {
    const result = [];
    
    for (const name of tagNames) {
      const slug = this.generateSlug(name);
      
      // Create tag if it doesn't exist
      const tag = await tagRepository.createIfNotExists(name, slug);
      result.push(tag);
    }
    
    return result;
  }

  /**
   * Count tag usage in content
   */
  async countTagUsage(tagId: number): Promise<number> {
    const result = await tagRepository.query(
      `SELECT COUNT(*) as count FROM content_tags WHERE tag_id = $1`,
      [tagId]
    );
    
    return parseInt(result.rows[0].count);
  }
}

export default new TagSuggestionService();