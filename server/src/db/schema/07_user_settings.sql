-- User Settings table
CREATE TABLE user_settings (
    id VARCHAR(26) PRIMARY KEY,
    user_id VARCHAR(26) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    theme VARCHAR(20) NOT NULL CHECK (theme IN ('light', 'dark')) DEFAULT 'light',
    notifications JSONB NOT NULL DEFAULT '{}',
    muted_channels VARCHAR(26)[] DEFAULT NULL,
    offline_sync JSONB NOT NULL DEFAULT '{"file_sync_days":7,"message_sync_days":7}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);

-- Triggers
CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON user_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 