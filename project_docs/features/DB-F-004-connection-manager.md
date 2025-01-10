# Feature Specification: Connection Manager

## Basic Information

- **Feature ID**: DB-F-004
- **Feature Name**: Connection Manager
- **Priority**: High
- **Status**: 🟨 In Progress

## Overview

The Connection Manager feature provides a robust system for managing database connections in ChatGenius. It implements connection pooling, health checks, and automatic recovery mechanisms to ensure reliable database access. This feature is critical for maintaining stable connections between the application and PostgreSQL database, especially for long-running operations and real-time features.

## User Stories & Acceptance Criteria

| ID | As a | I want to | So that | Acceptance Criteria |
|----|------|-----------|---------|-------------------|
| US-001 | Developer | To manage database connections efficiently | The application remains performant | - Connection pooling<br>- Connection limits<br>- Resource cleanup |
| US-002 | Developer | To monitor connection health | I can prevent connection issues | - Health checks<br>- Connection metrics<br>- Automatic recovery |
| US-003 | Developer | To handle connection failures gracefully | The system remains stable | - Error handling<br>- Retry mechanisms<br>- Fallback strategies |

## Technical Implementation

### Security Requirements

- Secure connection strings
- Connection encryption
- Connection timeout limits
- Access control per connection

### Frontend Changes

[[ Not relevant to this feature ]]

### Backend Changes

```typescript
// SSH Tunnel Interface
interface TunnelConfig {
  sshHost: string;
  sshPort: number;
  sshUsername: string;
  sshKeyPath: string;
  remoteHost: string;
  remotePort: number;
  localPort: number;
  maxRetries?: number;
  retryDelay?: number;
  healthCheckInterval?: number;
}

// Singleton SSH Tunnel
class SSHTunnel extends EventEmitter {
  private static instance: SSHTunnel | null = null;
  private sshClient: Client | null = null;
  private server: Server | null = null;
  private isConnected: boolean = false;
  private connectionPool: Map<string, ClientChannel> = new Map();
  private readonly maxPoolSize = 10;

  private constructor(private config: TunnelConfig) {
    super();
  }

  public static initializeInstance(config: TunnelConfig): SSHTunnel {
    if (!SSHTunnel.instance) {
      SSHTunnel.instance = new SSHTunnel(config);
    }
    return SSHTunnel.instance;
  }

  public static getInstance(): SSHTunnel {
    if (!SSHTunnel.instance) {
      throw new Error('SSHTunnel not initialized');
    }
    return SSHTunnel.instance;
  }

  public static resetInstance(): void {
    SSHTunnel.instance = null;
  }

  public async connect(): Promise<void> {
    if (this.isConnected) return;
    // Connection logic
  }

  public async disconnect(): Promise<void> {
    // Cleanup logic
  }

  public isConnectedToTunnel(): boolean {
    return this.isConnected;
  }
}

// Connection Manager Implementation
class PostgresConnectionManager implements ConnectionManager {
  private pool: Pool;
  private tunnel: SSHTunnel;
  private healthCheckInterval: NodeJS.Timeout;

  constructor(config: PoolConfig) {
    this.tunnel = SSHTunnel.getInstance();
    this.pool = new Pool({
      ...config,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    this.setupHealthCheck();
  }

  private setupHealthCheck(): void {
    this.healthCheckInterval = setInterval(async () => {
      try {
        if (!this.tunnel.isConnectedToTunnel()) {
          await this.tunnel.connect();
        }
        const client = await this.pool.connect();
        await client.query('SELECT 1');
        client.release();
      } catch (error) {
        console.error('Health check failed:', error);
        metrics.healthCheckFailures.inc();
      }
    }, 60000);
  }
}
```

### Database Changes

```sql
-- Connection monitoring table
CREATE TABLE connection_logs (
    id SERIAL PRIMARY KEY,
    connection_id TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    error_message TEXT,
    metadata JSONB
);

-- Connection monitoring function
CREATE OR REPLACE FUNCTION log_connection_event(
    p_connection_id TEXT,
    p_status TEXT,
    p_error_message TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::JSONB
) RETURNS VOID AS $$
BEGIN
    INSERT INTO connection_logs (connection_id, status, error_message, metadata)
    VALUES (p_connection_id, p_status, p_error_message, p_metadata);
END;
$$ LANGUAGE plpgsql;
```

### Configuration

