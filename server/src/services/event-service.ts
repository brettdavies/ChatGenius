import { Pool, PoolClient } from 'pg';
import { EventEmitter } from '../types/events';
import { logger } from '../utils/logger';

export class EventService implements EventEmitter {
  private client: PoolClient | null = null;
  private listeners = new Map<string, Set<(...args: any[]) => void>>();

  constructor(private pool: Pool) {}

  async start(): Promise<void> {
    try {
      this.client = await this.pool.connect();
      this.client.on('notification', this.handleNotification.bind(this));
      await this.client.query('LISTEN channels');
      logger.info('Event service started');
    } catch (error) {
      logger.error('Failed to start event service:', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (this.client) {
      try {
        await this.client.query('UNLISTEN channels');
        this.client.removeAllListeners('notification');
        await this.client.release();
        this.client = null;
        logger.info('Event service stopped');
      } catch (error) {
        logger.error('Failed to stop event service:', error);
        throw error;
      }
    }
  }

  on(event: string | symbol, listener: (...args: any[]) => void): this {
    const listeners = this.listeners.get(event.toString()) || new Set();
    listeners.add(listener);
    this.listeners.set(event.toString(), listeners);
    return this;
  }

  off(event: string | symbol, listener: (...args: any[]) => void): this {
    const listeners = this.listeners.get(event.toString());
    if (listeners) {
      listeners.delete(listener);
      if (listeners.size === 0) {
        this.listeners.delete(event.toString());
      }
    }
    return this;
  }

  notify(channel: string, data: any): void {
    const listeners = this.listeners.get(channel);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          logger.error(`Error in event listener for channel ${channel}:`, error);
        }
      });
    }
  }

  private handleNotification(msg: { channel: string; payload?: string }) {
    try {
      if (msg.payload) {
        const data = JSON.parse(msg.payload);
        this.notify(msg.channel, data);
      }
    } catch (error) {
      logger.error('Failed to handle notification:', error);
    }
  }
}

export const eventService = new EventService(
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  })
); 