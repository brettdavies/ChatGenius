import { Request, Response } from 'express';
import { ChannelService } from '@/services/channel-service';
import { CreateChannelRequest } from '@/types/channel';
import { ValidationError, UnauthorizedError } from '@/errors';
import { AuthenticatedRequest } from '@/types/express';

export class ChannelController {
  private channelService: ChannelService;

  constructor() {
    this.channelService = new ChannelService();
  }

  private getUserId(req: AuthenticatedRequest): string {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedError('User not authenticated');
    }
    return userId;
  }

  /**
   * Get all channels the authenticated user is a member of
   */
  async getUserChannels(req: AuthenticatedRequest, res: Response) {
    const userId = this.getUserId(req);
    const channels = await this.channelService.getUserChannels(userId);
    res.json(channels);
  }

  /**
   * Get all public channels for discovery
   */
  async getPublicChannels(req: AuthenticatedRequest, res: Response) {
    const channels = await this.channelService.getPublicChannels();
    res.json(channels);
  }

  /**
   * Create a new channel
   */
  async createChannel(req: AuthenticatedRequest, res: Response) {
    const userId = this.getUserId(req);
    const { name, type = 'public', description } = req.body;
    const channel = await this.channelService.createChannel({ 
      name, 
      type, 
      description,
      members: [userId]
    }, userId);
    res.status(201).json(channel);
  }

  /**
   * Get a channel by its short ID
   */
  async getChannelByShortId(req: AuthenticatedRequest, res: Response) {
    const userId = this.getUserId(req);
    const { short_id } = req.params;
    const channel = await this.channelService.getChannelByShortId(short_id, userId);
    res.json(channel);
  }

  /**
   * Archive a channel
   */
  async archiveChannel(req: AuthenticatedRequest, res: Response) {
    const userId = this.getUserId(req);
    const { channel_id } = req.params;
    const channel = await this.channelService.archiveChannel(channel_id, userId);
    res.json(channel);
  }
} 