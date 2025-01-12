# Database Management

This directory contains database schema definitions and migration files for the ChatGenius application. The database is now hosted on Supabase.

## Directory Structure

- `/schema` - SQL schema files defining the database structure
- `/migrations` - Historical migration files
- `/seeds` - Seed data for development/testing
- `/backups` - Database backup files

## Working with Supabase

### Prerequisites
- Install Supabase CLI: `brew install supabase/tap/supabase`
- Docker Desktop must be running for local development

### Common Commands

```bash
# Link to Supabase project
supabase link --project-ref your-project-ref

# Pull current schema
supabase db pull

# Push schema changes
supabase db push

# Start local development
supabase start

# View database changes
supabase db diff
```

### Schema Management

The database schema is now managed through Supabase migrations. The `/schema` directory is kept for reference and documentation purposes.

For any schema changes:
1. Make changes through Supabase Dashboard or local migrations
2. Pull the updated schema: `supabase db pull`
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
