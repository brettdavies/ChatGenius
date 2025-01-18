# ChatGenius Requirements

## Table of Contents

1. [Subsystem: Authentication](#subsystem-authentication)  
2. [Subsystem: User Experience (UI/UX)](#subsystem-user-experience-uiux)  
3. [Subsystem: Messaging](#subsystem-messaging)  
4. [Subsystem: Search](#subsystem-search)  
5. [Subsystem: Channels and Direct Messages](#subsystem-channels-and-direct-messages)  
6. [Subsystem: Out of Scope Features](#subsystem-out-of-scope-features)  
7. [Subsystem: Non-Functional Requirements](#subsystem-non-functional-requirements)  
8. [Subsystem: Acceptance Criteria](#subsystem-acceptance-criteria)  

---

## Subsystem: Authentication

priority: P0  
id: auth_subsystem  
description: "Handles user login, session management, and security (passwords, 2FA)."

### Sub-feature: Basic Email/Password Auth

status:

- db: done
- server: done
- client: done
- openapi: done
- tests: not_started
- docs: done

references:

- path: server/src/db/schema/01_users.sql
- path: server/src/db/queries/users.ts

acceptance_criteria:

- "Users can register/login with email/password."
- "Passwords are hashed (bcrypt)."
- "Database table 'users' is used to store credentials."

tests:

- "Auth flow tests for login and register."
- "Security tests for password hashing."

---

### Sub-feature: Session-based Cookie Auth

status:

- db: done
- server: done
- client: done
- openapi: done
- tests: not_started
- docs: done

references:

- path: server/src/db/pool.ts
- path: server/src/config/env.ts

acceptance_criteria:

- "Session cookies persist across refreshes until timeout."
- "Server sets secure session cookie."

tests:

- "Session tests covering creation, expiry."

---

### Sub-feature: Password Security

status:

- db: done
- server: done
- client: done
- openapi: done
- tests: not_started
- docs: done

references:

- path: auth/user-service.ts

acceptance_criteria:

- "Passwords validated on client side (e.g., min length, complexity)."
- "Passwords invalid if they do not meet policy."

tests:

- "Client-side validation tests."
- "Security tests for strong-hash verification."

---

### Sub-feature: Session Management

status:

- db: done
- server: done
- client: done
- openapi: done
- tests: not_started
- docs: not_started

references:

- path: services/session-cleanup.ts
- path: stores/auth.store.ts

acceptance_criteria:

- "Session duration is enforced (auto-expiry)."
- "Old sessions are cleaned up regularly."

tests:

- "Expiry tests verifying session invalidation."
- "Cleanup tests ensuring old sessions are purged."

---

### Sub-feature: Two-factor Authentication (TOTP)

status:

- db: done
- server: done
- client: done
- openapi: done
- tests: not_started
- docs: done

references:

- path: server/src/db/migrations/004_add_totp.sql

acceptance_criteria:

- "Users with 2FA enabled must provide a valid TOTP code at login."
- "System stores TOTP secrets in the database securely."

tests:

- "TOTP test verifying code acceptance/rejection steps."
- "Integration test for TOTP enabling/disabling."

---

## Subsystem: User Experience (UI/UX)

priority: P0  
id: ux_subsystem  
description: "Replicates Slack’s UI design and ensures interactive, responsive user experiences."

### Sub-feature: Exact Slack UI Replication

status:

- db: not_required
- server: not_required
- client: done
- openapi: not_required
- tests: not_started
- docs: done

references:

- path: client/src/components

acceptance_criteria:

- "Grid layout matches Slack’s structure."
- "Animations and transitions match Slack."

tests:

- "Layout tests verifying component arrangement."
- "Visual tests for CSS/animation correctness."

---

### Sub-feature: Theme Support

status:

- db: not_required
- server: not_required
- client: done
- openapi: not_required
- tests: not_started
- docs: done

references:

- path: client/src/stores

acceptance_criteria:

- "Dark and light themes are available."
- "Users can switch appearance in real-time."

tests:

- "Theme tests verifying toggling correctness."

---

### Sub-feature: Keyboard Shortcuts

status:

- db: not_required
- server: not_required
- client: not_started
- openapi: not_required
- tests: not_started
- docs: not_started

references:

- path: client/src/components

acceptance_criteria:

- "Standard Slack shortcuts (e.g., Ctrl+K) recognized."

tests:

- "Key event tests ensuring correct triggers."

---

### Sub-feature: Responsive Design

status:

- db: not_applicable
- server: not_applicable
- client: done
- openapi: not_applicable
- tests: not_started
- docs: done

references:

- path: responsive CSS approach
- doc: responsive guide

acceptance_criteria:

- "Layout adapts seamlessly to mobile or desktop."
- "No major visual anomalies on small screens."

tests:

- "Responsive tests verifying breakpoints."

---

### Sub-feature: Accessibility (WCAG 2.1)

status:

- db: not_applicable
- server: not_applicable
- client: done
- openapi: not_applicable
- tests: not_started
- docs: done

references:

- path: ARIA roles in UI
- doc: a11y guide

acceptance_criteria:

- "WCAG 2.1 guidelines are followed for color contrast, ARIA tags, etc."
- "Keyboard navigation works for all key features."

tests:

- "A11y tests verifying screen-reader compatibility."

---

### Sub-feature: Loading States

status:

- db: not_required
- server: not_required
- client: done
- openapi: not_required
- tests: not_started
- docs: done

references:

- path: client/src/components

acceptance_criteria:

- "Spinners or skeletons shown during data fetch."

tests:

- "Loading tests to confirm consistent usage."

---

### Sub-feature: Context UI (Menus & Tooltips)

status:

- db: not_required
- server: not_required
- client: done
- openapi: not_required
- tests: not_started
- docs: done

references:

- path: client/src/components

acceptance_criteria:

- "Context menus appear on right-click or relevant triggers."
- "Tooltips display on hover/focus."

tests:

- "UI tests verifying correct menu & tooltip behavior."

---

## Subsystem: Messaging

priority: P0  
id: messaging_subsystem  
description: "Core messaging features, including real-time updates, threads, edits, reactions."

### Sub-feature: Basic Message Operations

status:

- db: done
- server: done
- client: done
- openapi: done
- tests: not_started
- docs: done

references:

- path: server/src/db/schema/04_messages.sql
- path: server/src/db/queries/messages.ts
- path: server/src/services/message-service.ts
- path: server/src/routes/messages.ts
- path: server/src/middleware/message-rate-limit.ts

acceptance_criteria:

- "Users can send/receive text messages in real-time."
- "Rich text formatting is supported."
- "Emoji and full Unicode handled gracefully."

tests:

- "Message flow tests."
- "Formatting scenarios."

---

### Sub-feature: Message Threading

status:

- db: done
- server: done
- client: done
- openapi: done
- tests: not_started
- docs: done

references:

- path: server/src/db/schema/04_messages.sql
- path: server/src/services/message-service.ts
- path: server/src/routes/messages.ts

acceptance_criteria:

- "Users can create threads and post replies."
- "Thread indicators show reply counts."

tests:

- "Thread flows covering creation, replies."

---

### Sub-feature: Message Modifications

status:

- db: done
- server: done
- client: done
- openapi: done
- tests: not_started
- docs: done

references:

- path: server/src/db/schema/04_messages.sql
- path: server/src/services/message-service.ts
- path: server/src/routes/messages.ts

acceptance_criteria:

- "Users can edit previously sent messages."
- "Users can delete messages (soft delete)."

tests:

- "Edit flows and deletion flows."

---

### Sub-feature: Message Reactions

status:

- db: done
- server: done
- client: done
- openapi: done
- tests: not_started
- docs: done

references:

- path: server/src/db/schema/reactions.sql
- path: server/src/services/message-service.ts
- path: server/src/routes/messages.ts

acceptance_criteria:

- "Users can add and remove emoji reactions."
- "Reactions update in real-time."

tests:

- "Reaction flows verifying add/remove logic."

---

### Sub-feature: Real-time Features (Typing Indicators)

status:

- db: done
- server: done
- client: done
- openapi: done
- tests: not_started
- docs: done

references:

- path: server/src/db/schema/04_messages.sql
- path: server/src/db/pool.ts

acceptance_criteria:

- "Typing indicator displays for all active typers."
- "Multiple typing users updated in real-time."

tests:

- "Typing flows verifying real-time UI updates."

---

## Subsystem: Search

priority: P0  
id: search_subsystem  
description: "Provides robust search functionality (full-text queries, filters, real-time results)."

### Sub-feature: Message Content Search

status:

- db: done
- server: done
- client: done
- openapi: done
- tests: not_started
- docs: done

references:

- path: server/src/db/schema/04_messages.sql
- path: server/src/services/message-service.ts
- path: server/src/routes/messages.ts

acceptance_criteria:

- "Search returns relevant messages quickly."
- "Supports partial matching, real-time or near real-time results."

tests:

- "Search flows unit/integration tests."
- "Performance tests for large data sets."

---

### Sub-feature: Search Filters

status:

- db: done
- server: done
- client: done
- openapi: done
- tests: not_started
- docs: done

references:

- path: server/src/services/message-service.ts
- path: server/src/routes/messages.ts

acceptance_criteria:

- "Users can filter by channel, user, date, membership, thread, or exclude terms."
- "System returns correct filtered results."

tests:

- "Filter scenarios (channel, user, date, exclusions)."

---

### Sub-feature: Search Results

status:

- db: done
- server: done
- client: done
- openapi: done
- tests: not_started
- docs: done

references:

- path: server/src/db/queries/channels.ts
- path: server/src/db/queries/users.ts
- doc: preview docs

acceptance_criteria:

- "Displays previews of message content, allows ‘jump to message.’"
- "Context around each result is shown."

tests:

- "Preview tests, context tests, navigation tests."

---

## Subsystem: Channels and Direct Messages

priority: P0  
id: channels_subsystem  
description: "Management of public/private channels, DM creation, membership, and sidebars."

### Sub-feature: Public Channels

status:

- db: done
- server: done
- client: done
- openapi: done
- tests: not_started
- docs: done

references:

- path: server/src/db/schema/02_channels.sql
- path: server/src/db/queries/channels.ts
- path: server/src/routes/channels.ts
- path: server/src/services/channel-service.js
- path: server/src/middleware/channel-rate-limit.ts
- path: server/src/utils/channel-validation.ts
- path: server/src/config/env.ts
- doc: Rate limiting documentation

acceptance_criteria:

- "Users can create, update, archive, and soft-delete public channels."
- "Channel member management (add/remove/update roles)."
- "Input validation for channel names and descriptions."
- "Rate limiting for all channel operations."
- "Proper error handling and input sanitization."

tests:

- "Unit, integration, e2e for channel creation/updates."
- "Role scenario tests (member, admin, owner)."
- "Rate limit tests for all operations."
- "Validation tests for inputs."

### Sub-feature: Private Channels

status:

- db: done
- server: done
- client: done
- openapi: done
- tests: not_started
- docs: done

references:

- path: server/src/db/schema/02_channels.sql
- path: server/src/db/queries/channels.ts
- path: server/src/routes/channels.ts
- path: server/src/services/channel-service.js
- path: server/src/middleware/channel-rate-limit.ts
- path: server/src/utils/channel-validation.ts
- path: server/src/config/env.ts
- doc: Rate limiting documentation

acceptance_criteria:

- "Only invited members can join private channels."
- "Permission-based access (owner, admin, member)."
- "Rate limiting for all operations."
- "Input validation and sanitization."

tests:

- "Invite flows, visibility flows, permission scenarios."
- "Rate limit tests for all operations."
- "Validation tests for inputs."

### Sub-feature: Direct Messages (1:1)

status:

- db: done
- server: done
- client: done
- openapi: done
- tests: not_started
- docs: done

references:

- path: server/src/db/schema/02_channels.sql
- path: server/src/db/queries/channels.ts
- path: server/src/routes/channels.ts
- path: server/src/services/channel-service.js
- path: server/src/middleware/channel-rate-limit.ts
- path: server/src/utils/channel-validation.ts
- path: server/src/config/env.ts
- doc: Rate limiting documentation

acceptance_criteria:

- "Users can create 1:1 DM channels quickly."
- "Automatic membership for both participants."
- "Rate limiting for operations."
- "Member count validation (max 2 users)."

tests:

- "DM flows verifying creation, membership."
- "Privacy flows for confidentiality."
- "Rate limit tests."
- "Member count validation tests."

### Sub-feature: Channel/Conversation Sidebar

status:

- db: not_required
- server: done
- client: done
- openapi: done
- tests: not_started
- docs: done

references:

- path: server/src/db/queries/channels.ts

acceptance_criteria:

- "Displays all accessible channels, channel types, and member counts."
- "Sidebars reflect real-time membership changes."

tests:

- "List flows, type flows, count flows."

### Sub-feature: Unread Indicators

priority: P1
status:

- db: done
- server: done
- client: done
- openapi: done
- tests: not_started
- docs: done

references:

- doc: unread guide

acceptance_criteria:

- "Unread message counts displayed per channel."
- "Unread indicators cleared on channel view."

tests:

- "Unread flows verifying correct logic & UI highlight."

### Sub-feature: Group Direct Messages

status:

- db: not_started
- server: not_started
- client: not_started
- openapi: done
- tests: not_started
- docs: not_started

references:

- doc: group guide

acceptance_criteria:

- "Users can create multi-user DM sessions."
- "Privacy & membership parallels private channels."

tests:

- "Group DM flows (creation, membership)."

### Sub-feature: Channel Organization

priority: P1
status:

- db: done
- server: not_started
- client: not_started
- openapi: done
- tests: not_started
- docs: not_required

references:

- doc: order guide, section guide, favorite guide

acceptance_criteria:

- "Channel ordering, sections/folders, favorites are supported."
- "Drag-and-drop or UI controls for reordering."

tests:

- "Order flows, section flows, favorite flows."

### Sub-feature: Channel Analytics

status:

- db: not_started
- server: not_started
- client: not_started
- openapi: done
- tests: not_started
- docs: not_started

references:

- doc: analytics.md, stats.md, metrics.md

acceptance_criteria:

- "Member activity, message stats, growth metrics tracked."
- "Charts and data available in UI."

tests:

- "Analytics flows verifying data correctness."
- "Performance tests for large channel data."

## Subsystem: Out of Scope Features

priority: P2  
id: future_features  
description: "Planned for future releases, not part of current MVP."

### Sub-feature: File Handling

status:

- db: not_started
- server: not_started
- client: not_started
- openapi: done
- tests: not_started
- docs: not_started

acceptance_criteria:

- "File upload/sharing, previews, search, storage mgmt."
- "Restricted file types enforced."

tests:

- "No tests in current scope."

### Sub-feature: Progressive Web App (PWA)

status:

- db: not_started
- server: not_started
- client: not_started
- openapi: done
- tests: not_started
- docs: not_started

acceptance_criteria:

- "Offline mode, background sync, push notifications."
- "Installable PWA with service worker."

tests:

- "No tests in current scope."

### Sub-feature: Enhanced Message Timestamps

status:

- db: not_started
- server: not_started
- client: not_started
- openapi: done
- tests: not_started
- docs: not_started

  relative_time: done
  detailed_hover: done
  timezone_support: done

acceptance_criteria:

- "Relative time display and detailed on hover."
- "Timezones handled consistently."

tests:

- "No further tests (beyond basic done items)."

### Sub-feature: Message Pinning & Bookmarks

status:

- db: not_started
- server: not_started
- client: not_started
- openapi: done
- tests: not_started
- docs: not_started

acceptance_criteria:

- "Pin/unpin, pinned messages view, personal bookmarks."

tests:

- "No tests in current scope."

### Sub-feature: Message Broadcasting

status:

- db: not_started
- server: not_started
- client: not_started
- openapi: done
- tests: not_started
- docs: not_started

acceptance_criteria:

- "Announcement message type, special styling, broadcast perms."

tests:

- "No tests in current scope."

### Sub-feature: Message Notifications

status:
  basic_mentions: done
  advanced_notifs: not_started
  preferences: not_started

acceptance_criteria:

- "Advanced notification system, user prefs."

tests:

- "No tests in current scope."

## Subsystem: Non-Functional Requirements

priority: P0  
id: nfr_subsystem  
description: "Performance, scalability, security, maintainability, etc."

### Sub-feature: Performance (Message Delivery)

status:

- db: done
- server: done
- client: done
- openapi: done
- tests: done
- docs: done

references:

- path: server/src/services/message.service.ts
- path: server/src/monitoring/performance.monitor.ts
- doc: performance.md

acceptance_criteria:

- "Messages delivered in <200ms under normal load."
- "Performance metrics tracked."

tests:

- "Performance test verifying latency."

### Sub-feature: Real-time Updates

status:

- db: done
- server: done
- client: not_started
- openapi: done
- tests: not_started
- docs: done

references:

- path: server/src/services/realtime-service.ts
- path: server/src/services/event-service.ts
- path: server/src/middleware/event-rate-limit.ts
- path: server/src/routes/events.ts

acceptance_criteria:

- "Real-time message delivery via SSE."
- "Channel events (created, updated, archived)."
- "Typing indicators and presence updates."
- "Rate limiting for SSE connections."
- "Event buffering and reconnection handling."

tests:

- "Real-time event flows and rate limits."
- "Connection management and cleanup."
- "Event delivery under load."

### Sub-feature: Page Performance

status:

- db: done
- server: done
- client: done
- openapi: done
- tests: done
- docs: done

references:

- path: performance.config.ts (client)
- doc: vitals.md

acceptance_criteria:

- "Vitals tracking: Time-to-first-byte, largest contentful paint, etc."

tests:

- "Vitals test ensuring performance thresholds."

### Sub-feature: Scalability

status:

- db: in_progress
- server: in_progress
- client: in_progress
- openapi: done
- tests: not_started
- docs: not_started

acceptance_criteria:

- "Database design can handle large user base."
- "Sharding/replication strategies are considered for future."

tests:

- "No direct tests yet (scalability is partially conceptual)."

### Sub-feature: Security

status:

- db: done
- server: done
- client: done
- openapi: done
- tests: done
- docs: done

references:

- path: auth.service.ts
- path: auth.middleware.ts
- doc: security.md

acceptance_criteria:

- "Proper authentication, authorization flows."
- "No RCE or injection vulnerabilities in code review."

tests:

- "Auth test ensuring correct role checks, encryption test coverage."

### Sub-feature: Data Protection

status:

- db: done
- server: done
- client: done
- openapi: done
- tests: done
- docs: done

references:

- path: encryption.service.ts, keys.service.ts
- doc: encryption.md

acceptance_criteria:

- "Sensitive data encrypted at rest and in transit."

tests:

- "Encryption test verifying correct key usage."

### Sub-feature: UI/UX (Maintainability)

status:

- db: done
- server: done
- client: done
- openapi: done
- tests: done
- docs: done

acceptance_criteria:

- "Follows coding standards with TypeScript."
- "Well-documented components."

tests:

- "Lint checks, basic UI test coverage."

### Sub-feature: Maintainability

status:

- db: done
- server: done
- client: done
- openapi: done
- tests: done
- docs: done

acceptance_criteria:

- "Code is modular, documented, TS-based."
- "Automated testing in place."

tests:

- "No dedicated tests here beyond lint/CI coverage."

### Sub-feature: Performance Monitoring

priority: P1
status:

- db: done
- server: not_started
- client: not_started
- openapi: done
- tests: not_started
- docs: not_required

acceptance_criteria:

- "Performance metrics tracked and monitored."
- "Alerts for performance degradation."
- "Dashboard for monitoring system health."

tests:

- "Performance monitoring flows and alerts."

## Subsystem: Acceptance Criteria

priority: P0  
id: acceptance_subsystem  
description: "These define when features are truly ‘done’ from a user/business perspective."

### Sub-feature: UI Matching

status:
  overall: n_a  # Not a code sub-feature, broad acceptance standard

acceptance_criteria:

- "Component layout, colors, and spacing match Slack exactly."
- "Animations match Slack."

tests:

- "Visual regression tests (UI snapshot)."

### Sub-feature: Messaging

status:
  overall: n_a

acceptance_criteria:

- "Messages appear in real-time with rich text and emoji."
- "Threading matches Slack’s design."

tests:

- "End-to-end tests simulating user messaging."

### Sub-feature: Channels/DMs

status:
  overall: n_a

acceptance_criteria:

- "Channel creation/management fully functional."
- "Sidebar organization and unread states mirror Slack."

tests:

- "Scenario tests for channel membership, unread states."

### Sub-feature: Authentication

status:
  overall: n_a

acceptance_criteria:

- "Login flow (Passport.js or custom) is smooth."
- "Sessions persist and profile management works."

tests:

- "End-to-end auth tests ensuring 2FA if enabled."

## Rate Limiting

### Channel Operations

- Channel Creation: 10 requests per hour
- Channel Updates: 30 requests per minute
- Channel Member Operations: 50 requests per 5 minutes
- Channel Deletion: 10 requests per hour
- Channel Archival: 10 requests per hour
- Channel Read Operations: 100 requests per minute

These limits are configurable through environment variables:

- `CHANNEL_CREATE_RATE_LIMIT_WINDOW_MS` and `CHANNEL_CREATE_RATE_LIMIT_MAX_REQUESTS`
- `CHANNEL_UPDATE_RATE_LIMIT_WINDOW_MS` and `CHANNEL_UPDATE_RATE_LIMIT_MAX_REQUESTS`
- `CHANNEL_MEMBERS_RATE_LIMIT_WINDOW_MS` and `CHANNEL_MEMBERS_RATE_LIMIT_MAX_REQUESTS`
- `CHANNEL_DELETE_RATE_LIMIT_WINDOW_MS` and `CHANNEL_DELETE_RATE_LIMIT_MAX_REQUESTS`
- `CHANNEL_ARCHIVE_RATE_LIMIT_WINDOW_MS` and `CHANNEL_ARCHIVE_RATE_LIMIT_MAX_REQUESTS`
- `CHANNEL_READ_RATE_LIMIT_WINDOW_MS` and `CHANNEL_READ_RATE_LIMIT_MAX_REQUESTS`

---
