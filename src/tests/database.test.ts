/**
 * Database Schema Tests
 * Tests the database schema, migrations, and seed data
 */

import db from '../config/database';
import { ContentType, ContentStatus, ToolStatus, BadgeLevel } from '../models';

describe('Database Schema', () => {
  // Connect to the database before all tests
  beforeAll(async () => {
    await db.initialize();
  });

  // Close the database connection after all tests
  afterAll(async () => {
    await db.close();
  });

  // Test users table
  test('Users table exists and has correct structure', async () => {
    const result = await db.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);
    
    expect(result.rows.length).toBeGreaterThan(0);
    
    // Check for required columns
    const columns = result.rows.map(row => row.column_name);
    ['id', 'email', 'username', 'name', 'reputation', 'email_verified', 'created_at', 'updated_at'].forEach(col => {
      expect(columns).toContain(col);
    });
  });

  // Test vector extension
  test('Vector extension is installed', async () => {
    const result = await db.query(`
      SELECT extname FROM pg_extension WHERE extname = 'vector'
    `);
    
    expect(result.rows.length).toBe(1);
    expect(result.rows[0].extname).toBe('vector');
  });

  // Test content table with vector columns
  test('Content table has vector column', async () => {
    const result = await db.query(`
      SELECT column_name, data_type, udt_name
      FROM information_schema.columns 
      WHERE table_name = 'content' AND column_name = 'body_vector'
    `);
    
    expect(result.rows.length).toBe(1);
    expect(result.rows[0].udt_name).toBe('vector');
  });

  // Test seed data
  test('Seed data is properly loaded', async () => {
    // Check users
    const users = await db.query('SELECT COUNT(*) FROM users');
    expect(parseInt(users.rows[0].count)).toBeGreaterThan(0);
    
    // Check topics
    const topics = await db.query('SELECT COUNT(*) FROM topics');
    expect(parseInt(topics.rows[0].count)).toBeGreaterThan(0);
    
    // Check tags
    const tags = await db.query('SELECT COUNT(*) FROM tags');
    expect(parseInt(tags.rows[0].count)).toBeGreaterThan(0);
    
    // Check content
    const content = await db.query('SELECT COUNT(*) FROM content');
    expect(parseInt(content.rows[0].count)).toBeGreaterThan(0);
    
    // Check tools
    const tools = await db.query('SELECT COUNT(*) FROM tools');
    expect(parseInt(tools.rows[0].count)).toBeGreaterThan(0);
  });

  // Test content types enum
  test('Content types are valid', async () => {
    const result = await db.query(`
      SELECT DISTINCT type FROM content
    `);
    
    const types = result.rows.map(row => row.type);
    
    // All types should be valid ContentType enum values
    types.forEach(type => {
      expect(Object.values(ContentType)).toContain(type);
    });
  });

  // Test relationships
  test('Foreign key relationships work correctly', async () => {
    // Test content -> author relationship
    const contentWithAuthor = await db.query(`
      SELECT c.id, c.title, u.username
      FROM content c
      JOIN users u ON c.author_id = u.id
      LIMIT 1
    `);
    
    expect(contentWithAuthor.rows.length).toBe(1);
    expect(contentWithAuthor.rows[0].username).toBeTruthy();
    
    // Test topic hierarchy
    const topicsWithParent = await db.query(`
      SELECT t1.name AS child, t2.name AS parent
      FROM topics t1
      JOIN topics t2 ON t1.parent_id = t2.id
      LIMIT 1
    `);
    
    expect(topicsWithParent.rows.length).toBe(1);
    expect(topicsWithParent.rows[0].child).toBeTruthy();
    expect(topicsWithParent.rows[0].parent).toBeTruthy();
  });

  // Test database functions
  test('Database functions exist', async () => {
    const result = await db.query(`
      SELECT proname 
      FROM pg_proc 
      WHERE proname IN ('update_timestamp', 'update_counter', 'update_user_reputation', 'handle_content_vote', 'accept_answer', 'user_has_privilege')
      ORDER BY proname
    `);
    
    const functionNames = result.rows.map(row => row.proname);
    
    // Check if all our functions exist
    ['update_timestamp', 'update_counter', 'update_user_reputation', 'handle_content_vote', 'accept_answer', 'user_has_privilege'].forEach(func => {
      expect(functionNames).toContain(func);
    });
  });

  // Test vector search capability
  test('Vector search capability works', async () => {
    // This is a basic test to ensure the syntax works
    // In a real scenario, we would need actual vector data
    const query = `
      SELECT 1
      FROM content
      WHERE body_vector IS NOT NULL
      LIMIT 1
    `;
    
    await expect(db.query(query)).resolves.not.toThrow();
  });
});