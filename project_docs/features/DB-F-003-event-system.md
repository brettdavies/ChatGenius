# Feature Specification: PostgreSQL Event System

## Basic Information

- **Feature ID**: DB-F-003
- **Feature Name**: PostgreSQL Event System
- **Priority**: High
- **Status**: 🟨 In Progress

## Overview

This feature implements the PostgreSQL LISTEN/NOTIFY system for real-time event handling in ChatGenius. It provides the foundation for real-time updates by utilizing PostgreSQL's built-in pub/sub capabilities. The system handles database events like message creation, reactions, and status changes, converting them into application events that can be consumed by the SSE infrastructure.

## User Stories & Acceptance Criteria

| ID | As a | I want to | So that | Acceptance Criteria |
|----|------|-----------|---------|-------------------|
| US-001 | Developer | To listen for database events | I can react to data changes in real-time | - LISTEN setup for all channels<br>- Proper event parsing<br>- Error handling |
| US-002 | Developer | To handle connection issues | The system remains reliable | - Automatic reconnection<br>- Event queue management<br>- Connection state tracking |
| US-003 | Developer | To format events consistently | Events can be processed reliably | - Standard event format<br>- Type safety<br>- Proper payload serialization |

## Technical Implementation

### Security Requirements

- Secure handling of event payloads
- No sensitive data in notifications
- Connection pool security
- Error handling for malformed events

### Frontend Changes

[[ Not relevant to this feature ]]

### Backend Changes

```typescript
// Event listener setup
interface NotificationListener {
  startListening: () => Promise<void>;
  stopListening: () => Promise<void>;
}

// Event handler implementation
const listenForNotifications = async () => {
  const client = await pool.connect();
  
  try {
    // Listen for different notification channels
    await client.query('LISTEN message_change');
    await client.query('LISTEN reaction_change');
    await client.query('LISTEN user_status_change');
    await client.query('LISTEN channel_member_change');

    client.on('notification', (msg) => {
      const payload = JSON.parse(msg.payload || '{}');
      global.eventEmitter.emit(msg.channel, payload);
    });

    console.log('Listening for PostgreSQL notifications');
  } catch (error) {
    console.error('Error setting up notification listeners:', error);
    client.release();
  }
};

// Event types
type EventType = 'message_change' | 'reaction_change' | 'user_status_change' | 'channel_member_change';

interface DatabaseEvent {
  channel: EventType;
  payload: {
    operation: 'INSERT' | 'UPDATE' | 'DELETE';
    record: Record<string, any>;
  };
}
```

### Database Changes

```sql
-- Notification trigger function
CREATE OR REPLACE FUNCTION notify_event()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM pg_notify(
        TG_ARGV[0],
        json_build_object(
            'operation', TG_OP,
            'record', row_to_json(NEW)
        )::text
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Example trigger setup
CREATE TRIGGER notify_message_change
    AFTER INSERT OR UPDATE OR DELETE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION notify_event('message_change');
```

### Configuration

```typescript
interface FeatureConfig {
  development: {
    enableNotifications: true,
    maxReconnectAttempts: 5,
    reconnectDelay: 1000
  },
  production: {
    enableNotifications: true,
    maxReconnectAttempts: 10,
    reconnectDelay: 2000
  }
}

const required_env_vars = [
  'POSTGRES_HOST=localhost // Database host',
  'POSTGRES_PORT=5432 // Database port',
  'POSTGRES_DB=chatgenius // Database name'
];
```

## Testing Requirements

### Unit Tests

```typescript
describe('Event System', () => {
  test('should handle database notifications', async () => {
    // Test notification handling
  });

  test('should reconnect on connection loss', async () => {
    // Test reconnection
  });

  test('should parse event payloads correctly', async () => {
    // Test payload parsing
  });
});
```

### Integration Tests

- Verify notification triggers
- Test connection recovery
- Validate event propagation
- Test concurrent notifications
- Verify payload formatting
- Test error scenarios

### E2E Tests

[[ Not relevant to this feature ]]

## Monitoring Requirements

### Logging

```typescript
interface LogFormat {
  timestamp: string;
  correlationId: string;
  level: 'debug' | 'info' | 'warn' | 'error',
  event: 'notification_received' | 'connection_error' | 'reconnect_attempt',
  data?: {
    channel?: string;
    payload?: string;
    error?: string;
  }
}
```

### Metrics

```typescript
interface Metrics {
  performance: {
    notificationsReceived: Counter;
    reconnectAttempts: Counter;
    parseErrors: Counter;
    eventLatency: Histogram;
  }
}
```

## Definition of Done

- [x] LISTEN/NOTIFY system implemented
- [x] Event parsing implemented
- [x] Connection management implemented
- [x] Error handling implemented
- [ ] Performance testing completed
- [ ] Documentation updated
- [ ] Monitoring configured

## Dependencies

- External services:
  - PostgreSQL 14+
- Internal dependencies:
  - [DB-F-001: Schema Setup](./DB-F-001-schema-setup.md)
  - [DB-F-002: SSE Infrastructure](./DB-F-002-sse-infrastructure.md)
- Third-party packages:
  - pg@8.11.3: PostgreSQL client

## Rollback Plan

1. Remove notification triggers
2. Stop notification listeners
3. Remove event handling code
4. Update documentation

## Changelog

| Date | Author | Description | PR |
|------|--------|-------------|-------|
| 2024-01-10 | System | Initial event system implementation | - |
