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