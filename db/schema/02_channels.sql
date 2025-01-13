-- Channels table
CREATE TABLE channels (
    id VARCHAR(26) PRIMARY KEY,
    name VARCHAR(80) NOT NULL,
    description TEXT,
    type VARCHAR(20) NOT NULL CHECK (type IN ('public', 'private', 'dm')),
    created_by VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    archived_at TIMESTAMPTZ,
    archived_by VARCHAR(50) REFERENCES users(id),
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