/**
 * Tag Repository
 * Database operations for tags
 */

import Repository from './Repository';
import { Tag } from './index';
import db from '../config/database';

/**
 * Repository for tag operations
 */
export default class TagRepository extends Repository<Tag> {
  protected tableName = 'tags';

  /**
   * Find tag by slug
   */
  async findBySlug(slug: string): Promise<Tag | null> {
    const result = await db.query(
      `SELECT * FROM ${this.tableName} WHERE slug = $1`,
      [slug]
    );
    
    return result.rows.length ? result.rows[0] as Tag : null;
  }

  /**
   * Find tags by name prefix (for autocomplete)
   */
  async findByNamePrefix(prefix: string, limit: number = 10): Promise<Tag[]> {
    const result = await db.query(
      `SELECT * FROM ${this.tableName} 
       WHERE name ILIKE $1 
       ORDER BY name ASC
       LIMIT $2`,
      [`${prefix}%`, limit]
    );
    
    return result.rows as Tag[];
  }

  /**
   * Find popular tags (most used)
   */
  async findPopular(limit: number = 20): Promise<any[]> {
    const result = await db.query(
      `SELECT t.*, COUNT(ct.content_id) as usage_count
       FROM ${this.tableName} t
       LEFT JOIN content_tags ct ON t.id = ct.tag_id
       GROUP BY t.id
       ORDER BY usage_count DESC
       LIMIT $1`,
      [limit]
    );
    
    return result.rows;
  }

  /**
   * Find similar tags (for typo suggestions)
   */
  async findSimilar(tagName: string, limit: number = 5): Promise<Tag[]> {
    // Using PostgreSQL's trigram similarity for fuzzy matching
    const result = await db.query(
      `SELECT *, similarity(name, $1) as sim
       FROM ${this.tableName}
       WHERE similarity(name, $1) > 0.3
       ORDER BY sim DESC
       LIMIT $2`,
      [tagName, limit]
    );
    
    return result.rows as Tag[];
  }

  /**
   * Create a new tag if it doesn't exist
   */
  async createIfNotExists(name: string, slug: string, description?: string): Promise<Tag> {
    const result = await db.query(
      `INSERT INTO ${this.tableName} (name, slug, description, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       ON CONFLICT (slug) DO UPDATE 
       SET name = EXCLUDED.name, 
           description = COALESCE(EXCLUDED.description, ${this.tableName}.description)
       RETURNING *`,
      [name, slug, description]
    );
    
    return result.rows[0] as Tag;
  }

  /**
   * Get related tags (tags that often appear with the given tag)
   */
  async getRelatedTags(tagId: number, limit: number = 10): Promise<any[]> {
    const result = await db.query(
      `SELECT t.*, COUNT(ct1.content_id) as related_count
       FROM tags t
       JOIN content_tags ct1 ON t.id = ct1.tag_id
       JOIN content_tags ct2 ON ct1.content_id = ct2.content_id AND ct2.tag_id = $1
       WHERE t.id != $1
       GROUP BY t.id
       ORDER BY related_count DESC
       LIMIT $2`,
      [tagId, limit]
    );
    
    return result.rows;
  }
}