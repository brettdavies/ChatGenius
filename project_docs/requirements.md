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
    - Email/password authentication (plaintext)
    - Session-based cookie authentication
  - [P0] Session management
    - 24-hour session duration
    - Server-side session storage
  - [P1] User profile management
    - Profile picture upload
    - Display name customization
    - Time zone settings

### Messaging

- Users must be able to:
  - [P0] Send and receive messages in real-time using SSE
    - Support rich text formatting
    - Support emoji and Unicode characters
  - [P0] Create and participate in message threads
  - [P0] Edit and delete their own messages
  - [P0] React to messages with emojis
  - [P0] See typing indicators in real-time
  - [P1] Track message read states
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
