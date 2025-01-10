# Feature Specification: Database Schema Setup

## Basic Information

- **Feature ID**: DB-F-001
- **Feature Name**: Database Schema Setup
- **Priority**: High
- **Status**: 🟨 In Progress

## Overview

This feature implements the complete PostgreSQL database schema for the ChatGenius application. It includes all necessary tables, indexes, relationships, and triggers required for the chat system. The schema is designed to support real-time messaging, user management, channel organization, and offline capabilities while maintaining data integrity and performance.

## User Stories & Acceptance Criteria

| ID | As a | I want to | So that | Acceptance Criteria |
|----|------|-----------|---------|-------------------|
| US-001 | Developer | To have a complete database schema | I can store and retrieve application data efficiently | - All tables defined with proper columns and types<br>- All relationships established with correct constraints<br>- Indexes created for performance optimization |
| US-002 | Developer | To have proper data integrity constraints | The database maintains consistency | - Foreign key constraints implemented<br>- Check constraints for enums<br>- Not null constraints where appropriate |
| US-003 | Developer | To have real-time notification triggers | The application can handle real-time updates | - NOTIFY triggers for relevant tables<br>- Proper payload formatting<br>- Error handling in triggers |

## Technical Implementation

### Security Requirements

- All timestamps use TIMESTAMPTZ for proper timezone handling
- Soft delete support where appropriate
- No sensitive data stored in plain text
- Proper cascade rules for deletions
- ULID usage for primary keys to prevent sequential ID attacks

### Frontend Changes

[[ Not relevant to this feature ]]

### Backend Changes

```typescript
// Database setup core functionality
interface DatabaseSetup {
  setupDatabase(isTest?: boolean): Promise<{ pool: Pool }>;
}

// Core database operations
async function initializePool(isTest = false) {
  pool = new Pool({
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    host: 'localhost',
    port: 5432,
    database: process.env.POSTGRES_DB
  });

  if (isTest) {
    const client = await pool.connect();
    try {
      await client.query('CREATE SCHEMA IF NOT EXISTS test');
      await client.query('SET search_path TO test');
    } finally {
      client.release();
    }
  }

  return pool;
}

// Schema execution
async function executeSchemaFile(filePath: string, isTest = false) {
  const sql = fs.readFileSync(filePath, 'utf8');
  const client = await pool.connect();
  try {
    if (isTest) {
      await client.query('SET search_path TO test');
    }
    await client.query(sql);
  } finally {
    client.release();
  }
}

// CLI setup with SSH tunnel support
async function main() {
  const tunnel = SSHTunnel.initializeFromEnv();
  try {
    await tunnel.connect();
    await setupDatabase();
  } finally {
    await SSHTunnel.getInstance().disconnect();
    SSHTunnel.resetInstance();
  }
}
```

### Database Changes

```sql
-- Schema initialization
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";

-- Core tables
CREATE TABLE users (
    id VARCHAR(26) PRIMARY KEY,
    auth0_id VARCHAR(128) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    -- Additional columns as defined in schema
);

-- Additional tables and relationships as defined in schema files
-- Indexes, triggers, and constraints as implemented
```

### Configuration

```typescript
interface FeatureConfig {
  development: {
    enableSoftDeletes: true,
    enableNotifications: true,
    sshTunnel: {
      enabled: true,
      keyPath: '~/.ssh/id_rsa',
      maxRetries: 3,
      retryDelay: 1000
    }
  },
  production: {
    enableSoftDeletes: true,
    enableNotifications: true,
    sshTunnel: {
      enabled: true,
      keyPath: '/etc/ssh/private_key',
      maxRetries: 5,
      retryDelay: 2000
    }
  }
}

const required_env_vars = [
  'POSTGRES_HOST=localhost // Database host',
  'POSTGRES_PORT=5432 // Database port',
  'POSTGRES_DB=chatgenius // Database name',
  'POSTGRES_USER=postgres // Database user',
  'POSTGRES_PASSWORD=postgres // Database password',
  'SSH_HOST=remote-host // SSH tunnel host',
  'SSH_USER=tunnel-user // SSH tunnel user',
  'SSH_KEY_PATH=~/.ssh/id_rsa // SSH private key path'
];
```

### Usage Documentation

