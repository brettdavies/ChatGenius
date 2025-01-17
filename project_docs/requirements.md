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
  - [P0] Implement basic authentication
    - Email/password authentication ✅
    - Session-based cookie authentication ✅
    - Password hashing with bcrypt ✅
  - [P0] Session management
    - 24-hour session duration ✅
    - Server-side session storage ✅
    - Session cleanup job ✅
  - [P0] Two-factor authentication
    - TOTP support
    - Backup codes
    - Device remembering
  - [P1] Database tracking
    - Last login timestamp
    - Failed login attempts counter
    - Last failed login timestamp
    - Login IP tracking
  - [P1] Security monitoring
    - Rate limiting for login attempts
    - IP tracking middleware
    - Failed login attempt tracking
    - Account lockout after failed attempts
  - [P1] Enhanced session management
    - Device tracking
    - Concurrent session handling
    - Session analytics
  - [P1] Advanced rate limiting
    - IP-based rate limiting
    - Adaptive rate limiting
    - Rate limit by user and endpoint
  - [P1] Audit logging
    - Authentication events
    - Password changes
    - Profile updates
    - Security-related actions
  - [P1] Email verification system
    - Email verification on signup
    - Re-verification for email changes
    - Secure token generation
  - [P1] OAuth provider integration
    - Support for major providers
    - Profile data mapping
    - Token management
  - [P1] Remember me functionality
    - Secure persistent tokens
    - Device fingerprinting
    - Token rotation
  - [P1] Account security features
    - Account lockout after failed attempts
    - Security questions/answers
    - IP-based security
  - [P1] Enhanced password policies
    - Password complexity rules
    - Password history
    - Password expiration
  - [P1] API Documentation
    - OpenAPI schemas for auth endpoints ✅
    - Request/response validation ✅
    - Error response formats ✅
    - Rate limit documentation
    - Security headers documentation
  - [P1] Testing Coverage
    - Unit tests for user queries ✅
    - Integration tests for auth routes ✅
    - Test coverage for happy paths ✅
    - Test coverage for rate limiting
    - Test coverage for account lockout
    - Test coverage for IP tracking
  - [P1] User profile management
    - Profile picture upload
    - Display name customization
    - Time zone settings

### Messaging

- Users must be able to:
  - [P0] Send and receive messages in real-time using SSE ✅
    - Support rich text formatting ✅
    - Support emoji and Unicode characters ✅
  - [P0] Create and participate in message threads ✅
    - View parent message at top of thread ✅
    - Reply in thread context ✅
    - Show reply count in channel view ✅
    - Handle deleted messages in threads ✅
  - [P0] Edit and delete their own messages ✅
    - Edit message content ✅
    - Show edit indicator ✅
    - Soft delete with "This message has been deleted" ✅
    - Preserve thread context for deleted messages ✅
  - [P0] React to messages with emojis ✅
    - Add reactions ✅
    - Remove reactions ✅
    - Show reaction counts ✅
  - [P0] See typing indicators in real-time ✅
    - Show when users are typing in channels ✅
    - Show when users are typing in threads ✅
    - Clear indicator when user stops typing ✅
    - Support multiple simultaneous typing users ✅
    - Show "You are typing" for current user ✅
  - [P1] Track message read states
  - [P1] Mark any message as "unread from here"
    - Updates read state to mark all newer messages as unread
    - Updates unread indicators accordingly
  - [P1] Enhanced Rich Text Features
    - Link previews with metadata
    - URL unfurling with preview cards
    - OpenGraph data display
    - Domain icons/favicons
    - Lists and blockquotes
    - Tables
    - Code block syntax highlighting ✅
    - Inline code formatting ✅
    - Bold, italic, strikethrough formatting ✅
    - Links with custom styling ✅
  - [P1] Enhanced Emoji Reactions
    - Emoji picker UI
    - Reaction tooltips showing who reacted
    - Reaction grouping and sorting
  - [P1] Enhanced Message Editing
    - Edit history tracking
    - Keyboard shortcuts for editing

### Search

- Users must be able to:
  - [P0] Search message content ✅
    - Full-text search across all accessible channels ✅
    - Real-time search results ✅
    - Keyboard shortcuts (⌘K/Ctrl+K) ✅
  - [P0] Use search filters ✅
    - Channel filter: `channel:name` ✅
    - User filter: `user:@name` ✅
    - Thread filter: `has:thread` ✅
    - Date filters: `before:YYYYMMDD`, `after:YYYYMMDD` ✅
    - Exclusion filters with `-` prefix ✅
      - `-channel:name`: Exclude channel ✅
      - `-user:@name`: Exclude user ✅
      - `-has:thread`: Exclude threaded messages ✅
    - Multiple filters support ✅
    - Combining filters with search terms ✅
  - [P0] View search results ✅
    - Message preview with context ✅
    - Channel and user information ✅
    - Timestamp display ✅
    - Click to jump to message ✅

### Channels and Direct Messages

