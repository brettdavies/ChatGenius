# ChatGenius

ChatGenius is a Slack clone that aims to replicate Slack's functionality and user interface with exact feature parity. Built with modern web technologies and real-time communication capabilities.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Start development
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

This is a monorepo managed with npm workspaces. Main commands:

```bash
# Start frontend development
npm run dev

# Run all tests
npm test

# Build for production
npm run build
```

## 🤝 Contributing

1. Read the [Contributing Guidelines](project_docs/workflow_contribution_guidelines.md)
2. Fork the repository
3. Create a feature branch
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for all notable changes.