```typescript
// 1. Basic Setup
// Run the setup script to initialize the database
npm run setup

// 2. Test Environment Setup
// Run the setup script with test schema
npm run setup:test

// 3. Programmatic Usage
import { setupDatabase } from './db-core';
import { SSHTunnel } from './tunnel';

// Initialize tunnel first
const tunnel = SSHTunnel.initializeFromEnv();
await tunnel.connect();

// Then setup database
const { pool } = await setupDatabase();

// For test environment
const { pool: testPool } = await setupDatabase(true);

// 4. Environment Configuration
// Create .env.local file with:
POSTGRES_USER=your_user
POSTGRES_PASSWORD=your_password
POSTGRES_DB=chatgenius
SSH_HOST=your_remote_host
SSH_USER=your_ssh_user
SSH_KEY_PATH=~/.ssh/your_key
```

### Schema Documentation

The following tables are implemented:

1. `users`

   ```sql
   CREATE TABLE users (
       id VARCHAR(26) PRIMARY KEY,
       auth0_id VARCHAR(128) UNIQUE NOT NULL,
       email VARCHAR(255) UNIQUE NOT NULL,
       username VARCHAR(255) NOT NULL,
       full_name VARCHAR(255),
       avatar_url TEXT,
       created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
       deleted_at TIMESTAMPTZ
   );
   ```

2. `channels`

   ```sql
   CREATE TABLE channels (
       id VARCHAR(26) PRIMARY KEY,
       name VARCHAR(255) NOT NULL,
       description TEXT,
       created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
       deleted_at TIMESTAMPTZ
   );
   ```

3. `messages`

   ```sql
   CREATE TABLE messages (
       id VARCHAR(26) PRIMARY KEY,
       channel_id VARCHAR(26) NOT NULL REFERENCES channels(id),
       user_id VARCHAR(26) NOT NULL REFERENCES users(id),
       content TEXT NOT NULL,
       created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
       deleted_at TIMESTAMPTZ,
       metadata JSONB
   );
   ```

4. `channel_members`

   ```sql
   CREATE TABLE channel_members (
       channel_id VARCHAR(26) NOT NULL REFERENCES channels(id),
       user_id VARCHAR(26) NOT NULL REFERENCES users(id),
       role VARCHAR(50) NOT NULL DEFAULT 'member',
       joined_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
       PRIMARY KEY (channel_id, user_id)
   );
   ```

5. `reactions`

   ```sql
   CREATE TABLE reactions (
       id VARCHAR(26) PRIMARY KEY,
       message_id VARCHAR(26) NOT NULL REFERENCES messages(id),
       user_id VARCHAR(26) NOT NULL REFERENCES users(id),
       emoji VARCHAR(50) NOT NULL,
       created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
       UNIQUE(message_id, user_id, emoji)
   );
   ```

6. `files`

   ```sql
   CREATE TABLE files (
       id VARCHAR(26) PRIMARY KEY,
       message_id VARCHAR(26) REFERENCES messages(id),
       name VARCHAR(255) NOT NULL,
       type VARCHAR(100) NOT NULL,
       size BIGINT NOT NULL,
       url TEXT NOT NULL,
       created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
   );
   ```

7. `user_settings`

   ```sql
   CREATE TABLE user_settings (
       user_id VARCHAR(26) PRIMARY KEY REFERENCES users(id),
       theme VARCHAR(50) DEFAULT 'light',
       notifications_enabled BOOLEAN DEFAULT true,
       preferences JSONB DEFAULT '{}'::jsonb
   );
   ```

8. `user_status`

   ```sql
   CREATE TABLE user_status (
       user_id VARCHAR(26) PRIMARY KEY REFERENCES users(id),
       status VARCHAR(50) NOT NULL DEFAULT 'offline',
       last_seen TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
       custom_status TEXT
   );
   ```

9. `message_reads`

   ```sql
   CREATE TABLE message_reads (
       message_id VARCHAR(26) NOT NULL REFERENCES messages(id),
       user_id VARCHAR(26) NOT NULL REFERENCES users(id),
       read_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
       PRIMARY KEY (message_id, user_id)
   );
   ```

