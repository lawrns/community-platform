/**
 * Database Functions Migration
 * Creates necessary functions and triggers for the application
 */

/* eslint-disable camelcase */

exports.up = (pgm) => {
  // Create function to update timestamps on tables
  pgm.createFunction(
    'update_timestamp',
    [],
    {
      returns: 'trigger',
      language: 'plpgsql',
    },
    `
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    `
  );

  // Create function to update counter columns (upvotes, downvotes, views)
  pgm.createFunction(
    'update_counter',
    ['table_name text', 'id_column text', 'id_value integer', 'counter_column text', 'increment_value integer'],
    {
      returns: 'void',
      language: 'plpgsql',
    },
    `
    BEGIN
      EXECUTE format('UPDATE %I SET %I = %I + %L WHERE %I = %L', 
                    table_name, counter_column, counter_column, increment_value, id_column, id_value);
    END;
    `
  );

  // Create function to handle reputation changes
  pgm.createFunction(
    'update_user_reputation',
    ['user_id_param integer', 'change_param integer', 'reason_param text', 'content_id_param integer DEFAULT NULL'],
    {
      returns: 'void',
      language: 'plpgsql',
    },
    `
    BEGIN
      -- Update user reputation
      UPDATE users SET reputation = reputation + change_param WHERE id = user_id_param;
      
      -- Record in reputation history
      INSERT INTO reputation_history (user_id, change, reason, content_id, created_at)
      VALUES (user_id_param, change_param, reason_param, content_id_param, NOW());
    END;
    `
  );

  // Create function to handle content voting
  pgm.createFunction(
    'handle_content_vote',
    ['user_id_param integer', 'content_id_param integer', 'vote_type_param smallint'],
    {
      returns: 'boolean',
      language: 'plpgsql',
    },
    `
    DECLARE
      author_id_var integer;
      rep_change integer;
      prev_vote_type smallint;
      content_type_var varchar;
    BEGIN
      -- Get content author and type
      SELECT author_id, type INTO author_id_var, content_type_var FROM content WHERE id = content_id_param;
      
      -- Check for existing vote
      SELECT vote_type INTO prev_vote_type 
      FROM user_votes 
      WHERE user_id = user_id_param AND content_id = content_id_param;
      
      -- Calculate reputation change based on content type and vote_type
      IF content_type_var = 'question' THEN
        rep_change := CASE 
          WHEN vote_type_param = 1 THEN 5 
          WHEN vote_type_param = -1 THEN -2
          ELSE 0
        END;
      ELSIF content_type_var = 'answer' THEN
        rep_change := CASE 
          WHEN vote_type_param = 1 THEN 10
          WHEN vote_type_param = -1 THEN -2
          ELSE 0
        END;
      ELSE -- other content types
        rep_change := CASE 
          WHEN vote_type_param = 1 THEN 2
          WHEN vote_type_param = -1 THEN -1
          ELSE 0
        END;
      END IF;
      
      -- If reversing previous vote, double the effect
      IF prev_vote_type IS NOT NULL THEN
        IF prev_vote_type = -1 AND vote_type_param = 1 THEN
          -- Changing from downvote to upvote
          PERFORM update_counter('content', 'id', content_id_param, 'downvotes', -1);
          PERFORM update_counter('content', 'id', content_id_param, 'upvotes', 1);
          
          -- Reverse previous reputation change and add new one
          PERFORM update_user_reputation(author_id_var, ABS(rep_change) * 2, 'vote_reversal', content_id_param);
          
        ELSIF prev_vote_type = 1 AND vote_type_param = -1 THEN
          -- Changing from upvote to downvote
          PERFORM update_counter('content', 'id', content_id_param, 'upvotes', -1);
          PERFORM update_counter('content', 'id', content_id_param, 'downvotes', 1);
          
          -- Reverse previous reputation change and add new one
          PERFORM update_user_reputation(author_id_var, -ABS(rep_change) * 2, 'vote_reversal', content_id_param);
          
        ELSIF (prev_vote_type = 1 AND vote_type_param = 0) OR (prev_vote_type = -1 AND vote_type_param = 0) THEN
          -- Removing vote
          IF prev_vote_type = 1 THEN
            PERFORM update_counter('content', 'id', content_id_param, 'upvotes', -1);
            -- Reverse previous reputation change
            PERFORM update_user_reputation(author_id_var, -rep_change, 'vote_removed', content_id_param);
          ELSE
            PERFORM update_counter('content', 'id', content_id_param, 'downvotes', -1);
            -- Reverse previous reputation change
            PERFORM update_user_reputation(author_id_var, -rep_change, 'vote_removed', content_id_param);
          END IF;
        END IF;
        
        -- Delete existing vote if setting to 0, otherwise update
        IF vote_type_param = 0 THEN
          DELETE FROM user_votes 
          WHERE user_id = user_id_param AND content_id = content_id_param;
        ELSE
          UPDATE user_votes 
          SET vote_type = vote_type_param, updated_at = NOW()
          WHERE user_id = user_id_param AND content_id = content_id_param;
        END IF;
        
      ELSE -- No previous vote
        IF vote_type_param != 0 THEN
          -- Insert new vote
          INSERT INTO user_votes (user_id, content_id, vote_type, created_at, updated_at)
          VALUES (user_id_param, content_id_param, vote_type_param, NOW(), NOW());
          
          -- Update content vote count
          IF vote_type_param = 1 THEN
            PERFORM update_counter('content', 'id', content_id_param, 'upvotes', 1);
          ELSE
            PERFORM update_counter('content', 'id', content_id_param, 'downvotes', 1);
          END IF;
          
          -- Update author reputation
          IF user_id_param != author_id_var THEN -- Can't vote on your own content
            PERFORM update_user_reputation(
              author_id_var, 
              rep_change, 
              CASE 
                WHEN vote_type_param = 1 THEN 'upvote'
                ELSE 'downvote'
              END,
              content_id_param
            );
          END IF;
        END IF;
      END IF;
      
      RETURN TRUE;
    END;
    `
  );

  // Create function to mark an answer as accepted
  pgm.createFunction(
    'accept_answer',
    ['answer_id_param integer', 'question_author_id_param integer'],
    {
      returns: 'boolean',
      language: 'plpgsql',
    },
    `
    DECLARE
      answer_author_id_var integer;
      question_id_var integer;
    BEGIN
      -- Get answer author and question ID
      SELECT author_id, parent_id INTO answer_author_id_var, question_id_var
      FROM content 
      WHERE id = answer_id_param AND type = 'answer';
      
      -- Verify it's an answer
      IF NOT FOUND THEN
        RETURN FALSE;
      END IF;
      
      -- Mark answer as accepted
      UPDATE content 
      SET is_accepted = TRUE 
      WHERE id = answer_id_param;
      
      -- Update reputation for answer author (not if self-answering)
      IF answer_author_id_var != question_author_id_param THEN
        PERFORM update_user_reputation(answer_author_id_var, 15, 'accepted_answer', answer_id_param);
      END IF;
      
      RETURN TRUE;
    END;
    `
  );

  // Create function to check if a user has a specific privilege
  pgm.createFunction(
    'user_has_privilege',
    ['user_id_param integer', 'privilege_param text'],
    {
      returns: 'boolean',
      language: 'plpgsql',
    },
    `
    DECLARE
      user_reputation integer;
      required_reputation integer;
    BEGIN
      -- Get user's reputation
      SELECT reputation INTO user_reputation 
      FROM users 
      WHERE id = user_id_param;
      
      -- Set required reputation based on privilege
      CASE privilege_param
        WHEN 'create_post' THEN required_reputation := 1;
        WHEN 'comment' THEN required_reputation := 50;
        WHEN 'upvote' THEN required_reputation := 15;
        WHEN 'downvote' THEN required_reputation := 125;
        WHEN 'flag_content' THEN required_reputation := 50;
        WHEN 'edit_others' THEN required_reputation := 1000;
        WHEN 'moderation_tools' THEN required_reputation := 2000;
        WHEN 'trusted_user' THEN required_reputation := 5000;
        ELSE required_reputation := 999999; -- Default high value for unknown privileges
      END CASE;
      
      RETURN user_reputation >= required_reputation;
    END;
    `
  );

  // Add triggers for updating timestamps
  const timestampTables = [
    'users',
    'topics',
    'tags',
    'content',
    'tools',
    'tool_reviews',
    'user_settings',
  ];

  timestampTables.forEach(table => {
    pgm.createTrigger(table, 'update_timestamp_trigger', {
      when: 'BEFORE',
      operation: 'UPDATE',
      level: 'ROW',
      function: 'update_timestamp',
    });
  });

  // Create function for generating content search vectors
  pgm.createFunction(
    'update_content_search_vectors',
    [],
    {
      returns: 'trigger',
      language: 'plpgsql',
    },
    `
    BEGIN
      -- This function would call an external embedding service in production
      -- For now, we'll leave it as a placeholder
      -- In a real implementation, this would generate embeddings from the content
      
      -- NEW.body_vector = ...; (would be set by embedding service)
      
      RETURN NEW;
    END;
    `
  );

  // Add trigger for content search vectors
  pgm.createTrigger('content', 'content_search_vector_trigger', {
    when: 'BEFORE',
    operation: 'INSERT OR UPDATE',
    level: 'ROW',
    function: 'update_content_search_vectors',
  });

  // Create function for generating tool search vectors
  pgm.createFunction(
    'update_tool_search_vectors',
    [],
    {
      returns: 'trigger',
      language: 'plpgsql',
    },
    `
    BEGIN
      -- This function would call an external embedding service in production
      -- For now, we'll leave it as a placeholder
      -- In a real implementation, this would generate embeddings from the description
      
      -- NEW.description_vector = ...; (would be set by embedding service)
      
      RETURN NEW;
    END;
    `
  );

  // Add trigger for tool search vectors
  pgm.createTrigger('tools', 'tool_search_vector_trigger', {
    when: 'BEFORE',
    operation: 'INSERT OR UPDATE',
    level: 'ROW',
    function: 'update_tool_search_vectors',
  });
};

