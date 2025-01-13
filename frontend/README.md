# ChatGenius Frontend

The frontend application for ChatGenius, built with React, TypeScript, and Vite.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## 📁 Project Structure

```plaintext
frontend/
├── src/
│   ├── __tests__/          # Test suites
│   ├── components/         # Shared components
│   │   ├── channel/       # Single channel view components
│   │   ├── channels/      # Channel list, creation, and management
│   │   ├── layout/       # Layout components (Header, Footer, etc.)
│   │   ├── navigation/     # Navigation components (Sidebar, NavBar, etc.)
│   │   ├── profile/      # Profile-related components
│   │   ├── thread/       # Thread-related components
│   │   ├── ui/           # Shared UI components (Button, Input, Modal, etc.)
│   │   └── users/        # User-related components (UserList, UserCard, etc.)
│   ├── layouts/           # Layout components
│   ├── pages/             # Page components
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Utility functions
│   └── assets/            # Static assets
├── tests/                 # Test setup and mocks
├── public/                # Public static files
└── vite.config.ts        # Vite configuration
```

## 🛠️ Technology Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Testing**: Jest + React Testing Library
- **Authentication**: Auth0
- **Routing**: React Router v7
- **State Management**: React Context + Hooks

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 📚 Development Guidelines

### Component Structure

- Use functional components with hooks
- Implement proper TypeScript types
- Follow the project's ESLint rules
- Write comprehensive tests

### Code Style

- Use proper naming conventions
- Follow React best practices
- Maintain consistent file structure
- Document complex logic

### Testing Requirements

- Write tests for all components
- Maintain snapshot tests
- Test error scenarios
- Mock external dependencies

## 🔒 Environment Variables

Required environment variables:

```env
VITE_AUTH0_DOMAIN=your-auth0-domain
VITE_AUTH0_CLIENT_ID=your-auth0-client-id
VITE_API_URL=your-api-url
```

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate coverage report
- `npm run lint` - Lint code

## 🤝 Contributing

1. Follow the project's coding standards
2. Write clear commit messages
3. Include tests for new features
4. Update documentation as needed
5. Create detailed pull requests

## 🐛 Common Issues

### Test Environment

- Ensure Node.js version matches project requirements
- Clear Jest cache if tests are failing
- Check for proper environment variables

### Build Issues

- Clear `node_modules` and reinstall if needed
- Verify TypeScript configuration
- Check for proper Vite setup

### Each component folder may contain:

- Component files (`.tsx`)
- Tests (`.test.tsx`)
- Styles (if component-specific)
- Type definitions (if component-specific)
- Index files for clean exports
