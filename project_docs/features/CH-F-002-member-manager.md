# Feature Specification: Member Manager

## Basic Information

- **Feature ID**: CH-F-002
- **Feature Name**: Member Manager
- **Priority**: High
- **Status**: 🟦 Planned
- **Last Updated**: 2024-01-12

## Overview

The Member Manager handles channel membership operations, including inviting users, managing roles and permissions, and tracking member activity. It provides real-time updates for member status changes and integrates with the channel system for access control.

## User Stories & Acceptance Criteria

| ID | As a | I want to | So that | Acceptance Criteria |
|----|------|-----------|---------|-------------------|
| US-001 | Channel Admin | Invite users to channels | I can grow the channel community | - Send invites via email/username<br>- Set initial role<br>- Include custom message<br>- Track pending invites |
| US-002 | Channel Admin | Manage member roles | I can delegate responsibilities | - Assign/remove admin role<br>- Set moderator privileges<br>- Update permissions<br>- Audit role changes |
| US-003 | Channel Admin | Remove members | I can maintain channel quality | - Remove with reason<br>- Notify removed user<br>- Clean up member data<br>- Prevent immediate rejoin |
| US-004 | User | View member list | I can see who's in the channel | - See online status<br>- View roles/badges<br>- Search members<br>- Sort by role/status |

## Technical Implementation

### Security Requirements

- Role-based access control
- Audit logging for membership changes
- Validate invite permissions
- Rate limit invite sending
- Secure role elevation

### Frontend Changes

1. Type Safety:
   - Define member interfaces
   - Role and permission types
   - Event handling types

Example type definitions:

```typescript
interface Member {
  userId: string;        // ULID
  channelId: string;     // ULID
  role: MemberRole;
  joinedAt: string;      // ISO timestamp
  invitedBy?: string;    // ULID
}

type MemberRole = 'admin' | 'moderator' | 'member';

interface MemberPermissions {
  canInvite: boolean;
  canModerate: boolean;
  canManageRoles: boolean;
}
```

### Backend Changes

1. API Requirements:
   - Member CRUD endpoints
   - Role management
   - Invite system
   - Member search

Example API interface:

```typescript
interface InviteRequest {
  channelId: string;
  userIds: string[];
  role?: MemberRole;
  message?: string;
}

interface RoleUpdate {
  memberId: string;
  newRole: MemberRole;
  reason?: string;
}
```

### Database Changes

1. Schema Requirements:
   - Member roles table
   - Invite tracking
   - Audit logging

Example schema pattern:

```sql
CREATE TABLE channel_members (
  user_id uuid REFERENCES users(id),
  channel_id uuid REFERENCES channels(id),
  role text NOT NULL,
  joined_at timestamptz NOT NULL,
  invited_by uuid REFERENCES users(id),
  PRIMARY KEY (user_id, channel_id)
);
```

### Configuration

1. Environment Variables:
   - MAX_CHANNEL_MEMBERS=1000
   - MAX_INVITES_PER_DAY=100
   - INVITE_EXPIRY_DAYS=7

2. Feature Flags:
   - ENABLE_MEMBER_SEARCH=true
   - ENABLE_ROLE_MANAGEMENT=true
   - ENABLE_INVITE_SYSTEM=true

## Testing Requirements

### Unit Tests

1. Permission Tests:
   - Role validation
   - Access control
   - Invite permissions

2. Component Tests:
   - Member list rendering
   - Role management UI
   - Invite form validation

### Integration Tests

1. System Integration:
   - Role updates
   - Member removal
   - Invite processing
   - Event propagation

### E2E Tests

[[ Not relevant to this feature ]]

## Monitoring Requirements

### Logging

1. Required Log Events:
   - Role changes
   - Member additions/removals
   - Invite events
   - Permission updates

2. Log Format:

```typescript
interface MembershipLog {
  timestamp: string;
  channelId: string;
  actorId: string;
  targetId: string;
  action: 'invite' | 'join' | 'leave' | 'role_change';
  details: Record<string, unknown>;
}
```

### Metrics

1. Performance Metrics:
   - Member list load time
   - Role update latency
   - Invite processing time

2. Business Metrics:
   - Active member count
   - Role distribution
   - Invite acceptance rate
   - Member retention

3. Alert Thresholds:
   - High member churn
   - Invite spam detection
   - Role change frequency
   - Member list load >500ms

## Definition of Done

- [ ] Member CRUD operations working
- [ ] Role management implemented
- [ ] Invite system functional
- [ ] Real-time updates working
- [ ] Audit logging in place
- [ ] Documentation completed

## Dependencies

- Internal dependencies:
  - User system
  - Channel system
  - Permission system
  - Event system
- Third-party packages:
  - @tanstack/react-query: For member data
  - zustand: For state management

## Rollback Plan

1. Revert role changes
2. Cancel pending invites
3. Restore default permissions
4. Clean up member audit logs

## Changelog

| Date | Author | Description | PR |
|------|--------|-------------|-------|
| 2024-01-12 | System | Initial specification | N/A |
