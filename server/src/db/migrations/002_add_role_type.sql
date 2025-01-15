-- Add any additional role-related changes here
-- For example, adding new role types or role-related constraints

-- Ensure all existing users have a valid role
UPDATE users SET role = 'user' WHERE role IS NULL; 