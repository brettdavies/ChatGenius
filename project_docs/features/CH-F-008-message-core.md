# Feature Specification: Message System

## Basic Information

- **Feature ID**: CH-F-008
- **Feature Name**: Message System
- **Priority**: High
- **Status**: Planned
- **Last Updated**: 2024-01-12

## Overview

The Message System provides comprehensive message handling for ChatGenius, including real-time message delivery, thread support, typing indicators, and message history. It integrates with the Event System for real-time updates and supports rich text, attachments, and reactions.

## User Stories & Acceptance Criteria

| ID | As a | I want to | So that | Acceptance Criteria |
|----|------|-----------|---------|-------------------|
| US-001 | User | Send messages in channels | I can communicate with others | - Messages appear instantly with optimistic updates<br>- Rich text formatting supported<br>- Attachments can be added<br>- Failed messages show error state |
| US-002 | User | Reply in threads | I can have focused discussions | - Thread context visible<br>- Parent message shown<br>- Unread indicators for threads<br>- Thread participant list visible |
| US-003 | User | See typing indicators | I know when others are responding | - Indicators show in real-time<br>- Multiple typing users handled<br>- Indicators timeout appropriately<br>- Rate-limited updates |
| US-004 | User | React to messages | I can express quick responses | - Reactions update instantly<br>- Multiple reactions per user prevented<br>- Reaction counts accurate<br>- Common emojis suggested |
| US-005 | User | Edit and delete messages | I can correct mistakes | - Edit history maintained<br>- Delete action reversible<br>- Real-time updates for all users<br>- Permissions respected |

## Technical Implementation

### Security Requirements

- Message content sanitized
- Edit/delete permissions enforced
- File upload scanning
- Rate limiting for messages
- Audit logging for changes

### Frontend Changes

1. State Management:

   ```typescript
   interface Message {
     id: string;
     channelId: string;
     threadId?: string;
     content: string;
     userId: string;
     createdAt: string;
     editedAt?: string;
     reactions: Record<string, string[]>;
     attachments: Attachment[];
   }

   interface MessageState {
     messages: Record<string, Message>;
     threads: Record<string, Message[]>;
     typing: Record<string, string[]>;
     cache: {
       channelMessages: Record<string, string[]>;
       threadMessages: Record<string, string[]>;
     };
   }
   ```

2. Required Actions:
   - Message CRUD operations
   - Thread management
   - Typing indicator control
   - Reaction management
   - Cache invalidation

### Backend Changes

1. API Requirements:

   ```typescript
   interface MessageRequest {
     content: string;
     channelId: string;
     threadId?: string;
     attachments?: AttachmentInput[];
   }

   interface MessageResponse {
     id: string;
     status: 'sent' | 'failed';
     error?: string;
   }
   ```

2. Required Endpoints:
   - POST /api/messages
   - PATCH /api/messages/:id
   - DELETE /api/messages/:id
   - POST /api/messages/:id/reactions
   - POST /api/channels/:id/typing

### Database Changes

1. Schema Requirements:
   - Messages table with ULID primary keys
   - Thread references as self-relations
   - Reaction storage as JSONB
   - Attachment metadata storage
   - Audit log table for changes

2. Indexes:
   - Channel + timestamp for efficient loading
   - Thread + timestamp for thread views
   - Full-text search on content
   - User + timestamp for history

### Configuration

1. Environment Variables:
   - MAX_MESSAGE_LENGTH
   - TYPING_TIMEOUT
   - CACHE_DURATION
   - ATTACHMENT_LIMITS

2. Feature Flags:
   - ENABLE_THREADS
   - ENABLE_REACTIONS
   - ENABLE_ATTACHMENTS

## Testing Requirements

### Unit Tests

1. Store Tests:
   - Message CRUD operations
   - Cache management
   - Optimistic updates
   - Error handling

2. Component Tests:
   - Message rendering
   - Thread views
   - Input handling
   - Reaction display

### Integration Tests

1. API Integration:
   - Message operations
   - Real-time updates
   - Error scenarios
   - Rate limiting

2. Event Integration:
   - SSE connection
   - Event handling
   - State updates
   - Reconnection

### E2E Tests

[[ Not relevant to this feature ]]

## Monitoring Requirements

### Logging

1. Required Events:
   - Message operations
   - Thread creation
   - Edit/delete actions
   - Error conditions

2. Log Format:
   ```typescript
   interface MessageLog {
     event: 'create' | 'update' | 'delete';
     messageId: string;
     userId: string;
     channelId: string;
     timestamp: string;
     metadata: {
       threadId?: string;
       contentLength: number;
       attachmentCount: number;
     };
   }
   ```

### Metrics

1. Performance Metrics:
   - Message delivery latency
   - Cache hit rates
   - API response times
   - Event propagation time

2. Business Metrics:
   - Messages per channel
   - Thread usage rates
   - Reaction frequencies
   - Edit/delete rates

## Definition of Done

- [ ] Message CRUD operations implemented
- [ ] Thread support complete
- [ ] Real-time updates working
- [ ] Typing indicators functional
- [ ] Reactions system implemented
- [ ] Cache system operational
- [ ] Error handling robust
- [ ] Performance requirements met

## Dependencies

- Event System (DB-F-002)
- SSE Infrastructure (DB-F-003)
- Channel Creator (CH-F-001)

## Rollback Plan

1. Disable new message features
2. Revert database changes
3. Clear message caches
4. Restore previous version

## Changelog

- 2024-01-12: Consolidated CH-F-007 and CH-F-008 into single specification 