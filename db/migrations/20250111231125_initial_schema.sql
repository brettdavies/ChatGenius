-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";

-- Set timezone to UTC
SET timezone = 'UTC';

-- Utility functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Users table
CREATE TABLE users (
    id VARCHAR(26) PRIMARY KEY,
    auth0_id VARCHAR(128) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_auth0_id ON users(auth0_id);
CREATE INDEX idx_users_username ON users(username);

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Channels table
CREATE TABLE channels (
    id VARCHAR(26) PRIMARY KEY,
    name VARCHAR(80) NOT NULL,
    topic TEXT,
    type VARCHAR(20) NOT NULL CHECK (type IN ('public', 'private', 'dm')),
    created_by VARCHAR(26) NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_channels_name ON channels(name);
CREATE INDEX idx_channels_type ON channels(type);
CREATE INDEX idx_channels_created_by ON channels(created_by);

CREATE TRIGGER update_channels_updated_at
    BEFORE UPDATE ON channels
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Messages table
CREATE TABLE messages (
    id VARCHAR(26) PRIMARY KEY,
    channel_id VARCHAR(26) NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    user_id VARCHAR(26) NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    content TEXT NOT NULL,
    thread_id VARCHAR(26) REFERENCES messages(id) ON DELETE CASCADE,
    edited BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_messages_channel_id ON messages(channel_id);
CREATE INDEX idx_messages_user_id ON messages(user_id);
CREATE INDEX idx_messages_thread_id ON messages(thread_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

CREATE TRIGGER update_messages_updated_at
    BEFORE UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Reactions table
CREATE TABLE reactions (
    id VARCHAR(26) PRIMARY KEY,
    message_id VARCHAR(26) NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    user_id VARCHAR(26) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    emoji VARCHAR(32) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reactions_message_id ON reactions(message_id);
CREATE INDEX idx_reactions_user_id ON reactions(user_id);
CREATE INDEX idx_reactions_emoji ON reactions(emoji);

-- Channel Members table
CREATE TABLE channel_members (
    id VARCHAR(26) PRIMARY KEY,
    channel_id VARCHAR(26) NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    user_id VARCHAR(26) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_channel_members_channel_id ON channel_members(channel_id);
CREATE INDEX idx_channel_members_user_id ON channel_members(user_id);
CREATE INDEX idx_channel_members_role ON channel_members(role);

CREATE TRIGGER update_channel_members_updated_at
    BEFORE UPDATE ON channel_members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Files table
CREATE TABLE files (
    id VARCHAR(26) PRIMARY KEY,
    message_id VARCHAR(26) NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    user_id VARCHAR(26) NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    size BIGINT NOT NULL,
    url TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_files_user_id ON files(user_id);
CREATE INDEX idx_files_message_id ON files(message_id);
CREATE INDEX idx_files_type ON files(type);

CREATE TRIGGER update_files_updated_at
    BEFORE UPDATE ON files
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

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

CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);

CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON user_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- User Status table
CREATE TABLE user_status (
    id VARCHAR(26) PRIMARY KEY,
    user_id VARCHAR(26) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    presence VARCHAR(20) NOT NULL CHECK (presence IN ('online', 'away', 'offline')) DEFAULT 'offline',
    status_text VARCHAR(100),
    status_emoji VARCHAR(32),
    status_expiry TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_status_user_id ON user_status(user_id);
CREATE INDEX idx_user_status_presence ON user_status(presence);

CREATE TRIGGER update_user_status_updated_at
    BEFORE UPDATE ON user_status
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Message Reads table
CREATE TABLE message_reads (
    id VARCHAR(26) PRIMARY KEY,
    user_id VARCHAR(26) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    channel_id VARCHAR(26) NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    last_read_message_id VARCHAR(26) NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_message_reads_user_id ON message_reads(user_id);
CREATE INDEX idx_message_reads_channel_id ON message_reads(channel_id);
CREATE INDEX idx_message_reads_last_read_message_id ON message_reads(last_read_message_id);

CREATE TRIGGER update_message_reads_updated_at
    BEFORE UPDATE ON message_reads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Sync State table
CREATE TABLE sync_state (
    id VARCHAR(26) PRIMARY KEY,
    user_id VARCHAR(26) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    channel_id VARCHAR(26) NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    last_synced_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    sync_type VARCHAR(20) NOT NULL CHECK (sync_type IN ('messages', 'files', 'reactions')),
    sync_status VARCHAR(20) NOT NULL CHECK (sync_status IN ('pending', 'complete', 'error')) DEFAULT 'pending',
    error_details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sync_state_user_id ON sync_state(user_id);
CREATE INDEX idx_sync_state_channel_id ON sync_state(channel_id);
CREATE INDEX idx_sync_state_last_synced_at ON sync_state(last_synced_at);

CREATE TRIGGER update_sync_state_updated_at
    BEFORE UPDATE ON sync_state
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 