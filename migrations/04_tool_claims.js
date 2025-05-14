/**
 * Migration: Add tool claims table for vendor claiming workflow
 */

const { Client } = require('pg');
require('dotenv').config();

// Database connection configuration
const config = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'communityv2',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres'
};

async function up() {
  const client = new Client(config);
  await client.connect();
  
  try {
    // Begin transaction
    await client.query('BEGIN');
    
    // Create tool_claims table
    await client.query(`
      CREATE TABLE IF NOT EXISTS tool_claims (
        id SERIAL PRIMARY KEY,
        tool_id INTEGER NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
        proof TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        UNIQUE(tool_id, user_id)
      )
    `);
    
    // Add indexes
    await client.query('CREATE INDEX tool_claims_tool_id_idx ON tool_claims(tool_id)');
    await client.query('CREATE INDEX tool_claims_user_id_idx ON tool_claims(user_id)');
    await client.query('CREATE INDEX tool_claims_status_idx ON tool_claims(status)');
    
    // Commit transaction
    await client.query('COMMIT');
    
    console.log('Migration successfully applied');
  } catch (error) {
    // Rollback on error
    await client.query('ROLLBACK');
    console.error('Error applying migration:', error);
    throw error;
  } finally {
    await client.end();
  }
}

async function down() {
  const client = new Client(config);
  await client.connect();
  
  try {
    // Begin transaction
    await client.query('BEGIN');
    
    // Drop tool_claims table
    await client.query('DROP TABLE IF EXISTS tool_claims');
    
    // Commit transaction
    await client.query('COMMIT');
    
    console.log('Migration successfully reverted');
  } catch (error) {
    // Rollback on error
    await client.query('ROLLBACK');
    console.error('Error reverting migration:', error);
    throw error;
  } finally {
    await client.end();
  }
}

module.exports = { up, down };

// Execute directly when run as a script
if (require.main === module) {
  if (process.argv[2] === 'down') {
    down()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  } else {
    up()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  }
}