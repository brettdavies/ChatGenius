-- Make full_name column nullable
ALTER TABLE users 
  ALTER COLUMN full_name DROP NOT NULL; 