# Feature Specification: Event Types

## Basic Information

- **Feature ID**: DB-F-005
- **Feature Name**: Event Types
- **Priority**: High
- **Status**: 🟨 In Progress

## Overview

The Event Types feature defines and implements a comprehensive type system for all events in ChatGenius. It provides type definitions, validation, and serialization for various events like messages, reactions, user status changes, and channel member changes. This feature ensures type safety and consistency across the entire event system, from database triggers to client-side event handling.

## User Stories & Acceptance Criteria

| ID | As a | I want to | So that | Acceptance Criteria |
|----|------|-----------|---------|-------------------|
| US-001 | Developer | To have type-safe events | I can prevent runtime errors | - TypeScript interfaces<br>- Runtime validation<br>- Type guards |
| US-002 | Developer | To validate event payloads | Events are consistent | - Schema validation<br>- Error handling<br>- Payload sanitization |
| US-003 | Developer | To serialize events correctly | Data integrity is maintained | - Serialization rules<br>- Deserialization handling<br>- Version handling |

## Technical Implementation

### Security Requirements

- Input validation
- Payload sanitization
- Type coercion rules
- Version compatibility

### Frontend Changes

```typescript
// Event type definitions for client
export type EventName = 
  | 'message.created'
  | 'message.updated'
  | 'message.deleted'
  | 'reaction.added'
  | 'reaction.removed'
  | 'user.status_changed'
  | 'channel.member_joined'
  | 'channel.member_left';

export interface BaseEvent {
  id: string;
  timestamp: string;
  type: EventName;
  version: number;
}

export interface MessageEvent extends BaseEvent {
  type: 'message.created' | 'message.updated' | 'message.deleted';
  payload: {
    messageId: string;
    channelId: string;
    content: string;
    userId: string;
    metadata?: Record<string, unknown>;
  };
}

export interface ReactionEvent extends BaseEvent {
  type: 'reaction.added' | 'reaction.removed';
  payload: {
    messageId: string;
    userId: string;
    reaction: string;
  };
}
```

### Backend Changes

```typescript
// Event validation and processing
class EventProcessor {
  private validators: Map<EventName, ZodSchema>;

  constructor() {
    this.initializeValidators();
  }

  private initializeValidators(): void {
    this.validators.set('message.created', MessageSchema);
    this.validators.set('reaction.added', ReactionSchema);
    // ... other validators
  }

  public async processEvent(event: BaseEvent): Promise<void> {
    const validator = this.validators.get(event.type);
    if (!validator) {
      throw new UnknownEventError(event.type);
    }

    try {
      await validator.parseAsync(event);
      await this.emit(event);
    } catch (error) {
      throw new EventValidationError(error);
    }
  }
}

// Type guards
export function isMessageEvent(event: BaseEvent): event is MessageEvent {
  return event.type.startsWith('message.');
}

export function isReactionEvent(event: BaseEvent): event is ReactionEvent {
  return event.type.startsWith('reaction.');
}
```

### Database Changes

```sql
-- Event type enum
CREATE TYPE event_type AS ENUM (
    'message.created',
    'message.updated',
    'message.deleted',
    'reaction.added',
    'reaction.removed',
    'user.status_changed',
    'channel.member_joined',
    'channel.member_left'
);

-- Event log table
CREATE TABLE event_log (
    id SERIAL PRIMARY KEY,
    event_type event_type NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    version INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT valid_payload CHECK (jsonb_typeof(payload) = 'object')
);

-- Event validation function
CREATE OR REPLACE FUNCTION validate_event_payload(
    p_event_type event_type,
    p_payload JSONB
) RETURNS BOOLEAN AS $$
BEGIN
    CASE p_event_type
        WHEN 'message.created' THEN
            RETURN (
                p_payload ? 'messageId' AND
                p_payload ? 'channelId' AND
                p_payload ? 'content' AND
                p_payload ? 'userId'
            );
        -- Add other event type validations
        ELSE
            RETURN FALSE;
    END CASE;
END;
$$ LANGUAGE plpgsql;
```

### Configuration

```typescript
interface FeatureConfig {
  development: {
    validateEvents: true,
    maxPayloadSize: 1024 * 1024,
    eventVersioning: true
  },
  production: {
    validateEvents: true,
    maxPayloadSize: 512 * 1024,
    eventVersioning: true
  }
}

const required_env_vars = [
  'EVENT_VALIDATION_ENABLED=true // Enable event validation',
  'MAX_EVENT_PAYLOAD_SIZE=1048576 // Maximum payload size in bytes',
  'EVENT_VERSION=1 // Current event version'
];
```

## Testing Requirements

### Unit Tests

```typescript
describe('Event Types', () => {
  test('should validate message events', () => {
    // Test message event validation
  });

  test('should validate reaction events', () => {
    // Test reaction event validation
  });

  test('should handle invalid events', () => {
    // Test error handling
  });
});
```

### Integration Tests

- Verify event validation
- Test type guards
- Validate serialization
- Test version handling
- Verify payload limits
- Test error scenarios

### E2E Tests

- Test event flow
- Verify client handling
- Test versioning
- Validate error handling

## Monitoring Requirements

### Logging

```typescript
interface LogFormat {
  timestamp: string;
  correlationId: string;
  level: 'debug' | 'info' | 'warn' | 'error',
  event: 'event_processed' | 'validation_error' | 'version_mismatch',
  data?: {
    eventType?: string;
    version?: number;
    error?: string;
  }
}
```

### Metrics

```typescript
interface Metrics {
  performance: {
    eventProcessed: Counter;
    validationErrors: Counter;
    versionMismatches: Counter;
    processingTime: Histogram;
  }
}
```

## Definition of Done

- [x] Event types defined
- [x] Validation system implemented
- [x] Type guards implemented
- [x] Database schema updated
- [ ] Testing completed
- [ ] Documentation updated
- [ ] Monitoring configured

## Dependencies

- External services:
  - PostgreSQL 14+
- Internal dependencies:
  - [DB-F-001: Schema Setup](./DB-F-001-schema-setup.md)
  - [DB-F-003: Event System](./DB-F-003-event-system.md)
- Third-party packages:
  - zod@3.22.4: Schema validation
  - type-fest@4.10.2: Utility types

## Rollback Plan

1. Remove event type validations
2. Revert database schema
3. Remove type guards
4. Update documentation

## Changelog

| Date | Author | Description | PR |
|------|--------|-------------|-------|
| 2024-01-10 | System | Initial event types implementation | - | 