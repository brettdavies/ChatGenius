# Project Structure: ChatGenius

This document describes the organization of the ChatGenius codebase, a Slack clone project. It provides an overview of the directory structure, naming conventions, and best practices for maintaining a scalable and maintainable application that matches Slack's functionality and appearance exactly.

---

## Directory Structure

Below is the directory structure for ChatGenius:

```plaintext
src/
├── actions/              # Server-side actions
│   ├── db/               # Database actions (PostgreSQL)
│   ├── auth/             # Auth0 integration
│   ├── messages/         # Message handling
│   ├── channels/         # Channel management
│   ├── files/           # File handling
├── app/                 # Next.js app router
│   ├── api/             # API routes
│   │   ├── auth/        # Auth0 endpoints
│   │   ├── channels/    # Channel endpoints
│   │   ├── messages/    # Message endpoints
│   │   ├── files/       # File endpoints
│   │   ├── events/      # SSE endpoints
│   ├── (routes)/        # Page routes
│       ├── _components/ # Route-specific components
│       ├── layout.tsx   # Main layout
│       ├── page.tsx     # Main chat interface
├── components/          # Shared components
│   ├── ui/              # Base UI components
│   │   ├── slack/       # Slack-specific components
│   ├── channel/         # Channel components
│   ├── message/         # Message components
│   ├── file/           # File handling components
│   ├── auth/           # Auth components
├── db/                 # Database
│   ├── migrations/     # PostgreSQL migrations
│   ├── schema/         # Database schemas
│   ├── queries/        # SQL queries
├── lib/               # Shared libraries
│   ├── hooks/         # Custom hooks
│   │   ├── channel/   # Channel hooks
│   │   ├── message/   # Message hooks
│   │   ├── auth/      # Auth hooks
│   │   ├── sse/       # SSE hooks
│   ├── offline/       # Offline functionality
│   │   ├── sync/      # Data sync
│   │   ├── storage/   # IndexedDB management
│   │   ├── cache/     # Cache strategies
│   ├── sse/          # SSE implementation
│   ├── utils/        # Utility functions
├── public/           # Static assets
│   ├── sw.js        # Service Worker
│   ├── manifest.json # PWA manifest
│   ├── icons/       # App icons
├── styles/          # Global styles
│   ├── slack/       # Slack-matching styles
├── types/           # TypeScript types
├── tests/          # Test suites
    ├── unit/       # Unit tests
    ├── integration/ # Integration tests
    ├── e2e/        # End-to-end tests
```

## Directory Overview

- actions/: Server-side logic
  - db/: PostgreSQL database operations
  - auth/: Auth0 authentication logic
  - messages/: Message handling with SSE
  - channels/: Channel and DM management
  - files/: File upload and management

- app/: Next.js application structure
  - api/: RESTful and SSE endpoints
  - (routes)/: Page components and layouts

- components/: React components
  - ui/slack/: Pixel-perfect Slack UI components
  - channel/: Channel and DM components
  - message/: Message and thread components
  - file/: File preview and upload components

- lib/: Shared functionality
  - hooks/: React hooks for features
  - offline/: PWA and offline features
  - sse/: Server-Sent Events implementation
  - utils/: Shared utilities

## File Naming Conventions

- Components: Match Slack's component names where possible
  - Example: `MessageInput.tsx`, `ThreadView.tsx`
- Styles: Use CSS modules with Slack-matching class names
  - Example: `p-message__input`, `c-thread_view`
- Tests: Name files to match their implementation
  - Example: `MessageInput.test.tsx`

## Component Organization

### Shared Components

Organize UI components to match Slack's structure:

```plaintext
components/ui/slack/
├── message/
│   ├── MessageInput.tsx
│   ├── MessageActions.tsx
│   ├── MessageReactions.tsx
├── thread/
│   ├── ThreadView.tsx
│   ├── ThreadHeader.tsx
├── channel/
│   ├── ChannelHeader.tsx
│   ├── ChannelList.tsx
```

### Best Practices

1. Slack UI Matching:
   - Use exact class names and structure
   - Match component hierarchy
   - Implement all keyboard shortcuts

2. Real-time Features:
   - SSE for all real-time updates
   - Typing indicators
   - Presence updates
   - Read states

3. Offline Support:
   - PWA installation
   - Message caching
   - File sync
   - Background updates

4. Testing Requirements:
   - Visual regression tests
   - Real-time feature tests
   - Offline capability tests

### Scalability Guidelines

1. Feature Organization:

   ```plaintext
   features/
   ├── channels/
   │   ├── components/
   │   ├── hooks/
   │   ├── utils/
   ├── messages/
   ├── threads/
   ├── files/
   ```

2. Performance Optimization:
   - Route-based code splitting
   - Image optimization
   - SSE connection management
   - IndexedDB optimization

3. State Management:
   - Real-time sync state
   - Offline state
   - UI state matching Slack

4. Error Handling:
   - Network errors
   - Auth failures
   - Offline conflicts
   - File upload issues

## Highlights

1. **Exact Slack Clone**:
   - Pixel-perfect UI components
   - Identical feature set
   - Matching performance

2. **Real-time First**:
   - SSE implementation
   - Real-time state management
   - Presence handling

3. **Offline Capable**:
   - PWA support
   - Sync management
   - File caching

4. **Developer Experience**:
   - Clear structure
   - Type safety
   - Comprehensive testing
