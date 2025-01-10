import { Client, ClientChannel } from 'ssh2';
import fs from 'fs';
import net from 'net';
import os from 'os';
import path from 'path';
import { EventEmitter } from 'events';
import dotenv from 'dotenv';

/**
 * Configuration options for the SSH tunnel
 */
export interface TunnelConfig {
  /** SSH server hostname */
  sshHost: string;
  /** SSH server port */
  sshPort: number;
  /** SSH username */
  sshUsername: string;
  /** Path to SSH private key */
  sshKeyPath: string;
  /** Remote database host */
  remoteHost: string;
  /** Remote database port */
  remotePort: number;
  /** Local port to forward to */
  localPort: number;
  /** Maximum number of reconnection attempts (default: 3) */
  maxRetries?: number;
  /** Delay between reconnection attempts in ms (default: 1000) */
  retryDelay?: number;
  /** Interval for health checks in ms (default: 30000) */
  healthCheckInterval?: number;
}

/**
 * Interface for the tunnel's logging system
 */
interface Logger {
  info: (message: string) => void;
  error: (message: string, error?: Error) => void;
  debug: (message: string) => void;
  warn: (message: string) => void;
}

/**
 * SSHTunnel provides a secure connection to a remote database through SSH tunneling.
 * It implements a singleton pattern to ensure only one tunnel instance exists.
 * 
 * Features:
 * - Automatic connection management
 * - Connection pooling
 * - Health monitoring
 * - Automatic reconnection
 * - Enhanced logging
 * 
 * Events:
 * - 'maxRetriesExceeded': Emitted when reconnection attempts fail
 * 
 * @extends EventEmitter
 */
export class SSHTunnel extends EventEmitter {
  private static instance: SSHTunnel | null = null;
  private config: TunnelConfig;
  private server?: net.Server;
  private sshClient?: Client;
  private isConnected: boolean = false;
  private connectionPromise: Promise<void> | null = null;
  private healthCheckInterval?: NodeJS.Timeout;
  private retryCount: number = 0;
  private connectionPool: Map<string, ClientChannel> = new Map();
  private readonly maxPoolSize = 10;

  private logger: Logger = {
    info: (message: string) => console.log(`[SSH Tunnel] ${message}`),
    error: (message: string, error?: Error) => {
      console.error(`[SSH Tunnel] ${message}`);
      if (error) {
        console.error(`[SSH Tunnel] Error details:`, error);
      }
    },
    debug: (message: string) => console.debug(`[SSH Tunnel] ${message}`),
    warn: (message: string) => console.warn(`[SSH Tunnel] ${message}`)
  };

  /**
   * Private constructor to enforce singleton pattern.
   * Use {@link initializeInstance} or {@link initializeFromEnv} to create an instance.
   */
  private constructor(config: TunnelConfig) {
    super();
    this.config = {
      ...config,
      maxRetries: config.maxRetries || 3,
      retryDelay: config.retryDelay || 1000,
      healthCheckInterval: config.healthCheckInterval || 30000
    };
  }

  private expandTilde(filePath: string): string {
    if (filePath.startsWith('~/')) {
      return path.join(os.homedir(), filePath.slice(2));
    }
    return filePath;
  }

  /**
   * Gets the singleton instance of SSHTunnel.
   * @throws Error if instance hasn't been initialized
   */
  public static getInstance(): SSHTunnel {
    if (!SSHTunnel.instance) {
      throw new Error('SSHTunnel not initialized. Call initializeInstance first.');
    }
    return SSHTunnel.instance;
  }

  /**
   * Initializes the singleton instance with the provided configuration.
   * If an instance already exists, returns the existing instance.
   * 
   * @param config - Tunnel configuration options
   * @returns The singleton SSHTunnel instance
   */
  public static initializeInstance(config: TunnelConfig): SSHTunnel {
    if (!SSHTunnel.instance) {
      SSHTunnel.instance = new SSHTunnel(config);
    }
    return SSHTunnel.instance;
  }

