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