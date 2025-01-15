-- Add index on user ID if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_indexes
        WHERE tablename = 'users'
        AND indexname = 'idx_users_id'
    ) THEN
        CREATE INDEX idx_users_id ON users(id);
    END IF;
END
$$;

-- Add index on user ID for any tables referencing users
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_indexes
        WHERE tablename = 'user_settings'
        AND indexname = 'idx_user_settings_user_id'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
    END IF;
END
$$; 