import { jest } from '@jest/globals';
import { EventService } from '../event-service';
import { createMockPool, createMockClient } from '../../__mocks__/pg';
import { DatabaseEvent } from '../../types/events';
import { createMockChannel } from '../../utils/__tests__/test-mocks';
import { Notification } from 'pg';

describe('EventService', () => {
  let service: EventService;
  let mockPool: ReturnType<typeof createMockPool>;
  let mockClient: ReturnType<typeof createMockClient>;

  beforeEach(() => {
    mockClient = createMockClient();
    mockPool = createMockPool();
    mockPool.connect.mockImplementation(() => Promise.resolve(mockClient));
    service = new EventService(mockPool);
  });

  afterEach(async () => {
    await service.stop();
  });

  describe('start', () => {
    it('should connect and set up listeners', async () => {
      await service.start();

      expect(mockPool.connect).toHaveBeenCalled();
      expect(mockClient.on).toHaveBeenCalledWith('notification', expect.any(Function));
      expect(mockClient.on).toHaveBeenCalledWith('error', expect.any(Function));
    });

    it('should handle connection errors', async () => {
      const error = new Error('Connection failed');
      mockPool.connect.mockImplementation(() => Promise.reject(error));

      await expect(service.start()).rejects.toThrow('Connection failed');
    });
  });

  describe('event handling', () => {
    let notificationHandler: (msg: Notification) => void;
    let errorHandler: (error: Error) => void;

    beforeEach(async () => {
      await service.start();
      
      const calls = mockClient.on.mock.calls;
      const notificationCall = calls.find(([event]) => event === 'notification');
      const errorCall = calls.find(([event]) => event === 'error');
      
      notificationHandler = notificationCall?.[1] as (msg: Notification) => void;
      errorHandler = errorCall?.[1] as (error: Error) => void;
      
      expect(notificationHandler).toBeDefined();
      expect(errorHandler).toBeDefined();
    });

    it('should handle notifications', () => {
      const mockEvent: DatabaseEvent = {
        channel: 'test_channel',
        operation: 'INSERT',
        schema: 'public',
        table: 'channels',
        data: createMockChannel()
      };

      const listener = jest.fn();
      service.on('test_channel', listener);

      notificationHandler({
        channel: 'test_channel',
        payload: JSON.stringify(mockEvent),
        processId: 123,
        length: 0,
        name: 'test_channel'
      });

      expect(listener).toHaveBeenCalledWith(mockEvent);
    });

    it('should handle invalid notification payloads', () => {
      const listener = jest.fn();
      service.on('test_channel', listener);

      notificationHandler({
        channel: 'test_channel',
        payload: 'invalid json',
        processId: 123,
        length: 0,
        name: 'test_channel'
      });

      expect(listener).not.toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      const error = new Error('Database error');
      errorHandler(error);

      // Verify that the service attempts to reconnect
      expect(mockPool.connect).toHaveBeenCalledTimes(2);
    });
  });

  describe('emit', () => {
    beforeEach(async () => {
      await service.start();
    });

    it('should send notifications', () => {
      const mockEvent: DatabaseEvent = {
        channel: 'test_channel',
        operation: 'INSERT',
        schema: 'public',
        table: 'channels',
        data: createMockChannel()
      };

      service.emit('test_channel', mockEvent);

      expect(mockClient.query).toHaveBeenCalledWith(
        'SELECT pg_notify($1, $2)',
        ['test_channel', JSON.stringify(mockEvent)]
      );
    });

    it('should handle errors when sending notifications', () => {
      mockClient.query.mockImplementation(() => Promise.reject(new Error('Query failed')));

      const result = service.emit('test_channel', { data: 'test' });
      expect(result).toBe(false);
    });
  });
}); 