  /**
   * Initializes the singleton instance using environment variables.
   * Required environment variables:
   * - SSH_KEY_PATH: Path to SSH private key
   * - SSH_HOST: SSH server hostname
   * - SSH_PORT: SSH server port (optional, defaults to 22)
   * - SSH_USER: SSH username
   * - POSTGRES_REMOTE_HOST: Remote database host (optional, defaults to localhost)
   * - POSTGRES_REMOTE_PORT: Remote database port (optional, defaults to 5432)
   * - POSTGRES_PORT: Local port to forward to (optional, defaults to 5432)
   * 
   * @returns The singleton SSHTunnel instance
   * @throws Error if required environment variables are missing
   */
  public static initializeFromEnv(): SSHTunnel {
    // Load environment from multiple possible locations
    const envPaths = [
      path.resolve(__dirname, '../../../server/.env.local'),
      path.resolve(__dirname, '../../.env.local'),
      path.resolve(__dirname, '../../../.env.local')
    ];

    let envLoaded = false;
    for (const envPath of envPaths) {
      if (fs.existsSync(envPath)) {
        dotenv.config({ path: envPath });
        envLoaded = true;
        break;
      }
    }

    if (!envLoaded) {
      throw new Error('No .env.local file found in expected locations');
    }

    // Validate required environment variables
    const requiredVars = ['SSH_KEY_PATH', 'SSH_HOST', 'SSH_USER'];
    const missing = requiredVars.filter(varName => !process.env[varName]);
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    const sshKeyPath = process.env.SSH_KEY_PATH;
    const expandedPath = sshKeyPath!.startsWith('~') 
      ? path.join(os.homedir(), sshKeyPath!.slice(1))
      : sshKeyPath;

    if (!fs.existsSync(expandedPath!)) {
      throw new Error(`SSH key file not found at path: ${expandedPath}`);
    }

    const config: TunnelConfig = {
      sshHost: process.env.SSH_HOST!,
      sshPort: parseInt(process.env.SSH_PORT || '22'),
      sshUsername: process.env.SSH_USER!,
      sshKeyPath: expandedPath!,
      remoteHost: process.env.POSTGRES_REMOTE_HOST || 'localhost',
      remotePort: parseInt(process.env.POSTGRES_REMOTE_PORT || '5432'),
      localPort: parseInt(process.env.POSTGRES_PORT || '5432'),
      maxRetries: parseInt(process.env.SSH_MAX_RETRIES || '3'),
      retryDelay: parseInt(process.env.SSH_RETRY_DELAY || '1000'),
      healthCheckInterval: parseInt(process.env.SSH_HEALTH_CHECK_INTERVAL || '30000')
    };

    return SSHTunnel.initializeInstance(config);
  }

