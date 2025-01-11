import { PoolClient } from 'pg';

/**
 * Represents a database event with generic payload type
 */
export interface DatabaseEvent<T = unknown> {
  channel: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  schema: string;
  table: string;
  data: T;
}

/**
 * Configuration options for the event listener
 */
export interface EventListenerConfig {
  maxReconnectAttempts: number;
  reconnectDelay: number;
  channels: string[];
  enableBuffering: boolean;
  bufferSize: number;
}

/**
 * Status of the event listener connection
 */
export type ListenerStatus = 'connected' | 'disconnected' | 'reconnecting' | 'error';

/**
 * Event handler function type
 */
export type EventHandler<T = unknown> = (event: DatabaseEvent<T>) => void | Promise<void>;

/**
 * Interface for the event listener service
 */
export interface EventListener {
  start(): Promise<void>;
  stop(): Promise<void>;
  onEvent<T>(channel: string, handler: EventHandler<T>): void;
  offEvent(channel: string, handler: EventHandler): void;
  getStatus(): ListenerStatus;
}

/**
 * Error types for event system
 */
export type EventSystemErrorCode = 
  | 'CONNECTION_ERROR'  // Failed to connect to database or emit event
  | 'PARSE_ERROR'      // Failed to parse notification payload
  | 'HANDLER_ERROR';   // Error in event handler

export class EventSystemError extends Error {
  constructor(
    message: string,
    public code: EventSystemErrorCode,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'EventSystemError';
  }
}

/**
 * Default configuration for the event listener
 */
export const DEFAULT_EVENT_CONFIG: EventListenerConfig = {
  maxReconnectAttempts: 5,
  reconnectDelay: 2000,
  channels: [
    'message_change',
    'reaction_change',
    'user_status_change',
    'channel_member_change'
  ],
  enableBuffering: true,
  bufferSize: 1000
}; 