import { Pool, PoolClient } from 'pg';
import { PostgresEventService } from '../event-service';
import { DatabaseEvent, EventSystemError } from '../../utils/event';
import { EventEmitter } from 'events';

jest.mock('pg');

describe('PostgresEventService', () => {
  let service: PostgresEventService;
  let pool: jest.Mocked<Pool>;
  let mockClient: any;
  let handler: jest.Mock;

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

  afterEach(async () => {
    await service.stop();
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

      try {
        await service.start();
        fail('Expected start to throw an error');
      } catch (e) {
        expect(e).toBeInstanceOf(EventSystemError);
        expect(service.getStatus()).toBe('error');
      }
    });
  });

  describe('event handling', () => {
    it('should process notifications correctly', async () => {
      await service.start();
      const event: DatabaseEvent = {
        channel: 'messages',
        operation: 'INSERT',
        schema: 'public',
        table: 'messages',
        data: { id: '1', content: 'test' }
      };
      const notification = {
        channel: 'messages',
        payload: JSON.stringify(event)
      };

      service.onEvent('messages', handler);
      mockClient.on.mock.calls[0][1](notification);
      expect(handler).toHaveBeenCalledWith(event);
    });

    it('should buffer events when disconnected', async () => {
      await service.start();
      const event: DatabaseEvent = {
        channel: 'messages',
        operation: 'INSERT',
        schema: 'public',
        table: 'messages',
        data: { id: '1' }
      };

      service.onEvent('messages', handler);
      await service.stop();

      // Simulate notification while disconnected
      service['eventBuffer'].push(event);

      // Reconnect and verify buffered event is processed
      await service.start();
      expect(handler).toHaveBeenCalledWith(event);
    });
  });

  describe('error handling', () => {
    it('should emit error for invalid JSON payloads', async () => {
      await service.start();
      const notification = {
        channel: 'messages',
        payload: 'invalid json'
      };

      const errorPromise = new Promise(resolve => {
        service['eventEmitter'].once('error', resolve);
      });

      mockClient.on.mock.calls[0][1](notification);
      const error = await errorPromise;
      expect(error).toBeInstanceOf(EventSystemError);
      expect(error).toHaveProperty('code', 'PARSE_ERROR');
    });

    it('should attempt reconnection on error', async () => {
      jest.useFakeTimers();

      await service.start();
      expect(service.getStatus()).toBe('connected');

      // Simulate connection error
      const error = new Error('Connection lost');
      await service['handleError'](error);

      expect(service.getStatus()).toBe('reconnecting');
      expect(pool.connect).toHaveBeenCalledTimes(1);

      // Fast-forward past reconnect delay
      jest.advanceTimersByTime(1000);

      expect(pool.connect).toHaveBeenCalledTimes(2);

      // Restore timers
      jest.useRealTimers();
    });
  });
}); 