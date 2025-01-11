import { Response } from 'express';
import { DatabaseEvent } from './events';

/**
 * Status of an SSE connection
 */
export type SSEConnectionStatus = 'active' | 'closed' | 'error';

/**
 * Configuration options for SSE connections
 */
export interface SSEConfig {
  heartbeatInterval: number;
  maxConnectionsPerUser: number;
  retryInterval: number;
  compressionThreshold: number;
}

/**
 * Represents an SSE client connection
 */
export interface SSEConnection {
  id: string;
  userId: string;
  response: Response;
  channels: Set<string>;
  lastEventId?: string;
  createdAt: Date;
  status: SSEConnectionStatus;
  heartbeatInterval?: NodeJS.Timeout;
}

/**
 * Interface for the SSE service
 */
export interface SSEService {
  addConnection(userId: string, res: Response): Promise<SSEConnection>;
  removeConnection(connectionId: string): void;
  subscribeToChannel(connectionId: string, channel: string): void;
  unsubscribeFromChannel(connectionId: string, channel: string): void;
  broadcast(channel: string, event: DatabaseEvent): void;
  getConnectionStatus(connectionId: string): SSEConnectionStatus;
  getActiveConnections(): number;
  getUserConnections(userId: string): SSEConnection[];
}

/**
 * Error types for SSE system
 */
export class SSEError extends Error {
  constructor(
    message: string,
    public readonly code: 'CONNECTION_LIMIT' | 'INVALID_CONNECTION' | 'BROADCAST_ERROR' | 'CONNECTION_NOT_FOUND',
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'SSEError';
  }
}

/**
 * Default configuration for SSE
 */
export const DEFAULT_SSE_CONFIG: SSEConfig = {
  heartbeatInterval: 30000, // 30 seconds
  maxConnectionsPerUser: 5,
  retryInterval: 1000, // 1 second
  compressionThreshold: 1024 // 1KB
}; 