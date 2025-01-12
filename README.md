# ChatGenius

ChatGenius is a Slack clone that aims to replicate Slack's functionality and user interface with exact feature parity. Built with modern web technologies and real-time communication capabilities.

## 🚀 Quick Start

```bash
# Install dependencies for all workspaces
npm install

# Set up environment variables
cp .env.example .env.local

# Install Railway CLI
npm i -g @railway/cli

# Login to Railway
railway login

# Link to Railway project
railway link

# Start all development servers
npm run dev
```

## 📚 Documentation

Detailed documentation is available in the `project_docs` directory:

- [Project Overview](project_docs/project_overview.md) - Vision, objectives, and timeline
- [Project Structure](project_docs/project_structure.md) - Codebase organization
- [Tech Stack & Architecture](project_docs/tech_stack_architecture.md) - Technical decisions and design
- [Feature List](project_docs/feature_list.md) - Current features and roadmap
- [Contributing Guidelines](project_docs/workflow_contribution_guidelines.md) - Development workflow

## 🏗️ Project Structure

```plaintext
.
├── frontend/            # React frontend application
├── server/             # Node.js backend server
├── db/                 # Database management and migrations
└── project_docs/       # Project documentation
```

See the README in each directory for specific details:

- [Frontend Documentation](frontend/README.md)
- [Server Documentation](server/README.md)
- [Database Documentation](db/README.md)

## 🛠️ Development

This is a monorepo managed with npm workspaces. Available commands:

### Development Servers

```bash
npm run dev              # Start all workspaces
npm run dev:frontend     # Start frontend only
npm run dev:server       # Start server only
```

### Building

```bash
npm run build           # Build all workspaces
npm run build:frontend  # Build frontend only
npm run build:server    # Build server only
```

### Testing

```bash
npm run test           # Test all workspaces
npm run test:frontend  # Test frontend only
npm run test:server    # Test server only
```

### Database Commands

```bash
# Connect to Railway PostgreSQL
railway connect postgresql

# Run database migrations
railway run "psql \${DATABASE_URL} < db/migrations/migration.sql"

# View database variables
railway variables
```

### Other Commands

```bash
npm run lint          # Lint all workspaces
```

## 🔧 Workspace-Specific Features

### Frontend

- Vite dev server with HMR
- Jest + React Testing Library
- TypeScript + ESLint
- Tailwind CSS

### Server

- Express with TypeScript
- Hot reload in development
- Jest + Supertest
- API documentation

### Database

- PostgreSQL on Railway
- Migration tools
- Connection pooling
- SSL/TLS encryption

## 🤝 Contributing

1. Read the [Contributing Guidelines](project_docs/workflow_contribution_guidelines.md)
2. Fork the repository
3. Create a feature branch
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for all notable changes.
