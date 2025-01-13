# Project Structure: ChatGenius

This document describes the organization of the ChatGenius codebase. It provides an overview of the directory structure, naming conventions, and best practices for maintaining a scalable and maintainable application.

---

## Directory Structure

```plaintext
ChatGenius/
├── db/                           # Database management package
│   ├── backups/                  # Backup-related scripts
│   ├── migrations/               # Database migration files
│   ├── schema/                   # Schema definitions and documentation
│   ├── seeds/                    # Seed data scripts
│   └── scripts/                  # Database utility scripts
├── frontend/                     # React frontend application
│   ├── src/                      # Source code
│   │   ├── components/           # React components
│   │   │   ├── navigation/       # Navigation components
│   │   │   │   └── Sidebar.tsx
│   │   │   ├── channels/         # Channel management
│   │   │   │   ├── ChannelList.tsx
│   │   │   │   └── CreateChannelModal.tsx
│   │   │   ├── channel/          # Single channel view
│   │   │   │   ├── ChannelHeader.tsx
│   │   │   │   └── MessageList.tsx
│   │   │   ├── ui/               # Shared UI components
│   │   │   │   ├── Button.tsx
│   │   │   │   └── Modal.tsx
│   │   │   ├── users/            # User components
│   │   │   │   └── UserSelect.tsx
│   │   │   ├── profile/          # Profile components
│   │   │   ├── thread/           # Thread components
│   │   │   └── layout/           # Layout components
│   │   ├── stores/               # State management
│   │   │   ├── channel-store.ts
│   │   │   └── user-store.ts
│   │   ├── types/                # TypeScript types
│   │   │   ├── channel.ts
│   │   │   └── user.ts
│   │   ├── lib/                  # Shared utilities
│   │   │   └── api.ts
│   │   ├── hooks/                # Custom React hooks
│   │   └── assets/               # Static assets
│   ├── public/                   # Public static files
│   ├── tests/                    # Test setup and mocks
│   ├── index.html                # Entry HTML file
│   ├── vite.config.ts            # Vite configuration
│   ├── tsconfig.json             # TypeScript configuration
│   └── package.json              # Frontend dependencies
│        
├── server/                       # Express backend application
│   ├── src/                      # Source code
│   │   ├── controllers/          # Route controllers
│   │   │   └── channel-controller.ts
│   │   ├── services/             # Business logic
│   │   │   ├── channel-service.ts
│   │   │   └── event-service.ts
│   │   ├── middleware/           # Express middleware
│   │   │   ├── auth.ts
│   │   │   └── async-handler.ts
│   │   ├── routes/               # API routes
│   │   │   ├── channel-routes.ts
│   │   │   └── user-routes.ts
│   │   ├── types/                # TypeScript types
│   │   │   └── express.d.ts
│   │   ├── utils/                # Utility functions
│   │   │   └── errors.ts
│   │   ├── db/                   # Database setup
│   │   │   └── index.ts
│   │   └── app.ts                # Express application setup
│   ├── migrations/               # Database migrations
│   ├── tests/                    # Test files
│   ├── tsconfig.json             # TypeScript configuration
│   └── package.json              # Backend dependencies
│            
├── project_docs/                 # Project documentation
│   ├── features/                 # Feature specifications
│   └── project_structure.md
│
├── .gitignore                    # Git ignore rules
├── README.md                     # Project overview
└── package.json                  # Root package.json
```

Each directory serves a specific purpose:

1. **Frontend (`/frontend`)**:
   - Modern React application built with Vite
   - Component-based architecture
   - TypeScript for type safety
   - State management with Zustand
   - Path aliases configured with `@` prefix

2. **Server (`/server`)**:
   - Express.js backend
   - PostgreSQL database
   - RESTful API endpoints
   - Real-time events with SSE
   - TypeScript for type safety

3. **Documentation (`/project_docs`)**:
   - Feature specifications
   - Architecture documentation
   - Project structure
   - Development guidelines

4. **Root Level**:
   - Project configuration
   - Git configuration
   - CI/CD workflows
   - Project documentation

## Package Overview

### Frontend Package (`frontend/`)

The frontend package implements the user interface and client-side logic:

1. **Components (`src/components/`)**:
   - Domain-based organization (channels, users, etc.)
   - Shared UI components in `ui/`
   - Feature-specific components in respective folders
   - Strict separation of concerns between views and logic

2. **State Management (`src/stores/`)**:
   - Zustand stores for global state
   - Channel management with real-time updates
   - User state and authentication
   - Optimistic updates for better UX

