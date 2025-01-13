# Feature Specification: Channel Creator

## Basic Information

- **Feature ID**: CH-F-001
- **Feature Name**: Channel Creator
- **Priority**: High
- **Status**: 🟦 Planned
- **Last Updated**: 2025-01-12

## Overview

This feature implements the channel creation system, enabling users to create and configure new channels within the ChatGenius platform. It provides a streamlined interface for creating both public and private channels, with proper validation and immediate availability for communication.

The system integrates with the ULID-based primary key system for channel identification, ensuring chronologically sortable, unique identifiers that maintain data consistency across the platform.

## User Stories & Acceptance Criteria

| ID | As a | I want to | So that | Acceptance Criteria |
|----|------|-----------|---------|-------------------|
| US-001 | User | Create a new channel | I can start a new conversation space | - Channel is created with a valid ULID<br>- Creator is automatically added as owner<br>- Channel appears in sidebar immediately<br>- Channel type (public/private) is set correctly |
| US-002 | User | Set channel properties | I can properly configure the channel | - Channel name validation (2-80 chars, valid chars)<br>- Optional topic/description<br>- Type selection (public/private)<br>- Proper error messages for invalid input |
| US-003 | User | See validation feedback | I can correct any input errors | - Real-time validation feedback<br>- Clear error messages<br>- Submit button disabled when invalid<br>- Form maintains state during validation |
| US-004 | Admin | View channel creation events | I can monitor channel creation activity | - Creation events are logged<br>- Creator details are recorded<br>- Timestamp is recorded<br>- Event contains channel configuration |
| US-005 | Channel Owner | Delete a channel | I can remove unused channels | - Channel is permanently deleted<br>- All members are notified<br>- Channel is removed from sidebar<br>- Deletion event is logged |
| US-006 | Channel Owner | Archive a channel | I can preserve channel history while preventing new messages | - Channel is marked as archived<br>- Channel remains readable<br>- New messages are prevented<br>- Archive status is visible in UI |

## Technical Implementation

### Security Requirements

- Authentication required for channel creation
- Authorization check for channel creation permissions
- Input sanitization for channel name and topic (including emoji support)
- Rate limiting for channel creation
- Audit logging for creation events
- Authorization check for channel deletion and archiving
- Audit logging for deletion and archive events

### Frontend Changes

The frontend requires TypeScript interfaces and components for channel management. Requirements:

1. Type Safety:
   - Define Channel and ChannelStore interfaces
   - Implement type guards for validation
   - Ensure proper typing in component props and API responses

2. URL Pattern:
   - Use last 10 characters of channel ULID in URL
   - Format: `/:channelId` where channelId is last 10 chars
   - Examples:
     - Channel ULID: 01JHD76X6J0C4H8PF2V09SWA9A
     - URL: /F2V09SWA9A
   - Handle URL pattern matching in router
   - Maintain mapping between short IDs and full ULIDs

3. Validation Rules:
   - Channel name validation (2-80 chars, alphanumeric, emoji, hyphens, underscores)
   - DM channel validation (exactly 2 members)
   - Real-time validation feedback
   - Error message display
   - Submit button state management

4. Components:
   - Modal dialog for channel creation
   - Channel list item component
   - Error boundary for graceful failure handling

   Example type definitions:

   ```typescript
   // Core interfaces for channel management
   interface Channel {
     id: string;           // ULID
     name: string;         // Required for public/private, auto-generated for DM
     type: 'public' | 'private' | 'dm';
     description?: string; // Required for public/private, not used for DM
     members: string[];    // For DMs, exactly 2 members
     isArchived: boolean;
     archivedAt?: string;
     archivedBy?: string;
   }

   // Example validation implementation
   function isValidChannelName(name: string): boolean {
     return /^[\p{L}\p{N}\p{Emoji}-_]{2,80}$/u.test(name);
   }

   function isValidDMChannel(members: string[]): boolean {
     return members.length === 2;
   }
   ```

5. State Management:
   - Zustand store for channel state
   - Real-time event handling
   - Optimistic updates
   - Error state management

### Backend Changes

The backend system must provide core channel management functionality through a RESTful API. Requirements:

1. Core Endpoints:
   - Channel creation (POST /api/channels)
   - Channel deletion (DELETE /api/channels/:id)
   - Channel archival (PATCH /api/channels/:id/archive)
   - Channel update (PATCH /api/channels/:id)

2. Validation:
   - Server-side validation of channel names
   - DM member count validation
   - Input sanitization
   - Type checking

3. DM Channel Naming:
   - Auto-generate DM channel names using sorted user IDs
   - The smaller user ID is always first
   - Format: `{smaller_user_id}-{larger_user_id}`
   - Example: `01HGD8X6J0C4-01HGD8X6J0C5`

4. Error Handling:
   - Clear error messages for validation failures
   - Type-safe error handling
   - Proper error propagation

