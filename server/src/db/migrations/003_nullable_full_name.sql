DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'full_name'
    ) THEN
        ALTER TABLE users ALTER COLUMN full_name DROP NOT NULL;
    END IF;
END $$; 