```typescript
interface FeatureConfig {
  development: {
    maxConnections: 20,
    idleTimeout: 30000,
    connectionTimeout: 2000,
    healthCheckInterval: 60000,
    sshTunnel: {
      maxPoolSize: 10,
      maxRetries: 3,
      retryDelay: 1000
    }
  },
  production: {
    maxConnections: 100,
    idleTimeout: 30000,
    connectionTimeout: 3000,
    healthCheckInterval: 30000,
    sshTunnel: {
      maxPoolSize: 20,
      maxRetries: 5,
      retryDelay: 2000
    }
  }
}

const required_env_vars = [
  'POSTGRES_MAX_CONNECTIONS=20 // Maximum number of connections',
  'POSTGRES_IDLE_TIMEOUT=30000 // Idle timeout in milliseconds',
  'POSTGRES_HEALTH_CHECK_INTERVAL=60000 // Health check interval',
  'SSH_HOST=remote-host // SSH tunnel host',
  'SSH_USER=tunnel-user // SSH tunnel user',
  'SSH_KEY_PATH=~/.ssh/id_rsa // SSH private key path'
];
```

### Usage Documentation

```typescript
// 1. SSH Tunnel Usage
// Initialize tunnel with config
const tunnel = SSHTunnel.initializeInstance({
  sshHost: 'remote-host',
  sshPort: 22,
  sshUsername: 'user',
  sshKeyPath: '~/.ssh/id_rsa',
  remoteHost: 'localhost',
  remotePort: 5432,
  localPort: 5432
});

// Or initialize from environment
const tunnel = SSHTunnel.initializeFromEnv();

// Get existing instance
const tunnel = SSHTunnel.getInstance();

// Connect and disconnect
await tunnel.connect();
await tunnel.disconnect();

// Check connection status
if (tunnel.isConnectedToTunnel()) {
  // Use tunnel
}

// 2. Connection Manager Usage
const manager = new PostgresConnectionManager({
  host: 'localhost',
  port: 5432,
  database: 'chatgenius',
  user: 'postgres',
  password: 'password'
});

// Health checks are automatic
// Connection pooling is handled automatically

// 3. Error Recovery
tunnel.on('error', async (error) => {
  console.error('Tunnel error:', error);
  if (!tunnel.isConnectedToTunnel()) {
    await tunnel.connect();
  }
});

// 4. Environment Configuration
// Create .env.local file with:
SSH_HOST=your_remote_host
SSH_USER=your_ssh_user
SSH_KEY_PATH=~/.ssh/your_key
POSTGRES_MAX_CONNECTIONS=20
POSTGRES_IDLE_TIMEOUT=30000
```

### Connection Lifecycle

1. Initialization
   ```typescript
   // Always initialize tunnel first
   const tunnel = SSHTunnel.initializeFromEnv();
   await tunnel.connect();

   // Then create connection manager
   const manager = new PostgresConnectionManager(config);
   ```

2. Connection Pool Management
   ```typescript
   // The connection pool is managed automatically
   // Connections are created on demand up to the max pool size
   const pool = new Pool({
     max: 20,               // Maximum number of clients
     idleTimeoutMillis: 30000,  // Close idle clients after 30s
     connectionTimeoutMillis: 2000  // Return error after 2s
   });

   // Connections are automatically returned to the pool
   const client = await pool.connect();
   try {
     await client.query('SELECT 1');
   } finally {
     client.release();  // Always release in finally block
   }
   ```

3. Health Checks
   ```typescript
   // Health checks run automatically every minute
   // You can monitor them:
   manager.on('healthCheck', (status) => {
     if (!status.healthy) {
       console.error('Health check failed:', status.error);
     }
   });

   // Health check process:
   // 1. Verify SSH tunnel connection
   // 2. Test database connectivity
   // 3. Emit status event
   // 4. Auto-reconnect if needed
   ```

4. Cleanup
   ```typescript
   // Proper cleanup order
   await manager.shutdown();  // Closes all pool connections
   await tunnel.disconnect(); // Closes SSH tunnel
   SSHTunnel.resetInstance(); // Resets singleton

   // Always use in try/finally:
   try {
     // Your application code
   } finally {
     await cleanup();
   }
   ```

### Error Handling