  /**
   * Handles connection loss by attempting to reconnect.
   * Uses exponential backoff for retry delays.
   * Emits 'maxRetriesExceeded' event if all retries fail.
   * 
   * @private
   * @throws Error if maximum retries are exceeded
   */
  private async handleDisconnection(): Promise<void> {
    this.logger.warn(`Connection lost. Attempting to reconnect... (Attempt ${this.retryCount + 1}/${this.config.maxRetries})`);
    
    while (this.retryCount < this.config.maxRetries!) {
      try {
        this.retryCount++;
        await this.connect();
        this.logger.info('Successfully reconnected');
        this.retryCount = 0;
        return;
      } catch (error) {
        const delay = this.config.retryDelay! * Math.pow(2, this.retryCount - 1);
        this.logger.error(`Reconnection attempt ${this.retryCount} failed`, error as Error);
        if (this.retryCount < this.config.maxRetries!) {
          this.logger.info(`Waiting ${delay}ms before next attempt...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    this.logger.error(`Failed to reconnect after ${this.config.maxRetries} attempts`);
    this.emit('maxRetriesExceeded');
    throw new Error('Failed to reconnect after maximum retries');
  }

  /**
   * Starts the health check monitoring system.
   * Periodically checks connection status and attempts reconnection if needed.
   * 
   * @private
   */
  private startHealthCheck(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    this.healthCheckInterval = setInterval(async () => {
      this.logger.debug('Running health check...');
      if (!this.isConnected) {
        this.logger.warn('Health check failed - connection lost');
        try {
          await this.handleDisconnection();
        } catch (error) {
          this.logger.error('Health check reconnection failed', error as Error);
        }
      }
    }, this.config.healthCheckInterval);
  }

  /**
   * Creates a new connection in the connection pool.
   * 
   * @private
   * @returns Promise resolving to a new SSH tunnel stream
   */
  private async createPoolConnection(): Promise<ClientChannel> {
    return new Promise<ClientChannel>((resolve, reject) => {
      this.sshClient!.forwardOut(
        '127.0.0.1',
        this.config.localPort,
        this.config.remoteHost,
        this.config.remotePort,
        (err: Error | undefined, stream: ClientChannel) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(stream);
        }
      );
    });
  }

  /**
   * Gets an available connection from the pool or creates a new one.
   * Manages connection reuse and cleanup of dead connections.
   * 
   * @private
   * @returns Promise resolving to a tunnel stream
   * @throws Error if connection pool is full
   */
  private async getPoolConnection(): Promise<ClientChannel> {
    // Find an available connection or create a new one
    for (const [id, stream] of this.connectionPool) {
      if (!stream.destroyed) {
        this.logger.debug(`Reusing existing connection from pool: ${id}`);
        return stream;
      } else {
        this.connectionPool.delete(id);
      }
    }

    // Create new connection if pool isn't full
    if (this.connectionPool.size < this.maxPoolSize) {
      const stream = await this.createPoolConnection();
      const id = `conn_${Date.now()}_${this.connectionPool.size}`;
      this.connectionPool.set(id, stream);
      this.logger.debug(`Created new connection in pool: ${id}`);
      return stream;
    }

    throw new Error('Connection pool is full');
  }

  /**
   * Establishes the SSH tunnel connection.
   * Features:
   * - Connection pooling
   * - Automatic health checks
   * - Error handling
   * - Connection state management
   * 
   * @returns Promise that resolves when the connection is established
   * @throws Error if connection fails
   */
  public async connect(): Promise<void> {
    if (this.isConnected) {
      return;
    }

    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = new Promise<void>((resolve, reject) => {
      try {
        const keyPath = this.expandTilde(this.config.sshKeyPath);
        if (!fs.existsSync(keyPath)) {
          throw new Error(`SSH key file not found at path: ${keyPath}`);
        }

        const sshConfig = {
          host: this.config.sshHost,
          port: this.config.sshPort,
          username: this.config.sshUsername,
          privateKey: fs.readFileSync(keyPath)
        };

        this.sshClient = new Client();

        this.sshClient.on('ready', async () => {
          this.logger.info('SSH connection established, setting up tunnel...');
          try {
            // Create initial pool connection
            const stream = await this.createPoolConnection();
            const id = 'conn_initial';
            this.connectionPool.set(id, stream);

            this.server = net.createServer((sock) => {
              this.getPoolConnection()
                .then(stream => {
                  sock.pipe(stream);
                  stream.pipe(sock);
                })
                .catch(error => {
                  this.logger.error('Failed to get pool connection', error);
                  sock.destroy();
                });
            });

            this.server.listen(this.config.localPort, '127.0.0.1', () => {
              this.logger.info(`SSH tunnel established successfully on port ${this.config.localPort}`);
              this.isConnected = true;
              this.startHealthCheck();
              resolve();
            });

            this.server.on('error', (err: Error) => {
              this.logger.error('Tunnel server error:', err);
              this.isConnected = false;
              this.sshClient!.end();
              reject(err);
            });
          } catch (error) {
            this.logger.error('Failed to set up tunnel:', error as Error);
            reject(error);
          }
        });

        this.sshClient.on('error', (err: Error) => {
          this.logger.error('SSH connection error:', err);
          this.isConnected = false;
          reject(err);
        });

        this.sshClient.on('end', () => {
          this.logger.warn('SSH connection ended');
          this.isConnected = false;
        });

        this.sshClient.on('close', () => {
          this.logger.warn('SSH connection closed');
          this.isConnected = false;
        });

        this.sshClient.connect(sshConfig);
      } catch (error) {
        this.logger.error('Tunnel setup error:', error as Error);
        this.isConnected = false;
        reject(error);
      }
    });

    return this.connectionPromise;
  }

  /**
   * Gracefully closes the SSH tunnel connection.
   * - Stops health checks
   * - Closes all pooled connections
   * - Cleans up resources
   * 
   * @returns Promise that resolves when disconnection is complete
   */
  public async disconnect(): Promise<void> {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = undefined;
    }

    // Close all pool connections
    for (const [id, stream] of this.connectionPool) {
      this.logger.debug(`Closing pool connection: ${id}`);
      stream.end();
    }
    this.connectionPool.clear();

    return new Promise<void>((resolve) => {
      if (this.server) {
        this.server.close(() => {
          if (this.sshClient) {
            this.sshClient.end();
          }
          this.isConnected = false;
          this.connectionPromise = null;
          this.logger.info('SSH tunnel disconnected');
          resolve();
        });
      } else {
        if (this.sshClient) {
          this.sshClient.end();
        }
        this.isConnected = false;
        this.connectionPromise = null;
        this.logger.info('SSH tunnel disconnected');
        resolve();
      }
    });
  }

  /**
   * Checks if the tunnel is currently connected.
   * 
   * @returns true if connected, false otherwise
   */
  public isConnectedToTunnel(): boolean {
    return this.isConnected;
  }

  /**
   * Resets the singleton instance.
   * Disconnects if connected and clears the instance.
   */
  public static resetInstance(): void {
    if (SSHTunnel.instance?.isConnected) {
      SSHTunnel.instance.disconnect();
    }
    SSHTunnel.instance = null;
  }
} 