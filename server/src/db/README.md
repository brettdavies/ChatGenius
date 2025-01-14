# Database Management

This directory contains database schema definitions and migration files for the ChatGenius application. The database is hosted on Railway.

## Directory Structure

- `/backups` - Database backup files
- `/migrations` - Historical migration files
- `/schema` - SQL schema files defining the database structure
- `/seeds` - Seed data for development/testing

### Schema Management

The database schema is now managed through `/server`. The `/schema` directory is kept for reference and documentation purposes.

For any schema changes:

1. Make changes through Railway Dashboard or local migrations
2. Pull the updated schema: [[NOT AVAILABLE]]
3. Commit the new migration files

### Real-time Features

Real-time notifications are handled through Supabase's real-time feature. All tables have `REPLICA IDENTITY FULL` enabled for real-time change tracking.

### Connection Management

Database connections are now managed by Supabase's connection pooling. The connection details can be found in your Supabase project settings.

## Tables

1. `users` - User accounts and profiles
2. `channels` - Chat channels
3. `messages` - Chat messages
4. `reactions` - Message reactions
5. `channel_members` - Channel membership
6. `files` - File metadata
7. `user_settings` - User preferences
8. `user_status` - User online status
9. `message_reads` - Message read receipts
10. `sync_state` - Client sync state
