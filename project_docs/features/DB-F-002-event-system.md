# Feature Specification: PostgreSQL Event System

## Basic Information

- **Feature ID**: DB-F-002
- **Feature Name**: PostgreSQL Event System
- **Priority**: High
- **Status**: 🟩 Completed
- **Last Updated**: 2025-01-11

## Overview

This feature implements the PostgreSQL LISTEN/NOTIFY system for real-time event handling in ChatGenius. It leverages PostgreSQL's built-in pub/sub capabilities to provide reliable, scalable event propagation throughout the application.

The system serves as the foundation for real-time features by capturing database changes and converting them into application events. It ensures data consistency and real-time updates for messages, reactions, user status changes, and channel activities.

## User Stories & Acceptance Criteria

| ID | As a | I want to | So that | Acceptance Criteria |
|----|------|-----------|---------|-------------------|
| US-001 | Developer | Listen to database events | I can react to changes in real-time | - LISTEN setup for all channels<br>- Event parsing works<br>- Error handling in place<br>- Connection recovery works |
| US-002 | Developer | Handle connection issues | The system stays reliable | - Auto-reconnection works<br>- Event queue managed<br>- No events lost<br>- Connection state tracked |
| US-003 | Developer | Process events consistently | Events are handled reliably | - Standard event format<br>- Type safety enforced<br>- Proper serialization<br>- Error handling works |
| US-004 | Admin | Monitor event system | I can ensure reliability | - Event metrics tracked<br>- Error rates monitored<br>- Performance tracked<br>- Resource usage monitored |

## Technical Implementation

### Security Requirements

- Secure event payload handling
- No sensitive data in notifications
- Connection pool security
- SSH tunnel authentication
- Proper error handling
- Resource cleanup
- Connection validation

### Connection Architecture

1. **Connection Types**:
   - General pool connections for regular operations (shared SSH tunnel)
   - Dedicated notification connections for LISTEN/NOTIFY (separate SSH tunnel)
   - Maximum 10 concurrent pool connections
   - One connection per notification instance
   - **Important**: Notifications require their own separate SSH tunnel, distinct from the general connection pool tunnel

2. **SSH Tunnel Integration**:
   - Separate SSH tunnel for notifications to isolate LISTEN/NOTIFY traffic
   - Private key authentication only
   - No password authentication
   - Key file permissions checked
   - Connection encryption enforced

3. **Connection Flow**:
   ```mermaid
   sequenceDiagram
       participant App
       participant Notifications
       participant NotifyTunnel
       participant DB
       App->>Notifications: Initialize
       Notifications->>NotifyTunnel: Create Dedicated SSH Tunnel
       NotifyTunnel->>DB: Establish Connection
       DB-->>Notifications: Connection Ready
       Notifications->>DB: LISTEN Commands
   ```

### Frontend Changes

[[ Not relevant to this feature ]]

### Backend Changes

1. API Requirements:
   - Event listener setup
   - Event broadcasting
   - Connection management
   - Health checks

2. Business Logic:
   - Event parsing
   - Type validation
   - Error handling
   - Reconnection logic

3. Error Handling:
   - Connection failures with exponential backoff
   - Parse errors
   - Type errors
   - Resource limits
   - Health check monitoring
   - Automatic cleanup of dead connections
   - Graceful degradation for notification failures

Example patterns:

```typescript
interface DatabaseEvent<T> {
  channel: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  schema: string;
  table: string;
  data: T;
}

interface EventListener {
  start(): Promise<void>;
  stop(): Promise<void>;
  onEvent<T>(channel: string, handler: (event: DatabaseEvent<T>) => void): void;
}
```

### Database Changes

1. Schema Requirements:
   - Trigger functions
   - Event notifications
   - Type definitions
   - Indexes if needed

2. Data Migration:
   - Add notification triggers
   - Update existing triggers
   - No data migration needed

Example trigger pattern:

