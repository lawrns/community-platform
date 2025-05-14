/**
 * Add trigram similarity extension for tag suggestions
 */

exports.up = (pgm) => {
  // Add pg_trgm extension for similarity matching
  pgm.sql(`
    CREATE EXTENSION IF NOT EXISTS pg_trgm;
  `);

  // Add index for fast similarity search
  pgm.sql(`
    CREATE INDEX IF NOT EXISTS idx_tags_name_trigram ON tags USING gin (name gin_trgm_ops);
  `);

  // Add function to generate tag suggestions
  pgm.sql(`
    CREATE OR REPLACE FUNCTION get_tag_suggestions(input_text TEXT, max_results INTEGER)
    RETURNS TABLE(id INTEGER, name TEXT, similarity FLOAT)
    AS $$
    BEGIN
      RETURN QUERY
      SELECT
        t.id,
        t.name,
        similarity(t.name, input_text) as similarity
      FROM tags t
      WHERE similarity(t.name, input_text) > 0.3
      ORDER BY similarity DESC
      LIMIT max_results;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // Add function to enforce tag limit per content
  pgm.sql(`
    CREATE OR REPLACE FUNCTION enforce_tag_limit()
    RETURNS TRIGGER AS $$
    DECLARE
      tag_count INTEGER;
    BEGIN
      SELECT COUNT(*) INTO tag_count
      FROM content_tags
      WHERE content_id = NEW.content_id;
      
      IF tag_count >= 5 THEN
        RAISE EXCEPTION 'Maximum of 5 tags per content item';
      END IF;
      
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // Add trigger to enforce tag limit
  pgm.sql(`
    CREATE TRIGGER enforce_tag_limit_trigger
    BEFORE INSERT ON content_tags
    FOR EACH ROW
    EXECUTE FUNCTION enforce_tag_limit();
  `);
};

exports.down = (pgm) => {
  // Remove trigger
  pgm.sql(`
    DROP TRIGGER IF EXISTS enforce_tag_limit_trigger ON content_tags;
  `);

  // Remove functions
  pgm.sql(`
    DROP FUNCTION IF EXISTS enforce_tag_limit();
    DROP FUNCTION IF EXISTS get_tag_suggestions(TEXT, INTEGER);
  `);

  // Remove index
  pgm.sql(`
    DROP INDEX IF EXISTS idx_tags_name_trigram;
  `);

  // Note: We don't drop the pg_trgm extension as it might be used by other parts of the system
};