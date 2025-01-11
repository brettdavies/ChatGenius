import { Pool, PoolClient } from 'pg';
import { PostgresEventService, DatabaseEvent } from '../event-service';
import { EventSystemError } from '../../utils/events';
import { EventEmitter } from 'events';

jest.mock('pg');

describe('PostgresEventService', () => {
  let service: PostgresEventService;
  let pool: jest.Mocked<Pool>;
  let mockClient: any;
  let handler: jest.Mock;
  let notificationHandler: (msg: { channel: string; payload: string }) => void;
  let errorHandler: (error: Error) => void;

  beforeEach(() => {
    mockClient = {
      query: jest.fn(),
      on: jest.fn(),
      removeAllListeners: jest.fn(),
      release: jest.fn(),
    };

    pool = {
      connect: jest.fn().mockResolvedValue(mockClient),
    } as unknown as jest.Mocked<Pool>;

    service = new PostgresEventService(pool);
    handler = jest.fn();
  });

  describe('start', () => {
    it('should start listening for events', async () => {
      await service.start();
      expect(pool.connect).toHaveBeenCalled();
      expect(mockClient.query).toHaveBeenCalledWith('LISTEN channels');
      expect(mockClient.query).toHaveBeenCalledWith('LISTEN messages');
      expect(mockClient.query).toHaveBeenCalledWith('LISTEN users');
      expect(service.getStatus()).toBe('connected');
    });

    it('should handle connection errors', async () => {
      const error = new Error('Connection failed');
      (pool.connect as jest.Mock).mockRejectedValueOnce(error);
      
      const errorPromise = new Promise<void>((resolve) => {
        service['eventEmitter'].once('error', (err: EventSystemError) => {
          expect(err.code).toBe('CONNECTION_ERROR');
          expect(err.originalError).toBe(error);
          resolve();
        });
      });

      await service.start();
      await errorPromise;
      expect(service['status']).toBe('error');
    }, 30000);
  });

  describe('event handling', () => {
    beforeEach(async () => {
      // Store the notification handler when it's registered
      mockClient.on.mockImplementation((event: string, handler: any) => {
        if (event === 'notification') {
          notificationHandler = handler;
        } else if (event === 'error') {
          errorHandler = handler;
        }
      });

      await service.start();
    });

    it('should process notifications correctly', async () => {
      const event: DatabaseEvent = {
        channel: 'messages',
        operation: 'INSERT',
        schema: 'public',
        table: 'messages',
        data: { id: '1', content: 'test' }
      };

      service.onEvent('messages', handler);
      notificationHandler({ channel: 'messages', payload: JSON.stringify(event) });
      expect(handler).toHaveBeenCalledWith(event);
    });

    it('should buffer events when disconnected', async () => {
      const event: DatabaseEvent = {
        channel: 'messages',
        operation: 'INSERT',
        schema: 'public',
        table: 'messages',
        data: { id: '1' }
      };

      service.onEvent('messages', handler);

      // Stop the service and verify status is disconnected
      await service.stop();
      expect(service.getStatus()).toBe('disconnected');

      // Send event while disconnected
      notificationHandler({ channel: 'messages', payload: JSON.stringify(event) });
      expect(handler).not.toHaveBeenCalled();

      // Reconnect and verify buffered event is processed
      await service.start();
      expect(handler).toHaveBeenCalledWith(event);
    });

    it('should emit error for invalid JSON payloads', async () => {
      // Create a promise that resolves when the error event is emitted
      const errorPromise = new Promise<void>((resolve) => {
        service['eventEmitter'].once('error', (err: EventSystemError) => {
          expect(err.code).toBe('PARSE_ERROR');
          expect(err.originalError).toBeInstanceOf(SyntaxError);
          resolve();
        });
      });

      notificationHandler({ channel: 'messages', payload: 'invalid json' });
      await errorPromise;
    });
  });

  describe('error handling', () => {
    beforeEach(async () => {
      mockClient.on.mockImplementation((event: string, handler: any) => {
        if (event === 'notification') {
          notificationHandler = handler;
        } else if (event === 'error') {
          errorHandler = handler;
        }
      });

      await service.start();
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should attempt reconnection on error', async () => {
      jest.useFakeTimers();
      const error = new Error('Connection lost');
      
      const reconnectPromise = new Promise<void>((resolve) => {
        service['eventEmitter'].once('error', (err: EventSystemError) => {
          expect(err.code).toBe('CONNECTION_ERROR');
          expect(err.originalError).toBe(error);
          expect(service['status']).toBe('reconnecting');
          resolve();
        });
      });

      await service.start();
      await service['handleError'](error);
      
      // Fast-forward past reconnect delay
      jest.advanceTimersByTime(service['config'].reconnectDelay);
      
      await reconnectPromise;
      expect(service['reconnectAttempts']).toBe(1);
      
      jest.useRealTimers();
    }, 30000);
  });
}); 