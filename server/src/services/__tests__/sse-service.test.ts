import { jest } from '@jest/globals';
import { Response } from 'express';
import { ServerSentEventsService } from '../sse-service';
import { createMockResponse } from '../../utils/__tests__/test-helpers';

describe('ServerSentEventsService', () => {
  let service: ServerSentEventsService;
  let mockResponse: jest.Mocked<Response>;

  beforeEach(() => {
    service = new ServerSentEventsService();
    mockResponse = createMockResponse();
  });

  describe('connection management', () => {
    it('should add a new connection', () => {
      const userId = 'test-user';
      const connection = service.addConnection(userId, mockResponse);

      expect(connection.userId).toBe(userId);
      expect(connection.channels).toBeInstanceOf(Set);
      expect(connection.channels.size).toBe(0);
      expect(mockResponse.writeHead).toHaveBeenCalledWith(
        200,
        expect.objectContaining({
          'Content-Type': 'text/event-stream'
        })
      );
    });

    it('should remove a connection', () => {
      const userId = 'test-user';
      const connection = service.addConnection(userId, mockResponse);
      service.removeConnection(connection.id);

      const status = service.getConnectionStatus(connection.id);
      expect(status.connected).toBe(false);
    });
  });

  describe('channel management', () => {
    it('should subscribe to channels', () => {
      const userId = 'test-user';
      const channel = 'test-channel';
      const connection = service.addConnection(userId, mockResponse);

      service.subscribeToChannel(connection.id, channel);
      const status = service.getConnectionStatus(connection.id);

      expect(status.channels).toContain(channel);
    });

    it('should unsubscribe from channels', () => {
      const userId = 'test-user';
      const channel = 'test-channel';
      const connection = service.addConnection(userId, mockResponse);

      service.subscribeToChannel(connection.id, channel);
      service.unsubscribeFromChannel(connection.id, channel);
      const status = service.getConnectionStatus(connection.id);

      expect(status.channels).not.toContain(channel);
    });
  });

  describe('event sending', () => {
    it('should send events to subscribed connections', () => {
      const userId = 'test-user';
      const channel = 'test-channel';
      const connection = service.addConnection(userId, mockResponse);
      service.subscribeToChannel(connection.id, channel);

      const eventData = { message: 'test' };
      service.sendEventToChannel(channel, 'test-event', eventData);

      expect(mockResponse.write).toHaveBeenCalledWith(`event: test-event\n`);
      expect(mockResponse.write).toHaveBeenCalledWith(`data: ${JSON.stringify(eventData)}\n\n`);
    });

    it('should not send events to unsubscribed connections', () => {
      const userId = 'test-user';
      const channel = 'test-channel';
      const connection = service.addConnection(userId, mockResponse);

      const eventData = { message: 'test' };
      service.sendEventToChannel(channel, 'test-event', eventData);

      expect(mockResponse.write).not.toHaveBeenCalled();
    });
  });

  describe('connection status', () => {
    it('should return correct connection status', () => {
      const userId = 'test-user';
      const channel = 'test-channel';
      const connection = service.addConnection(userId, mockResponse);
      service.subscribeToChannel(connection.id, channel);

      const status = service.getConnectionStatus(connection.id);

      expect(status.connected).toBe(true);
      expect(status.userId).toBe(userId);
      expect(status.channels).toContain(channel);
      expect(status.connectedSince).toBeInstanceOf(Date);
    });

    it('should return inactive status for unknown connections', () => {
      const status = service.getConnectionStatus('unknown-id');

      expect(status.connected).toBe(false);
      expect(status.channels).toEqual([]);
      expect(status.userId).toBeUndefined();
      expect(status.connectedSince).toBeUndefined();
    });
  });
}); 