import { ChannelModel } from '@/models/channel.model';
import { CreateChannelRequest } from '@/types/channel';
import { NotFoundError, ValidationError, UnauthorizedError } from '@/errors';

export class ChannelService {
  private channelModel: ChannelModel;

  constructor() {
    this.channelModel = new ChannelModel();
  }

  /**
   * Get all channels for a user
   */
  async getChannels(userId: string) {
    return await this.channelModel.findAll();
  }

  /**
   * Create a new channel
   */
  async createChannel(data: CreateChannelRequest, userId: string) {
    if (!data.name) {
      throw new ValidationError('Channel name is required');
    }
    return await this.channelModel.create(data.name, userId);
  }

  /**
   * Get a channel by ID
   */
  async getChannel(channelId: string, userId: string) {
    const channel = await this.channelModel.findById(channelId);
    if (!channel) {
      throw new NotFoundError('Channel not found');
    }
    return channel;
  }

  /**
   * Get a channel by short ID
   */
  async getChannelByShortId(shortId: string, userId: string) {
    const channel = await this.channelModel.findByShortId(shortId);
    if (!channel) {
      throw new NotFoundError('Channel not found');
    }
    return channel;
  }

  /**
   * Archive a channel
   */
  async archiveChannel(channelId: string, userId: string) {
    const channel = await this.channelModel.archive(channelId);
    if (!channel) {
      throw new NotFoundError('Channel not found');
    }
    return channel;
  }

  /**
   * Delete a channel
   */
  async deleteChannel(channelId: string, userId: string) {
    const channel = await this.channelModel.delete(channelId);
    if (!channel) {
      throw new NotFoundError('Channel not found');
    }
    return channel;
  }
} 