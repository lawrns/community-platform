-- WebAuthn Passkey Authentication Migration

-- Create webauthn_credentials table
CREATE TABLE webauthn_credentials (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  credential_id TEXT NOT NULL UNIQUE,
  public_key TEXT NOT NULL,
  counter BIGINT NOT NULL DEFAULT 0,
  credential_device_type TEXT NOT NULL,
  credential_backed_up BOOLEAN NOT NULL,
  transports TEXT[], -- Array of supported transports
  name TEXT, -- User-friendly credential name
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  last_used_at TIMESTAMP,
  CONSTRAINT webauthn_credentials_user_credential_unique UNIQUE (user_id, credential_id)
);

-- Enable Row Level Security
ALTER TABLE webauthn_credentials ENABLE ROW LEVEL SECURITY;

-- Create security policies
CREATE POLICY webauthn_credentials_select_policy ON webauthn_credentials 
  FOR SELECT 
  USING (auth.uid()::text = (SELECT auth_provider_id FROM users WHERE id = user_id));

CREATE POLICY webauthn_credentials_insert_policy ON webauthn_credentials 
  FOR INSERT 
  WITH CHECK (auth.uid()::text = (SELECT auth_provider_id FROM users WHERE id = user_id));

CREATE POLICY webauthn_credentials_update_policy ON webauthn_credentials 
  FOR UPDATE 
  USING (auth.uid()::text = (SELECT auth_provider_id FROM users WHERE id = user_id));

CREATE POLICY webauthn_credentials_delete_policy ON webauthn_credentials 
  FOR DELETE 
  USING (auth.uid()::text = (SELECT auth_provider_id FROM users WHERE id = user_id));

-- Create indexes
CREATE INDEX idx_webauthn_credentials_user_id ON webauthn_credentials(user_id);
CREATE INDEX idx_webauthn_credentials_credential_id ON webauthn_credentials(credential_id);

-- Update users table to add webauthn_enabled flag
ALTER TABLE users ADD COLUMN webauthn_enabled BOOLEAN NOT NULL DEFAULT FALSE;

-- Create function to check if user has webauthn credentials
CREATE OR REPLACE FUNCTION user_has_webauthn_credentials(
  p_user_id INTEGER
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM webauthn_credentials WHERE user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql;

-- Insert some data to metadata table to track this migration
INSERT INTO _metadata (version) VALUES ('1.1.0');