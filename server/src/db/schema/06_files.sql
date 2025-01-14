-- Files table
CREATE TABLE files (
    id VARCHAR(26) PRIMARY KEY,
    message_id VARCHAR(26) NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    user_id VARCHAR(26) NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    size BIGINT NOT NULL,
    url TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_files_user_id ON files(user_id);
CREATE INDEX idx_files_message_id ON files(message_id);
CREATE INDEX idx_files_type ON files(type);

-- Triggers
CREATE TRIGGER update_files_updated_at
    BEFORE UPDATE ON files
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up storage on file deletion
CREATE OR REPLACE FUNCTION cleanup_file_storage()
RETURNS TRIGGER AS $$
BEGIN
    -- Note: Implement actual storage cleanup logic here
    -- This is a placeholder for the cleanup implementation
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cleanup_deleted_file
    AFTER DELETE ON files
    FOR EACH ROW
    EXECUTE FUNCTION cleanup_file_storage(); 