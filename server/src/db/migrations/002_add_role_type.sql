-- Create the role enum type
CREATE TYPE user_role AS ENUM ('user', 'admin');

-- Add role column to users table
ALTER TABLE users 
  DROP COLUMN IF EXISTS role,
  ADD COLUMN role user_role DEFAULT 'user' NOT NULL; 