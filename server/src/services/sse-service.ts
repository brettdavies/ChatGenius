import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import zlib from 'zlib';
import { promisify } from 'util';
import {
  SSEService,
  SSEConnection,
  SSEConfig,
  SSEConnectionStatus,
  SSEError,
  DEFAULT_SSE_CONFIG
} from '../utils/sse';
import { DatabaseEvent } from '../utils/events';
import { eventService } from './event-service';

const gzip = promisify(zlib.gzip);
const gzipAsync = promisify(zlib.gzip);

/**
 * Service for managing Server-Sent Events connections
 */
export class ServerSentEventsService implements SSEService {
  private connections: Map<string, SSEConnection> = new Map();
  private heartbeatIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor(private config: SSEConfig = DEFAULT_SSE_CONFIG) {}

  /**
   * Add a new SSE connection
   */
  public async addConnection(userId: string, res: Response): Promise<SSEConnection> {
    // Check connection limit
    const userConnections = this.getUserConnections(userId);
    if (userConnections.length >= this.config.maxConnectionsPerUser) {
      throw new SSEError(
        `Connection limit reached for user ${userId}`,
        'CONNECTION_LIMIT'
      );
    }

    // Set up SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no' // Disable Nginx buffering
    });

    // Create connection
    const connection: SSEConnection = {
      id: uuidv4(),
      userId,
      response: res,
      channels: new Set(),
      createdAt: new Date(),
      status: 'active'
    };

    // Store connection
    this.connections.set(connection.id, connection);

    // Set up heartbeat
    this.setupHeartbeat(connection);

    // Set up connection cleanup
    res.on('close', () => {
      this.cleanupConnection(connection.id);
    });

    // Send initial retry interval
    await this.send(connection, {
      event: 'retry',
      data: this.config.retryInterval.toString()
    });

    return connection;
  }

  /**
   * Remove an SSE connection
   */
  public removeConnection(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      throw new SSEError('Connection not found', 'CONNECTION_NOT_FOUND');
    }
    this.cleanupConnection(connectionId);
  }

  /**
   * Subscribe a connection to a channel
   */
  public subscribeToChannel(connectionId: string, channel: string): void {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      throw new SSEError(
        `Invalid connection ID: ${connectionId}`,
        'INVALID_CONNECTION'
      );
    }

    connection.channels.add(channel);
  }

  /**
   * Unsubscribe a connection from a channel
   */
  public unsubscribeFromChannel(connectionId: string, channel: string): void {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      throw new SSEError(
        `Invalid connection ID: ${connectionId}`,
        'INVALID_CONNECTION'
      );
    }

    connection.channels.delete(channel);
  }

  /**
   * Broadcast an event to all connections subscribed to a channel
   */
  public broadcast(channel: string, event: DatabaseEvent): void {
    const message = {
      event: channel,
      data: JSON.stringify(event),
      id: uuidv4()
    };

    for (const connection of this.connections.values()) {
      if (connection.channels.has(channel)) {
        this.send(connection, message).catch(error => {
          console.error(`Error broadcasting to connection ${connection.id}:`, error);
          this.cleanupConnection(connection.id);
        });
      }
    }
  }

  /**
   * Get the status of a connection
   */
  public getConnectionStatus(connectionId: string): SSEConnectionStatus {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      throw new SSEError('Connection not found', 'CONNECTION_NOT_FOUND');
    }
    return connection.status;
  }

  /**
   * Get the number of active connections
   */
  public getActiveConnections(): number {
    return Array.from(this.connections.values()).filter(
      conn => conn.status === 'active'
    ).length;
  }

  /**
   * Get all connections for a user
   */
  public getUserConnections(userId: string): SSEConnection[] {
    return Array.from(this.connections.values()).filter(
      conn => conn.userId === userId
    );
  }

  /**
   * Set up heartbeat for a connection
   */
  private setupHeartbeat(connection: SSEConnection): void {
    const interval = setInterval(async () => {
      try {
        await this.send(connection, {
          event: 'heartbeat',
          data: new Date().toISOString()
        });
      } catch (error) {
        console.error(`Heartbeat failed for connection ${connection.id}:`, error);
        this.cleanupConnection(connection.id);
      }
    }, this.config.heartbeatInterval);

    this.heartbeatIntervals.set(connection.id, interval);
  }

  /**
   * Send an event to a connection with optional compression
   */
  private async send(
    connection: SSEConnection,
    message: { event: string; data: string; id?: string }
  ): Promise<void> {
    try {
      let payload = `event: ${message.event}\n`;
      if (message.id) {
        payload += `id: ${message.id}\n`;
      }
      payload += `data: ${message.data}\n\n`;

      const messageBytes = Buffer.from(payload);
      let data: string | Buffer = payload;
      let headers: Record<string, string> = {};

      if (messageBytes.length > this.config.compressionThreshold) {
        data = await gzipAsync(messageBytes);
        headers['Content-Encoding'] = 'gzip';
      }

      if (Object.keys(headers).length > 0) {
        connection.response.writeHead(200, headers);
      }

      const success = connection.response.write(data);
      if (!success) {
        throw new Error('Write failed');
      }
    } catch (error) {
      this.cleanupConnection(connection.id);
      throw new SSEError('Failed to send event', 'BROADCAST_ERROR', error as Error);
    }
  }

  /**
   * Clean up a connection and its resources
   */
  private cleanupConnection(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (connection) {
      if (connection.heartbeatInterval) {
        clearInterval(connection.heartbeatInterval);
      }
      connection.status = 'closed';
      this.connections.delete(connectionId);
    }
  }
}

// Export singleton instance
export const sseService = new ServerSentEventsService();

// Set up event forwarding from database events to SSE
eventService.onEvent('message_change', event => sseService.broadcast('message_change', event));
eventService.onEvent('reaction_change', event => sseService.broadcast('reaction_change', event));
eventService.onEvent('user_status_change', event => sseService.broadcast('user_status_change', event));
eventService.onEvent('channel_member_change', event => sseService.broadcast('channel_member_change', event)); 