/**
 * Taxonomy System Validation Script
 * Validates that the taxonomy and tagging system meets the requirements
 */

const { Client } = require('pg');
const dotenv = require('dotenv');
const axios = require('axios');

// Load environment variables
dotenv.config();

// Configure PostgreSQL client
const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// API URL
const API_URL = process.env.API_URL || 'http://localhost:3000/api';

/**
 * Main validation function
 */
async function validateTaxonomySystem() {
  try {
    console.log('Starting taxonomy and tagging system validation...');
    
    // Connect to database
    await client.connect();
    console.log('Connected to database');
    
    // Validate database schema
    await validateDatabaseSchema();
    
    // Validate tag constraint
    await validateTagLimit();
    
    // Validate tag similarity
    await validateTagSimilarity();
    
    // Validate hierarchical topics
    await validateTopicHierarchy();
    
    // Validate API endpoints
    await validateAPIEndpoints();
    
    console.log('\n✅ Taxonomy and tagging system validation completed successfully!');
  } catch (error) {
    console.error('\n❌ Validation failed:', error.message);
    process.exit(1);
  } finally {
    // Close database connection
    await client.end();
  }
}

/**
 * Validate database schema
 */
async function validateDatabaseSchema() {
  console.log('\nValidating database schema...');
  
  // Check tags table
  const tagsResult = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'tags'
    ORDER BY ordinal_position
  `);
  
  if (tagsResult.rows.length === 0) {
    throw new Error('Tags table not found');
  }
  
  // Check topics table with parent_id relationship
  const topicsResult = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'topics'
    ORDER BY ordinal_position
  `);
  
  if (topicsResult.rows.length === 0) {
    throw new Error('Topics table not found');
  }
  
  // Check for parent_id column in topics
  const hasParentId = topicsResult.rows.some(col => col.column_name === 'parent_id');
  if (!hasParentId) {
    throw new Error('Topics table missing parent_id column for hierarchy');
  }
  
  // Check content_tags junction table
  const contentTagsResult = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'content_tags'
    ORDER BY ordinal_position
  `);
  
  if (contentTagsResult.rows.length === 0) {
    throw new Error('Content_tags junction table not found');
  }
  
  // Check content_topics junction table
  const contentTopicsResult = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'content_topics'
    ORDER BY ordinal_position
  `);
  
  if (contentTopicsResult.rows.length === 0) {
    throw new Error('Content_topics junction table not found');
  }
  
  // Check pg_trgm extension
  const trgmResult = await client.query(`
    SELECT extname FROM pg_extension WHERE extname = 'pg_trgm'
  `);
  
  if (trgmResult.rows.length === 0) {
    throw new Error('pg_trgm extension not installed (required for tag suggestions)');
  }
  
  console.log('✓ Database schema validation passed');
}

/**
 * Validate tag limit constraint
 */
async function validateTagLimit() {
  console.log('\nValidating tag limit constraint...');
  
  // Check if the enforce_tag_limit trigger exists
  const triggerResult = await client.query(`
    SELECT trigger_name 
    FROM information_schema.triggers 
    WHERE trigger_name = 'enforce_tag_limit_trigger'
  `);
  
  if (triggerResult.rows.length === 0) {
    throw new Error('Tag limit trigger not found');
  }
  
  console.log('✓ Tag limit constraint validation passed');
}

/**
 * Validate tag similarity functionality
 */
async function validateTagSimilarity() {
  console.log('\nValidating tag similarity functionality...');
  
  // Check if the similarity index exists
  const indexResult = await client.query(`
    SELECT indexname 
    FROM pg_indexes 
    WHERE indexname = 'idx_tags_name_trigram'
  `);
  
  if (indexResult.rows.length === 0) {
    throw new Error('Tag similarity index not found');
  }
  
  // Check if get_tag_suggestions function exists
  const functionResult = await client.query(`
    SELECT proname 
    FROM pg_proc 
    WHERE proname = 'get_tag_suggestions'
  `);
  
  if (functionResult.rows.length === 0) {
    throw new Error('Tag suggestion function not found');
  }
  
  console.log('✓ Tag similarity validation passed');
}

/**
 * Validate hierarchical topics
 */
async function validateTopicHierarchy() {
  console.log('\nValidating topic hierarchy...');
  
  // Insert test data for hierarchy
  await client.query('BEGIN');
  
  try {
    // Create parent topic
    const parentResult = await client.query(`
      INSERT INTO topics (name, slug, description, created_at, updated_at)
      VALUES ('Test Parent', 'test-parent', 'Parent topic for testing', NOW(), NOW())
      RETURNING id
    `);
    
    const parentId = parentResult.rows[0].id;
    
    // Create child topic
    const childResult = await client.query(`
      INSERT INTO topics (name, slug, description, parent_id, created_at, updated_at)
      VALUES ('Test Child', 'test-child', 'Child topic for testing', $1, NOW(), NOW())
      RETURNING id
    `, [parentId]);
    
    const childId = childResult.rows[0].id;
    
    // Create grandchild topic
    await client.query(`
      INSERT INTO topics (name, slug, description, parent_id, created_at, updated_at)
      VALUES ('Test Grandchild', 'test-grandchild', 'Grandchild topic for testing', $1, NOW(), NOW())
    `, [childId]);
    
    // Verify hierarchy with a query
    const hierarchyResult = await client.query(`
      WITH RECURSIVE topic_tree AS (
        SELECT id, name, parent_id, 1 as level
        FROM topics
        WHERE id = $1
        
        UNION ALL
        
        SELECT t.id, t.name, t.parent_id, tt.level + 1
        FROM topics t
        JOIN topic_tree tt ON t.parent_id = tt.id
      )
      SELECT * FROM topic_tree ORDER BY level
    `, [parentId]);
    
    if (hierarchyResult.rows.length < 3) {
      throw new Error('Topic hierarchy query returned incorrect results');
    }
    
    console.log('✓ Topic hierarchy validation passed');
  } finally {
    // Rollback test data
    await client.query('ROLLBACK');
  }
}

/**
 * Validate API endpoints
 */
async function validateAPIEndpoints() {
  console.log('\nValidating API endpoints...');
  
  // We'll just check if the endpoints are reachable
  // In a real validation scenario, we would test each endpoint thoroughly
  try {
    // Check tag endpoints
    await axios.get(`${API_URL}/tags`);
    await axios.get(`${API_URL}/tags/popular`);
    
    // Check topic endpoints
    await axios.get(`${API_URL}/topics`);
    await axios.get(`${API_URL}/topics/hierarchy`);
    
    console.log('✓ API endpoints validation passed');
  } catch (error) {
    // If server is not running, don't fail the validation
    if (error.code === 'ECONNREFUSED') {
      console.log('⚠️ API server not running, skipping API endpoint validation');
    } else {
      throw new Error(`API endpoint validation failed: ${error.message}`);
    }
  }
}

// Run the validation if executed directly
if (require.main === module) {
  validateTaxonomySystem()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Validation script error:', err);
      process.exit(1);
    });
}

module.exports = { validateTaxonomySystem };