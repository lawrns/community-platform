/**
 * Migration: Create moderation-related tables
 * - flags: User reports of content, users, tools, etc.
 * - moderation_actions: Actions taken by moderators or AI
 * - moderation_audit_log: Immutable log of all moderation-related changes
 * - appeals: User appeals of moderation actions
 * - spam_checks: Log of AI spam detection checks
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
    
    // Create flags table
    await client.query(`
      CREATE TABLE IF NOT EXISTS flags (
        id SERIAL PRIMARY KEY,
        type VARCHAR(20) NOT NULL CHECK (type IN ('content', 'tool', 'review', 'comment', 'user')),
        reason VARCHAR(50) NOT NULL CHECK (
          reason IN ('spam', 'harassment', 'violence', 'hate_speech', 'misinformation', 'copyright', 'adult_content', 'other')
        ),
        description TEXT,
        content_id INTEGER REFERENCES content(id) ON DELETE CASCADE,
        tool_id INTEGER REFERENCES tools(id) ON DELETE CASCADE,
        review_id INTEGER REFERENCES tool_reviews(id) ON DELETE CASCADE,
        comment_id INTEGER,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        reporter_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (
          status IN ('pending', 'approved', 'rejected', 'appealed')
        ),
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        CONSTRAINT flags_entity_constraint CHECK (
          (type = 'content' AND content_id IS NOT NULL) OR
          (type = 'tool' AND tool_id IS NOT NULL) OR
          (type = 'review' AND review_id IS NOT NULL) OR
          (type = 'comment' AND comment_id IS NOT NULL) OR
          (type = 'user' AND user_id IS NOT NULL)
        )
      )
    `);
    
    // Create moderation_actions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS moderation_actions (
        id SERIAL PRIMARY KEY,
        action_type VARCHAR(20) NOT NULL CHECK (
          action_type IN ('hide', 'unhide', 'delete', 'undelete', 'warn', 'suspend', 'unsuspend')
        ),
        moderator_id INTEGER NOT NULL REFERENCES users(id),
        content_id INTEGER REFERENCES content(id) ON DELETE CASCADE,
        tool_id INTEGER REFERENCES tools(id) ON DELETE CASCADE,
        review_id INTEGER REFERENCES tool_reviews(id) ON DELETE CASCADE,
        comment_id INTEGER,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        flag_id INTEGER REFERENCES flags(id) ON DELETE SET NULL,
        reason TEXT,
        status VARCHAR(20) NOT NULL DEFAULT 'completed' CHECK (
          status IN ('pending', 'completed', 'reverted')
        ),
        ai_detected BOOLEAN NOT NULL DEFAULT FALSE,
        ai_score FLOAT,
        ai_reason TEXT,
        metadata JSONB,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        reverted_at TIMESTAMP,
        reverted_by_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        CONSTRAINT moderation_actions_entity_constraint CHECK (
          (content_id IS NOT NULL) OR
          (tool_id IS NOT NULL) OR
          (review_id IS NOT NULL) OR
          (comment_id IS NOT NULL) OR
          (user_id IS NOT NULL)
        )
      )
    `);
    
    // Create moderation_audit_log table (immutable)
    await client.query(`
      CREATE TABLE IF NOT EXISTS moderation_audit_log (
        id SERIAL PRIMARY KEY,
        action_id INTEGER NOT NULL REFERENCES moderation_actions(id) ON DELETE CASCADE,
        actor_id INTEGER NOT NULL REFERENCES users(id),
        action VARCHAR(50) NOT NULL,
        details JSONB,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    
    // Create appeals table
    await client.query(`
      CREATE TABLE IF NOT EXISTS appeals (
        id SERIAL PRIMARY KEY,
        moderation_action_id INTEGER NOT NULL REFERENCES moderation_actions(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        reason TEXT NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (
          status IN ('pending', 'approved', 'rejected')
        ),
        moderator_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        moderator_notes TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        resolved_at TIMESTAMP
      )
    `);
    
    // Create spam_checks table
    await client.query(`
      CREATE TABLE IF NOT EXISTS spam_checks (
        id SERIAL PRIMARY KEY,
        type VARCHAR(20) NOT NULL,
        content TEXT NOT NULL,
        score FLOAT NOT NULL,
        is_spam BOOLEAN NOT NULL,
        reason TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    
    // Add indexes
    await client.query('CREATE INDEX flags_reporter_id_idx ON flags(reporter_id)');
    await client.query('CREATE INDEX flags_status_idx ON flags(status)');
    await client.query('CREATE INDEX flags_type_idx ON flags(type)');
    await client.query('CREATE INDEX moderation_actions_moderator_id_idx ON moderation_actions(moderator_id)');
    await client.query('CREATE INDEX moderation_actions_status_idx ON moderation_actions(status)');
    await client.query('CREATE INDEX appeals_user_id_idx ON appeals(user_id)');
    await client.query('CREATE INDEX appeals_status_idx ON appeals(status)');
    await client.query('CREATE INDEX spam_checks_is_spam_idx ON spam_checks(is_spam)');
    
    // Add composite indexes for entity lookups
    await client.query('CREATE INDEX flags_content_id_idx ON flags(content_id) WHERE content_id IS NOT NULL');
    await client.query('CREATE INDEX flags_tool_id_idx ON flags(tool_id) WHERE tool_id IS NOT NULL');
    await client.query('CREATE INDEX flags_user_id_idx ON flags(user_id) WHERE user_id IS NOT NULL');
    await client.query('CREATE INDEX moderation_actions_content_id_idx ON moderation_actions(content_id) WHERE content_id IS NOT NULL');
    await client.query('CREATE INDEX moderation_actions_user_id_idx ON moderation_actions(user_id) WHERE user_id IS NOT NULL');
    
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
    
    // Drop tables in reverse order
    await client.query('DROP TABLE IF EXISTS spam_checks');
    await client.query('DROP TABLE IF EXISTS appeals');
    await client.query('DROP TABLE IF EXISTS moderation_audit_log');
    await client.query('DROP TABLE IF EXISTS moderation_actions');
    await client.query('DROP TABLE IF EXISTS flags');
    
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