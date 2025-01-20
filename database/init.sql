-- This file is auto-generated from the schema files in server/src/db/schema

-- Set timezone to UTC for consistent timestamp handling
SET timezone = 'UTC';

-- Drop existing tables if they exist
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS channel_members CASCADE;
DROP TABLE IF EXISTS channels CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;

-- Create update_updated_at_column function (used by multiple tables)
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
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    role VARCHAR(20) DEFAULT 'user' NOT NULL,
    totp_enabled BOOLEAN DEFAULT FALSE,
    totp_secret TEXT,
    backup_codes TEXT[] DEFAULT ARRAY[]::TEXT[],
    totp_verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ
);

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- Users triggers
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

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

-- Channels indexes
CREATE INDEX idx_channels_name ON channels(name);
CREATE INDEX idx_channels_type ON channels(type);
CREATE INDEX idx_channels_created_by ON channels(created_by);
CREATE INDEX idx_channels_archived_at ON channels(archived_at) WHERE archived_at IS NULL;

-- Channels triggers
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

-- Channel Members table
CREATE TABLE channel_members (
    id VARCHAR(26) PRIMARY KEY,
    channel_id VARCHAR(26) NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    user_id VARCHAR(26) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL DEFAULT 'member',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ,
    UNIQUE(channel_id, user_id)
);

-- Channel Members triggers
CREATE TRIGGER update_channel_members_updated_at
    BEFORE UPDATE ON channel_members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Messages table
CREATE TABLE messages (
    id VARCHAR(26) PRIMARY KEY,
    channel_id VARCHAR(26) NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    user_id VARCHAR(26) NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    content TEXT NOT NULL,
    thread_id VARCHAR(26) REFERENCES messages(id) ON DELETE CASCADE,
    reactions JSONB NOT NULL DEFAULT '{}',
    edited BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ
);

-- Messages indexes
CREATE INDEX idx_messages_channel_id ON messages(channel_id);
CREATE INDEX idx_messages_user_id ON messages(user_id);
CREATE INDEX idx_messages_thread_id ON messages(thread_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- Messages triggers
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

-- Sessions table
CREATE TABLE sessions (
    sid varchar NOT NULL COLLATE "default",
    sess json NOT NULL,
    expire timestamp(6) NOT NULL,
    CONSTRAINT sessions_pkey PRIMARY KEY (sid)
);

CREATE INDEX idx_sessions_expire ON sessions (expire);