1. SSH Tunnel Errors
```typescript
tunnel.on('error', async (error: Error) => {
  switch (error.code) {
    case 'ECONNRESET':
      console.error('SSH connection reset by peer');
      await tunnel.connect();  // Auto-reconnect
      break;
    case 'ETIMEDOUT':
      console.error('SSH connection timed out');
      await tunnel.connect();  // Auto-reconnect
      break;
    default:
      console.error('SSH error:', error.message);
      // Emit event for application handling
      tunnel.emit('tunnelError', error);
  }
});
```

2. Connection Pool Errors
```typescript
// Pool error handling
pool.on('error', (err: Error, client: PoolClient) => {
  console.error('Unexpected error on idle client', err);
  client.release(true);  // Force release with error
});

// Connection timeout handling
try {
  const client = await pool.connect();
} catch (error) {
  if (error.code === 'ECONNREFUSED') {
    console.error('Database connection refused');
  } else if (error.code === 'ETIMEDOUT') {
    console.error('Connection timeout');
  }
}
```

3. Health Check Recovery
```typescript
private async handleHealthCheckFailure(error: Error) {
  console.error('Health check failed:', error);
  
  if (!this.tunnel.isConnectedToTunnel()) {
    try {
      await this.tunnel.connect();
    } catch (error) {
      console.error('Failed to reconnect tunnel:', error);
      this.emit('healthCheckFailed', error);
      return;
    }
  }

  try {
    // Test database connection
    const client = await this.pool.connect();
    await client.query('SELECT 1');
    client.release();
    console.log('Database connection recovered');
  } catch (error) {
    console.error('Database connection failed:', error);
    this.emit('healthCheckFailed', error);
  }
}
```

4. Resource Management
```typescript
// Proper resource cleanup
async function cleanup() {
  // 1. Stop accepting new connections
  this.pool.end();
  
  // 2. Wait for active queries to finish (with timeout)
  const timeout = setTimeout(() => {
    console.warn('Force closing remaining connections');
    this.forceCleanup();
  }, 5000);
  
  try {
    await Promise.race([
      this.waitForQueries(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 5000)
      )
    ]);
  } finally {
    clearTimeout(timeout);
  }
  
  // 3. Close SSH tunnel
  await this.tunnel.disconnect();
}
```

## Testing Requirements

### Unit Tests

```typescript
describe('Connection Manager', () => {
  test('should create and release connections', async () => {
    // Test connection lifecycle
  });

  test('should handle connection failures', async () => {
    // Test error handling
  });

  test('should perform health checks', async () => {
    // Test health monitoring
  });
});
```

### Integration Tests

- Verify connection pooling
- Test connection limits
- Validate health checks
- Test error recovery
- Verify connection cleanup
- Test concurrent connections

### E2E Tests

- Test connection stability
- Verify recovery mechanisms
- Test under load
- Validate monitoring

## Monitoring Requirements

### Logging

```typescript
interface LogFormat {
  timestamp: string;
  correlationId: string;
  level: 'debug' | 'info' | 'warn' | 'error',
  event: 'connection_acquired' | 'connection_released' | 'health_check' | 'connection_error',
  data?: {
    connectionId?: string;
    poolSize?: number;
    error?: string;
  }
}
```

### Metrics

```typescript
interface Metrics {
  performance: {
    activeConnections: Gauge;
    connectionErrors: Counter;
    healthCheckFailures: Counter;
    connectionAcquisitionTime: Histogram;
    connectionLifetime: Histogram;
  }
}
```

## Definition of Done

- [x] Connection pooling implemented
- [x] SSH tunnel singleton implemented
- [x] Health check system implemented
- [x] Error handling implemented
- [x] Documentation completed
  - [x] Usage documentation
  - [x] Connection lifecycle documentation
  - [x] Error handling documentation

## Dependencies

- External services:
  - PostgreSQL 14+
- Internal dependencies:
  - [DB-F-001: Schema Setup](./DB-F-001-schema-setup.md)
- Third-party packages:
  - pg@8.11.3: PostgreSQL client
  - pg-pool@3.6.1: Connection pooling

## Rollback Plan

1. Disable connection pooling
2. Stop health checks
3. Remove monitoring
4. Revert to basic connections
5. Update documentation

## Changelog

| Date | Author | Description | PR |
|------|--------|-------------|-------|
| 2024-01-10 | System | Initial connection manager implementation | - |
| 2024-01-10 | System | Added SSH tunnel singleton pattern | - |
| 2024-01-10 | System | Added connection pooling | - |
| 2024-01-10 | System | Added comprehensive documentation | - | 