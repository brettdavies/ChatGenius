import { Request, Response } from 'express';
import { channelRoutes } from '../channel.routes';
import { channelService } from '../../services/channel-service';
import { createMockRequest, createMockResponse } from '../../utils/__tests__/test-helpers';
import { Channel } from '../../types/channel';

jest.mock('../../services/channel-service');
const mockChannelService = channelService as jest.Mocked<typeof channelService>;

describe('Channel Routes', () => {
  let req: jest.Mocked<Request>;
  let res: jest.Mocked<Response>;

  beforeEach(() => {
    req = createMockRequest();
    res = createMockResponse();
    jest.clearAllMocks();
  });

  describe('GET /channels', () => {
    it('should return channels for user', async () => {
      const mockChannels: Channel[] = [
        { id: '1', name: 'test', ownerId: 'user1', createdAt: new Date().toISOString() }
      ];
      mockChannelService.getChannelsForUser.mockResolvedValue(mockChannels);

      await channelRoutes.getChannels(req, res);

      expect(mockChannelService.getChannelsForUser).toHaveBeenCalledWith(req.user?.sub);
      expect(res.json).toHaveBeenCalledWith(mockChannels);
    });
  });

  describe('POST /channels', () => {
    it('should create a new channel', async () => {
      const mockChannel: Channel = {
        id: '1',
        name: 'test',
        ownerId: 'user1',
        createdAt: new Date().toISOString()
      };
      mockChannelService.createChannel.mockResolvedValue(mockChannel);

      req.body = { name: 'test' };
      await channelRoutes.createChannel(req, res);

      expect(mockChannelService.createChannel).toHaveBeenCalledWith({
        name: 'test',
        ownerId: req.user?.sub
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockChannel);
    });
  });
}); 