5. Performance:
   - Efficient channel creation
   - Real-time event emission
   - Optimistic locking for updates

   Example API interfaces:

   ```typescript
   interface CreateChannelRequest {
     name?: string;        // Required for public/private, auto-generated for DM
     type: 'public' | 'private' | 'dm';
     description?: string; // Required for public/private, not used for DM
     members: string[];    // Target members (exactly 2 for DM)
   }

   interface ChannelResponse {
     id: string;          // ULID
     name: string;        // Unicode support
     description?: string;
     isPrivate: boolean;
     createdAt: string;   // ISO timestamp
     createdBy: string;   // User ULID
   }
   ```

### Database Changes

Database schema and constraints must be updated to properly handle channels. Requirements:

1. Schema Updates:
   - Channel table with ULID primary key
   - Proper indexes for efficient queries
   - Audit columns for tracking changes

2. Indexes:
   - Primary key on channel ID
   - Index on channel type
   - Index on creation date
   - Index on member relationships

Example schema pattern:

```sql
CREATE TABLE channels (
  id VARCHAR(26) PRIMARY KEY,
  name VARCHAR(80) NOT NULL,
  description TEXT,
  type VARCHAR(20) NOT NULL CHECK (type IN ('public', 'private', 'dm')),
  created_by VARCHAR(26) NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  archived_at TIMESTAMP WITH TIME ZONE,
  archived_by VARCHAR(26) REFERENCES users(id)
);

CREATE INDEX idx_channels_type ON channels(type);
CREATE INDEX idx_channels_created_at ON channels(created_at);
```

### Configuration

1. Environment Variables:
   - No additional variables needed
   - Use existing auth configuration

2. Feature Flags:
   - ENABLE_CHANNEL_CREATION=true
   - ENABLE_PRIVATE_CHANNELS=true

3. Performance Settings:
   - Channel creation rate limit
   - Maximum channels per user
   - Cache settings for channel list

## Testing Requirements

### Unit Tests

1. Core Function Tests:
   - Channel name validation
   - Type validation
   - Permission checks
   - ULID generation

2. Validation Tests:
   - Invalid channel names
   - Invalid types
   - Missing required fields
   - Rate limit checks
   - Invalid deletion attempts
   - Invalid archive attempts

Example test structure:

```typescript
describe('Channel Creation', () => {
  describe('Validation', () => {
    // Test name validation
    // Test type validation
    // Test permission checks
  });

  describe('ULID Generation', () => {
    // Test ID format
    // Test uniqueness
    // Test chronological ordering
  });
});

describe('Channel Management', () => {
  describe('Deletion', () => {
    // Test permission checks
    // Test cascade deletion
    // Test event emission
  });

  describe('Archiving', () => {
    // Test state transitions
    // Test permission checks
    // Test event emission
  });
});
```

### Integration Tests

1. System Integration:
   - API endpoint testing
   - Database operations
   - Event system integration

2. Component Integration:
   - Frontend/Backend integration
   - Real-time updates
   - Sidebar integration

### E2E Tests

[[ Not relevant to this feature ]]

## Monitoring Requirements

### Logging

1. Required Log Events:
   - Channel creation attempts
   - Channel deletion attempts
   - Channel archive attempts
   - Validation failures
   - Permission denials
   - Rate limit hits

2. Log Format:
   - Include channel ULID
   - Creator ULID
   - Timestamp
   - Configuration details

Example format:

```typescript
interface ChannelOperationLog {
  event: 'channel_created' | 'channel_deleted' | 'channel_archived' | 'operation_failed';
  channelId: string;
  userId: string;
  timestamp: string;
  details: {
    operation: 'create' | 'delete' | 'archive';
    name?: string;
    type?: string;
    error?: string;
  };
}
```

### Metrics

1. Performance Metrics:
   - Creation latency
   - Validation time
   - Database operation time
   - Cache hit rates

2. Business Metrics:
   - Channels created per day
   - Public vs private ratio
   - Creation success rate
   - Popular creation times

3. Alert Thresholds:
   - High failure rate (>10%)
   - Slow creation time (>500ms)
   - Rate limit breaches
   - Database errors

## Definition of Done

- [x] Channel creation API implemented
- [x] Frontend form implemented
- [x] ULID integration complete
- [x] Validation rules implemented
- [x] Permission checks in place
- [x] Error handling complete
- [ ] Channel deletion implemented
- [ ] Channel archiving implemented
- [ ] Event emissions implemented
- [ ] Tests passing
- [ ] Documentation updated
- [ ] Logging configured
- [ ] Metrics collecting
- [ ] Security review completed

## Dependencies

- External services:
  - None required
- Internal dependencies:
  - DB-F-006: ULID System
  - CORE-F-001: Auth0 Social Login
  - DB-F-001: Schema Setup
- Third-party packages:
  - ulid@2.3.0: ID generation

## Rollback Plan

1. Feature flag disable procedure:
   - Set ENABLE_CHANNEL_CREATION=false

2. Database rollback steps:

   ```sql
   -- No rollback needed for new feature
   -- Future rollbacks must maintain ULID format
   ```

3. Code reversion process
4. Configuration cleanup
5. Monitoring updates

## Changelog

| Date | Author | Description | PR |
|------|--------|-------------|-------|
| 2025-01-10 | System | Initial specification | - |
| 2025-01-11 | System | Added channel validation implementation | - |
| 2025-01-11 | System | Added deletion and archiving requirements | - |
