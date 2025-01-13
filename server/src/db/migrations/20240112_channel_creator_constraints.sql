-- Migration: Add Channel Creator Constraints
-- Specification: CH-F-001

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_channels_type ON channels(type);
CREATE INDEX IF NOT EXISTS idx_channels_created_at ON channels(created_at);
CREATE INDEX IF NOT EXISTS idx_channel_members_dm_lookup
ON channel_members (channel_id, user_id)
WHERE deleted_at IS NULL;

-- Down Migration
/*
DROP INDEX IF EXISTS idx_channels_type;
DROP INDEX IF EXISTS idx_channels_created_at;
DROP INDEX IF EXISTS idx_channel_members_dm_lookup;
*/ 