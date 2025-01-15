CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMP WITH TIME ZONE,
    revoked_reason VARCHAR(255),
    CONSTRAINT refresh_tokens_token_key UNIQUE (token)
);

-- Index for looking up tokens
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);

-- Index for finding user's tokens
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);

-- Index for cleanup of expired tokens
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

COMMENT ON TABLE refresh_tokens IS 'Stores refresh tokens for JWT authentication';
COMMENT ON COLUMN refresh_tokens.id IS 'Unique identifier for the refresh token';
COMMENT ON COLUMN refresh_tokens.user_id IS 'Reference to the user this token belongs to';
COMMENT ON COLUMN refresh_tokens.token IS 'The actual refresh token string';
COMMENT ON COLUMN refresh_tokens.expires_at IS 'When this refresh token expires';
COMMENT ON COLUMN refresh_tokens.created_at IS 'When this refresh token was created';
COMMENT ON COLUMN refresh_tokens.revoked_at IS 'When this refresh token was revoked (if it was)';
COMMENT ON COLUMN refresh_tokens.revoked_reason IS 'Why this refresh token was revoked'; 