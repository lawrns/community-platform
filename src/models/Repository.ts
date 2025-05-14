/**
 * Repository Class
 * Base class for database access with support for both PostgreSQL and Supabase
 */

import db from '../config/database';
import { executeQuery, getById, getMany, create, update, remove, rawQuery } from '../utils/supabaseUtils';
import { supabase } from '../config/supabase';
import env, { config } from '../config/environment';

// Determine if we should use Supabase
const useSupabase = !!config.SUPABASE_URL && !!config.SUPABASE_ANON_KEY;

/**
 * Generic repository class for database operations
 */
export default abstract class Repository<T> {
  /**
   * Table name for the repository
   */
  protected abstract tableName: string;

  /**
   * Primary key column name
   */
  protected primaryKey: string = 'id';

  /**
   * Find entity by ID
   */
  async findById(id: number | string): Promise<T | null> {
    if (useSupabase) {
      const result = await getById<T>(this.tableName, id.toString());
      return result.data;
    } else {
      const result = await db.query(
        `SELECT * FROM ${this.tableName} WHERE ${this.primaryKey} = $1`,
        [id]
      );
      
      return result.rows.length ? result.rows[0] as T : null;
    }
  }

  /**
   * Find all entities
   */
  async findAll(limit: number = 100, offset: number = 0): Promise<T[]> {
    if (useSupabase) {
      const result = await getMany<T[]>(this.tableName, {
        limit,
        offset,
        orderBy: this.primaryKey,
        orderDirection: 'asc'
      });
      return result.data || [];
    } else {
      const result = await db.query(
        `SELECT * FROM ${this.tableName} ORDER BY ${this.primaryKey} LIMIT $1 OFFSET $2`,
        [limit, offset]
      );
      
      return result.rows as T[];
    }
  }

  /**
   * Find entities by a field value
   */
  async findBy(field: string, value: any): Promise<T[]> {
    if (useSupabase) {
      const result = await getMany<T[]>(this.tableName, {
        filters: { [field]: value }
      });
      return result.data || [];
    } else {
      const result = await db.query(
        `SELECT * FROM ${this.tableName} WHERE ${field} = $1`,
        [value]
      );
      
      return result.rows as T[];
    }
  }

  /**
   * Create a new entity
   */
  async create(data: Partial<T>): Promise<T> {
    if (useSupabase) {
      const result = await create<T>(this.tableName, data);
      if (!result.data) {
        throw new Error(`Failed to create ${this.tableName} record: ${result.error?.message}`);
      }
      return result.data;
    } else {
      const keys = Object.keys(data);
      const values = Object.values(data);
      
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
      const columnNames = keys.join(', ');
      
      const result = await db.query(
        `INSERT INTO ${this.tableName} (${columnNames}) 
         VALUES (${placeholders}) 
         RETURNING *`,
        values
      );
      
      return result.rows[0] as T;
    }
  }

  /**
   * Update an entity
   */
  async update(id: number | string, data: Partial<T>): Promise<T | null> {
    if (useSupabase) {
      const result = await update<T>(this.tableName, id.toString(), data);
      return result.data;
    } else {
      const keys = Object.keys(data);
      const values = Object.values(data);
      
      // Skip update if no data
      if (keys.length === 0) {
        return this.findById(id);
      }
      
      const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
      
      const result = await db.query(
        `UPDATE ${this.tableName} 
         SET ${setClause} 
         WHERE ${this.primaryKey} = $${keys.length + 1} 
         RETURNING *`,
        [...values, id]
      );
      
      return result.rows.length ? result.rows[0] as T : null;
    }
  }

  /**
   * Delete an entity
   */
  async delete(id: number | string): Promise<boolean> {
    if (useSupabase) {
      const result = await remove<T>(this.tableName, id.toString());
      return !result.error;
    } else {
      const result = await db.query(
        `DELETE FROM ${this.tableName} WHERE ${this.primaryKey} = $1 RETURNING *`,
        [id]
      );
      
      return result.rows.length > 0;
    }
  }

  /**
   * Count entities
   */
  async count(): Promise<number> {
    if (useSupabase) {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return data?.length || 0;
    } else {
      const result = await db.query(`SELECT COUNT(*) FROM ${this.tableName}`);
      return parseInt(result.rows[0].count);
    }
  }

  /**
   * Execute a custom query
   */
  async query(sql: string, params: any[] = []): Promise<any> {
    if (useSupabase) {
      const result = await rawQuery(sql, params);
      return result.data;
    } else {
      return db.query(sql, params);
    }
  }

  /**
   * Execute a query within a transaction
   */
  async transaction<R>(callback: (client: any) => Promise<R>): Promise<R> {
    return db.transaction(callback);
  }
}