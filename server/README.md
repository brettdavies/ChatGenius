# ChatGenius Server

The backend server for ChatGenius, built with Node.js, Express, and TypeScript.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test
```

## 📁 Project Structure

```plaintext
server/
├── src/
│   ├── api/              # API routes and controllers
│   ├── config/           # Configuration files
│   ├── middleware/       # Custom middleware
│   ├── models/           # Data models
│   ├── services/         # Business logic
│   ├── utils/            # Utility functions
│   └── types/            # TypeScript type definitions
├── tests/                # Test files
├── scripts/              # Utility scripts
└── docs/                 # API documentation
```

## 🛠️ Technology Stack

- **Runtime**: Node.js
- **Framework**: Express
- **Language**: TypeScript
- **Database**: PostgreSQL
- **Testing**: Jest

## 🔌 API Features

- RESTful endpoints
- Real-time updates via SSE
- Rate limiting
- Request validation
- Error handling
- Authentication/Authorization
- API documentation
- Response caching
- Background jobs
- File uploads

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

### Code Organization

- Follow clean architecture principles
- Implement proper TypeScript types
- Use dependency injection
- Write comprehensive tests

### API Design

- Follow REST best practices
- Use proper HTTP methods
- Implement proper error responses
- Version your APIs
- Document all endpoints

### Security

- Validate all inputs
- Sanitize responses
- Implement rate limiting
- Use proper authentication
- Follow security best practices

## 🔒 Environment Variables

Required environment variables:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/db
REDIS_URL=redis://localhost:6379
RABBITMQ_URL=amqp://localhost:5672
JWT_SECRET=your-jwt-secret
AUTH0_DOMAIN=your-auth0-domain
AUTH0_AUDIENCE=your-auth0-audience
```

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate coverage report
- `npm run lint` - Lint code
- `npm run docs` - Generate API documentation
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed database

## 🤝 Contributing

1. Follow the project's coding standards
2. Write clear commit messages
3. Include tests for new features
4. Update API documentation
5. Create detailed pull requests

## 🔍 Monitoring & Debugging

### Logging

- Use proper log levels
- Include request IDs
- Structure log messages
- Monitor error rates

### Performance

- Monitor response times
- Track memory usage
- Watch database queries
- Monitor cache hit rates

### Health Checks

- Database connectivity
- Redis connection
- Message queue status
- External service health

## 🐛 Common Issues

### Database

- Check connection strings
- Verify migrations
- Monitor connection pool
- Watch for slow queries

### Memory

- Monitor heap usage
- Check for memory leaks
- Adjust garbage collection
- Monitor worker processes
