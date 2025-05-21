-- Quadratic Voting System Migration

-- Create vote_credits table to track user vote credits
CREATE TABLE vote_credits (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  available_credits INTEGER NOT NULL DEFAULT 100,
  total_earned_credits INTEGER NOT NULL DEFAULT 100,
  last_credit_refresh TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Add vote_weight column to user_votes table
ALTER TABLE user_votes ADD COLUMN vote_weight INTEGER NOT NULL DEFAULT 1;
ALTER TABLE user_votes ADD COLUMN credits_spent INTEGER NOT NULL DEFAULT 1;

-- Create table to track vote credit transactions
CREATE TABLE vote_credit_transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  credits_change INTEGER NOT NULL,
  reason VARCHAR(50) NOT NULL, -- spent, earned, refreshed, etc.
  content_id INTEGER REFERENCES content(id) ON DELETE SET NULL,
  tool_id INTEGER REFERENCES tools(id) ON DELETE SET NULL,
  review_id INTEGER REFERENCES tool_reviews(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT credit_transaction_target_check CHECK (
    (content_id IS NOT NULL AND tool_id IS NULL AND review_id IS NULL) OR
    (content_id IS NULL AND tool_id IS NOT NULL AND review_id IS NULL) OR
    (content_id IS NULL AND tool_id IS NULL AND review_id IS NOT NULL) OR
    (content_id IS NULL AND tool_id IS NULL AND review_id IS NULL)
  )
);

-- Create index for vote credit transactions
CREATE INDEX idx_vote_credit_transactions_user_id ON vote_credit_transactions(user_id);
CREATE INDEX idx_vote_credit_transactions_reason ON vote_credit_transactions(reason);

-- Enable Row Level Security
ALTER TABLE vote_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE vote_credit_transactions ENABLE ROW LEVEL SECURITY;

-- Create security policies for vote_credits
CREATE POLICY vote_credits_select_policy ON vote_credits 
  FOR SELECT 
  USING (true); -- Anyone can see vote credits

CREATE POLICY vote_credits_update_policy ON vote_credits 
  FOR UPDATE 
  USING (auth.uid()::text = (SELECT auth_provider_id FROM users WHERE id = user_id));

-- Create security policies for vote_credit_transactions
CREATE POLICY vote_credit_transactions_select_policy ON vote_credit_transactions 
  FOR SELECT 
  USING (auth.uid()::text = (SELECT auth_provider_id FROM users WHERE id = user_id));

-- Function to calculate quadratic vote cost
CREATE OR REPLACE FUNCTION calculate_vote_cost(weight INTEGER) 
RETURNS INTEGER AS $$
BEGIN
  -- Formula: cost = weight^2
  RETURN weight * weight;
END;
$$ LANGUAGE plpgsql;

-- Function to handle quadratic voting
CREATE OR REPLACE FUNCTION handle_quadratic_vote(
  p_user_id INTEGER,
  p_target_id INTEGER,
  p_target_type VARCHAR(20),
  p_vote_weight INTEGER,
  p_vote_type INTEGER
) RETURNS JSONB AS $$
DECLARE
  v_content_id INTEGER := NULL;
  v_tool_id INTEGER := NULL;
  v_review_id INTEGER := NULL;
  v_owner_id INTEGER;
  v_vote_cost INTEGER;
  v_available_credits INTEGER;
  v_existing_weight INTEGER;
  v_existing_cost INTEGER;
  v_vote_result JSONB;
  v_credit_change INTEGER;
BEGIN
  -- Calculate vote cost
  v_vote_cost := calculate_vote_cost(p_vote_weight);
  
  -- Set the appropriate ID based on target type
  IF p_target_type = 'content' THEN
    v_content_id := p_target_id;
    -- Get content owner
    SELECT author_id INTO v_owner_id FROM content WHERE id = p_target_id;
  ELSIF p_target_type = 'tool' THEN
    v_tool_id := p_target_id;
    -- Get tool owner (vendor)
    SELECT vendor_id INTO v_owner_id FROM tools WHERE id = p_target_id;
  ELSIF p_target_type = 'review' THEN
    v_review_id := p_target_id;
    -- Get review owner
    SELECT user_id INTO v_owner_id FROM tool_reviews WHERE id = p_target_id;
  ELSE
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Invalid target type'
    );
  END IF;
  
  -- Check if user is the owner
  IF v_owner_id = p_user_id THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Cannot vote on your own content'
    );
  END IF;
  
  -- Check available credits
  SELECT available_credits INTO v_available_credits
  FROM vote_credits
  WHERE user_id = p_user_id;
  
  -- Create vote credits record if it doesn't exist
  IF v_available_credits IS NULL THEN
    INSERT INTO vote_credits (user_id, available_credits, total_earned_credits)
    VALUES (p_user_id, 100, 100);
    
    v_available_credits := 100;
  END IF;
  
  -- Check for existing vote and its weight
  IF p_target_type = 'content' THEN
    SELECT vote_weight, credits_spent INTO v_existing_weight, v_existing_cost
    FROM user_votes
    WHERE user_id = p_user_id AND content_id = p_target_id;
  ELSIF p_target_type = 'tool' THEN
    SELECT vote_weight, credits_spent INTO v_existing_weight, v_existing_cost
    FROM user_votes
    WHERE user_id = p_user_id AND tool_id = p_target_id;
  ELSIF p_target_type = 'review' THEN
    SELECT vote_weight, credits_spent INTO v_existing_weight, v_existing_cost
    FROM user_votes
    WHERE user_id = p_user_id AND review_id = p_target_id;
  END IF;
  
  -- If updating an existing vote
  IF v_existing_weight IS NOT NULL THEN
    -- Calculate credit change (may be positive if reducing vote weight)
    v_credit_change := v_existing_cost - v_vote_cost;
    
    -- Check if user has enough credits if increasing weight
    IF v_credit_change < 0 AND v_available_credits < ABS(v_credit_change) THEN
      RETURN jsonb_build_object(
        'success', false,
        'message', 'Not enough vote credits',
        'available_credits', v_available_credits,
        'required_credits', ABS(v_credit_change)
      );
    END IF;
    
    -- Update vote
    IF p_target_type = 'content' THEN
      UPDATE user_votes
      SET vote_weight = p_vote_weight, vote_type = p_vote_type, credits_spent = v_vote_cost,
          updated_at = NOW()
      WHERE user_id = p_user_id AND content_id = p_target_id;
      
      -- Update content vote count
      IF p_vote_type = 1 THEN -- Upvote
        UPDATE content 
        SET upvotes = upvotes + p_vote_weight - v_existing_weight
        WHERE id = p_target_id;
      ELSE -- Downvote
        UPDATE content 
        SET downvotes = downvotes + p_vote_weight - v_existing_weight
        WHERE id = p_target_id;
      END IF;
    ELSIF p_target_type = 'tool' THEN
      UPDATE user_votes
      SET vote_weight = p_vote_weight, vote_type = p_vote_type, credits_spent = v_vote_cost,
          updated_at = NOW()
      WHERE user_id = p_user_id AND tool_id = p_target_id;
      
      -- Update tool vote count
      UPDATE tools 
      SET upvotes = upvotes + p_vote_weight - v_existing_weight
      WHERE id = p_target_id;
    ELSIF p_target_type = 'review' THEN
      UPDATE user_votes
      SET vote_weight = p_vote_weight, vote_type = p_vote_type, credits_spent = v_vote_cost,
          updated_at = NOW()
      WHERE user_id = p_user_id AND review_id = p_target_id;
      
      -- Update review vote count
      UPDATE tool_reviews 
      SET upvotes = upvotes + p_vote_weight - v_existing_weight
      WHERE id = p_target_id;
    END IF;
  ELSE
    -- New vote
    -- Check if user has enough credits
    IF v_available_credits < v_vote_cost THEN
      RETURN jsonb_build_object(
        'success', false,
        'message', 'Not enough vote credits',
        'available_credits', v_available_credits,
        'required_credits', v_vote_cost
      );
    END IF;
    
    v_credit_change := -v_vote_cost;
    
    -- Insert new vote
    IF p_target_type = 'content' THEN
      INSERT INTO user_votes (user_id, content_id, vote_type, vote_weight, credits_spent, created_at, updated_at)
      VALUES (p_user_id, p_target_id, p_vote_type, p_vote_weight, v_vote_cost, NOW(), NOW());
      
      -- Update content vote count
      IF p_vote_type = 1 THEN -- Upvote
        UPDATE content 
        SET upvotes = upvotes + p_vote_weight
        WHERE id = p_target_id;
      ELSE -- Downvote
        UPDATE content 
        SET downvotes = downvotes + p_vote_weight
        WHERE id = p_target_id;
      END IF;
    ELSIF p_target_type = 'tool' THEN
      INSERT INTO user_votes (user_id, tool_id, vote_type, vote_weight, credits_spent, created_at, updated_at)
      VALUES (p_user_id, p_target_id, p_vote_type, p_vote_weight, v_vote_cost, NOW(), NOW());
      
      -- Update tool vote count
      UPDATE tools 
      SET upvotes = upvotes + p_vote_weight
      WHERE id = p_target_id;
    ELSIF p_target_type = 'review' THEN
      INSERT INTO user_votes (user_id, review_id, vote_type, vote_weight, credits_spent, created_at, updated_at)
      VALUES (p_user_id, p_target_id, p_vote_type, p_vote_weight, v_vote_cost, NOW(), NOW());
      
      -- Update review vote count
      UPDATE tool_reviews 
      SET upvotes = upvotes + p_vote_weight
      WHERE id = p_target_id;
    END IF;
  END IF;
  
  -- Update user's credits
  UPDATE vote_credits
  SET available_credits = available_credits + v_credit_change,
      updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Record the credit transaction
  INSERT INTO vote_credit_transactions (
    user_id, credits_change, reason, content_id, tool_id, review_id
  )
  VALUES (
    p_user_id, v_credit_change, 'vote', v_content_id, v_tool_id, v_review_id
  );
  
  -- If this is a content vote, update reputation
  IF p_target_type = 'content' AND v_owner_id IS NOT NULL THEN
    -- Calculate reputation change based on vote weight
    -- Upvotes give positive reputation
    IF p_vote_type = 1 THEN
      PERFORM update_user_reputation(
        v_owner_id,
        p_vote_weight * 10, -- Base value multiplied by weight
        'upvote_received',
        v_content_id
      );
    -- Downvotes subtract reputation
    ELSE
      PERFORM update_user_reputation(
        v_owner_id,
        p_vote_weight * -2, -- Base value multiplied by weight
        'downvote_received',
        v_content_id
      );
    END IF;
  END IF;
  
  -- Return success and updated credit balance
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Vote recorded successfully',
    'available_credits', v_available_credits + v_credit_change,
    'credits_spent', v_vote_cost,
    'vote_weight', p_vote_weight
  );
