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