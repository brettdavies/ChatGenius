# Project Structure: ChatGenius

This document describes the organization of the ChatGenius codebase. It provides an overview of the directory structure, naming conventions, and best practices for maintaining a scalable and maintainable application.

---

## Directory Structure

Below is the directory structure for ChatGenius:

```plaintext
.
├── db/                           # Database management
│   ├── migrations/              # Database migration files
│   ├── schema/                 # Schema definitions and documentation
│   ├── scripts/                # Database utility scripts
│   ├── seeds/                  # Seed data scripts
│   └── backups/                # Backup-related scripts
├── src/
│   ├── __tests__/                    # Test suites
│   │   ├── components/               # Component tests
│   │   │   ├── __snapshots__/       # Component snapshots
│   │   │   ├── ProtectedRoute.test.tsx
│   │   │   ├── SessionManager.test.tsx
│   │   │   └── SessionWarningModal.test.tsx
│   │   ├── layouts/                  # Layout tests
│   │   │   └── RootLayout.test.tsx
│   │   └── pages/                    # Page tests
│   │       ├── __snapshots__/       # Page snapshots
│   │       ├── ErrorPage.test.tsx
│   │       ├── Home.test.tsx
│   │       └── Login.test.tsx
│   ├── assets/                      # Static assets
│   │   └── react.svg
│   ├── components/                  # Shared components
│   │   ├── ProtectedRoute.tsx
│   │   ├── SessionManager.tsx
│   │   └── SessionWarningModal.tsx
│   ├── hooks/                      # Custom React hooks
│   ├── layouts/                    # Layout components
│   │   └── RootLayout.tsx
│   ├── pages/                      # Page components
│   │   ├── ErrorPage.tsx
│   │   ├── Home.tsx
│   │   └── Login.tsx
│   ├── utils/                      # Utility functions
│   ├── App.css                     # App-level styles
│   ├── App.tsx                     # Root App component
│   ├── auth.config.ts             # Auth0 configuration
│   ├── index.css                  # Global styles
│   ├── main.tsx                   # Entry point
│   ├── setupTests.ts              # Test setup
│   └── vite-env.d.ts             # Vite type declarations
├── package.json                   # Project dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
├── vite.config.ts               # Vite configuration
└── README.md                    # Project documentation
```

## Directory Overview

- db/: Database management and related files
  - migrations/: Database migration files with timestamps
  - schema/: Database schema definitions and ERD diagrams
  - scripts/: Database utility and maintenance scripts
  - seeds/: Data seeding scripts for different environments
  - backups/: Backup configuration and verification scripts

- __tests__/: Test suites organized by component type
  - components/: Tests for shared components
  - layouts/: Tests for layout components
  - pages/: Tests for page components

- assets/: Static assets like images and icons
  - Currently contains React logo

- components/: Shared React components
  - ProtectedRoute: Authentication route wrapper
  - SessionManager: Handles session timeouts
  - SessionWarningModal: Session expiration warning

- hooks/: Custom React hooks
  - Currently empty, ready for custom hooks

- layouts/: Layout components
  - RootLayout: Main application layout

- pages/: Page components
  - ErrorPage: Error display page
  - Home: Main home page
  - Login: Authentication page

- utils/: Utility functions
  - Currently empty, ready for shared utilities

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
├── ProtectedRoute.tsx    # Auth protection
├── SessionManager.tsx    # Session handling
└── SessionWarningModal.tsx # Session UI
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

3. Offline Support:
   - PWA installation
   - Message caching
   - File sync
   - Background updates

4. Testing Requirements:
   - Unit tests for all components
   - Snapshot tests for UI consistency
   - Integration tests for auth flow

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

## Testing Organization

### Test File Structure

```typescript
// Example test file structure
import { render, screen, fireEvent } from '@testing-library/react';
import { useAuth0 } from '@auth0/auth0-react';
import ComponentName from '../../components/ComponentName';

// Mock external dependencies
jest.mock('@auth0/auth0-react');
const mockUseAuth0 = useAuth0 as jest.Mock;

describe('ComponentName', () => {
  // Setup and teardown
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Snapshot tests
  describe('snapshots', () => {
    it('matches snapshot for default state', () => {
      const { container } = render(<ComponentName />);
      expect(container).toMatchSnapshot();
    });
  });

  // Functionality tests
  it('handles user interaction', () => {
    // Test implementation
  });
});
```

### Test Conventions

1. **File Organization**:
   - Test files mirror source structure
   - Snapshots in `__snapshots__` directories
   - Clear test descriptions
   - Consistent mock patterns

2. **Coverage Requirements**:
   - Components: 85% minimum
   - Pages: 85% minimum
   - Utils: 95% minimum

3. **Testing Patterns**:
   - Mock Auth0 hooks consistently
   - Test error states
   - Verify user interactions
   - Check component rendering
