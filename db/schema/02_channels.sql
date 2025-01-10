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

-- Indexes
CREATE INDEX idx_channels_name ON channels(name);
CREATE INDEX idx_channels_type ON channels(type);
CREATE INDEX idx_channels_created_by ON channels(created_by);

-- Triggers
CREATE TRIGGER update_channels_updated_at
    BEFORE UPDATE ON channels
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 