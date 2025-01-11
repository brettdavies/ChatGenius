import { Pool, PoolClient } from 'pg';
import { EventEmitter } from 'events';
import { pool } from '../config/database';
import { EventSystemError } from '../utils/events';

export interface DatabaseEvent<T = any> {
  channel: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  schema: string;
  table: string;
  data: T;
}

export interface EventListenerConfig {
  maxReconnectAttempts?: number;
  reconnectDelay?: number;
  channels?: string[];
  bufferEvents?: boolean;
  maxBufferSize?: number;
}

export type ListenerStatus = 'disconnected' | 'connected' | 'error' | 'reconnecting';

export type EventHandler = (event: DatabaseEvent) => void | Promise<void>;

export interface EventListener {
  start(): Promise<void>;
  stop(): Promise<void>;
  getStatus(): ListenerStatus;
  addHandler(handler: EventHandler): void;
  removeHandler(handler: EventHandler): void;
}

export const DEFAULT_EVENT_CONFIG: Required<EventListenerConfig> = {
  maxReconnectAttempts: 5,
  reconnectDelay: 1000,
  channels: ['channels', 'messages', 'users'],
  bufferEvents: true,
  maxBufferSize: 1000,
};

export class PostgresEventService implements EventListener {
  private client: PoolClient | null = null;
  private status: ListenerStatus = 'disconnected';
  private reconnectAttempts = 0;
  private eventBuffer: DatabaseEvent[] = [];
  private handlers: Map<string, Set<EventHandler>> = new Map();
  private eventEmitter = new EventEmitter();

  constructor(
    private db: Pool = pool,
    private config: Required<EventListenerConfig> = DEFAULT_EVENT_CONFIG
  ) {}

  /**
   * Start listening for database events
   */
  public async start(): Promise<void> {
    console.log('PostgreSQL event listener started');
    await this.connect();
  }

  /**
   * Stop listening for database events
   */
  public async stop(): Promise<void> {
    if (this.client) {
      for (const channel of this.config.channels) {
        await this.client.query(`UNLISTEN ${channel}`);
      }
      this.client.removeAllListeners();
      this.client.release();
      this.client = null;
    }
    this.status = 'disconnected';
    console.log('PostgreSQL event listener stopped');
  }

  /**
   * Get the current status of the event listener
   */
  public getStatus(): ListenerStatus {
    return this.status;
  }

  /**
   * Add an event handler for a specific channel
   */
  public onEvent<T>(channel: string, handler: EventHandler): void {
    if (!this.handlers.has(channel)) {
      this.handlers.set(channel, new Set());
    }
    this.handlers.get(channel)?.add(handler);
  }

  /**
   * Remove an event handler for a specific channel
   */
  public offEvent(channel: string, handler: EventHandler): void {
    this.handlers.get(channel)?.delete(handler);
  }

  /**
   * Add an event handler
   */
  public addHandler(handler: EventHandler): void {
    for (const handlers of this.handlers.values()) {
      handlers.add(handler);
    }
  }

  /**
   * Remove an event handler
   */
  public removeHandler(handler: EventHandler): void {
    for (const handlers of this.handlers.values()) {
      handlers.delete(handler);
    }
  }

  /**
   * Emit a database event
   */
  public async emit(event: DatabaseEvent): Promise<void> {
    if (!this.client) {
      throw new EventSystemError(
        'Cannot emit event: not connected',
        'CONNECTION_ERROR'
      );
    }

    try {
      // Use parameterized query to prevent SQL injection
      await this.client.query(
        'SELECT pg_notify($1, $2)',
        [event.channel, JSON.stringify(event)]
      );
    } catch (error) {
      throw new EventSystemError(
        'Failed to emit event',
        'HANDLER_ERROR',
        error as Error
      );
    }
  }

  /**
   * Connect to the database and start listening for events
   */
  private async connect(): Promise<void> {
    try {
      this.client = await this.db.connect();

      // Listen on all configured channels
      for (const channel of this.config.channels) {
        await this.client.query(`LISTEN ${channel}`);
      }

      // Set up notification handler
      (this.client as any).on('notification', this.handleNotification.bind(this));

      // Set up error handler
      this.client.on('error', this.handleError.bind(this));

      this.status = 'connected';
      this.reconnectAttempts = 0;

      // Process any buffered events
      if (this.eventBuffer.length > 0) {
        console.log(`Processing ${this.eventBuffer.length} buffered events`);
        for (const event of this.eventBuffer) {
          await this.processEvent(event);
        }
        this.eventBuffer = [];
      }
    } catch (error) {
      await this.handleError(error as Error);
    }
  }

  /**
   * Handle incoming notifications from PostgreSQL
   */
  private async handleNotification(msg: { channel: string; payload: string }) {
    try {
      const event = JSON.parse(msg.payload) as DatabaseEvent;
      await this.processEvent(event);
    } catch (error) {
      console.error('Error processing notification:', error);
      // Emit error event instead of throwing
      this.eventEmitter.emit('error', new EventSystemError(
        'Failed to process notification',
        'PARSE_ERROR',
        error as Error
      ));
    }
  }

  /**
   * Process a database event
   */
  private async processEvent(event: DatabaseEvent): Promise<void> {
    if (this.status === 'connected') {
      // Call all registered handlers for this channel
      const handlers = this.handlers.get(event.channel);
      if (handlers) {
        for (const handler of handlers) {
          try {
            await handler(event);
          } catch (error) {
            console.error('Error in event handler:', error);
            this.eventEmitter.emit('error', new EventSystemError(
              'Failed to process event',
              'HANDLER_ERROR',
              error as Error
            ));
          }
        }
      }
    } else if (this.config.bufferEvents && this.eventBuffer.length < this.config.maxBufferSize) {
      // Buffer event for later processing
      this.eventBuffer.push(event);
    }
  }

  /**
   * Handle connection errors
   */
  private async handleError(error: Error): Promise<void> {
    console.error('PostgreSQL event listener error:', error);
    
    if (this.reconnectAttempts < this.config.maxReconnectAttempts) {
      this.status = 'reconnecting';
      this.reconnectAttempts++;
      console.log(`Attempting reconnection (${this.reconnectAttempts}/${this.config.maxReconnectAttempts})`);
      
      setTimeout(async () => {
        await this.connect();
      }, this.config.reconnectDelay);
    } else {
      this.status = 'error';
      this.eventEmitter.emit('error', new EventSystemError(
        'Max reconnection attempts reached',
        'CONNECTION_ERROR',
        error
      ));
    }
  }
}

// Export singleton instance
export const eventService = new PostgresEventService(); 