exports.down = (pgm) => {
  // Drop triggers
  const timestampTables = [
    'users',
    'topics',
    'tags',
    'content',
    'tools',
    'tool_reviews',
    'user_settings',
  ];

  timestampTables.forEach(table => {
    pgm.dropTrigger(table, 'update_timestamp_trigger', { ifExists: true });
  });

  pgm.dropTrigger('content', 'content_search_vector_trigger', { ifExists: true });
  pgm.dropTrigger('tools', 'tool_search_vector_trigger', { ifExists: true });

  // Drop functions
  pgm.dropFunction('update_timestamp', [], { ifExists: true });
  pgm.dropFunction('update_counter', ['text', 'text', 'integer', 'text', 'integer'], { ifExists: true });
  pgm.dropFunction('update_user_reputation', ['integer', 'integer', 'text', 'integer'], { ifExists: true });
  pgm.dropFunction('handle_content_vote', ['integer', 'integer', 'smallint'], { ifExists: true });
  pgm.dropFunction('accept_answer', ['integer', 'integer'], { ifExists: true });
  pgm.dropFunction('user_has_privilege', ['integer', 'text'], { ifExists: true });
  pgm.dropFunction('update_content_search_vectors', [], { ifExists: true });
  pgm.dropFunction('update_tool_search_vectors', [], { ifExists: true });
};