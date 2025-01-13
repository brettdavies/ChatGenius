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
   * Get all channels
   */
  async getChannels(req: AuthenticatedRequest, res: Response) {
    const userId = this.getUserId(req);
    const channels = await this.channelService.getChannels(userId);
    res.json(channels);
  }

  /**
   * Create a new channel
   */
  async createChannel(req: AuthenticatedRequest, res: Response) {
    const userId = this.getUserId(req);
    const channelData = req.body as CreateChannelRequest;

    const channel = await this.channelService.createChannel(channelData, userId);
    res.status(201).json(channel);
  }

  /**
   * Get a channel by ID or short ID
   */
  async getChannel(req: AuthenticatedRequest, res: Response) {
    const { channel_id } = req.params;
    const userId = this.getUserId(req);

    const channel = await this.channelService.getChannel(channel_id, userId);
    res.json(channel);
  }

  /**
   * Get a channel by short ID
   */
  async getChannelByShortId(req: AuthenticatedRequest, res: Response) {
    const { shortId } = req.params;
    const userId = this.getUserId(req);

    const channel = await this.channelService.getChannelByShortId(shortId, userId);
    res.json(channel);
  }

  /**
   * Archive a channel
   */
  async archiveChannel(req: AuthenticatedRequest, res: Response) {
    const { channel_id } = req.params;
    const userId = this.getUserId(req);

    const channel = await this.channelService.archiveChannel(channel_id, userId);
    res.json(channel);
  }

  /**
   * Delete a channel
   */
  async deleteChannel(req: AuthenticatedRequest, res: Response) {
    const { channel_id } = req.params;
    const userId = this.getUserId(req);

    await this.channelService.deleteChannel(channel_id, userId);
    res.status(204).send();
  }
} 