-- Auto-generated from schema files
-- Generated on Tue Jan 14 14:25:35 PST 2025

-- Including 00_init.sql

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";

-- Set timezone to UTC
SET timezone = 'UTC'; 

-- Including 01_users.sql

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

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_auth0_id ON users(auth0_id);
CREATE INDEX idx_users_username ON users(username);

-- Triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 

-- Including 02_channels.sql

-- Channels table
CREATE TABLE channels (
    id VARCHAR(26) PRIMARY KEY,
    name VARCHAR(80) NOT NULL,
    description TEXT,
    type VARCHAR(20) NOT NULL CHECK (type IN ('public', 'private', 'dm')),
    created_by VARCHAR(26) NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    archived_at TIMESTAMPTZ,
    archived_by VARCHAR(26) REFERENCES users(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_channels_name ON channels(name);
CREATE INDEX idx_channels_type ON channels(type);
CREATE INDEX idx_channels_created_by ON channels(created_by);
CREATE INDEX idx_channels_archived_at ON channels(archived_at) WHERE archived_at IS NULL;

-- Triggers
CREATE TRIGGER update_channels_updated_at
    BEFORE UPDATE ON channels
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add trigger to prevent updates to archived channels
CREATE OR REPLACE FUNCTION prevent_archived_channel_updates()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.archived_at IS NOT NULL THEN
    RAISE EXCEPTION 'Cannot modify archived channel';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_archived_channel_updates
    BEFORE UPDATE ON channels
    FOR EACH ROW
    EXECUTE FUNCTION prevent_archived_channel_updates(); 

-- Including 03_messages.sql

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

-- Indexes
CREATE INDEX idx_messages_channel_id ON messages(channel_id);
CREATE INDEX idx_messages_user_id ON messages(user_id);
CREATE INDEX idx_messages_thread_id ON messages(thread_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- Triggers
CREATE TRIGGER update_messages_updated_at
    BEFORE UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Notification function for real-time updates
CREATE OR REPLACE FUNCTION notify_message_change()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM pg_notify(
        'message_change',
        json_build_object(
            'operation', TG_OP,
            'record', row_to_json(NEW)
        )::text
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for real-time notifications
CREATE TRIGGER notify_message_insert
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION notify_message_change();

CREATE TRIGGER notify_message_update
    AFTER UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION notify_message_change(); 

-- Including 04_reactions.sql

-- Reactions table
CREATE TABLE reactions (
    id VARCHAR(26) PRIMARY KEY,
    message_id VARCHAR(26) NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    user_id VARCHAR(26) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    emoji VARCHAR(32) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_reactions_message_id ON reactions(message_id);
CREATE INDEX idx_reactions_user_id ON reactions(user_id);
CREATE INDEX idx_reactions_emoji ON reactions(emoji);

-- Notification function for real-time updates
CREATE OR REPLACE FUNCTION notify_reaction_change()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM pg_notify(
        'reaction_change',
        json_build_object(
            'operation', TG_OP,
            'record', row_to_json(NEW)
        )::text
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for real-time notifications
CREATE TRIGGER notify_reaction_insert
    AFTER INSERT ON reactions
    FOR EACH ROW
    EXECUTE FUNCTION notify_reaction_change();

CREATE TRIGGER notify_reaction_delete
    AFTER DELETE ON reactions
    FOR EACH ROW
    EXECUTE FUNCTION notify_reaction_change(); 

-- Including 05_channel_members.sql

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

-- Indexes
CREATE INDEX idx_channel_members_channel_id ON channel_members(channel_id);
CREATE INDEX idx_channel_members_user_id ON channel_members(user_id);
CREATE INDEX idx_channel_members_role ON channel_members(role);

-- Triggers
CREATE TRIGGER update_channel_members_updated_at
    BEFORE UPDATE ON channel_members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Notification function for real-time updates
CREATE OR REPLACE FUNCTION notify_channel_member_change()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM pg_notify(
        'channel_member_change',
        json_build_object(
            'operation', TG_OP,
            'record', row_to_json(NEW)
        )::text
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for real-time notifications
CREATE TRIGGER notify_channel_member_insert
    AFTER INSERT ON channel_members
    FOR EACH ROW
    EXECUTE FUNCTION notify_channel_member_change();

CREATE TRIGGER notify_channel_member_update
    AFTER UPDATE ON channel_members
    FOR EACH ROW
    EXECUTE FUNCTION notify_channel_member_change();

CREATE TRIGGER notify_channel_member_delete
    AFTER DELETE ON channel_members
    FOR EACH ROW
    EXECUTE FUNCTION notify_channel_member_change(); 

-- Including 06_files.sql

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

-- Indexes
CREATE INDEX idx_files_user_id ON files(user_id);
CREATE INDEX idx_files_message_id ON files(message_id);
CREATE INDEX idx_files_type ON files(type);

-- Triggers
CREATE TRIGGER update_files_updated_at
    BEFORE UPDATE ON files
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up storage on file deletion
CREATE OR REPLACE FUNCTION cleanup_file_storage()
RETURNS TRIGGER AS $$
BEGIN
    -- Note: Implement actual storage cleanup logic here
    -- This is a placeholder for the cleanup implementation
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cleanup_deleted_file
    AFTER DELETE ON files
    FOR EACH ROW
    EXECUTE FUNCTION cleanup_file_storage(); 

-- Including 07_user_settings.sql

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

-- Including 08_user_status.sql

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

-- Indexes
CREATE INDEX idx_user_status_user_id ON user_status(user_id);
CREATE INDEX idx_user_status_presence ON user_status(presence);

-- Triggers
CREATE TRIGGER update_user_status_updated_at
    BEFORE UPDATE ON user_status
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Notification function for real-time updates
CREATE OR REPLACE FUNCTION notify_user_status_change()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM pg_notify(
        'user_status_change',
        json_build_object(
            'operation', TG_OP,
            'record', row_to_json(NEW)
        )::text
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for real-time notifications
CREATE TRIGGER notify_user_status_update
    AFTER UPDATE ON user_status
    FOR EACH ROW
    EXECUTE FUNCTION notify_user_status_change(); 

-- Including 09_message_reads.sql

-- Message Reads table
CREATE TABLE message_reads (
    id VARCHAR(26) PRIMARY KEY,
    user_id VARCHAR(26) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    channel_id VARCHAR(26) NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    last_read_message_id VARCHAR(26) NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_message_reads_user_id ON message_reads(user_id);
CREATE INDEX idx_message_reads_channel_id ON message_reads(channel_id);
CREATE INDEX idx_message_reads_last_read_message_id ON message_reads(last_read_message_id);

-- Triggers
CREATE TRIGGER update_message_reads_updated_at
    BEFORE UPDATE ON message_reads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 

-- Including 10_sync_state.sql

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

-- Indexes
CREATE INDEX idx_sync_state_user_id ON sync_state(user_id);
CREATE INDEX idx_sync_state_channel_id ON sync_state(channel_id);
CREATE INDEX idx_sync_state_last_synced_at ON sync_state(last_synced_at);

-- Triggers
CREATE TRIGGER update_sync_state_updated_at
    BEFORE UPDATE ON sync_state
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 

