-- Begin transaction
BEGIN;

-- Clean existing data
DELETE FROM messages;
DELETE FROM channel_members;
DELETE FROM channels;
DELETE FROM users;

-- Sample Users
INSERT INTO users (id, username, email, password, role, totp_enabled, totp_secret, backup_codes, totp_verified_at, avatar_url) VALUES
  ('01HKXGQ8FJ8MSQKZ6BT5JWVP01', 'sarah', 'sarah@example.com', '$2a$10$9FqItXxnkoICTOQ5p8yqUe8K3N6PVvW.8KSgRoryHjqeDuoQY1j2e', 'admin', false, NULL, ARRAY[]::TEXT[], NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah'),
  ('01HKXGQ8FJ8MSQKZ6BT5JWVP02', 'alex', 'alex@example.com', '$2a$10$9FqItXxnkoICTOQ5p8yqUe8K3N6PVvW.8KSgRoryHjqeDuoQY1j2e', 'admin', false, NULL, ARRAY[]::TEXT[], NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex'),
  ('01HKXGQ8FJ8MSQKZ6BT5JWVP03', 'maya', 'maya@example.com', '$2a$10$9FqItXxnkoICTOQ5p8yqUe8K3N6PVvW.8KSgRoryHjqeDuoQY1j2e', 'admin', false, NULL, ARRAY[]::TEXT[], NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=maya');

-- Sample Channels
INSERT INTO channels (id, name, type, description, created_by, created_at, updated_at) VALUES
  ('01HKXGQ8FJ8MSQKZ6BT5JWVP04', 'general', 'public', 'General discussion channel', '01HKXGQ8FJ8MSQKZ6BT5JWVP01', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('01HKXGQ8FJ8MSQKZ6BT5JWVP05', 'random', 'public', 'Random discussions and fun stuff', '01HKXGQ8FJ8MSQKZ6BT5JWVP01', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Channel Members (add all users to both channels)
INSERT INTO channel_members (id, channel_id, user_id, role, created_at, updated_at) VALUES
  -- General channel members
  ('01HKXGQ8FJ8MSQKZ6BT5JWVP06', '01HKXGQ8FJ8MSQKZ6BT5JWVP04', '01HKXGQ8FJ8MSQKZ6BT5JWVP01', 'owner', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('01HKXGQ8FJ8MSQKZ6BT5JWVP07', '01HKXGQ8FJ8MSQKZ6BT5JWVP04', '01HKXGQ8FJ8MSQKZ6BT5JWVP02', 'member', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('01HKXGQ8FJ8MSQKZ6BT5JWVP08', '01HKXGQ8FJ8MSQKZ6BT5JWVP04', '01HKXGQ8FJ8MSQKZ6BT5JWVP03', 'member', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  -- Random channel members
  ('01HKXGQ8FJ8MSQKZ6BT5JWVP09', '01HKXGQ8FJ8MSQKZ6BT5JWVP05', '01HKXGQ8FJ8MSQKZ6BT5JWVP01', 'owner', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('01HKXGQ8FJ8MSQKZ6BT5JWVP0A', '01HKXGQ8FJ8MSQKZ6BT5JWVP05', '01HKXGQ8FJ8MSQKZ6BT5JWVP02', 'member', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('01HKXGQ8FJ8MSQKZ6BT5JWVP0B', '01HKXGQ8FJ8MSQKZ6BT5JWVP05', '01HKXGQ8FJ8MSQKZ6BT5JWVP03', 'member', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Messages in general channel
INSERT INTO messages (id, channel_id, user_id, content, edited, created_at, updated_at) VALUES
  ('01HKXGQ8FJ8MSQKZ6BT5JWVP0C', '01HKXGQ8FJ8MSQKZ6BT5JWVP04', '01HKXGQ8FJ8MSQKZ6BT5JWVP01', 
   '👋 Hey everyone! Just joined the team and excited to get started!', 
   false, CURRENT_TIMESTAMP - INTERVAL '1 hour', CURRENT_TIMESTAMP - INTERVAL '1 hour'),
   
  ('01HKXGQ8FJ8MSQKZ6BT5JWVP0D', '01HKXGQ8FJ8MSQKZ6BT5JWVP04', '01HKXGQ8FJ8MSQKZ6BT5JWVP02', 
   'Welcome @Sarah! Great to have you on board. Let me know if you need any help getting set up.', 
   false, CURRENT_TIMESTAMP - INTERVAL '55 minutes', CURRENT_TIMESTAMP - INTERVAL '55 minutes'),
   
  ('01HKXGQ8FJ8MSQKZ6BT5JWVP0E', '01HKXGQ8FJ8MSQKZ6BT5JWVP04', '01HKXGQ8FJ8MSQKZ6BT5JWVP01', 
   'Thanks @Alex! 😊 I was wondering if someone could point me to the documentation for our current sprint?', 
   false, CURRENT_TIMESTAMP - INTERVAL '50 minutes', CURRENT_TIMESTAMP - INTERVAL '50 minutes'),
   
  ('01HKXGQ8FJ8MSQKZ6BT5JWVP0F', '01HKXGQ8FJ8MSQKZ6BT5JWVP04', '01HKXGQ8FJ8MSQKZ6BT5JWVP03', 
   'I can help with that! Check out the #resources channel - I''ve pinned all the important docs there.', 
   false, CURRENT_TIMESTAMP - INTERVAL '45 minutes', CURRENT_TIMESTAMP - INTERVAL '45 minutes'),
   
  ('01HKXGQ8FJ8MSQKZ6BT5JWVP0G', '01HKXGQ8FJ8MSQKZ6BT5JWVP04', '01HKXGQ8FJ8MSQKZ6BT5JWVP01', 
   'Perfect, thanks @Maya! 🙌', 
   false, CURRENT_TIMESTAMP - INTERVAL '40 minutes', CURRENT_TIMESTAMP - INTERVAL '40 minutes');

-- Messages with reactions
INSERT INTO messages (id, channel_id, user_id, content, reactions, edited, created_at, updated_at) VALUES
  ('01HKXGQ8FJ8MSQKZ6BT5JWVP0H', '01HKXGQ8FJ8MSQKZ6BT5JWVP04', '01HKXGQ8FJ8MSQKZ6BT5JWVP02', 
   'Hey team! I''ve just updated our [getting started guide](https://docs.example.com/getting-started). Take a look when you have a chance! 📚',
   '{"👍": ["01HKXGQ8FJ8MSQKZ6BT5JWVP01", "01HKXGQ8FJ8MSQKZ6BT5JWVP03"], "🎉": ["01HKXGQ8FJ8MSQKZ6BT5JWVP01"]}',
   false, CURRENT_TIMESTAMP - INTERVAL '35 minutes', CURRENT_TIMESTAMP - INTERVAL '35 minutes'),
   
  ('01HKXGQ8FJ8MSQKZ6BT5JWVP0I', '01HKXGQ8FJ8MSQKZ6BT5JWVP04', '01HKXGQ8FJ8MSQKZ6BT5JWVP03', 
   '**Important announcement:** We''ll be upgrading our servers this weekend. Check #maintenance for the detailed schedule.',
   '{"👀": ["01HKXGQ8FJ8MSQKZ6BT5JWVP01", "01HKXGQ8FJ8MSQKZ6BT5JWVP02"]}',
   false, CURRENT_TIMESTAMP - INTERVAL '30 minutes', CURRENT_TIMESTAMP - INTERVAL '30 minutes');

-- Thread messages
INSERT INTO messages (id, channel_id, user_id, content, thread_id, reactions, edited, created_at, updated_at) VALUES
  ('01HKXGQ8FJ8MSQKZ6BT5JWVP0J', '01HKXGQ8FJ8MSQKZ6BT5JWVP04', '01HKXGQ8FJ8MSQKZ6BT5JWVP01', 
   'Great work! I especially like the new `quickstart` section. @Maya, could you review the API examples?',
   '01HKXGQ8FJ8MSQKZ6BT5JWVP0H',
   '{"💡": ["01HKXGQ8FJ8MSQKZ6BT5JWVP02"]}',
   false, CURRENT_TIMESTAMP - INTERVAL '32 minutes', CURRENT_TIMESTAMP - INTERVAL '32 minutes'),
   
  ('01HKXGQ8FJ8MSQKZ6BT5JWVP0K', '01HKXGQ8FJ8MSQKZ6BT5JWVP04', '01HKXGQ8FJ8MSQKZ6BT5JWVP03', 
   'Sure! I''ll take a look. By the way, here''s a useful tip:\n```typescript\nconst api = new API({\n  endpoint: "api.example.com",\n  version: "v2"\n});\n```',
   '01HKXGQ8FJ8MSQKZ6BT5JWVP0H',
   '{"🙏": ["01HKXGQ8FJ8MSQKZ6BT5JWVP01"]}',
   false, CURRENT_TIMESTAMP - INTERVAL '30 minutes', CURRENT_TIMESTAMP - INTERVAL '30 minutes');

-- Messages in random channel
INSERT INTO messages (id, channel_id, user_id, content, edited, created_at, updated_at) VALUES
  ('01HKXGQ8FJ8MSQKZ6BT5JWVP0L', '01HKXGQ8FJ8MSQKZ6BT5JWVP05', '01HKXGQ8FJ8MSQKZ6BT5JWVP02', 
   '🎉 Anyone up for a virtual coffee chat?', 
   false, CURRENT_TIMESTAMP - INTERVAL '30 minutes', CURRENT_TIMESTAMP - INTERVAL '30 minutes'),
   
  ('01HKXGQ8FJ8MSQKZ6BT5JWVP0M', '01HKXGQ8FJ8MSQKZ6BT5JWVP05', '01HKXGQ8FJ8MSQKZ6BT5JWVP03', 
   'Count me in! ☕️', 
   false, CURRENT_TIMESTAMP - INTERVAL '25 minutes', CURRENT_TIMESTAMP - INTERVAL '25 minutes');

-- Messages with reactions in random channel
INSERT INTO messages (id, channel_id, user_id, content, reactions, edited, created_at, updated_at) VALUES
  ('01HKXGQ8FJ8MSQKZ6BT5JWVP0N', '01HKXGQ8FJ8MSQKZ6BT5JWVP05', '01HKXGQ8FJ8MSQKZ6BT5JWVP01', 
   'Just found this amazing article about AI: [2024 AI Trends](https://example.com/ai-trends)\n\nKey points:\n- Advancement in LLMs\n- Multimodal AI\n- Edge Computing',
   '{"🤖": ["01HKXGQ8FJ8MSQKZ6BT5JWVP02"], "🔥": ["01HKXGQ8FJ8MSQKZ6BT5JWVP03"]}',
   false, CURRENT_TIMESTAMP - INTERVAL '20 minutes', CURRENT_TIMESTAMP - INTERVAL '20 minutes'),
   
  ('01HKXGQ8FJ8MSQKZ6BT5JWVP0O', '01HKXGQ8FJ8MSQKZ6BT5JWVP05', '01HKXGQ8FJ8MSQKZ6BT5JWVP03', 
   '🎨 Check out this AI art I generated!\n![AI Art](https://example.com/ai-art.png)\n*Generated using Stable Diffusion*',
   '{"🎨": ["01HKXGQ8FJ8MSQKZ6BT5JWVP01", "01HKXGQ8FJ8MSQKZ6BT5JWVP02"], "🤖": ["01HKXGQ8FJ8MSQKZ6BT5JWVP01"], "😍": ["01HKXGQ8FJ8MSQKZ6BT5JWVP02"]}',
   false, CURRENT_TIMESTAMP - INTERVAL '15 minutes', CURRENT_TIMESTAMP - INTERVAL '15 minutes');

-- Thread messages in random channel
INSERT INTO messages (id, channel_id, user_id, content, thread_id, reactions, edited, created_at, updated_at) VALUES
  ('01HKXGQ8FJ8MSQKZ6BT5JWVP0P', '01HKXGQ8FJ8MSQKZ6BT5JWVP05', '01HKXGQ8FJ8MSQKZ6BT5JWVP02', 
   'Fascinating article! The part about *multimodal AI* reminds me of our discussion in #ai-projects last week.',
   '01HKXGQ8FJ8MSQKZ6BT5JWVP0N',
   '{}',
   false, CURRENT_TIMESTAMP - INTERVAL '18 minutes', CURRENT_TIMESTAMP - INTERVAL '18 minutes'),
   
  ('01HKXGQ8FJ8MSQKZ6BT5JWVP0Q', '01HKXGQ8FJ8MSQKZ6BT5JWVP05', '01HKXGQ8FJ8MSQKZ6BT5JWVP03', 
   '@Alex We should definitely incorporate some of these ideas into our roadmap! I''ve created a [task](https://example.com/tasks/123) to track this.',
   '01HKXGQ8FJ8MSQKZ6BT5JWVP0N',
   '{"💪": ["01HKXGQ8FJ8MSQKZ6BT5JWVP01", "01HKXGQ8FJ8MSQKZ6BT5JWVP02"]}',
   false, CURRENT_TIMESTAMP - INTERVAL '16 minutes', CURRENT_TIMESTAMP - INTERVAL '16 minutes');

COMMIT; 