END;
$$ LANGUAGE plpgsql;

-- Function to remove quadratic vote
CREATE OR REPLACE FUNCTION remove_quadratic_vote(
  p_user_id INTEGER,
  p_target_id INTEGER,
  p_target_type VARCHAR(20)
) RETURNS JSONB AS $$
DECLARE
  v_content_id INTEGER := NULL;
  v_tool_id INTEGER := NULL;
  v_review_id INTEGER := NULL;
  v_vote_weight INTEGER;
  v_vote_type INTEGER;
  v_credits_spent INTEGER;
  v_vote_exists BOOLEAN;
BEGIN
  -- Set the appropriate ID based on target type
  IF p_target_type = 'content' THEN
    v_content_id := p_target_id;
    
    -- Check if vote exists
    SELECT EXISTS(
      SELECT 1 FROM user_votes
      WHERE user_id = p_user_id AND content_id = p_target_id
    ) INTO v_vote_exists;
    
    IF v_vote_exists THEN
      -- Get vote details
      SELECT vote_weight, vote_type, credits_spent 
      INTO v_vote_weight, v_vote_type, v_credits_spent
      FROM user_votes
      WHERE user_id = p_user_id AND content_id = p_target_id;
      
      -- Delete the vote
      DELETE FROM user_votes
      WHERE user_id = p_user_id AND content_id = p_target_id;
      
      -- Update content vote count
      IF v_vote_type = 1 THEN -- Upvote
        UPDATE content 
        SET upvotes = upvotes - v_vote_weight
        WHERE id = p_target_id;
      ELSE -- Downvote
        UPDATE content 
        SET downvotes = downvotes - v_vote_weight
        WHERE id = p_target_id;
      END IF;
    ELSE
      RETURN jsonb_build_object(
        'success', false,
        'message', 'No vote found to remove'
      );
    END IF;
  ELSIF p_target_type = 'tool' THEN
    v_tool_id := p_target_id;
    
    -- Check if vote exists
    SELECT EXISTS(
      SELECT 1 FROM user_votes
      WHERE user_id = p_user_id AND tool_id = p_target_id
    ) INTO v_vote_exists;
    
    IF v_vote_exists THEN
      -- Get vote details
      SELECT vote_weight, vote_type, credits_spent 
      INTO v_vote_weight, v_vote_type, v_credits_spent
      FROM user_votes
      WHERE user_id = p_user_id AND tool_id = p_target_id;
      
      -- Delete the vote
      DELETE FROM user_votes
      WHERE user_id = p_user_id AND tool_id = p_target_id;
      
      -- Update tool vote count
      UPDATE tools 
      SET upvotes = upvotes - v_vote_weight
      WHERE id = p_target_id;
    ELSE
      RETURN jsonb_build_object(
        'success', false,
        'message', 'No vote found to remove'
      );
    END IF;
  ELSIF p_target_type = 'review' THEN
    v_review_id := p_target_id;
    
    -- Check if vote exists
    SELECT EXISTS(
      SELECT 1 FROM user_votes
      WHERE user_id = p_user_id AND review_id = p_target_id
    ) INTO v_vote_exists;
    
    IF v_vote_exists THEN
      -- Get vote details
      SELECT vote_weight, vote_type, credits_spent 
      INTO v_vote_weight, v_vote_type, v_credits_spent
      FROM user_votes
      WHERE user_id = p_user_id AND review_id = p_target_id;
      
      -- Delete the vote
      DELETE FROM user_votes
      WHERE user_id = p_user_id AND review_id = p_target_id;
      
      -- Update review vote count
      UPDATE tool_reviews 
      SET upvotes = upvotes - v_vote_weight
      WHERE id = p_target_id;
    ELSE
      RETURN jsonb_build_object(
        'success', false,
        'message', 'No vote found to remove'
      );
    END IF;
  ELSE
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Invalid target type'
    );
  END IF;
  
  -- If we get here, vote was found and deleted
  
  -- Refund credits
  UPDATE vote_credits
  SET available_credits = available_credits + v_credits_spent,
      updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Record the credit transaction
  INSERT INTO vote_credit_transactions (
    user_id, credits_change, reason, content_id, tool_id, review_id
  )
  VALUES (
    p_user_id, v_credits_spent, 'vote_refund', v_content_id, v_tool_id, v_review_id
  );
  
  -- Return success
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Vote removed successfully',
    'credits_refunded', v_credits_spent
  );
