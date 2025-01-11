# Database Module

This module handles database operations for ChatGenius, including schema management, migrations, and secure connections via SSH tunneling.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development with watch mode
npm run dev

# Build TypeScript
npm run build

# Run tests
npm test

# Setup database
npm run setup

# Verify connection
npm run verify
```

## 🛠️ Features

- PostgreSQL database management
- Secure SSH tunneling with connection pooling
- Schema migrations and versioning
- Automated testing infrastructure
- Connection monitoring and health checks

## 📁 Project Structure

```plaintext
db/
├── src/
│   ├── migrations/     # Database migrations
│   ├── models/        # Database models
│   ├── scripts/       # Utility scripts
│   └── shared/        # Shared utilities
├── tests/             # Test files
│   ├── __mocks__/     # Test mocks
│   └── setup.ts       # Test setup
└── scripts/           # CLI scripts
```

## 🧪 Connection Management

The module uses a singleton pattern for SSH tunnel management, ensuring:

- Single shared tunnel instance across the application
- Automatic connection state tracking
- Connection pooling and reuse
- Proper cleanup on application shutdown

### Connection Pooling

The tunnel maintains a pool of connections with the following features:

- Maximum pool size of 10 connections
- Automatic connection reuse
- Dead connection cleanup
- Connection creation on demand

### Health Monitoring

Automatic health checks are performed to ensure connection stability:

- Regular connection status verification
- Automatic reconnection attempts on failure
- Exponential backoff for retry attempts
- Event emission for monitoring

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

Tests are written using Jest and follow these conventions:

- Unit tests for database models
- Integration tests for migrations
- Connection pooling tests
- SSH tunnel tests

### Example Test

```typescript
import { Pool } from 'pg';
import { createPool } from '../src/shared/pool';

describe('Database Pool', () => {
  let pool: Pool;

  beforeAll(async () => {
    pool = await createPool();
  });

  afterAll(async () => {
    await pool.end();
  });

  it('should connect to the database', async () => {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT NOW()');
      expect(result.rows).toHaveLength(1);
    } finally {
      client.release();
    }
  });
});
```

## 🔒 Usage

### Basic Setup

```typescript
import { SSHTunnel } from './src/shared/tunnel';

// Initialize the shared tunnel instance
const tunnel = SSHTunnel.initializeFromEnv();

// Connect to the database
await tunnel.connect();

// Use the database...

// Cleanup when done
await SSHTunnel.getInstance().disconnect();
SSHTunnel.resetInstance();
```

### Advanced Configuration

You can initialize the tunnel with custom configuration:

```typescript
const config = {
  sshHost: 'your-host',
  sshPort: 22,
  sshUsername: 'your-user',
  sshKeyPath: '~/.ssh/your_key',
  remoteHost: 'localhost',
  remotePort: 5432,
  localPort: 5432,
  maxRetries: 5,              // Custom retry attempts
  retryDelay: 2000,           // Custom retry delay
  healthCheckInterval: 60000   // Custom health check interval
};

const tunnel = SSHTunnel.initializeInstance(config);
```

### Event Handling

The tunnel emits events that you can listen to:

```typescript
const tunnel = SSHTunnel.getInstance();

// Listen for max retries exceeded
tunnel.on('maxRetriesExceeded', () => {
  console.error('Failed to reconnect after maximum attempts');
});
```

## 🔒 Environment Variables

Required environment variables:

```env
# Database Configuration
POSTGRES_DB=your_database_name
POSTGRES_USER=your_username
POSTGRES_PASSWORD=your_password
POSTGRES_PORT=5432

# SSH Tunnel Configuration (if needed)
SSH_HOST=your_ssh_host
SSH_PORT=22
SSH_USER=your_ssh_username
SSH_KEY_PATH=~/.ssh/your_key

# Optional Tunnel Configuration
SSH_MAX_RETRIES=3           # Maximum reconnection attempts
SSH_RETRY_DELAY=1000        # Base delay between retries in ms
SSH_HEALTH_CHECK_INTERVAL=30000  # Health check interval in ms

# Test Configuration
TEST_POSTGRES_DB=test_db
TEST_POSTGRES_USER=test_user
TEST_POSTGRES_PASSWORD=test_password
```

## 📦 Available Scripts

- `npm run dev` - Watch mode for TypeScript
- `npm run build` - Build TypeScript
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate coverage report
- `npm run setup` - Setup database
- `npm run setup:test` - Setup test database
- `npm run verify` - Verify database connection

## 🤝 Security

- All connections are encrypted via SSH
- Key-based authentication only
- Connection monitoring and logging
- Connection pooling with size limits

## 📊 Monitoring

The tunnel provides monitoring capabilities:

- Connection status tracking
- Health check results
- Connection pool statistics
- Detailed event logging

## 🤝 Contributing

1. Follow TypeScript best practices
2. Write comprehensive tests
3. Document schema changes
4. Update migrations
5. Test connection handling

## 🐛 Common Issues

### Development

- Check database connection strings
- Verify SSH key permissions
- Monitor connection pool size
- Watch for migration conflicts

### Testing

- Use separate test database
- Reset database state between tests
- Mock SSH connections when needed
- Handle async cleanup properly

### Error Handling

- Automatic reconnection with exponential backoff
- Connection pool management
- Detailed error classification
- Event-based error reporting
