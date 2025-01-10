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