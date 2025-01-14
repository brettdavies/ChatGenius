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