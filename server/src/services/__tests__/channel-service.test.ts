import { jest } from '@jest/globals';
import { ChannelService } from '../channel-service';
import { EventService } from '../event-service';
import { createMockPool, createQueryResult } from '../../__mocks__/pg';
import { createMockChannel } from '../../utils/__tests__/test-mocks';
import { Channel } from '../../types/channel';
import { DatabaseEvent } from '../../types/events';

describe('ChannelService', () => {
  let service: ChannelService;
  let mockPool: ReturnType<typeof createMockPool>;
  let mockEventService: jest.Mocked<EventService>;

  beforeEach(() => {
    mockPool = createMockPool();
    
    const eventService = new EventService(mockPool);
    mockEventService = {
      ...eventService,
      emit: jest.fn().mockImplementation((channel: string, event: DatabaseEvent) => {
        return true;
      }),
      on: jest.fn().mockReturnThis(),
      off: jest.fn().mockReturnThis(),
      start: jest.fn().mockResolvedValue(undefined),
      stop: jest.fn().mockResolvedValue(undefined)
    } as unknown as jest.Mocked<EventService>;

    service = new ChannelService(mockPool, mockEventService);
  });

  describe('createChannel', () => {
    it('should create a channel and emit event', async () => {
      const mockChannel = createMockChannel({
        owner_id: 'user1',
        name: 'test-channel'
      });

      mockPool.query.mockResolvedValueOnce(createQueryResult([mockChannel]));

      const result = await service.createChannel(mockChannel.owner_id, {
        name: mockChannel.name,
        isPrivate: mockChannel.is_private
      });

      expect(result).toBe(mockChannel.id);
      expect(mockEventService.emit).toHaveBeenCalledWith('channels', expect.objectContaining({
        channel: 'channels',
        operation: 'INSERT',
        schema: 'public',
        table: 'channels',
        data: mockChannel
      }));
    });
  });

  describe('listChannels', () => {
    it('should return channels for user', async () => {
      const mockChannels = [
        createMockChannel({
          owner_id: 'user1',
          name: 'test-channel-1'
        }),
        createMockChannel({
          owner_id: 'user1',
          name: 'test-channel-2'
        })
      ];

      mockPool.query.mockResolvedValueOnce(createQueryResult(mockChannels));

      const result = await service.listChannels('user1');
      expect(result).toEqual(mockChannels);
      expect(mockPool.query).toHaveBeenCalled();
    });
  });
}); 