/**
 * Topic Hierarchy Service
 * Manages the hierarchical relationship between topics
 */

import slugify from 'slugify';
import { topicRepository } from '../../models/repositories';
import cache from '../../config/cache';

/**
 * Cache TTL for hierarchy (1 hour)
 */
const HIERARCHY_CACHE_TTL = 3600;

/**
 * Topic Hierarchy Service class
 */
class TopicHierarchyService {
  /**
   * Generate a slug from a topic name
   */
  generateSlug(name: string): string {
    return slugify(name, {
      lower: true,
      strict: true,
      replacement: '-',
    });
  }

  /**
   * Get the full topic hierarchy (cached)
   */
  async getFullHierarchy(): Promise<any[]> {
    // Try to get from cache first
    const cacheKey = 'topic_hierarchy';
    const cachedHierarchy = await cache.get<any[]>(cacheKey);
    
    if (cachedHierarchy) {
      return cachedHierarchy;
    }
    
    // Get from database
    const hierarchy = await topicRepository.getHierarchy();
    
    // Store in cache
    await cache.set(cacheKey, hierarchy, HIERARCHY_CACHE_TTL);
    
    return hierarchy;
  }

  /**
   * Get breadcrumb trail for a topic
   */
  async getBreadcrumbs(topicId: number): Promise<any[]> {
    return topicRepository.getBreadcrumbs(topicId);
  }

  /**
   * Create a topic with optional parent
   */
  async createTopic(name: string, description?: string, parentId?: number): Promise<any> {
    // Generate slug
    const slug = this.generateSlug(name);
    
    // Check if topic with this slug already exists
    const existingTopic = await topicRepository.findBySlug(slug);
    if (existingTopic) {
      throw new Error('A topic with this name already exists');
    }
    
    // If parentId is provided, check if it exists
    if (parentId) {
      const parentTopic = await topicRepository.findById(parentId);
      if (!parentTopic) {
        throw new Error('Parent topic not found');
      }
    }
    
    // Create topic
    const topic = await topicRepository.create({
      name,
      slug,
      description,
      parent_id: parentId || null,
      created_at: new Date(),
      updated_at: new Date(),
    });
    
    // Invalidate cache
    await cache.del('topic_hierarchy');
    
    return topic;
  }

  /**
   * Move a topic to a new parent
   */
  async moveTopic(topicId: number, newParentId: number | null): Promise<any> {
    try {
      const topic = await topicRepository.moveToParent(topicId, newParentId);
      
      // Invalidate cache
      await cache.del('topic_hierarchy');
      
      return topic;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete a topic if it has no children
   */
  async deleteTopic(topicId: number): Promise<boolean> {
    // Check if topic exists
    const topic = await topicRepository.findById(topicId);
    if (!topic) {
      throw new Error('Topic not found');
    }
    
    // Check for children
    const children = await topicRepository.findChildren(topicId);
    if (children.length > 0) {
      throw new Error('Cannot delete a topic with children. Move or delete children first.');
    }
    
    // Check if content is using this topic
    const contentCount = await this.countTopicUsage(topicId);
    if (contentCount > 0) {
      throw new Error(`Cannot delete a topic that is used by ${contentCount} content items. Reassign content first.`);
    }
    
    // Delete topic
    const result = await topicRepository.delete(topicId);
    
    // Invalidate cache
    await cache.del('topic_hierarchy');
    
    return result;
  }

  /**
   * Count topic usage in content
   */
  async countTopicUsage(topicId: number): Promise<number> {
    const result = await topicRepository.query(
      `SELECT COUNT(*) as count FROM content_topics WHERE topic_id = $1`,
      [topicId]
    );
    
    return parseInt(result.rows[0].count);
  }

  /**
   * Get all descendant topics (children, grandchildren, etc.)
   */
  async getAllDescendants(topicId: number): Promise<any[]> {
    // First get immediate children
    const children = await topicRepository.findChildren(topicId);
    let descendants = [...children];
    
    // Then recursively get their children
    for (const child of children) {
      const childDescendants = await this.getAllDescendants(child.id);
      descendants = [...descendants, ...childDescendants];
    }
    
    return descendants;
  }

  /**
   * Get topics with their content counts
   */
  async getTopicsWithContentCounts(): Promise<any[]> {
    const result = await topicRepository.query(
      `SELECT t.*, COUNT(ct.content_id) as content_count
       FROM topics t
       LEFT JOIN content_topics ct ON t.id = ct.topic_id
       GROUP BY t.id
       ORDER BY t.name ASC`
    );
    
    return result.rows;
  }
}

export default new TopicHierarchyService();