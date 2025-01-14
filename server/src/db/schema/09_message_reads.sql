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