-- Migration to support recommendation system and user interactions tracking

-- Create user_content_views table to track content views
CREATE TABLE user_content_views (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_id INTEGER NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  view_count INTEGER NOT NULL DEFAULT 1,
  viewed_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, content_id)
);

-- Create user follows for topics
CREATE TABLE user_topic_follows (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic_id INTEGER NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, topic_id)
);

-- Create user follows for tags
CREATE TABLE user_tag_follows (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, tag_id)
);

-- Create user follows for other users
CREATE TABLE user_follows (
  follower_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  followed_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (follower_id, followed_id),
  CHECK (follower_id != followed_id) -- Prevent self-follows
);

-- Create user interests table for onboarding preferences
CREATE TABLE user_interests (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  interest_type VARCHAR(20) NOT NULL, -- 'tag', 'topic', 'tool_category'
  interest_id INTEGER NOT NULL,
  strength NUMERIC(3,2) NOT NULL DEFAULT 1.0, -- Interest weight from 0.0-1.0
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, interest_type, interest_id)
);

-- Create user embeddings table for semantic recommendations
CREATE TABLE user_embeddings (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE PRIMARY KEY,
  interest_vector VECTOR(1536), -- Same dimensionality as content embeddings
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Update user_settings table with feed personalization options
ALTER TABLE user_settings ADD COLUMN feed_preferences JSONB NOT NULL DEFAULT '{
  "showTrending": true,
  "showFollowing": true,
  "contentTypes": ["question", "post", "tutorial"],
  "hideViewed": false,
  "freshContentRatio": 0.3
}';

-- Create functions for interaction tracking

-- Function to record content view
CREATE OR REPLACE FUNCTION record_content_view(
  p_user_id INTEGER,
  p_content_id INTEGER
) RETURNS VOID AS $$
BEGIN
  INSERT INTO user_content_views (user_id, content_id, viewed_at)
  VALUES (p_user_id, p_content_id, NOW())
  ON CONFLICT (user_id, content_id) 
  DO UPDATE SET 
    viewed_at = NOW(),
    view_count = user_content_views.view_count + 1;
END;
$$ LANGUAGE plpgsql;

-- Function to follow a topic
CREATE OR REPLACE FUNCTION follow_topic(
  p_user_id INTEGER,
  p_topic_id INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  SELECT EXISTS(SELECT 1 FROM topics WHERE id = p_topic_id) INTO v_exists;
  IF NOT v_exists THEN
    RETURN FALSE;
  END IF;
  
  INSERT INTO user_topic_follows (user_id, topic_id)
  VALUES (p_user_id, p_topic_id)
  ON CONFLICT (user_id, topic_id) DO NOTHING;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to unfollow a topic
CREATE OR REPLACE FUNCTION unfollow_topic(
  p_user_id INTEGER,
  p_topic_id INTEGER
) RETURNS BOOLEAN AS $$
BEGIN
  DELETE FROM user_topic_follows 
  WHERE user_id = p_user_id AND topic_id = p_topic_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to follow a tag
CREATE OR REPLACE FUNCTION follow_tag(
  p_user_id INTEGER,
  p_tag_id INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  SELECT EXISTS(SELECT 1 FROM tags WHERE id = p_tag_id) INTO v_exists;
  IF NOT v_exists THEN
    RETURN FALSE;
  END IF;
  
  INSERT INTO user_tag_follows (user_id, tag_id)
  VALUES (p_user_id, p_tag_id)
  ON CONFLICT (user_id, tag_id) DO NOTHING;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to unfollow a tag
CREATE OR REPLACE FUNCTION unfollow_tag(
  p_user_id INTEGER,
  p_tag_id INTEGER
) RETURNS BOOLEAN AS $$
BEGIN
  DELETE FROM user_tag_follows 
  WHERE user_id = p_user_id AND tag_id = p_tag_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to follow a user
CREATE OR REPLACE FUNCTION follow_user(
  p_follower_id INTEGER,
  p_followed_id INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  IF p_follower_id = p_followed_id THEN
    RETURN FALSE; -- Cannot follow yourself
  END IF;
  
  SELECT EXISTS(SELECT 1 FROM users WHERE id = p_followed_id) INTO v_exists;
  IF NOT v_exists THEN
    RETURN FALSE;
  END IF;
  
  INSERT INTO user_follows (follower_id, followed_id)
  VALUES (p_follower_id, p_followed_id)
  ON CONFLICT (follower_id, followed_id) DO NOTHING;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to unfollow a user
CREATE OR REPLACE FUNCTION unfollow_user(
  p_follower_id INTEGER,
  p_followed_id INTEGER
) RETURNS BOOLEAN AS $$
BEGIN
  DELETE FROM user_follows 
  WHERE follower_id = p_follower_id AND followed_id = p_followed_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Create indices for performance
CREATE INDEX idx_user_content_views_user_id ON user_content_views(user_id);
CREATE INDEX idx_user_content_views_content_id ON user_content_views(content_id);
CREATE INDEX idx_user_topic_follows_user_id ON user_topic_follows(user_id);
CREATE INDEX idx_user_topic_follows_topic_id ON user_topic_follows(topic_id);
CREATE INDEX idx_user_tag_follows_user_id ON user_tag_follows(user_id);
CREATE INDEX idx_user_tag_follows_tag_id ON user_tag_follows(tag_id);
CREATE INDEX idx_user_follows_follower_id ON user_follows(follower_id);
CREATE INDEX idx_user_follows_followed_id ON user_follows(followed_id);
CREATE INDEX idx_user_interests_user_id ON user_interests(user_id);
CREATE INDEX idx_user_interests_type_id ON user_interests(interest_type, interest_id);

-- Add RLS policies for security
ALTER TABLE user_content_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_topic_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tag_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_embeddings ENABLE ROW LEVEL SECURITY;

-- Create read policies
CREATE POLICY select_own_views ON user_content_views FOR SELECT USING (auth.uid()::text = (SELECT auth_provider_id FROM users WHERE id = user_id));
CREATE POLICY select_own_topic_follows ON user_topic_follows FOR SELECT USING (auth.uid()::text = (SELECT auth_provider_id FROM users WHERE id = user_id));
CREATE POLICY select_topic_follows_count ON user_topic_follows FOR SELECT USING (true); -- Allow counting follows
CREATE POLICY select_own_tag_follows ON user_tag_follows FOR SELECT USING (auth.uid()::text = (SELECT auth_provider_id FROM users WHERE id = user_id));
CREATE POLICY select_tag_follows_count ON user_tag_follows FOR SELECT USING (true); -- Allow counting follows
CREATE POLICY select_own_follows ON user_follows FOR SELECT USING (auth.uid()::text = (SELECT auth_provider_id FROM users WHERE id = follower_id));
CREATE POLICY select_followers ON user_follows FOR SELECT USING (true); -- Allow seeing who follows whom
CREATE POLICY select_own_interests ON user_interests FOR SELECT USING (auth.uid()::text = (SELECT auth_provider_id FROM users WHERE id = user_id));
CREATE POLICY select_own_embeddings ON user_embeddings FOR SELECT USING (auth.uid()::text = (SELECT auth_provider_id FROM users WHERE id = user_id));