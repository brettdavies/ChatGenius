# Database Module

This module handles database operations for ChatGenius, including schema management, migrations, and secure connections via SSH tunneling.

## Features

- PostgreSQL database management
- Secure SSH tunneling with connection pooling
- Schema migrations and versioning
- Automated testing infrastructure
- Connection monitoring and health checks

## Configuration

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# Database Configuration
POSTGRES_DB=your_database_name
POSTGRES_USER=your_username
POSTGRES_PASSWORD=your_password
POSTGRES_PORT=5432

# SSH Tunnel Configuration
SSH_HOST=your_ssh_host
SSH_PORT=22
SSH_USER=your_ssh_username
SSH_KEY_PATH=~/.ssh/your_key

# Remote Database Configuration
POSTGRES_REMOTE_HOST=localhost
POSTGRES_REMOTE_PORT=5432

# Optional Tunnel Configuration
SSH_MAX_RETRIES=3           # Maximum reconnection attempts
SSH_RETRY_DELAY=1000        # Base delay between retries in ms
SSH_HEALTH_CHECK_INTERVAL=30000  # Health check interval in ms
```

## Usage

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

### Connection Management

The module uses a singleton pattern for SSH tunnel management, ensuring:

- Single shared tunnel instance across the application
- Automatic connection state tracking
- Connection pooling and reuse
- Proper cleanup on application shutdown

#### Connection Pooling

The tunnel maintains a pool of connections with the following features:
- Maximum pool size of 10 connections
- Automatic connection reuse
- Dead connection cleanup
- Connection creation on demand

#### Health Monitoring

Automatic health checks are performed to ensure connection stability:
- Regular connection status verification
- Automatic reconnection attempts on failure
- Exponential backoff for retry attempts
- Event emission for monitoring

### Event Handling

The tunnel emits events that you can listen to:

```typescript
const tunnel = SSHTunnel.getInstance();

// Listen for max retries exceeded
tunnel.on('maxRetriesExceeded', () => {
  console.error('Failed to reconnect after maximum attempts');
});
```

### Error Handling

The tunnel includes comprehensive error handling:

```typescript
try {
  await tunnel.connect();
} catch (error) {
  if (error.message.includes('max retries exceeded')) {
    // Handle reconnection failure
  } else if (error.message.includes('Connection refused')) {
    // Handle connection refused
  }
}
```

## Development

### Running Tests

```bash
npm run test
```

The test suite includes:
- Singleton pattern verification
- Connection management tests
- Connection pooling tests
- Health check functionality
- Automatic reconnection
- Error handling scenarios

### Database Setup

```bash
npm run setup
```

### Verify Connection

```bash
npm run verify
```

## Security

- All connections are encrypted via SSH
- Key-based authentication only
- Connection monitoring and logging
- Connection pooling with size limits

## Monitoring

The tunnel provides monitoring capabilities:
- Connection status tracking
- Health check results
- Connection pool statistics
- Detailed event logging

## Error Handling

Comprehensive error handling includes:
- Automatic reconnection with exponential backoff
- Connection pool management
- Detailed error classification
- Event-based error reporting

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests
4. Submit a pull request 