END;
$$ LANGUAGE plpgsql;

-- Function to refresh user credits (for scheduled job)
CREATE OR REPLACE FUNCTION refresh_vote_credits() RETURNS void AS $$
DECLARE
  v_credit_refresh_interval INTERVAL := INTERVAL '1 week'; -- Adjust as needed
  v_refresh_amount INTEGER := 50; -- Credits to add each refresh
BEGIN
  -- Update eligible users
  UPDATE vote_credits
  SET available_credits = available_credits + v_refresh_amount,
      total_earned_credits = total_earned_credits + v_refresh_amount,
      last_credit_refresh = NOW(),
      updated_at = NOW()
  WHERE last_credit_refresh < (NOW() - v_credit_refresh_interval);
  
  -- Record transactions for users who received credits
  INSERT INTO vote_credit_transactions (
    user_id, credits_change, reason
  )
  SELECT 
    user_id, v_refresh_amount, 'weekly_refresh'
  FROM vote_credits
  WHERE last_credit_refresh < (NOW() - v_credit_refresh_interval);
END;
$$ LANGUAGE plpgsql;

-- Create an initial vote_credits record for each user
INSERT INTO vote_credits (user_id, available_credits, total_earned_credits)
SELECT id, 100, 100 FROM users;

-- Insert metadata
INSERT INTO _metadata (version) VALUES ('1.2.0');