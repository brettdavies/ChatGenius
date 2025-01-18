# ChatGenius Overview

This document provides a high-level introduction to the ChatGenius project, including its vision, objectives, scope, and key details. It is intended to align all team members and stakeholders with the project’s goals and purpose.

---

## Table of Contents

- [ChatGenius Overview](#chatgenius-overview)
  - [Table of Contents](#table-of-contents)
  - [Project Vision](#project-vision)
  - [Objectives](#objectives)
    - [Primary Objectives](#primary-objectives)
    - [Secondary Objectives](#secondary-objectives)
  - [Scope](#scope)
    - [In-Scope](#in-scope)
    - [Out-of-Scope (MVP Phase)](#out-of-scope-mvp-phase)
  - [Key Milestones](#key-milestones)
  - [Tech Stack Overview](#tech-stack-overview)
    - [Frontend Stack](#frontend-stack)
    - [Server Stack](#server-stack)
    - [Real-time Implementation](#real-time-implementation)
    - [Database Stack](#database-stack)
  - [Key Risks and Mitigations](#key-risks-and-mitigations)
  - [Stakeholders and Teams](#stakeholders-and-teams)
    - [Key Stakeholders](#key-stakeholders)
    - [Development Team](#development-team)
    - [External Dependencies](#external-dependencies)
  - [Rate Limiting](#rate-limiting)
    - [Channel Operations](#channel-operations)
    - [Real-time Events](#real-time-events)
    - [Implementation](#implementation)
    - [Environment Variables](#environment-variables)
    - [Error Handling](#error-handling)
  - [Real-time Features](#real-time-features)
    - [Server-Sent Events (SSE)](#server-sent-events-sse)
    - [Rate Limiting](#rate-limiting-1)

---

## Project Vision

ChatGenius aims to create an exact replica of Slack's functionality and user interface. The project will focus on creating a complete clone of Slack with identical features and user experience.

Our goal is to develop a communication platform that is indistinguishable from Slack in its base functionality, providing users with a familiar and robust workplace communication tool.

---

## Objectives

### Primary Objectives

1. Create a Slack clone with:
   - Identical user interface and experience
   - Real-time messaging with SSE technology
   - Complete feature parity including:
     - Channel-based communication
     - Direct messaging
     - Thread support
     - Emoji reactions
     - User presence indicators
     - Search functionality

### Secondary Objectives

1. User Experience Excellence (P1):
   - Match Slack's UI precisely
   - Ensure responsive design matching Slack's behavior
   - Implement all keyboard shortcuts and accessibility features
   - Support all languages and alphabets
   - Maintain real-time performance matching Slack's standards
   - Unread message indicators and notification management
   - Channel organization and workspace structure

2. Developer Experience:
   - Establish clear documentation and coding standards
   - Implement efficient development workflows using Cursor AI
   - Create automated testing and deployment pipelines
   - Maintain modular architecture for future enhancements

3. Non-Functional Requirements (P1):
   - Performance monitoring and optimization
   - Resource usage tracking
   - Response time metrics
   - Real-time event delivery monitoring
   - Connection health tracking

---

## Scope

### In-Scope

MVP Phase (2 Day Delivery):

- User Management
  - Auth0-based authentication with:
    - Social logins (Google, GitHub)
    - Email/password
  - User profiles matching Slack's format
  - Real-time presence indicators
  - Custom status messages
  - User preferences and settings

- Messaging Core
  - Real-time messaging via SSE
  - Full Unicode support for all languages
  - Rich text formatting
  - Markdown support
  - Emoji reactions (full parity with Slack)
  - Message editing and deletion with history
  - Typing indicators
  - Read states
  - Thread support with full functionality
  - Message search with Slack-like operators

- Channels & Direct Messages
  - Public and private channels
  - Direct messages (1:1)
  - Group direct messages
  - Channel creation and management
  - User invitations
  - Channel/conversation sidebar
  - Unread indicators
  - Channel/conversation search

- UI/UX
  - Pixel-perfect Slack clone
  - Dark/light theme support
  - All keyboard shortcuts
  - Responsive design matching Slack
  - Loading states and animations
  - Error states and notifications
  - Context menus
  - Tooltips and help text

### Out-of-Scope (MVP Phase)

- Mobile native applications
- Video/audio calls
- Screen sharing
- Third-party integrations (except Auth0)
- Custom emoji support
- Message scheduling
- Workflow builder
- Advanced search operators
- Analytics and insights
- User groups and org structure
- Compliance exports
- Custom retention policies
- File handling features:
  - File upload and sharing
  - File previews and comments
  - Storage management
  - File search functionality
- PWA features:
  - Offline support
  - Service Workers
  - Installation capabilities
  - Background sync
  - Push notifications
  - Local storage and caching

---

## Key Milestones

| Milestone           | Description                                        | Target Date    | Status       |
|--------------------|----------------------------------------------------|----------------|--------------|
| Project Initiation | Setup repository, documentation, and infrastructure | Jan 10, 2024   | Completed    |
| Day 1 Development  | Core messaging, channels, and auth implementation   | Jan 11, 2024   | In Progress  |
| Day 2 Development  | UI polish, testing, and deployment                 | Jan 12, 2024   | Planned      |

---

## Tech Stack Overview

| Layer        | Technology                          | Rationale                                   |
|--------------|-------------------------------------|--------------------------------------------|
| Frontend     | React, TypeScript, Tailwind, Vite   | Modern, type-safe UI development           |
| State        | Zustand                            | Simple, flexible state management          |
| Server       | Node.js, TypeScript, Express        | Type-safe, efficient message handling      |
| Database     | PostgreSQL                          | Reliable, self-hosted database             |
| Real-time    | Server-Sent Events (SSE)           | Simple, reliable one-way real-time updates |
| Auth         | Passport.js                        | Session-based authentication               |
| Testing      | Jest, React Testing Library        | Comprehensive test coverage                |
| Deployment   | Docker                             | Containerized deployment and scaling       |
| Development  | Cursor AI                          | AI-powered development assistance          |

### Frontend Stack

- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui
- **Build Tool**: Vite
- **State Management**: Zustand
- **Testing**: Jest + React Testing Library

### Server Stack

- **Runtime**: Node.js
- **Framework**: Express with TypeScript
- **API Style**: RESTful with SSE
- **Authentication**: Passport.js + Session
- **Testing**: Jest + Supertest
- **Documentation**: OpenAPI/Swagger

### Real-time Implementation

The application uses Server-Sent Events (SSE) for real-time updates:

1. **Event Service**:
   ```typescript
   // Example channel event emission in services
   private realtimeService = RealtimeService.getInstance();

   async createChannel(data: CreateChannelInput): Promise<Channel> {
     const channel = await createChannelInDB(data);
     
     await this.realtimeService.emit({
       type: ChannelEventType.CHANNEL_CREATED,
       channelId: channel.id,
       userId: data.createdBy,
       timestamp: new Date(),
       data: channel
     });
     
     return channel;
   }
   ```

2. **Event Types**:
   - Channel operations (create, update, archive, delete)
   - Member changes (join, leave, role updates)
   - Typing indicators
   - Presence updates

3. **Connection Management**:
   - Automatic reconnection
   - Event buffering
   - Connection pooling
   - Proper cleanup on disconnect

4. **Performance Considerations**:
   - Event batching for multiple rapid updates
   - Connection limits per user
   - Event filtering based on user permissions
   - Efficient event routing

5. **Rate Limiting**:
   - Channel Creation: 10 requests per hour
   - Channel Updates: 30 requests per minute
   - Channel Member Operations: 50 requests per 5 minutes
   - Channel Deletion: 10 requests per hour
   - Channel Archival: 10 requests per hour
   - Channel Read Operations: 100 requests per minute

6. **Environment Configuration**:
   Rate limits are configurable through environment variables:
   - Create operations: `CHANNEL_CREATE_RATE_LIMIT_*`
   - Update operations: `CHANNEL_UPDATE_RATE_LIMIT_*`
   - Member operations: `CHANNEL_MEMBERS_RATE_LIMIT_*`
   - Delete operations: `CHANNEL_DELETE_RATE_LIMIT_*`
   - Archive operations: `CHANNEL_ARCHIVE_RATE_LIMIT_*`
   - Read operations: `CHANNEL_READ_RATE_LIMIT_*`

7. **Client Integration**:
   ```typescript
   // Example SSE client connection
   const events = new EventSource('/api/events/channels/${channelId}/events');
   
   events.onmessage = (event) => {
     const channelEvent = JSON.parse(event.data);
     // Handle different event types
     switch (channelEvent.type) {
       case 'channel.created':
         // Update UI with new channel
         break;
       case 'channel.member_joined':
         // Update member list
         break;
       // ... handle other events
     }
   };
   ```

8. **Error Handling**:
   - Automatic retry on connection failure
   - Exponential backoff for reconnection attempts
   - Event queue management during disconnection
   - Graceful degradation to polling if SSE fails

### Database Stack

- **Database**: PostgreSQL (self-hosted)
- **Connection**: node-postgres with connection pooling
- **Security**: SSL/TLS encryption
- **Events**: LISTEN/NOTIFY
- **Migrations**: Custom migration system
- **Testing**: Integration tests

---

## Key Risks and Mitigations

| Risk                                    | Mitigation                                        |
|----------------------------------------|--------------------------------------------------|
| Tight 2-day timeline                    | Focus on core features first, clear prioritization|
| SSE scalability                         | Implement proper connection pooling and event buffering |
| UI matching complexity                  | Use component-driven development with strict specs|
| Real-time performance at scale          | Implement efficient PostgreSQL querying and indexing |
| Passport.js integration complexity      | Start with basic auth flow, expand features later |
| Database connection reliability         | Implement robust SSH tunneling with auto-reconnect |

---

## Stakeholders and Teams

### Key Stakeholders

- **Project Lead**: Brett Davies
  Responsible for overall project direction, technical decisions, and delivery

### Development Team

| Role               | Name           | Responsibilities                        |
|--------------------|----------------|----------------------------------------|
| Full Stack Dev     | Brett Davies   | End-to-end implementation              |

### External Dependencies

- **Auth0**: Authentication provider
- **PostgreSQL**: Database hosting
- **Vercel**: Deployment and hosting

---

## Rate Limiting

The application implements rate limiting to protect against abuse and ensure fair resource usage. Rate limits are configured through environment variables and can be adjusted based on deployment requirements.

### Channel Operations
- **Creation**: 10 requests per hour
- **Updates**: 30 requests per minute
- **Member Operations**: 50 requests per 5 minutes
- **Deletion**: 10 requests per hour
- **Archival**: 10 requests per hour
- **Read Operations**: 100 requests per minute

### Real-time Events
- **Event Subscriptions**: 1 connection per channel per user per hour
  - Ensures each user can only maintain one active SSE connection per channel
  - Prevents connection flooding
- **Typing Indicators**: 30 updates per minute
  - Balances real-time feedback with server load
  - Sufficient for normal typing behavior
- **Presence Updates**: 60 updates per minute
  - Allows for frequent presence status changes
  - Maintains real-time presence information without overwhelming the server

### Implementation
Rate limiting is implemented using `express-rate-limit` with the following features:
- IP-based rate limiting with support for proxy forwarding
- Standard rate limit headers (`RateLimit-*`)
- Configurable through environment variables
- Custom error messages with error codes
- Separate limits for different operation types

Example configuration:
```typescript
// Rate limit for SSE connections
export const eventSubscriptionLimiter = rateLimit({
  windowMs: ENV.RATE_LIMIT.EVENTS.SUBSCRIPTION.WINDOW_MS, // 1 hour
  max: ENV.RATE_LIMIT.EVENTS.SUBSCRIPTION.MAX_REQUESTS,   // 1 request
  message: {
    message: 'Too many event subscriptions',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});
```

### Environment Variables
Rate limits can be configured through the following environment variables:
```env
# Channel rate limits
CHANNEL_CREATE_RATE_LIMIT_WINDOW_MS=3600000
CHANNEL_CREATE_RATE_LIMIT_MAX_REQUESTS=10

# Event rate limits
EVENT_SUBSCRIPTION_RATE_LIMIT_WINDOW_MS=3600000
EVENT_SUBSCRIPTION_RATE_LIMIT_MAX_REQUESTS=1
EVENT_TYPING_RATE_LIMIT_WINDOW_MS=60000
EVENT_TYPING_RATE_LIMIT_MAX_REQUESTS=30
EVENT_PRESENCE_RATE_LIMIT_WINDOW_MS=60000
EVENT_PRESENCE_RATE_LIMIT_MAX_REQUESTS=60
```

### Error Handling
When a rate limit is exceeded, the API returns:
- Status code: `429 Too Many Requests`
- Response body:
  ```json
  {
    "message": "Too many requests, please try again later",
    "code": "RATE_LIMIT_EXCEEDED"
  }
  ```
- Headers:
  - `RateLimit-Limit`: Maximum requests allowed in the window
  - `RateLimit-Remaining`: Remaining requests in the current window
  - `RateLimit-Reset`: Time when the rate limit resets (Unix timestamp)

---

## Real-time Features

### Server-Sent Events (SSE)
- Real-time message delivery and updates
- Channel event notifications
- Typing indicators
- Presence updates
- Rate limiting: 1 connection per channel per user

### Rate Limiting
- Message operations:
  - Creation: 30/minute
  - Updates: 30/minute
  - Deletion: 20/minute
  - Reactions: 60/minute
  - Search: 30/minute
- Channel operations:
  - Creation: 10/hour
  - Updates: 30/minute
  - Member operations: 50/5 minutes
  - Deletion: 10/hour
  - Archival: 10/hour
  - Read operations: 100/minute

**Reminder**: This document is a living resource. Update it as the project evolves, particularly the scope, milestones, and team sections.
