# Project Structure: ChatGenius

This document describes the organization of the codebase for ChatGenius. It provides an overview of the directory structure, naming conventions, and best practices for maintaining a scalable and maintainable project.

---

## Table of Contents

- [Project Structure: ChatGenius](#project-structure-chatgenius)
  - [Table of Contents](#table-of-contents)
  - [Directory Structure](#directory-structure)
  - [Directory Overview](#directory-overview)
  - [File Naming Conventions](#file-naming-conventions)
  - [Component Organization](#component-organization)
    - [Shared Components](#shared-components)
    - [One-Off Components](#one-off-components)
    - [Guidelines for Component Organization](#guidelines-for-component-organization)
    - [Best Practices](#best-practices)
    - [Scalability Guidelines](#scalability-guidelines)
  - [Highlights of This Template](#highlights-of-this-template)

---

## Directory Structure

Below is the standard directory structure ChatGenius:

```plaintext
src/
├── actions/           # Server-side actions
│   ├── db/            # Database-related actions
│   ├── other-actions/ # Other server-side actions
├── app/               # App router (e.g., React Router or Next.js)
│   ├── api/           # API routes
│   ├── route/         # Example route
│       ├── _components/ # One-off components for the route
│       ├── layout.tsx   # Layout for the route
│       ├── page.tsx     # Page for the route
├── components/        # Shared components
│   ├── ui/            # Reusable UI components
│   ├── utilities/     # Utility components
├── db/                # Database schema and migrations
│   ├── schema/        # Database schemas
├── lib/               # Libraries for custom logic
│   ├── hooks/         # Custom hooks
├── public/            # Static assets (images, fonts)
├── styles/            # Global and modular stylesheets
├── types/             # TypeScript type definitions
├── tests/             # Unit and integration tests
```

## Directory Overview

- actions/: Server-side logic, separated into database and other server actions.
- app/: Handles routing and layouts for the application.
- components/: Contains reusable and utility components for the frontend.
- db/: Manages database schemas and related logic.
- lib/: Houses shared libraries such as custom hooks or utility functions.
- public/: Stores static assets like images, icons, and fonts.
- styles/: Includes global CSS or SCSS files and theme definitions.
- types/: Centralized location for TypeScript types and interfaces.
- tests/: Contains automated tests for quality assurance.

## File Naming Conventions

To maintain consistency:

- Folders: Use kebab-case (e.g., shared-components, user-profile).
- Files: Use PascalCase for React components (e.g., UserCard.tsx).
- Utilities and Hooks: Use camelCase (e.g., useFetch.ts, formatDate.ts).
- TypeScript Types:
  - Use a suffix like -types (e.g., user-types.ts).
  - Export all types through types/index.ts.

## Component Organization

### Shared Components

Place reusable components in the components/ folder. Examples:

- components/ui/Button.tsx: A shared button component used across the app.
- components/ui/Modal.tsx: A reusable modal dialog.

### One-Off Components

Components specific to a single route or feature go in the _components folder under the respective route. Examples:

- app/route/_components/FeatureCard.tsx: A card used only for the route page.

### Guidelines for Component Organization

- Avoid duplicating shared components in multiple locations.
- Keep one-off components close to their usage to minimize confusion.

### Best Practices

1. Keep Files Modular:
   - Limit each file to a single responsibility (e.g., a single React component or utility function).

2. Use Index Files:
   - Export components, hooks, or utilities from index.ts to simplify imports.
   - Example:

    ```ts
    // components/ui/index.ts
    export { default as Button } from './Button';
    export { default as Modal } from './Modal';
    ```

3. Avoid Deep Nesting:
   - Limit directory depth to three levels to ensure navigability.
   - Example:

    ```ts
    src/components/ui/Button.tsx (✅)
    src/components/ui/buttons/primary/large/Button.tsx (❌)
    ```

4. Document as You Go:
   - Add comments or markdown documentation for complex structures.

### Scalability Guidelines

1. Group by Feature When Needed:
   - If a feature grows complex, group all related files into a single folder.
   - Example:

    ```plaintext
    features/chat/
    ├── components/
    ├── hooks/
    ├── ChatPage.tsx
    ```

2. Adopt Lazy Loading:
   - Use lazy loading for routes and components to improve performance.
   - Example:

    ```ts
    const UserProfile = React.lazy(() => import('./UserProfile'));
    ```

3. Monitor Shared Components:
   - Periodically review components/ to identify overused or outdated components.

4. Future Enhancements
   - Introduce a `features/` directory to organize feature-specific files as the project grows.
   - Modularize shared components by domain (e.g., `components/auth/`).

5. Deprecated Components:
   - Move deprecated components to a `deprecated/` folder.
   - Add a `README.md` in `deprecated/` explaining why components were retired and their replacements.

---

Reminder: This document is a living resource. Update it as the project grows, especially when introducing new structures or conventions.

---

## Highlights of This Template

1. **Clear Structure**:
   - Provides a high-level and detailed view of how the codebase is organized.
   - Ensures contributors can quickly locate and work on files.

2. **Scalability Focus**:
   - Includes guidelines to accommodate growing features and avoid file sprawl.

3. **Consistency Through Naming**:
   - Defines naming conventions to ensure uniformity across the codebase.

4. **Encourages Modularization**:
   - Promotes keeping files small and focused, supporting maintainability.
