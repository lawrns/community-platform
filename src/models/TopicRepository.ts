/**
 * Topic Repository
 * Database operations for hierarchical topics
 */

import Repository from './Repository';
import { Topic } from './index';
import db from '../config/database';

/**
 * Repository for topic operations
 */
export default class TopicRepository extends Repository<Topic> {
  protected tableName = 'topics';

  /**
   * Find topic by slug
   */
  async findBySlug(slug: string): Promise<Topic | null> {
    const result = await db.query(
      `SELECT * FROM ${this.tableName} WHERE slug = $1`,
      [slug]
    );
    
    return result.rows.length ? result.rows[0] as Topic : null;
  }

  /**
   * Find top-level topics (topics with no parent)
   */
  async findTopLevel(): Promise<Topic[]> {
    const result = await db.query(
      `SELECT * FROM ${this.tableName} 
       WHERE parent_id IS NULL
       ORDER BY name ASC`
    );
    
    return result.rows as Topic[];
  }

  /**
   * Find child topics for a given parent topic
   */
  async findChildren(parentId: number): Promise<Topic[]> {
    const result = await db.query(
      `SELECT * FROM ${this.tableName} 
       WHERE parent_id = $1
       ORDER BY name ASC`,
      [parentId]
    );
    
    return result.rows as Topic[];
  }

  /**
   * Get the complete topic hierarchy
   */
  async getHierarchy(): Promise<any[]> {
    // First get all top-level topics
    const topLevelTopics = await this.findTopLevel();
    
    // Then recursively get their children
    const result = [];
    
    for (const topic of topLevelTopics) {
      const hierarchicalTopic = await this.getTopicWithChildren(topic.id);
      result.push(hierarchicalTopic);
    }
    
    return result;
  }

  /**
   * Get a topic with all its children (recursive)
   */
  private async getTopicWithChildren(topicId: number): Promise<any> {
    // Get the topic
    const topic = await this.findById(topicId);
    
    if (!topic) {
      return null;
    }
    
    // Get the children
    const children = await this.findChildren(topicId);
    
    // Recursively get children of children
    const childrenWithTheirChildren = [];
    
    for (const child of children) {
      const childWithItsChildren = await this.getTopicWithChildren(child.id);
      childrenWithTheirChildren.push(childWithItsChildren);
    }
    
    // Return the topic with its children
    return {
      ...topic,
      children: childrenWithTheirChildren
    };
  }

  /**
   * Get topic breadcrumbs (path from root to the topic)
   */
  async getBreadcrumbs(topicId: number): Promise<Topic[]> {
    const breadcrumbs = [];
    let currentTopic = await this.findById(topicId);
    
    // Build the breadcrumb trail from the current topic up to the root
    while (currentTopic) {
      breadcrumbs.unshift(currentTopic);
      
      if (currentTopic.parent_id) {
        currentTopic = await this.findById(currentTopic.parent_id);
      } else {
        currentTopic = null;
      }
    }
    
    return breadcrumbs;
  }

  /**
   * Get popular topics (most content)
   */
  async findPopular(limit: number = 10): Promise<any[]> {
    const result = await db.query(
      `SELECT t.*, COUNT(ct.content_id) as content_count
       FROM ${this.tableName} t
       LEFT JOIN content_topics ct ON t.id = ct.topic_id
       GROUP BY t.id
       ORDER BY content_count DESC
       LIMIT $1`,
      [limit]
    );
    
    return result.rows;
  }

  /**
   * Move a topic to a new parent
   */
  async moveToParent(topicId: number, newParentId: number | null): Promise<Topic | null> {
    // Prevent circular references
    if (newParentId !== null) {
      // Check if newParent is a descendant of topic
      const descendants = await this.getAllDescendants(topicId);
      if (descendants.some(d => d.id === newParentId)) {
        throw new Error('Cannot move a topic to one of its descendants');
      }
    }
    
    const result = await db.query(
      `UPDATE ${this.tableName} 
       SET parent_id = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [newParentId, topicId]
    );
    
    return result.rows.length ? result.rows[0] as Topic : null;
  }

  /**
   * Get all descendants of a topic (recursive)
   */
  private async getAllDescendants(topicId: number): Promise<Topic[]> {
    const children = await this.findChildren(topicId);
    let descendants = [...children];
    
    for (const child of children) {
      const childDescendants = await this.getAllDescendants(child.id);
      descendants = [...descendants, ...childDescendants];
    }
    
    return descendants;
  }
}