# ChatGenius Server

The backend server for ChatGenius, built with Node.js, Express, and TypeScript. Integrates with Supabase for database operations and real-time features.

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
│   │   └── app.ts       # Application settings
│   ├── middleware/       # Custom middleware
│   ├── models/          # Data models
│   ├── services/        # Business logic
│   │   ├── event-service.ts  # Event handling
│   │   └── auth-service.ts   # Authentication
│   ├── utils/           # Utility functions
│   └── types/          # TypeScript definitions
└── tests/              # Test files
```

## 🛠️ Technology Stack

- **Runtime**: Node.js
- **Framework**: Express
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Testing**: Jest + Supertest
- **Documentation**: OpenAPI/Swagger
- **Authentication**: Auth0
- **Real-time**: Supabase Realtime

## 📡 Real-time Features

The server uses Supabase's real-time features for live updates:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// Subscribe to changes
supabase
  .channel('table-changes')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'messages' },
    (payload) => {
      // Handle real-time updates
    }
  )
  .subscribe();
```

### Real-time Features

- Automatic connection management
- Event filtering
- Type-safe payloads
- Channel management
- Presence support

## 🔌 Database Integration

Database access is managed through Supabase:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Execute queries
const { data, error } = await supabase
  .from('users')
  .select('*');
```

### Database Features

- Connection pooling
- Row Level Security (optional)
- Type safety with generated types
- Query builder
- Real-time subscriptions

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration

# Generate coverage report
npm run coverage
```

### Test Structure

- Unit tests for services
- Integration tests for API
- Database operation tests
- Real-time feature tests

## 🔒 Environment Variables

Required environment variables:

```env
# Server Configuration
NODE_ENV=development
PORT=3001
CORS_ORIGIN=http://localhost:3000

# Authentication
AUTH0_DOMAIN=your-auth0-domain
AUTH0_AUDIENCE=your-auth0-audience

# Supabase Configuration
SUPABASE_URL=your-project-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Lint code
- `npm run coverage` - Generate coverage report

## 🔍 Error Handling

The server implements comprehensive error handling:

### API Errors

- Input validation
- Authentication failures
- Authorization errors
- Rate limiting

### Database Errors

- Connection failures
- Query errors
- Constraint violations
- Real-time subscription errors

## 🔒 Security

- Auth0 integration
- Supabase security features
- Input validation
- Rate limiting
- Error sanitization

## 📊 Monitoring

The server provides monitoring for:

- API endpoints
- Database operations
- Real-time subscriptions
- Authentication
- Error rates

## 🤝 Contributing

1. Follow TypeScript practices
2. Write comprehensive tests
3. Document API changes
4. Update OpenAPI specs
5. Test error handling

## 🐛 Troubleshooting

### Common Issues

1. Server Startup
   - Check environment variables
   - Verify Supabase connection
   - Confirm port availability
   - Review logs

2. API Issues
   - Validate request format
   - Check authentication
   - Review rate limits
   - Monitor timeouts

3. Real-time Features
   - Check Supabase connection
   - Verify channel subscriptions
   - Monitor event delivery
   - Review error logs
