/**
 * Reputation System Functions Migration
 * Creates additional functions for reputation management
 */

/* eslint-disable camelcase */

exports.up = (pgm) => {
  // Create function to get user's reputation rank
  pgm.createFunction(
    'get_user_reputation_rank',
    ['user_id_param integer'],
    {
      returns: 'integer',
      language: 'plpgsql',
    },
    `
    DECLARE
      user_rank integer;
    BEGIN
      SELECT COUNT(*) + 1 INTO user_rank
      FROM users
      WHERE reputation > (SELECT reputation FROM users WHERE id = user_id_param);
      
      RETURN user_rank;
    END;
    `
  );

  // Create function to get user's reputation percentile
  pgm.createFunction(
    'get_user_reputation_percentile',
    ['user_id_param integer'],
    {
      returns: 'numeric',
      language: 'plpgsql',
    },
    `
    DECLARE
      user_percentile numeric;
    BEGIN
      SELECT 
        (COUNT(*) FILTER (WHERE reputation <= (SELECT reputation FROM users WHERE id = user_id_param)) * 100.0 / NULLIF(COUNT(*), 0))::numeric(5,2)
        INTO user_percentile
      FROM users
      WHERE reputation > 0;
      
      RETURN user_percentile;
    END;
    `
  );

  // Create function to check badge eligibility
  pgm.createFunction(
    'check_badge_eligibility',
    ['user_id_param integer', 'badge_key_param text'],
    {
      returns: 'boolean',
      language: 'plpgsql',
    },
    `
    DECLARE
      badge_id_var integer;
      is_eligible boolean := false;
    BEGIN
      -- Map badge keys to badge IDs
      CASE badge_key_param
        WHEN 'welcome' THEN badge_id_var := 1;
        WHEN 'first_post' THEN badge_id_var := 2;
        WHEN 'first_answer' THEN badge_id_var := 3;
        WHEN 'first_question' THEN badge_id_var := 4;
        WHEN 'helpful' THEN badge_id_var := 5;
        WHEN 'popular_post' THEN badge_id_var := 6;
        WHEN 'valuable_answer' THEN badge_id_var := 7;
        WHEN 'expert' THEN badge_id_var := 8;
        WHEN 'great_question' THEN badge_id_var := 9;
        WHEN 'reviewer' THEN badge_id_var := 10;
        ELSE RETURN false; -- Unknown badge
      END CASE;
      
      -- Check if user already has this badge
      IF EXISTS (
        SELECT 1 FROM user_badges 
        WHERE user_id = user_id_param AND badge_id = badge_id_var
      ) THEN
        RETURN false; -- User already has this badge
      END IF;
      
      -- Check eligibility based on badge type
      CASE badge_key_param
        WHEN 'welcome' THEN
          -- Check if user has completed profile
          SELECT EXISTS (
            SELECT 1 FROM users 
            WHERE id = user_id_param 
            AND avatar_url IS NOT NULL 
            AND bio IS NOT NULL 
            AND name IS NOT NULL
          ) INTO is_eligible;
          
        WHEN 'first_post' THEN
          -- Check if user has created at least one post
          SELECT EXISTS (
            SELECT 1 FROM content 
            WHERE author_id = user_id_param 
            AND type = 'post'
          ) INTO is_eligible;
          
        WHEN 'first_answer' THEN
          -- Check if user has created at least one answer
          SELECT EXISTS (
            SELECT 1 FROM content 
            WHERE author_id = user_id_param 
            AND type = 'answer'
          ) INTO is_eligible;
          
        WHEN 'first_question' THEN
          -- Check if user has created at least one question
          SELECT EXISTS (
            SELECT 1 FROM content 
            WHERE author_id = user_id_param 
            AND type = 'question'
          ) INTO is_eligible;
          
        WHEN 'helpful' THEN
          -- Check if user has at least one accepted answer
          SELECT EXISTS (
            SELECT 1 FROM content 
            WHERE author_id = user_id_param 
            AND type = 'answer' 
            AND is_accepted = true
          ) INTO is_eligible;
          
        WHEN 'popular_post' THEN
          -- Check if user has a post with at least 10 upvotes
          SELECT EXISTS (
            SELECT 1 FROM content 
            WHERE author_id = user_id_param 
            AND (type = 'post' OR type = 'question') 
            AND upvotes >= 10
          ) INTO is_eligible;
          
        WHEN 'valuable_answer' THEN
          -- Check if user has an answer with at least 10 upvotes
          SELECT EXISTS (
            SELECT 1 FROM content 
            WHERE author_id = user_id_param 
            AND type = 'answer' 
            AND upvotes >= 10
          ) INTO is_eligible;
          
        WHEN 'expert' THEN
          -- Check if user has an answer with at least 25 upvotes
          SELECT EXISTS (
            SELECT 1 FROM content 
            WHERE author_id = user_id_param 
            AND type = 'answer' 
            AND upvotes >= 25
          ) INTO is_eligible;
          
        WHEN 'great_question' THEN
          -- Check if user has a question with at least 25 upvotes
          SELECT EXISTS (
            SELECT 1 FROM content 
            WHERE author_id = user_id_param 
            AND type = 'question' 
            AND upvotes >= 25
          ) INTO is_eligible;
          
        WHEN 'reviewer' THEN
          -- Check if user has at least 5 tool reviews
          SELECT (COUNT(*) >= 5) INTO is_eligible
          FROM tool_reviews
          WHERE user_id = user_id_param;
          
        ELSE
          is_eligible := false;
      END CASE;
      
      RETURN is_eligible;
    END;
    `
  );

  // Create function to award a badge if eligible
  pgm.createFunction(
    'award_badge_if_eligible',
    ['user_id_param integer', 'badge_key_param text'],
    {
      returns: 'boolean',
      language: 'plpgsql',
    },
    `
    DECLARE
      badge_id_var integer;
      is_eligible boolean;
    BEGIN
      -- Map badge key to badge ID
      CASE badge_key_param
        WHEN 'welcome' THEN badge_id_var := 1;
        WHEN 'first_post' THEN badge_id_var := 2;
        WHEN 'first_answer' THEN badge_id_var := 3;
        WHEN 'first_question' THEN badge_id_var := 4;
        WHEN 'helpful' THEN badge_id_var := 5;
        WHEN 'popular_post' THEN badge_id_var := 6;
        WHEN 'valuable_answer' THEN badge_id_var := 7;
        WHEN 'expert' THEN badge_id_var := 8;
        WHEN 'great_question' THEN badge_id_var := 9;
        WHEN 'reviewer' THEN badge_id_var := 10;
        ELSE RETURN false; -- Unknown badge
      END CASE;
      
      -- Check eligibility
      SELECT check_badge_eligibility(user_id_param, badge_key_param) INTO is_eligible;
      
      -- Award badge if eligible
      IF is_eligible THEN
        INSERT INTO user_badges (user_id, badge_id, awarded_at)
        VALUES (user_id_param, badge_id_var, NOW())
        ON CONFLICT (user_id, badge_id) DO NOTHING;
        
        -- Create notification for badge
        INSERT INTO notifications (user_id, type, content, is_read, created_at)
        VALUES (
          user_id_param, 
          'badge', 
          jsonb_build_object(
            'badge_id', badge_id_var,
            'name', (SELECT name FROM badges WHERE id = badge_id_var),
            'description', (SELECT description FROM badges WHERE id = badge_id_var),
            'level', (SELECT level FROM badges WHERE id = badge_id_var)
          ),
          false,
          NOW()
        );
        
        RETURN true;
      ELSE
        RETURN false;
      END IF;
    END;
    `
  );

  // Create function to check all badges for a user
  pgm.createFunction(
    'check_all_badges',
    ['user_id_param integer'],
    {
      returns: 'integer[]',
      language: 'plpgsql',
    },
    `
    DECLARE
      awarded_badges integer[] := '{}';
      badge_keys text[] := ARRAY['welcome', 'first_post', 'first_answer', 'first_question', 
                               'helpful', 'popular_post', 'valuable_answer', 'expert', 
                               'great_question', 'reviewer'];
      badge_key text;
      badge_awarded boolean;
      badge_id_map jsonb := '{
        "welcome": 1,
        "first_post": 2,
        "first_answer": 3,
        "first_question": 4,
        "helpful": 5,
        "popular_post": 6,
        "valuable_answer": 7,
        "expert": 8,
        "great_question": 9,
        "reviewer": 10
      }';
    BEGIN
      FOREACH badge_key IN ARRAY badge_keys LOOP
        SELECT award_badge_if_eligible(user_id_param, badge_key) INTO badge_awarded;
        
        IF badge_awarded THEN
          awarded_badges := awarded_badges || (badge_id_map->badge_key)::integer;
        END IF;
      END LOOP;
      
      RETURN awarded_badges;
    END;
    `
  );

  // Create trigger function to check badges after reputation change
  pgm.createFunction(
    'check_badges_after_reputation',
    [],
    {
      returns: 'trigger',
      language: 'plpgsql',
    },
    `
    BEGIN
      -- Only check for specific reputation-related badges
      PERFORM award_badge_if_eligible(NEW.user_id, 'popular_post');
      PERFORM award_badge_if_eligible(NEW.user_id, 'valuable_answer');
      PERFORM award_badge_if_eligible(NEW.user_id, 'expert');
      PERFORM award_badge_if_eligible(NEW.user_id, 'great_question');
      
      RETURN NEW;
    END;
    `
  );

  // Add trigger for checking badges after reputation change
  pgm.createTrigger('reputation_history', 'check_badges_trigger', {
    when: 'AFTER',
    operation: 'INSERT',
    level: 'ROW',
    function: 'check_badges_after_reputation',
  });

  // Create trigger function to check content-specific badges
  pgm.createFunction(
    'check_content_badges',
    [],
    {
      returns: 'trigger',
      language: 'plpgsql',
    },
    `
    BEGIN
      -- Check for content type and trigger appropriate badge checks
      IF NEW.type = 'post' THEN
        PERFORM award_badge_if_eligible(NEW.author_id, 'first_post');
      ELSIF NEW.type = 'question' THEN
        PERFORM award_badge_if_eligible(NEW.author_id, 'first_question');
      ELSIF NEW.type = 'answer' THEN
        PERFORM award_badge_if_eligible(NEW.author_id, 'first_answer');
        
        -- If answer is accepted
        IF NEW.is_accepted = true AND OLD.is_accepted = false THEN
          PERFORM award_badge_if_eligible(NEW.author_id, 'helpful');
        END IF;
      END IF;
      
      RETURN NEW;
    END;
    `
  );

  // Add trigger for checking badges after content changes
  pgm.createTrigger('content', 'check_content_badges_trigger', {
    when: 'AFTER',
    operation: 'INSERT OR UPDATE',
    level: 'ROW',
    function: 'check_content_badges',
  });

  // Create trigger function to check tool review badges
  pgm.createFunction(
    'check_review_badges',
    [],
    {
      returns: 'trigger',
      language: 'plpgsql',
    },
    `
    BEGIN
      -- Check for reviewer badge
      PERFORM award_badge_if_eligible(NEW.user_id, 'reviewer');
      
      RETURN NEW;
    END;
    `
  );

  // Add trigger for checking badges after tool review creation
  pgm.createTrigger('tool_reviews', 'check_review_badges_trigger', {
    when: 'AFTER',
    operation: 'INSERT',
    level: 'ROW',
    function: 'check_review_badges',
  });

  // Create trigger function to check profile completion badge
  pgm.createFunction(
    'check_profile_badges',
    [],
    {
      returns: 'trigger',
      language: 'plpgsql',
    },
    `
    BEGIN
      -- Check for welcome badge if profile is updated with avatar and bio
      IF (NEW.avatar_url IS NOT NULL AND OLD.avatar_url IS NULL) OR
         (NEW.bio IS NOT NULL AND OLD.bio IS NULL) THEN
        
        -- Check if profile is now complete
        IF NEW.avatar_url IS NOT NULL AND NEW.bio IS NOT NULL AND NEW.name IS NOT NULL THEN
          PERFORM award_badge_if_eligible(NEW.id, 'welcome');
        END IF;
      END IF;
      
      RETURN NEW;
    END;
    `
  );

  // Add trigger for checking welcome badge after profile update
  pgm.createTrigger('users', 'check_profile_badges_trigger', {
    when: 'AFTER',
    operation: 'UPDATE',
    level: 'ROW',
    function: 'check_profile_badges',
  });
};

exports.down = (pgm) => {
  // Drop triggers
  pgm.dropTrigger('reputation_history', 'check_badges_trigger', { ifExists: true });
  pgm.dropTrigger('content', 'check_content_badges_trigger', { ifExists: true });
  pgm.dropTrigger('tool_reviews', 'check_review_badges_trigger', { ifExists: true });
  pgm.dropTrigger('users', 'check_profile_badges_trigger', { ifExists: true });

  // Drop functions
  pgm.dropFunction('get_user_reputation_rank', ['integer'], { ifExists: true });
  pgm.dropFunction('get_user_reputation_percentile', ['integer'], { ifExists: true });
  pgm.dropFunction('check_badge_eligibility', ['integer', 'text'], { ifExists: true });
  pgm.dropFunction('award_badge_if_eligible', ['integer', 'text'], { ifExists: true });
  pgm.dropFunction('check_all_badges', ['integer'], { ifExists: true });
  pgm.dropFunction('check_badges_after_reputation', [], { ifExists: true });
  pgm.dropFunction('check_content_badges', [], { ifExists: true });
  pgm.dropFunction('check_review_badges', [], { ifExists: true });
  pgm.dropFunction('check_profile_badges', [], { ifExists: true });
};