10. `sync_state`

    ```sql
    CREATE TABLE sync_state (
        id VARCHAR(26) PRIMARY KEY,
        user_id VARCHAR(26) NOT NULL REFERENCES users(id),
        last_sync TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        sync_type VARCHAR(50) NOT NULL,
        metadata JSONB
    );
    ```

### Error Handling

1. SSH Tunnel Errors

    ```typescript
    try {
    const tunnel = SSHTunnel.initializeFromEnv();
    await tunnel.connect();
    } catch (error) {
    if (error instanceof SSHTunnelError) {
        switch (error.code) {
        case 'ECONNREFUSED':
            console.error('SSH connection refused. Check host and port.');
            break;
        case 'ENOTFOUND':
            console.error('SSH host not found. Check DNS or host address.');
            break;
        case 'ENOENT':
            console.error('SSH key file not found. Check SSH_KEY_PATH.');
            break;
        default:
            console.error('SSH tunnel error:', error.message);
        }
        process.exit(1);
    }
    }
    ```

2. Database Setup Errors

    ```typescript
    try {
    await setupDatabase();
    } catch (error) {
    if (error instanceof DatabaseError) {
        switch (error.code) {
        case '42P04':
            console.error('Database already exists');
            break;
        case '42P07':
            console.error('Schema already exists');
            break;
        case '42501':
            console.error('Insufficient privileges');
            break;
        case '3D000':
            console.error('Database does not exist');
            break;
        default:
            console.error('Database error:', error.message);
        }
    }
    }
    ```

3. Schema Execution Errors

    ```typescript
    try {
    await executeSchemaFile(filePath);
    } catch (error) {
    if (error instanceof DatabaseError) {
        if (error.code === '23505') {
        console.error('Unique constraint violation');
        } else if (error.code === '23503') {
        console.error('Foreign key constraint violation');
        } else {
        console.error('Schema execution error:', error.message);
        }
    }
    }
    ```

4. Recovery Strategies

    ```typescript
    // Retry logic for transient errors
    async function executeWithRetry(operation: () => Promise<void>, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
        await operation();
        return;
        } catch (error) {
        if (attempt === maxRetries) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
    }
    }

    // Usage
    await executeWithRetry(async () => {
    await setupDatabase();
    });
    ```

## Testing Requirements

### Unit Tests

```typescript
describe('Database Schema', () => {
  test('should create all tables successfully', async () => {
    // Test table creation
  });

  test('should enforce foreign key constraints', async () => {
    // Test constraints
  });

  test('should handle soft deletes correctly', async () => {
    // Test soft delete functionality
  });
});
```

### Integration Tests

- Verify all tables are created with correct structure
- Test foreign key constraints
- Validate index creation
- Test trigger functionality
- Verify notification system
- Test data integrity constraints

### E2E Tests

[[ Not relevant to this feature ]]

## Monitoring Requirements

### Logging

```typescript
interface LogFormat {
  timestamp: string;
  correlationId: string;
  level: 'debug' | 'info' | 'warn' | 'error',
  event: 'schema_migration' | 'constraint_violation' | 'trigger_error',
  data?: Record<string, unknown>
}
```

### Metrics

```typescript
interface Metrics {
  performance: {
    queryDuration: Histogram;
    indexUsage: Counter;
    triggerExecution: Counter;
  }
}
```

## Definition of Done

- [x] All tables created with correct structure
- [x] All relationships and constraints implemented
- [x] Indexes created for performance
- [x] Triggers implemented for notifications
- [x] Migration scripts tested
- [x] Rollback scripts verified
- [x] Documentation completed
  - [x] Usage documentation
  - [x] Schema documentation
  - [x] Error handling documentation

## Dependencies

- External services:
  - PostgreSQL 14+
- Internal dependencies:
  - None
- Third-party packages:
  - pg@8.11.3: PostgreSQL client
  - dotenv: Environment configuration

## Rollback Plan

1. Execute down migrations in reverse order
2. Verify data integrity after rollback
3. Remove any created extensions
4. Update application code to previous version

## Changelog

| Date | Author | Description | PR |
|------|--------|-------------|-------|
| 2024-01-10 | System | Initial schema implementation | - |
| 2024-01-10 | System | Added SSH tunnel support | - |
| 2024-01-10 | System | Refactored to use singleton pattern | - |
| 2024-01-10 | System | Added comprehensive documentation | - |
