-- Add TOTP columns to users table
ALTER TABLE users
ADD COLUMN totp_secret TEXT,
ADD COLUMN totp_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN backup_codes TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN totp_verified_at TIMESTAMPTZ; 