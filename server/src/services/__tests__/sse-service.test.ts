import { jest } from '@jest/globals';
import { Response } from 'express';
import { SSEService } from '../sse-service';
import { SSEConnection, ConnectionStatus } from '../../types/sse';
import { createMockResponse } from '../../utils/__tests__/test-helpers';

describe('SSEService', () => {
  let sseService: SSEService;
  let mockResponse: Response;

  beforeEach(() => {
    sseService = new SSEService();
    mockResponse = createMockResponse();
  });

  describe('connection management', () => {
    it('should add a new connection', () => {
      const userId = 'test-user';
      const connectionId = sseService.addConnection(userId, mockResponse);

      expect(connectionId).toBeTruthy();
      expect(mockResponse.writeHead).toHaveBeenCalledWith(
        200,
        expect.objectContaining({
          'Content-Type': 'text/event-stream'
        })
      );
    });

    it('should remove a connection', () => {
      const userId = 'test-user';
      const connectionId = sseService.addConnection(userId, mockResponse);
      sseService.removeConnection(connectionId);

      expect(sseService.getConnectionCount()).toBe(0);
    });
  });

  describe('channel management', () => {
    it('should subscribe to channels', () => {
      const userId = 'test-user';
      const channel = 'test-channel';
      const connectionId = sseService.addConnection(userId, mockResponse);

      sseService.subscribeToChannel(connectionId, channel);
    });

    it('should unsubscribe from channels', () => {
      const userId = 'test-user';
      const channel = 'test-channel';
      const connectionId = sseService.addConnection(userId, mockResponse);

      sseService.subscribeToChannel(connectionId, channel);
      sseService.unsubscribeFromChannel(connectionId, channel);
    });
  });

  describe('event sending', () => {
    it('should send events to subscribed connections', () => {
      const userId = 'test-user';
      const channel = 'test-channel';
      const connectionId = sseService.addConnection(userId, mockResponse);
      sseService.subscribeToChannel(connectionId, channel);

      const eventData = { message: 'test' };
      sseService.sendEventToChannel(channel, eventData);

      expect(mockResponse.write).toHaveBeenCalledWith(`data: ${JSON.stringify(eventData)}\n\n`);
    });

    it('should not send events to unsubscribed connections', () => {
      const userId = 'test-user';
      const channel = 'test-channel';
      sseService.addConnection(userId, mockResponse);

      const eventData = { message: 'test' };
      sseService.sendEventToChannel(channel, eventData);

      expect(mockResponse.write).not.toHaveBeenCalled();
    });
  });
}); 