- The system must support:
  - [P0] Public channels
    - Creation and basic management
    - Member management
  - [P0] Private channels
    - Invitation-only access
    - Member visibility controls
  - [P0] Direct messages (1:1)
  - [P0] Channel/conversation sidebar
  - [P1] Unread indicators
  - [P1] Group direct messages

### User Experience

- The system must provide:
  - [P0] Exact Slack UI replication
    - Identical component layout
    - Matching styles and animations
  - [P0] Dark/light theme support
  - [P0] All standard Slack keyboard shortcuts
  - [P0] Responsive design matching Slack
  - [P0] Accessibility features (WCAG 2.1)
  - [P1] Loading states and animations
  - [P1] Context menus and tooltips

### Out of Scope Features

The following features are planned for future releases:

1. File Handling
   - File upload and sharing
   - File preview functionality
   - File comments and reactions
   - File search capabilities
   - Storage management
   - File type restrictions

2. Progressive Web App Features
   - Offline functionality
   - Installation as PWA
   - Service worker implementation
   - Background sync
   - Push notifications
   - Local storage and caching

3. **Enhanced Message Timestamps**
   - Relative time display (e.g., "2 hours ago")
   - Detailed timestamp on hover
   - Timezone support

4. **Message Pinning**
   - Pin/unpin functionality
   - Pinned messages view
   - Pin permissions

5. **Message Bookmarks**
   - Bookmark functionality
   - Saved items view
   - Personal bookmark collections

6. **Message Broadcasting**
   - Announcement message types
   - Special announcement styling
   - Broadcast permissions

7. **Message Notifications**
   - Notification system
   - Mention notifications
   - Notification preferences

Priority Levels:

- P0: Must have for 2-day MVP launch
  - Core features required for basic functionality
  - Estimated completion: 2 days
  - Complexity: Low to Medium
- P1: Important but can be added post-launch
  - Enhanced features for better user experience
  - Estimated completion: 1-2 weeks
  - Complexity: Medium
- P2: Nice to have features
  - Quality of life improvements
  - Estimated completion: 2-4 weeks
  - Complexity: Medium to High

---

## Non-Functional Requirements

These requirements define the operational qualities of the system.

### Performance

- Message Delivery
  - 95th percentile latency < 100ms under normal load
  - 99th percentile latency < 250ms under peak load
  - Peak load defined as 100 concurrent users per channel

- Real-time Updates
  - Typing indicators: 95th percentile < 50ms
  - Presence updates: 95th percentile < 100ms
  - Under normal network conditions (< 50ms RTT)

- Page Performance
  - Initial page load: < 2s (95th percentile)
  - Time to Interactive: < 3s (95th percentile)
  - First Contentful Paint: < 1.5s (95th percentile)
  - Core Web Vitals compliance

- Client Performance
  - 60fps scrolling and animations
  - Memory usage < 200MB
  - CPU usage < 30% during normal operation

### Scalability

- Support for initial user base (development/testing)
- Database design ready for future scaling

### Security

- Authentication & Authorization
  - Basic email/password authentication
  - Session-based cookie authentication
  - Rate limiting: 5 failed attempts per minute
  - Password requirements:
    - Minimum 8 characters
  - [P1] Password reset functionality
    - Secure reset token generation
    - Time-limited reset links
    - Email delivery system
    - Rate limiting on reset requests
  - [P1] Enhanced session management
    - Session tracking and management
    - Session revocation
    - Activity logging
  - [P1] Advanced rate limiting
    - IP-based rate limiting
    - Adaptive rate limiting
    - Rate limit by user and endpoint
  - [P1] Audit logging
    - Authentication events
    - Password changes
    - Profile updates
    - Security-related actions
  - [P1] Email verification system
    - Email verification on signup
    - Re-verification for email changes
    - Secure token generation
  - [P1] Two-factor authentication
    - TOTP support
    - Backup codes
    - Device remembering
  - [P1] OAuth provider integration
    - Support for major providers
    - Profile data mapping
    - Token management
  - [P1] Remember me functionality
    - Secure persistent tokens
    - Device fingerprinting
    - Token rotation
  - [P1] Account security features
    - Account lockout after failed attempts
    - Security questions/answers
    - IP-based security
  - [P1] Enhanced password policies
    - Password complexity rules
    - Password history
    - Password expiration
  - [P1] Session management
    - Device tracking
    - Concurrent session handling
    - Session analytics

- Session Management
  - Server-side session storage
  - Session timeout after 24 hours of inactivity
  - Force logout on password change

- API Security
  - Rate limiting: 100 requests per minute per user
  - Input validation on all endpoints
  - Request size limits (max 1MB)
  - Basic CORS configuration for development

### UI/UX

- Pixel-perfect match with Slack
- WCAG 2.1 accessibility compliance
- Responsive from 320px to 4K
- Support for all modern desktop browsers

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

### Channels/DMs

- Channel creation works as in Slack
- Member management functions properly
- Sidebar organization matches Slack
- Unread states work correctly

### Authentication

- Passport.js login flow works smoothly
- Sessions persist appropriately
- Profile management works correctly
