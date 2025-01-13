import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { SSEConnection, ConnectionStatus } from '@/types/sse';
import { logger } from '@/utils/logger';

export class SSEService {
  private connections: Map<string, SSEConnection> = new Map();

  addConnection(userId: string, response: Response): string {
    const connectionId = uuidv4();
    const connection: SSEConnection = {
      id: connectionId,
      userId,
      response,
      channels: new Set(),
      status: ConnectionStatus.ACTIVE,
      createdAt: new Date()
    };

    this.connections.set(connectionId, connection);
    this.setupSSEHeaders(response);
    return connectionId;
  }

  private setupSSEHeaders(response: Response): void {
    response.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });
  }

  removeConnection(connectionId: string): void {
    if (this.connections.has(connectionId)) {
      logger.info(`Removing SSE connection: ${connectionId}`);
      this.connections.delete(connectionId);
    }
  }

  subscribeToChannel(connectionId: string, channel: string): void {
    const connection = this.connections.get(connectionId);
    if (connection) {
      connection.channels.add(channel);
      logger.info(`Connection ${connectionId} subscribed to channel: ${channel}`);
    }
  }

  unsubscribeFromChannel(connectionId: string, channel: string): void {
    const connection = this.connections.get(connectionId);
    if (connection) {
      connection.channels.delete(channel);
      logger.info(`Connection ${connectionId} unsubscribed from channel: ${channel}`);
    }
  }

  sendEventToChannel(channel: string, data: any): void {
    for (const [connectionId, connection] of this.connections.entries()) {
      if (connection.status === ConnectionStatus.ACTIVE && connection.channels.has(channel)) {
        try {
          this.sendEvent(connection.response, data);
        } catch (error) {
          logger.error(`Error sending event to connection ${connectionId}:`, error);
          this.removeConnection(connectionId);
        }
      }
    }
  }

  private sendEvent(response: Response, data: any): void {
    response.write(`data: ${JSON.stringify(data)}\n\n`);
  }

  getConnectionCount(): number {
    return this.connections.size;
  }
}

export const sseService = new SSEService(); 