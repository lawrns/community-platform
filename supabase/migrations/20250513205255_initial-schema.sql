-- Initial Database Schema Migration

-- Create extension for vector search
CREATE EXTENSION IF NOT EXISTS vector;

-- Create users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  username VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  reputation INTEGER NOT NULL DEFAULT 0,
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  auth_provider VARCHAR(20),
  auth_provider_id VARCHAR(255),
  password_hash VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create topics table (hierarchical)
CREATE TABLE topics (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  parent_id INTEGER REFERENCES topics(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create tags table
CREATE TABLE tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  slug VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create content table
CREATE TABLE content (
  id SERIAL PRIMARY KEY,
  type VARCHAR(20) NOT NULL, -- Type of content: post, question, answer, tutorial, comment
  title VARCHAR(255),
  body TEXT NOT NULL,
  body_html TEXT NOT NULL,
  body_vector VECTOR(1536), -- Embedding vector for semantic search
  author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_id INTEGER REFERENCES content(id) ON DELETE CASCADE, -- For answers and comments, refers to parent question or post
  is_accepted BOOLEAN DEFAULT FALSE, -- For answers, indicates if it has been accepted
  upvotes INTEGER NOT NULL DEFAULT 0,
  downvotes INTEGER NOT NULL DEFAULT 0,
  views INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'published', -- Status: draft, published, deleted, hidden
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create content_versions table for version history
CREATE TABLE content_versions (
  id SERIAL PRIMARY KEY,
  content_id INTEGER NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  title VARCHAR(255),
  body TEXT NOT NULL,
  body_html TEXT NOT NULL,
  editor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  edit_comment TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create content_tags junction table
CREATE TABLE content_tags (
  content_id INTEGER NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (content_id, tag_id)
);

-- Create content_topics junction table
CREATE TABLE content_topics (
  content_id INTEGER NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  topic_id INTEGER NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (content_id, topic_id)
);

-- Create tools table
CREATE TABLE tools (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  description_vector VECTOR(1536), -- Embedding vector for semantic search
  website_url TEXT,
  logo_url TEXT,
  pricing_info JSONB,
  features JSONB,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  vendor_id INTEGER REFERENCES users(id) ON DELETE SET NULL, -- User ID of verified vendor who manages this listing
  upvotes INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'active', -- Status: active, pending, hidden, deleted
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create tool_tags junction table
CREATE TABLE tool_tags (
  tool_id INTEGER NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tool_id, tag_id)
);

-- Create tool reviews table
CREATE TABLE tool_reviews (
  id SERIAL PRIMARY KEY,
  tool_id INTEGER NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  content TEXT NOT NULL,
  upvotes INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'published', -- Status: published, hidden, flagged
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT one_review_per_user_per_tool UNIQUE (tool_id, user_id)
);

-- Create badges table
CREATE TABLE badges (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  icon_url TEXT,
  level VARCHAR(20) NOT NULL, -- Level: bronze, silver, gold
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create user_badges junction table
CREATE TABLE user_badges (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id INTEGER NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  awarded_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, badge_id)
);

-- Create notifications table
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- Type: upvote, comment, answer, mention, badge, etc.
  content JSONB NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create user_settings table
CREATE TABLE user_settings (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE PRIMARY KEY,
  notification_preferences JSONB NOT NULL DEFAULT '{}',
  ui_preferences JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create user_votes table for tracking user votes
CREATE TABLE user_votes (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_id INTEGER REFERENCES content(id) ON DELETE CASCADE,
  tool_id INTEGER REFERENCES tools(id) ON DELETE CASCADE,
  review_id INTEGER REFERENCES tool_reviews(id) ON DELETE CASCADE,
  vote_type SMALLINT NOT NULL, -- 1 for upvote, -1 for downvote
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT user_votes_target_check CHECK (
    (content_id IS NOT NULL AND tool_id IS NULL AND review_id IS NULL) OR
    (content_id IS NULL AND tool_id IS NOT NULL AND review_id IS NULL) OR
    (content_id IS NULL AND tool_id IS NULL AND review_id IS NOT NULL)
  ),
  CONSTRAINT user_content_vote_unique UNIQUE (user_id, content_id) DEFERRABLE INITIALLY DEFERRED,
  CONSTRAINT user_tool_vote_unique UNIQUE (user_id, tool_id) DEFERRABLE INITIALLY DEFERRED,
  CONSTRAINT user_review_vote_unique UNIQUE (user_id, review_id) DEFERRABLE INITIALLY DEFERRED
);

-- Create reputation_history table for tracking reputation changes
CREATE TABLE reputation_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  change INTEGER NOT NULL,
  reason VARCHAR(50) NOT NULL, -- Reason: upvote, downvote, accepted, bounty, etc.
  content_id INTEGER REFERENCES content(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create _metadata table for application specific metadata
CREATE TABLE _metadata (
  id SERIAL PRIMARY KEY,
  version VARCHAR(50) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Insert initial version
INSERT INTO _metadata (version) VALUES ('1.0.0');

-- Create required stored procedures

-- Update user reputation function
CREATE OR REPLACE FUNCTION update_user_reputation(
  p_user_id INTEGER,
  p_change INTEGER,
  p_reason VARCHAR(50),
  p_content_id INTEGER DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  -- Update user reputation
  UPDATE users
  SET reputation = reputation + p_change
  WHERE id = p_user_id;
  
  -- Insert reputation history record
  INSERT INTO reputation_history (user_id, change, reason, content_id)
  VALUES (p_user_id, p_change, p_reason, p_content_id);
END;
$$ LANGUAGE plpgsql;

-- Create function to check if user has a privilege based on reputation
CREATE OR REPLACE FUNCTION user_has_privilege(
  p_user_id INTEGER,
  p_privilege VARCHAR(50)
) RETURNS BOOLEAN AS $$
DECLARE
  v_reputation INTEGER;
  v_required_reputation INTEGER;
BEGIN
  -- Get user's reputation
  SELECT reputation INTO v_reputation
  FROM users
  WHERE id = p_user_id;
  
  -- Set required reputation based on privilege
  CASE p_privilege
    WHEN 'create_post' THEN v_required_reputation := 0;
    WHEN 'comment' THEN v_required_reputation := 0;
    WHEN 'upvote' THEN v_required_reputation := 15;
    WHEN 'downvote' THEN v_required_reputation := 50;
    WHEN 'create_tag' THEN v_required_reputation := 100;
    WHEN 'edit_others' THEN v_required_reputation := 200;
    WHEN 'close_question' THEN v_required_reputation := 500;
    WHEN 'delete_others' THEN v_required_reputation := 1000;
    WHEN 'moderator' THEN v_required_reputation := 5000;
    ELSE v_required_reputation := 999999; -- Default for unknown privileges
  END CASE;
  
  -- Check if user has enough reputation
  RETURN v_reputation >= v_required_reputation;
END;
$$ LANGUAGE plpgsql;

-- Create function to get user statistics
CREATE OR REPLACE FUNCTION get_user_stats(
  p_user_id INTEGER
) RETURNS json AS $$
DECLARE
  v_question_count INTEGER;
  v_answer_count INTEGER;
  v_post_count INTEGER;
  v_accepted_answers INTEGER;
  v_review_count INTEGER;
  v_badge_count INTEGER;
BEGIN
  -- Count questions
  SELECT COUNT(*) INTO v_question_count
  FROM content
  WHERE author_id = p_user_id AND type = 'question';
  
  -- Count answers
  SELECT COUNT(*) INTO v_answer_count
  FROM content
  WHERE author_id = p_user_id AND type = 'answer';
  
  -- Count posts
  SELECT COUNT(*) INTO v_post_count
  FROM content
  WHERE author_id = p_user_id AND type = 'post';
  
  -- Count accepted answers
  SELECT COUNT(*) INTO v_accepted_answers
  FROM content
  WHERE author_id = p_user_id AND type = 'answer' AND is_accepted = true;
  
  -- Count tool reviews
  SELECT COUNT(*) INTO v_review_count
  FROM tool_reviews
  WHERE user_id = p_user_id;
  
  -- Count badges
  SELECT COUNT(*) INTO v_badge_count
  FROM user_badges
  WHERE user_id = p_user_id;
  
  -- Return JSON with all stats
  RETURN json_build_object(
    'question_count', v_question_count,
    'answer_count', v_answer_count,
    'post_count', v_post_count,
    'accepted_answers', v_accepted_answers,
    'review_count', v_review_count,
    'badge_count', v_badge_count
  );
END;
$$ LANGUAGE plpgsql;

-- Create RLS policies
-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reputation_history ENABLE ROW LEVEL SECURITY;

-- Create security policies for public data (anyone can read)
CREATE POLICY public_read_policy ON topics FOR SELECT USING (true);
CREATE POLICY public_read_policy ON tags FOR SELECT USING (true);
CREATE POLICY public_read_policy ON content FOR SELECT USING (status = 'published');
CREATE POLICY public_read_policy ON tools FOR SELECT USING (status = 'active');
CREATE POLICY public_read_policy ON tool_reviews FOR SELECT USING (status = 'published');
CREATE POLICY public_read_policy ON badges FOR SELECT USING (true);

-- Create security policies for user data (users can only see/edit their own data)
CREATE POLICY users_select_policy ON users FOR SELECT USING (true);
CREATE POLICY users_update_policy ON users FOR UPDATE USING (auth.uid()::text = auth_provider_id);
CREATE POLICY notifications_select_policy ON notifications FOR SELECT USING (auth.uid()::text = (SELECT auth_provider_id FROM users WHERE id = user_id));
CREATE POLICY user_settings_select_policy ON user_settings FOR SELECT USING (auth.uid()::text = (SELECT auth_provider_id FROM users WHERE id = user_id));
CREATE POLICY user_settings_update_policy ON user_settings FOR UPDATE USING (auth.uid()::text = (SELECT auth_provider_id FROM users WHERE id = user_id));
CREATE POLICY user_votes_select_policy ON user_votes FOR SELECT USING (auth.uid()::text = (SELECT auth_provider_id FROM users WHERE id = user_id));
CREATE POLICY reputation_history_select_policy ON reputation_history FOR SELECT USING (auth.uid()::text = (SELECT auth_provider_id FROM users WHERE id = user_id));

-- Create indices for performance
CREATE INDEX idx_content_body_vector ON content USING ivfflat (body_vector vector_l2_ops);
CREATE INDEX idx_tools_description_vector ON tools USING ivfflat (description_vector vector_l2_ops);
CREATE INDEX idx_content_type_status ON content(type, status);
CREATE INDEX idx_content_author_id ON content(author_id);
CREATE INDEX idx_content_parent_id ON content(parent_id);
CREATE INDEX idx_content_tags_tag_id ON content_tags(tag_id);
CREATE INDEX idx_content_topics_topic_id ON content_topics(topic_id);
CREATE INDEX idx_topics_parent_id ON topics(parent_id);
CREATE INDEX idx_tool_reviews_tool_id ON tool_reviews(tool_id);
CREATE INDEX idx_notifications_user_id_is_read ON notifications(user_id, is_read);
CREATE INDEX idx_reputation_history_user_id ON reputation_history(user_id);