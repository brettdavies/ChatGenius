# Requirements: ChatGenius

This document outlines the requirements for ChatGenius, a Slack clone project. It serves as a reference for developers, testers, and stakeholders to ensure that the project meets its objectives and constraints.

---

## Table of Contents

1. [Functional Requirements](#functional-requirements)
2. [Non-Functional Requirements](#non-functional-requirements)
3. [Acceptance Criteria](#acceptance-criteria)

---

## Functional Requirements

The following are the core functionalities that the system must implement to meet its goals.

### User Authentication

- The system must allow users to:
  - [P0] Register and login using Auth0
    - Social logins (Google, GitHub)
    - Email/password authentication
  - [P0] Maintain user sessions securely
  - [P1] Support user profile management

### Messaging

- Users must be able to:
  - [P0] Send and receive messages in real-time using SSE
    - Support rich text formatting
    - Support emoji and Unicode characters
  - [P0] Create and participate in message threads
  - [P0] Edit and delete their own messages
  - [P0] React to messages with emojis
  - [P0] See typing indicators in real-time
  - [P0] Track message read states
  - [P1] Mark any message as "unread from here"
    - Updates read state to mark all newer messages as unread
    - Updates unread indicators accordingly

### Channels and Direct Messages

- The system must support:
  - [P0] Public channels
    - Creation and basic management
    - Member management
  - [P0] Private channels
    - Invitation-only access
    - Member visibility controls
  - [P0] Direct messages (1:1)
  - [P0] Group direct messages
  - [P0] Channel/conversation sidebar
  - [P0] Unread indicators

### File Sharing

- Users must be able to:
  - [P0] Upload files in messages
    - Support common file types
    - Show previews for images and documents
  - [P0] Download shared files
  - [P0] View file metadata
  - [P0] Comment on files

### User Experience

- The system must provide:
  - [P0] Exact Slack UI replication
    - Identical component layout
    - Matching styles and animations
  - [P0] Dark/light theme support
  - [P0] All standard Slack keyboard shortcuts
  - [P0] Responsive design matching Slack
  - [P0] Loading states and animations
  - [P0] Context menus and tooltips

### Progressive Web App

- The system must support:
  - [P1] Installation as a PWA
    - Web app manifest
    - Service worker registration
    - Install prompts
  - [P1] Offline functionality
    - Cache messages and reactions
      - All messages in active channels
      - All reactions to cached messages
      - Message edit history
    - Cache files within sync window
      - Default sync window: 7 days
      - User-configurable sync period
      - Respect device storage limits
    - Queue outgoing messages
    - Sync when back online
  - [P1] Push notifications
    - Message notifications
    - Mention alerts
    - DM notifications
  - [P1] Background sync
    - Message delivery
    - Read state updates
    - Status updates
  - [P1] Storage management
    - Show storage usage statistics
    - Allow manual cache clearing
    - Auto-cleanup of old cached files
    - Respect device storage quotas

Priority Levels:

- P0: Must have for 2-day MVP launch
- P1: Important but can be added after initial release

---

## Non-Functional Requirements

These requirements define the operational qualities of the system.

### Performance

- Message delivery latency < 100ms
- Real-time updates (typing, presence) < 100ms
- Page load time < 2s
- Smooth scrolling and animations (60fps)
- PWA performance metrics:
  - Time to Interactive < 3s
  - Lighthouse PWA score > 90
  - Offline capability within 500ms

### Scalability

- Support for initial user base (development/testing)
- Database design ready for future scaling

### Security

- Auth0-based authentication
- HTTPS/TLS for all communications
- Secure session management
- PostgreSQL security best practices

### UI/UX

- Pixel-perfect match with Slack
- WCAG 2.1 accessibility compliance
- Responsive from 320px to 4K
- Support for all modern desktop browsers
- Offline mode indicators
- File sync status indicators
- Storage usage indicators

### Reliability

- Graceful error handling
- Automatic reconnection for SSE
- Data consistency across components

### Maintainability

- TypeScript throughout
- Comprehensive documentation
- Component-based architecture
- Automated testing setup

---

## Acceptance Criteria

These criteria define when features are considered complete.

### UI Matching

- Component layout matches Slack exactly
- Colors, typography, and spacing are identical
- Animations and transitions match Slack
- Responsive behavior matches Slack
- All interactive elements work as in Slack

### Messaging

- Messages appear in real-time
- Rich text formatting works correctly
- Emoji reactions function properly
- Thread views match Slack exactly
- Read states update correctly
- "Unread from here" functions correctly
  - Updates read state immediately
  - Shows correct unread counts
  - Persists across sessions

### Channels/DMs

- Channel creation works as in Slack
- Member management functions properly
- Sidebar organization matches Slack
- Unread states work correctly

### Files

- Upload/download works reliably
- Previews display correctly
- Comments work as in Slack
- File list view matches Slack

### Authentication

- Auth0 login flow works smoothly
- Sessions persist appropriately
- Profile management works correctly

### Progressive Web App

- Installs successfully on supported platforms
- Works offline for recent content
  - Messages and reactions available offline
  - Files within sync window accessible
  - Sync window preferences respected
- Syncs correctly when online
- Push notifications delivered reliably
- Background tasks execute as expected
- Storage management works correctly
  - Shows accurate usage statistics
  - Cleanup functions work properly
  - Respects device storage limits
