import { Response } from 'express';
import { ServerSentEventsService } from '../sse-service';
import { SSEConfig } from '../../utils/sse';
import { DatabaseEvent } from '../../utils/events';

describe('ServerSentEventsService', () => {
  let service: ServerSentEventsService;
  let res: any;

  beforeEach(() => {
    res = {
      write: jest.fn().mockReturnValue(true),
      writeHead: jest.fn().mockReturnValue(true),
      setHeader: jest.fn(),
      on: jest.fn(),
      once: jest.fn(),
      end: jest.fn(),
    };

    const config: SSEConfig = {
      heartbeatInterval: 100,
      maxConnectionsPerUser: 2,
      retryInterval: 1000,
      compressionThreshold: 1024
    };

    service = new ServerSentEventsService(config);
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('connection management', () => {
    it('should establish a new connection', async () => {
      const userId = 'test-user';
      const connection = await service.addConnection(userId, res as Response);
      expect(connection.id).toBeDefined();
      expect(connection.userId).toBe(userId);
      expect(connection.status).toBe('active');
    });

    it('should enforce connection limit per user', async () => {
      const userId = 'test-user';
      await service.addConnection(userId, res as Response);
      await service.addConnection(userId, res as Response);
      await expect(service.addConnection(userId, res as Response)).rejects.toThrow();
    });

    it('should remove connection on client disconnect', async () => {
      const userId = 'test-user';
      const connection = await service.addConnection(userId, res as Response);
      service.removeConnection(connection.id);
      expect(() => service.getConnectionStatus(connection.id)).toThrow();
    });
  });

  describe('channel management', () => {
    it('should subscribe and unsubscribe from channels', async () => {
      const userId = 'test-user';
      const channel = 'test-channel';
      const connection = await service.addConnection(userId, res as Response);
      service.subscribeToChannel(connection.id, channel);
      service.unsubscribeFromChannel(connection.id, channel);
    });

    it('should handle invalid connection IDs', () => {
      expect(() => service.subscribeToChannel('invalid-id', 'test-channel')).toThrow();
    });
  });

  describe('heartbeat', () => {
    it('should send heartbeat at configured interval', async () => {
      const userId = 'test-user';
      await service.addConnection(userId, res as Response);
      jest.advanceTimersByTime(100);
      expect(res.write).toHaveBeenCalled();
    });

    it('should cleanup connection on failed heartbeat', async () => {
      const userId = 'test-user';
      const connection = await service.addConnection(userId, res as Response);
      res.write.mockImplementation(() => {
        throw new Error('Write failed');
      });
      jest.advanceTimersByTime(100);
      expect(() => service.getConnectionStatus(connection.id)).toThrow();
    });
  });

  describe('compression', () => {
    it('should compress large payloads', async () => {
      const userId = '123';
      const channel = 'test-channel';
      let wasCompressed = false;
      
      const res = {
        write: jest.fn().mockReturnValue(true),
        writeHead: jest.fn().mockImplementation((status, headers) => {
          if (headers['Content-Encoding'] === 'gzip') {
            wasCompressed = true;
          }
        }),
        setHeader: jest.fn(),
        on: jest.fn(),
      } as unknown as Response;

      const service = new ServerSentEventsService({
        compressionThreshold: 10, // Set a low threshold for testing
        heartbeatInterval: 1000,
        maxConnectionsPerUser: 5,
        retryInterval: 1000
      });

      const connection = await service.addConnection(userId, res);
      service.subscribeToChannel(connection.id, channel);

      const event: DatabaseEvent<{ content: string }> = {
        channel,
        operation: 'INSERT',
        schema: 'public',
        table: 'test',
        data: { content: 'x'.repeat(1000) } // Create a large payload
      };

      await service.broadcast(channel, event);
      expect(wasCompressed).toBe(true);
      expect(res.write).toHaveBeenCalled();
      expect(res.writeHead).toHaveBeenCalledWith(200, expect.objectContaining({
        'Content-Encoding': 'gzip'
      }));
    });
  });
}); 