```sql
-- Example notification trigger
CREATE OR REPLACE FUNCTION notify_event()
RETURNS TRIGGER AS $$
DECLARE
  payload json;
BEGIN
  payload := json_build_object(
    'operation', TG_OP,
    'schema', TG_TABLE_SCHEMA,
    'table', TG_TABLE_NAME,
    'data', row_to_json(NEW)
  );
  
  PERFORM pg_notify(TG_ARGV[0], payload::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Configuration

1. Environment Variables:
   ```
   SSH_KEY_PATH=path/to/key
   SSH_HOST=hostname
   SSH_USER=username
   POSTGRES_USER=dbuser
   POSTGRES_PASSWORD=dbpassword
   POSTGRES_DB=dbname
   PG_NOTIFY_CHANNEL=event_channel_prefix
   MAX_RECONNECT_ATTEMPTS=5
   RECONNECT_DELAY=1000
   ```

2. Feature Flags:
   - ENABLE_DB_EVENTS=true
   - ENABLE_EVENT_BUFFERING=true

3. Performance Settings:
   - Connection pool size
   - Event buffer size
   - Cleanup intervals

## Testing Requirements

### Unit Tests

1. Core Function Tests:
   - Event listening
   - Event parsing
   - Type validation
   - Error handling

2. Validation Tests:
   - Connection handling
   - Reconnection logic
   - Event buffering
   - Resource cleanup

Example test structure:

```typescript
describe('Database Events', () => {
  describe('Event Handling', () => {
    // Test event parsing
    // Test type validation
    // Test error cases
  });

  describe('Connection Management', () => {
    // Test connection handling
    // Test reconnection
    // Test cleanup
  });
});
```

### Integration Tests

1. System Integration:
   - Database triggers
   - Event propagation
   - Type safety
   - Error handling

2. Component Integration:
   - SSE integration
   - Event transformation
   - Resource management
   - Error propagation

### E2E Tests

[[ Not relevant to this feature ]]

## Monitoring Requirements

### Logging

1. Required Log Events:
   - Event reception
   - Parse failures
   - Connection issues
   - Type errors
   - Connection lifecycle events
   - Error conditions
   - Performance metrics
   - Security-related events

2. Log Format:
   - Include event ID
   - Channel information
   - Timing data
   - Error details

Example format:

```typescript
interface EventLog {
  event: 'received' | 'parsed' | 'error';
  channel: string;
  timestamp: string;
  details: {
    operation?: string;
    table?: string;
    error?: string;
    duration?: number;
  };
}
```

### Metrics

1. Performance Metrics:
   - Events per second
   - Parse duration
   - Connection uptime
   - Memory usage
   - Dead connection cleanup
   - Resource usage monitoring
   - Error rate tracking

2. Business Metrics:
   - Events by type
   - Error rates
   - Reconnection rate
   - Queue size

3. Alert Thresholds:
   - High error rate
   - Connection loss
   - Parse failures
   - Queue overflow

## Definition of Done

- [x] Event listening implemented
  - PostgresEventService with LISTEN/NOTIFY support
  - Channel-specific event handling
  - Proper cleanup on shutdown
- [x] Event parsing working
  - JSON parsing with error handling
  - Type-safe DatabaseEvent interface
  - Proper error propagation
- [x] Connection management complete
  - Automatic reconnection
  - Connection state tracking
  - Resource cleanup
- [x] Error handling tested
  - Connection failures
  - Parse errors
  - Reconnection scenarios
- [x] Performance requirements met
  - Event buffering during disconnects
  - Efficient event processing
  - Resource management
- [x] Monitoring configured
  - Error logging
  - Status tracking
  - Event metrics
- [x] Documentation completed
  - Feature specification
  - Code documentation
  - Test documentation
- [x] Security review passed
  - SSH tunnel security
  - Parameterized queries
  - No sensitive data exposure
  - Proper error handling
- [x] Load testing completed
  - Multiple event handling
  - Reconnection scenarios
  - Resource limits
- [x] Integration tests passing
  - Event system tests
  - SSE integration tests
  - All scenarios covered

## Dependencies

- External services:
  - PostgreSQL 14+: Database with NOTIFY support
- Internal dependencies:
  - DB-F-001: Schema Setup
  - DB-F-003: SSE Infrastructure
- Third-party packages:
  - pg@8.11.3: PostgreSQL client
  - pg-listen@1.7.0: LISTEN/NOTIFY utilities

## Rollback Plan

1. Feature flag disable procedure:
   - Set ENABLE_DB_EVENTS=false
   - Stop event listeners

2. Database rollback steps:

   ```sql
   -- Remove notification triggers
   DROP TRIGGER IF EXISTS notify_event ON table_name;
   DROP FUNCTION IF EXISTS notify_event();
   ```

3. Code reversion process:
   - Remove event listeners
   - Update dependent systems
   - Clean up resources

4. Monitoring updates:
   - Update dashboards
   - Adjust alerts
   - Update documentation

## Changelog

| Date | Author | Description | PR |
|------|--------|-------------|-------|
| 2025-01-11 | System | Initial specification | - |
| 2025-01-12 | System | Added SSH tunnel details | - |