3. **API Integration (`src/lib/`)**:
   - Axios-based API client
   - Type-safe API requests
   - Error handling and retries
   - Real-time event handling with SSE

4. **Type System (`src/types/`)**:
   - Shared type definitions
   - API request/response types
   - Component prop types
   - Store state types

### Server Package (`server/`)

The server package implements the backend API and business logic:

1. **API Layer (`src/routes/, src/controllers/`)**:
   - RESTful endpoints
   - Request validation
   - Response formatting
   - Error handling

2. **Business Logic (`src/services/`)**:
   - Channel management
   - User operations
   - Event handling
   - Real-time updates via SSE

3. **Database Integration (`src/db/`)**:
   - PostgreSQL connection management
   - Query builders
   - Transaction handling
   - Migration management

4. **Middleware (`src/middleware/`)**:
   - Authentication
   - Request parsing
   - Error handling
   - Async operation handling

### Shared Features

Common features and patterns across packages:

1. **Type Safety**:
   - TypeScript throughout
   - Shared type definitions
   - Runtime validation
   - API contract enforcement

2. **Real-time Updates**:
   - Server-Sent Events (SSE)
   - Event-driven architecture
   - Optimistic UI updates
   - Offline support

3. **Error Handling**:
   - Consistent error types
   - Error boundaries
   - Graceful degradation
   - User-friendly error messages

4. **Testing**:
   - Unit tests for components and services
   - Integration tests for API endpoints
   - E2E tests for critical flows
   - Test utilities and helpers

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

Components are organized by their domain and responsibility:

```plaintext
components/
├── navigation/          # Navigation-related components
│   ├── Sidebar.tsx     # Main navigation sidebar
│   └── NavBar.tsx      # Top navigation bar
├── channels/           # Channel management
│   ├── ChannelList.tsx        # List of channels
│   ├── CreateChannelModal.tsx # Channel creation modal
│   └── ChannelItem.tsx       # Individual channel item
├── channel/            # Single channel components
│   ├── ChannelHeader.tsx     # Channel header with info/actions
│   ├── MessageList.tsx       # List of messages in channel
│   └── MessageInput.tsx      # Message input component
├── ui/                # Reusable UI components
│   ├── Button.tsx
│   ├── Input.tsx
│   └── Modal.tsx
├── users/             # User-related components
│   ├── UserList.tsx          # List of users
│   ├── UserCard.tsx         # User profile card
│   └── UserSelect.tsx       # User selection component
├── profile/           # Profile components
│   ├── ProfileSettings.tsx   # User profile settings
│   └── ProfileView.tsx      # Profile view component
├── thread/            # Thread-related components
│   ├── ThreadView.tsx        # Thread discussion view
│   └── ThreadList.tsx       # List of threads
└── layout/            # Layout components
    ├── Header.tsx           # Application header
    └── MainLayout.tsx       # Main application layout

```

#### Component Guidelines

1. **Navigation Components** (`navigation/`):
   - Handle application navigation and routing
   - Manage navigation state and active states
   - Implement responsive navigation patterns

2. **Channel Components** (`channels/` and `channel/`):
   - `channels/`: Multiple channel management
   - `channel/`: Single channel view and interaction
   - Clear separation between list/management and single-channel concerns

3. **UI Components** (`ui/`):
   - Reusable, atomic components
   - Consistent styling and behavior
   - Well-documented props and usage
   - Accessibility-first approach

4. **User Components** (`users/`):
   - User management and display
   - User selection and filtering
   - User presence and status

5. **Profile Components** (`profile/`):
   - User profile management
   - Settings and preferences
   - Profile customization

6. **Thread Components** (`thread/`):
   - Thread creation and management
   - Thread view and navigation
   - Reply management

7. **Layout Components** (`layout/`):
   - Page layouts and structure
   - Responsive design patterns
   - Layout composition

#### Best Practices

1. **File Organization**:
   - One component per file
   - Clear, descriptive filenames
   - Consistent naming conventions
   - Index files for clean exports

2. **Component Structure**:
   - Props interface defined with TypeScript
   - Clear component responsibilities
   - Proper error handling
   - Loading states handled

3. **State Management**:
   - Local state for UI concerns
   - Global state for shared data
   - Clear state update patterns
   - Optimistic updates where appropriate

4. **Testing**:
   - Component unit tests
   - Integration tests for features
   - Accessibility testing
   - Performance testing

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
