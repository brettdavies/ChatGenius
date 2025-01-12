# Project Structure: ChatGenius

This document describes the organization of the ChatGenius codebase. It provides an overview of the directory structure, naming conventions, and best practices for maintaining a scalable and maintainable application.

---

## Directory Structure

Below is the directory structure for ChatGenius:

```plaintext
.
├── db/                           # Database management package
│   ├── src/                     # Source code
│   │   ├── connection/         # Database connection management
│   │   ├── notifications/      # Database event notifications
│   │   └── shared/            # Shared utilities and types
│   ├── migrations/             # Database migration files
│   ├── schema/                 # Schema definitions and documentation
│   ├── scripts/                # Database utility scripts
│   ├── seeds/                  # Seed data scripts
│   └── backups/                # Backup-related scripts
├── server/                      # Server application
│   ├── src/                    # Source code
│   │   ├── api/               # API routes and controllers
│   │   ├── config/            # Configuration files
│   │   ├── middleware/        # Custom middleware
│   │   ├── models/            # Data models
│   │   ├── services/          # Business logic and services
│   │   ├── utils/             # Utility functions
│   │   └── types/            # TypeScript type definitions
│   └── tests/                 # Test files
├── frontend/                    # Frontend application
│   ├── src/                    # Source code
│   │   ├── components/        # Shared React components
│   │   │   ├── ui/           # UI components
│   │   │   └── features/     # Feature-specific components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── layouts/          # Layout components
│   │   ├── pages/            # Page components
│   │   ├── utils/            # Utility functions
│   │   └── types/           # TypeScript definitions
│   ├── public/               # Static assets
│   └── tests/                # Test files
└── README.md                   # Project documentation
```

## Package Overview

### Database Package (`db/`)

The database package manages all database-related functionality:

1. **Connection Management**:
   - Railway database connection
   - Connection pooling with automatic cleanup
   - Health monitoring and reconnection
   - Environment-based configuration

2. **Event Notifications**:
   - Real-time database event notifications
   - Event buffering and replay
   - Channel-based subscriptions
   - Error handling and recovery

3. **Shared Utilities**:
   - Type definitions
   - Configuration interfaces
   - Common utilities

### Server Package (`server/`)

The server package implements the application logic:

1. **Services**:
   - Event handling service
   - Authentication service
   - Business logic services

2. **Configuration**:
   - Database configuration
   - Environment-based settings
   - Type-safe configurations

3. **API Layer**:
   - RESTful endpoints
   - Real-time event handling
   - Error handling middleware

### Frontend Package (`frontend/`)

The frontend package implements the user interface:

1. **Components**:
   - Shared UI components
   - Feature-specific components
   - Layout components
   - Page components

2. **State Management**:
   - Real-time sync state
   - Offline state
   - UI state matching Slack

3. **Features**:
   - Channel management
   - Direct messaging
   - Thread support
   - File sharing
   - Search functionality

## File Naming Conventions

- Components: PascalCase for component files
  - Example: `ProtectedRoute.tsx`, `SessionManager.tsx`
- Tests: Component name with `.test.tsx` suffix
  - Example: `ProtectedRoute.test.tsx`
- Styles: Component name with `.css` suffix
  - Example: `App.css`
- Configuration: kebab-case for config files
  - Example: `vite-env.d.ts`

## Component Organization

### Shared Components

Components are organized by their role in the application:

```plaintext
components/
├── ui/                # UI components
│   ├── Button.tsx
│   ├── Input.tsx
│   └── Modal.tsx
├── features/          # Feature components
│   ├── channels/
│   ├── messages/
│   └── threads/
└── layout/           # Layout components
    ├── Header.tsx
    └── Sidebar.tsx
```

### Best Practices

1. Component Structure:
   - Keep components focused and single-responsibility
   - Use TypeScript for type safety
   - Include proper prop types and documentation

2. Authentication Features:
   - Protected route handling
   - Session management
   - Login flow

3. Real-time Features:
   - SSE for all real-time updates
   - Typing indicators
   - Presence updates
   - Read states

4. Offline Support:
   - PWA installation
   - Message caching
   - File sync
   - Background updates

## Testing Strategy

1. **Frontend Tests**:
   - Component unit tests
   - Integration tests
   - E2E tests with Cypress
   - Coverage: 85% minimum

2. **Server Tests**:
   - API endpoint tests
   - Service logic tests
   - Integration tests
   - Coverage: 85% minimum

3. **Database Tests**:
   - Connection tests
   - Migration tests
   - Notification tests
   - Coverage: 90% minimum

## Development Workflow

1. **Frontend Development**:
   - Component-driven development
   - Storybook for UI components
   - Hot module replacement
   - Type checking

2. **Server Development**:
   - API-first development
   - OpenAPI documentation
   - Automated testing
   - Type safety

3. **Database Development**:
   - Schema-driven development
   - Migration testing
   - Connection management
   - Event system testing
