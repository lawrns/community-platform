/**
 * Initial Database Schema Migration
 */

/* eslint-disable camelcase */

// For more information on migrations:
// https://salsita.github.io/node-pg-migrate/#/migrations

exports.up = (pgm) => {
  // Create extension for vector search
  pgm.createExtension('vector', { ifNotExists: true });

  // Create users table
  pgm.createTable('users', {
    id: { type: 'serial', primaryKey: true },
    email: { type: 'varchar(255)', notNull: true, unique: true },
    username: { type: 'varchar(50)', notNull: true, unique: true },
    name: { type: 'varchar(255)', notNull: true },
    avatar_url: { type: 'text' },
    bio: { type: 'text' },
    reputation: { type: 'integer', notNull: true, default: 0 },
    email_verified: { type: 'boolean', notNull: true, default: false },
    auth_provider: { type: 'varchar(20)' },
    auth_provider_id: { type: 'varchar(255)' },
    password_hash: { type: 'varchar(255)' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') },
  });

  // Create topics table (hierarchical)
  pgm.createTable('topics', {
    id: { type: 'serial', primaryKey: true },
    name: { type: 'varchar(100)', notNull: true },
    slug: { type: 'varchar(100)', notNull: true, unique: true },
    description: { type: 'text' },
    parent_id: { type: 'integer', references: 'topics(id)', onDelete: 'SET NULL' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') },
  });

  // Create tags table
  pgm.createTable('tags', {
    id: { type: 'serial', primaryKey: true },
    name: { type: 'varchar(50)', notNull: true },
    slug: { type: 'varchar(50)', notNull: true, unique: true },
    description: { type: 'text' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') },
  });

  // Create content table
  pgm.createTable('content', {
    id: { type: 'serial', primaryKey: true },
    type: { 
      type: 'varchar(20)', 
      notNull: true, 
      comment: 'Type of content: post, question, answer, tutorial, comment' 
    },
    title: { type: 'varchar(255)' },
    body: { type: 'text', notNull: true },
    body_html: { type: 'text', notNull: true },
    body_vector: { type: 'vector(1536)', comment: 'Embedding vector for semantic search' },
    author_id: { 
      type: 'integer', 
      notNull: true, 
      references: 'users(id)', 
      onDelete: 'CASCADE' 
    },
    parent_id: { 
      type: 'integer', 
      references: 'content(id)', 
      onDelete: 'CASCADE',
      comment: 'For answers and comments, refers to parent question or post' 
    },
    is_accepted: { 
      type: 'boolean', 
      default: false,
      comment: 'For answers, indicates if it has been accepted' 
    },
    upvotes: { type: 'integer', notNull: true, default: 0 },
    downvotes: { type: 'integer', notNull: true, default: 0 },
    views: { type: 'integer', notNull: true, default: 0 },
    status: { 
      type: 'varchar(20)', 
      notNull: true, 
      default: 'published',
      comment: 'Status: draft, published, deleted, hidden' 
    },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') },
  });

  // Create content_versions table for version history
  pgm.createTable('content_versions', {
    id: { type: 'serial', primaryKey: true },
    content_id: { 
      type: 'integer', 
      notNull: true, 
      references: 'content(id)', 
      onDelete: 'CASCADE' 
    },
    version: { type: 'integer', notNull: true },
    title: { type: 'varchar(255)' },
    body: { type: 'text', notNull: true },
    body_html: { type: 'text', notNull: true },
    editor_id: { 
      type: 'integer', 
      notNull: true, 
      references: 'users(id)', 
      onDelete: 'SET NULL' 
    },
    edit_comment: { type: 'text' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') },
  });

  // Create content_tags junction table
  pgm.createTable('content_tags', {
    content_id: { 
      type: 'integer', 
      notNull: true, 
      references: 'content(id)', 
      onDelete: 'CASCADE' 
    },
    tag_id: { 
      type: 'integer', 
      notNull: true, 
      references: 'tags(id)', 
      onDelete: 'CASCADE' 
    },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') },
  });
  pgm.addConstraint('content_tags', 'content_tags_pkey', {
    primaryKey: ['content_id', 'tag_id'],
  });

  // Create content_topics junction table
  pgm.createTable('content_topics', {
    content_id: { 
      type: 'integer', 
      notNull: true, 
      references: 'content(id)', 
      onDelete: 'CASCADE' 
    },
    topic_id: { 
      type: 'integer', 
      notNull: true, 
      references: 'topics(id)', 
      onDelete: 'CASCADE' 
    },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') },
  });
  pgm.addConstraint('content_topics', 'content_topics_pkey', {
    primaryKey: ['content_id', 'topic_id'],
  });

  // Create tools table
  pgm.createTable('tools', {
    id: { type: 'serial', primaryKey: true },
    name: { type: 'varchar(100)', notNull: true },
    slug: { type: 'varchar(100)', notNull: true, unique: true },
    description: { type: 'text', notNull: true },
    description_vector: { type: 'vector(1536)', comment: 'Embedding vector for semantic search' },
    website_url: { type: 'text' },
    logo_url: { type: 'text' },
    pricing_info: { type: 'jsonb' },
    features: { type: 'jsonb' },
    is_verified: { type: 'boolean', notNull: true, default: false },
    vendor_id: { 
      type: 'integer', 
      references: 'users(id)', 
      onDelete: 'SET NULL',
      comment: 'User ID of verified vendor who manages this listing' 
    },
    upvotes: { type: 'integer', notNull: true, default: 0 },
    status: { 
      type: 'varchar(20)', 
      notNull: true, 
      default: 'active',
      comment: 'Status: active, pending, hidden, deleted' 
    },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') },
  });

  // Create tool_categories junction table
  pgm.createTable('tool_tags', {
    tool_id: { 
      type: 'integer', 
      notNull: true, 
      references: 'tools(id)', 
      onDelete: 'CASCADE' 
    },
    tag_id: { 
      type: 'integer', 
      notNull: true, 
      references: 'tags(id)', 
      onDelete: 'CASCADE' 
    },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') },
  });
  pgm.addConstraint('tool_tags', 'tool_tags_pkey', {
    primaryKey: ['tool_id', 'tag_id'],
  });

  // Create tool reviews table
  pgm.createTable('tool_reviews', {
    id: { type: 'serial', primaryKey: true },
    tool_id: { 
      type: 'integer', 
      notNull: true, 
      references: 'tools(id)', 
      onDelete: 'CASCADE' 
    },
    user_id: { 
      type: 'integer', 
      notNull: true, 
      references: 'users(id)', 
      onDelete: 'CASCADE' 
    },
    rating: { type: 'integer', notNull: true, check: 'rating >= 1 AND rating <= 5' },
    title: { type: 'varchar(255)' },
    content: { type: 'text', notNull: true },
    upvotes: { type: 'integer', notNull: true, default: 0 },
    status: { 
      type: 'varchar(20)', 
      notNull: true, 
      default: 'published',
      comment: 'Status: published, hidden, flagged' 
    },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') },
  });
  pgm.addConstraint('tool_reviews', 'one_review_per_user_per_tool', {
    unique: ['tool_id', 'user_id'],
  });

  // Create badges table
  pgm.createTable('badges', {
    id: { type: 'serial', primaryKey: true },
    name: { type: 'varchar(50)', notNull: true },
    description: { type: 'text', notNull: true },
    icon_url: { type: 'text' },
    level: { 
      type: 'varchar(20)', 
      notNull: true,
      comment: 'Level: bronze, silver, gold' 
    },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') },
  });

  // Create user_badges junction table
  pgm.createTable('user_badges', {
    user_id: { 
      type: 'integer', 
      notNull: true, 
      references: 'users(id)', 
      onDelete: 'CASCADE' 
    },
    badge_id: { 
      type: 'integer', 
      notNull: true, 
      references: 'badges(id)', 
      onDelete: 'CASCADE' 
    },
    awarded_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') },
  });
  pgm.addConstraint('user_badges', 'user_badges_pkey', {
    primaryKey: ['user_id', 'badge_id'],
  });

  // Create notifications table
  pgm.createTable('notifications', {
    id: { type: 'serial', primaryKey: true },
    user_id: { 
      type: 'integer', 
      notNull: true, 
      references: 'users(id)', 
      onDelete: 'CASCADE' 
    },
    type: { 
      type: 'varchar(50)', 
      notNull: true,
      comment: 'Type: upvote, comment, answer, mention, badge, etc.' 
    },
    content: { type: 'jsonb', notNull: true },
    is_read: { type: 'boolean', notNull: true, default: false },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') },
  });

  // Create notification_settings table
  pgm.createTable('user_settings', {
    user_id: { 
      type: 'integer', 
      notNull: true, 
      references: 'users(id)', 
      onDelete: 'CASCADE',
      primaryKey: true 
    },
    notification_preferences: { type: 'jsonb', notNull: true, default: '{}' },
    ui_preferences: { type: 'jsonb', notNull: true, default: '{}' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') },
  });

  // Create user_votes table for tracking user votes
  pgm.createTable('user_votes', {
    user_id: { 
      type: 'integer', 
      notNull: true, 
      references: 'users(id)', 
      onDelete: 'CASCADE' 
    },
    content_id: { 
      type: 'integer', 
      references: 'content(id)', 
      onDelete: 'CASCADE' 
    },
    tool_id: { 
      type: 'integer', 
      references: 'tools(id)', 
      onDelete: 'CASCADE' 
    },
    review_id: { 
      type: 'integer', 
      references: 'tool_reviews(id)', 
      onDelete: 'CASCADE' 
    },
    vote_type: { 
      type: 'smallint', 
      notNull: true,
      comment: '1 for upvote, -1 for downvote'  
    },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') },
  });
  pgm.addConstraint('user_votes', 'user_votes_target_check', {
    check: `(content_id IS NOT NULL AND tool_id IS NULL AND review_id IS NULL)
            OR (content_id IS NULL AND tool_id IS NOT NULL AND review_id IS NULL)
            OR (content_id IS NULL AND tool_id IS NULL AND review_id IS NOT NULL)`,
  });
  pgm.addConstraint('user_votes', 'user_content_vote_unique', {
    unique: ['user_id', 'content_id'],
    where: 'content_id IS NOT NULL',
  });
  pgm.addConstraint('user_votes', 'user_tool_vote_unique', {
    unique: ['user_id', 'tool_id'],
    where: 'tool_id IS NOT NULL',
  });
  pgm.addConstraint('user_votes', 'user_review_vote_unique', {
    unique: ['user_id', 'review_id'],
    where: 'review_id IS NOT NULL',
  });

  // Create reputation_history table for tracking reputation changes
  pgm.createTable('reputation_history', {
    id: { type: 'serial', primaryKey: true },
    user_id: { 
      type: 'integer', 
      notNull: true, 
      references: 'users(id)', 
      onDelete: 'CASCADE' 
    },
    change: { type: 'integer', notNull: true },
    reason: { 
      type: 'varchar(50)', 
      notNull: true,
      comment: 'Reason: upvote, downvote, accepted, bounty, etc.' 
    },
    content_id: { type: 'integer', references: 'content(id)', onDelete: 'SET NULL' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') },
  });

  // Create indexes for performance
  pgm.createIndex('content', 'body_vector', { method: 'ivfflat' });
  pgm.createIndex('tools', 'description_vector', { method: 'ivfflat' });
  pgm.createIndex('content', ['type', 'status']);
  pgm.createIndex('content', ['author_id']);
  pgm.createIndex('content', ['parent_id']);
  pgm.createIndex('content_tags', ['tag_id']);
  pgm.createIndex('content_topics', ['topic_id']);
  pgm.createIndex('topics', ['parent_id']);
  pgm.createIndex('tool_reviews', ['tool_id']);
  pgm.createIndex('notifications', ['user_id', 'is_read']);
  pgm.createIndex('reputation_history', ['user_id']);
};

exports.down = (pgm) => {
  // Drop tables in reverse order to avoid foreign key constraints
  pgm.dropTable('reputation_history');
  pgm.dropTable('user_votes');
  pgm.dropTable('user_settings');
  pgm.dropTable('notifications');
  pgm.dropTable('user_badges');
  pgm.dropTable('badges');
  pgm.dropTable('tool_reviews');
  pgm.dropTable('tool_tags');
  pgm.dropTable('tools');
  pgm.dropTable('content_topics');
  pgm.dropTable('content_tags');
  pgm.dropTable('content_versions');
  pgm.dropTable('content');
  pgm.dropTable('tags');
  pgm.dropTable('topics');
  pgm.dropTable('users');
  
  // Drop the vector extension
  pgm.dropExtension('vector');
};