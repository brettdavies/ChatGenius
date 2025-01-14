-- Initial seed data for ChatGenius

-- Cleanup existing data
TRUNCATE TABLE user_status, user_settings, messages, channel_members, channels, users CASCADE;

-- Test Users
INSERT INTO users (id, auth0_id, email, username, full_name, avatar_url)
VALUES 
  ('01JHD76X6J0C4H8PF2V09SWA9A', 'auth0|6780c27612d2763043705c92', 'test1@example.com', 'testuser1', 'Test User 1', NULL),
  ('01HQ7GZDK9YRWF5TZPR8X6C7MR', 'auth0|test2', 'test2@example.com', 'testuser2', 'Test User 2', NULL),
  ('01HQ7GZDK9YRWF5TZPR8X6C7MS', 'auth0|test3', 'test3@example.com', 'testuser3', 'Test User 3', NULL);

-- General Channel
INSERT INTO channels (id, name, description, type, created_by)
VALUES (
  '01HQ7GZDK9YRWF5TZPR8X6C7MT',
  'general',
  'General discussion channel',
  'public',
  '01JHD76X6J0C4H8PF2V09SWA9A'
);

-- Channel Memberships
INSERT INTO channel_members (id, channel_id, user_id, role)
VALUES 
  ('01HQ7GZDK9YRWF5TZPR8X6C7MU', '01HQ7GZDK9YRWF5TZPR8X6C7MT', '01JHD76X6J0C4H8PF2V09SWA9A', 'owner'),
  ('01HQ7GZDK9YRWF5TZPR8X6C7MV', '01HQ7GZDK9YRWF5TZPR8X6C7MT', '01HQ7GZDK9YRWF5TZPR8X6C7MR', 'member'),
  ('01HQ7GZDK9YRWF5TZPR8X6C7MW', '01HQ7GZDK9YRWF5TZPR8X6C7MT', '01HQ7GZDK9YRWF5TZPR8X6C7MS', 'member');

-- Initial Messages
INSERT INTO messages (id, channel_id, user_id, content)
VALUES 
  ('01HQ7GZDK9YRWF5TZPR8X6C7MX', '01HQ7GZDK9YRWF5TZPR8X6C7MT', '01JHD76X6J0C4H8PF2V09SWA9A', 'Welcome to ChatGenius! 👋'),
  ('01HQ7GZDK9YRWF5TZPR8X6C7MY', '01HQ7GZDK9YRWF5TZPR8X6C7MT', '01HQ7GZDK9YRWF5TZPR8X6C7MR', 'Thanks for having me here!');

-- User Settings (default preferences)
INSERT INTO user_settings (id, user_id, theme, notifications, offline_sync)
VALUES 
  ('01HQ7GZDK9YRWF5TZPR8X6C7MZ', '01JHD76X6J0C4H8PF2V09SWA9A', 'light', '{"enabled": true, "email": true}', '{"file_sync_days":7,"message_sync_days":7}'),
  ('01HQ7GZDK9YRWF5TZPR8X6C7N0', '01HQ7GZDK9YRWF5TZPR8X6C7MR', 'light', '{"enabled": true, "email": true}', '{"file_sync_days":7,"message_sync_days":7}'),
  ('01HQ7GZDK9YRWF5TZPR8X6C7N1', '01HQ7GZDK9YRWF5TZPR8X6C7MS', 'light', '{"enabled": true, "email": true}', '{"file_sync_days":7,"message_sync_days":7}');

-- Initial User Status
INSERT INTO user_status (id, user_id, presence, status_text)
VALUES 
  ('01HQ7GZDK9YRWF5TZPR8X6C7N2', '01JHD76X6J0C4H8PF2V09SWA9A', 'online', NULL),
  ('01HQ7GZDK9YRWF5TZPR8X6C7N3', '01HQ7GZDK9YRWF5TZPR8X6C7MR', 'online', NULL),
  ('01HQ7GZDK9YRWF5TZPR8X6C7N4', '01HQ7GZDK9YRWF5TZPR8X6C7MS', 'online', NULL); 