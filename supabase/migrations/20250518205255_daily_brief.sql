-- Migration for AI-Powered Daily Brief Feature
-- Creates tables and functions for storing and generating personalized daily content briefs

-- Daily Brief Table
CREATE TABLE IF NOT EXISTS daily_briefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE,
  expired_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '7 days'),
  metadata JSONB DEFAULT '{}'::JSONB,
  CONSTRAINT daily_briefs_one_per_day_per_user UNIQUE (user_id, DATE(generated_at))
);

-- Brief Items Table (for content included in the brief)
CREATE TABLE IF NOT EXISTS brief_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brief_id UUID NOT NULL REFERENCES daily_briefs(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL, -- 'tool', 'topic', 'discussion', etc.
  content_id UUID NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  relevance_score FLOAT NOT NULL,
  position INTEGER NOT NULL,
  metadata JSONB DEFAULT '{}'::JSONB
);

-- Brief Interactions Table
CREATE TABLE IF NOT EXISTS brief_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brief_id UUID NOT NULL REFERENCES daily_briefs(id) ON DELETE CASCADE,
  item_id UUID REFERENCES brief_items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL, -- 'view', 'click', 'save', 'share', 'dismiss'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'::JSONB
);

-- User Brief Preferences
CREATE TABLE IF NOT EXISTS user_brief_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT true,
  frequency TEXT DEFAULT 'daily', -- 'daily', 'weekly', 'monthly'
  content_types JSONB DEFAULT '["tools", "topics", "discussions"]'::JSONB,
  preferred_time TIME DEFAULT '08:00:00',
  preferred_timezone TEXT DEFAULT 'UTC',
  max_items INTEGER DEFAULT 10,
  email_delivery BOOLEAN DEFAULT true,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index on user_id for daily_briefs
CREATE INDEX IF NOT EXISTS daily_briefs_user_id_idx ON daily_briefs(user_id);

-- Create index on brief_id for brief_items
CREATE INDEX IF NOT EXISTS brief_items_brief_id_idx ON brief_items(brief_id);

-- Create index on brief_id, user_id for brief_interactions
CREATE INDEX IF NOT EXISTS brief_interactions_brief_id_user_id_idx ON brief_interactions(brief_id, user_id);

-- Create index on content_type, content_id for brief_items
CREATE INDEX IF NOT EXISTS brief_items_content_type_content_id_idx ON brief_items(content_type, content_id);

-- Create function to mark a brief as read
CREATE OR REPLACE FUNCTION mark_brief_as_read(
  p_brief_id UUID,
  p_user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE daily_briefs
  SET read_at = now()
  WHERE id = p_brief_id AND user_id = p_user_id;
  
  -- Add a 'view' interaction
  INSERT INTO brief_interactions (
    brief_id, 
    user_id, 
    interaction_type
  )
  VALUES (
    p_brief_id,
    p_user_id,
    'view'
  );
END;
$$;

-- Create function to record item interaction
CREATE OR REPLACE FUNCTION record_brief_item_interaction(
  p_item_id UUID,
  p_user_id UUID,
  p_interaction_type TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_brief_id UUID;
BEGIN
  -- Get the brief_id from the item
  SELECT brief_id INTO v_brief_id
  FROM brief_items
  WHERE id = p_item_id;
  
  -- Insert the interaction
  INSERT INTO brief_interactions (
    brief_id,
    item_id,
    user_id,
    interaction_type
  )
  VALUES (
    v_brief_id,
    p_item_id,
    p_user_id,
    p_interaction_type
  );
END;
$$;

-- Set up RLS policies
ALTER TABLE daily_briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE brief_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE brief_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_brief_preferences ENABLE ROW LEVEL SECURITY;

-- Policy for daily_briefs
CREATE POLICY daily_briefs_user_policy
  ON daily_briefs
  FOR ALL
  USING (user_id = auth.uid());

-- Policy for brief_items (can view if they can view the parent brief)
CREATE POLICY brief_items_user_policy
  ON brief_items
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM daily_briefs
      WHERE id = brief_items.brief_id
      AND user_id = auth.uid()
    )
  );

-- Policy for brief_interactions
CREATE POLICY brief_interactions_user_policy
  ON brief_interactions
  FOR ALL
  USING (user_id = auth.uid());

-- Policy for user_brief_preferences
CREATE POLICY user_brief_preferences_user_policy
  ON user_brief_preferences
  FOR ALL
  USING (user_id = auth.uid());

-- Create function to get a user's latest brief
CREATE OR REPLACE FUNCTION get_latest_user_brief(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  summary TEXT,
  generated_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  items JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    db.id,
    db.title,
    db.summary,
    db.generated_at,
    db.read_at,
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', bi.id,
          'title', bi.title,
          'summary', bi.summary,
          'content_type', bi.content_type,
          'content_id', bi.content_id,
          'relevance_score', bi.relevance_score,
          'position', bi.position,
          'metadata', bi.metadata
        )
        ORDER BY bi.position
      )
      FROM brief_items bi
      WHERE bi.brief_id = db.id
    ) AS items
  FROM daily_briefs db
  WHERE db.user_id = p_user_id
  ORDER BY db.generated_at DESC
  LIMIT 1;
END;
$$;

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON daily_briefs TO authenticated;
GRANT SELECT ON brief_items TO authenticated;
GRANT SELECT, INSERT ON brief_interactions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON user_brief_preferences TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION mark_brief_as_read TO authenticated;
GRANT EXECUTE ON FUNCTION record_brief_item_interaction TO authenticated;
GRANT EXECUTE ON FUNCTION get_latest_user_brief TO authenticated;