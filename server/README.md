# ChatGenius Server

The backend server for ChatGenius, built with Node.js, Express, and TypeScript.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server with hot reload
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
├── tests/                # Test files and setup
├── scripts/              # Utility scripts
└── docs/                 # API documentation
```

## 🛠️ Technology Stack

- **Runtime**: Node.js
- **Framework**: Express
- **Language**: TypeScript
- **Database**: PostgreSQL
- **Testing**: Jest + Supertest
- **Documentation**: OpenAPI/Swagger
- **Authentication**: JWT + Auth0

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Test Structure

- Uses Jest with TypeScript support
- Supertest for API endpoint testing
- Separate test environment configuration
- Automatic test database setup

### Test Files

```typescript
// Example API test
import request from 'supertest';
import app from '../src/app';

describe('API Endpoints', () => {
  it('GET /api/health should return 200', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);
    
    expect(response.body).toEqual({ status: 'ok' });
  });
});
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
# Server Configuration
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/db

# Authentication
JWT_SECRET=your-jwt-secret
AUTH0_DOMAIN=your-auth0-domain
AUTH0_AUDIENCE=your-auth0-audience

# Test Environment
TEST_DATABASE_URL=postgresql://user:password@localhost:5432/test_db
```

## 📦 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate coverage report
- `npm run lint` - Lint code

## 🤝 Contributing

1. Follow the project's coding standards
2. Write clear commit messages
3. Include tests for new features
4. Update API documentation
5. Create detailed pull requests

## 🔍 Common Issues

### Test Environment

- Ensure test database is configured
- Check environment variables
- Clear Jest cache if needed
- Use correct Node.js version

### Development

- Run `npm run build` after changes
- Check TypeScript errors
- Verify database connection
- Monitor API responses
