import { Channel, ChannelMember, ChannelMemberRole, ChannelNotFoundError } from '@/types/channel';
import { ChannelModel } from '@/models/channel.model';
import { CreateChannelRequest, createChannelSchema, ChannelType } from '@/types/channel';
import { UnauthorizedError, NotFoundError, ValidationError } from '@/errors';
import { logger } from '@/utils/logger';
import { z } from 'zod';

export class ChannelService {
  private channelModel: ChannelModel;

  constructor() {
    this.channelModel = new ChannelModel();
  }

  /**
   * Get all channels the user is a member of
   */
  async getUserChannels(userId: string) {
    logger.info(`[ChannelService] Getting channels for user: ${userId}`);
    const channels = await this.channelModel.findUserChannels(userId);
    logger.info(`[ChannelService] Found ${channels.length} channels`);
    return channels;
  }

  /**
   * Get all public channels for discovery
   */
  async getPublicChannels() {
    logger.info('[ChannelService] Getting public channels');
    const channels = await this.channelModel.findPublicChannels();
    logger.info(`[ChannelService] Found ${channels.length} public channels`);
    return channels;
  }

  /**
   * Create a new channel
   */
  async createChannel(data: CreateChannelRequest, userId: string) {
    logger.info(`[ChannelService] Creating channel with type: ${data.type}`);
    
    try {
      // Validate request data using Zod schema
      const validatedData = createChannelSchema.parse(data);
      
      // Create the channel
      const channel = await this.channelModel.create(
        validatedData.name || `${validatedData.type}-channel`,
        validatedData.type,
        userId
      );

      logger.info(`[ChannelService] Created channel: ${channel.id}`);
      return channel;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError(error.errors[0].message);
      }
      throw error;
    }
  }

  /**
   * Get a channel by its short ID
   */
  async getChannelByShortId(shortId: string, userId: string) {
    logger.info(`[ChannelService] Getting channel by short ID: ${shortId}`);
    
    const channel = await this.channelModel.findByShortId(shortId);
    if (!channel) {
      throw new NotFoundError('Channel not found');
    }

    // Check if user has access to the channel
    const hasAccess = await this.channelModel.isUserMember(channel.id, userId);
    if (!hasAccess) {
      throw new UnauthorizedError('User does not have access to this channel');
    }

    // Get channel members
    const members = await this.channelModel.getChannelMembers(channel.id);
    channel.members = members.map(member => ({
      id: member.id,
      user_id: member.id,
      channel_id: channel.id,
      role: member.role as ChannelMemberRole,
      joined_at: member.joined_at
    }));

    logger.info(`[ChannelService] Found channel: ${channel.id}`);
    return channel;
  }

  /**
   * Archive a channel
   */
  async archiveChannel(channelId: string, userId: string) {
    logger.info(`[ChannelService] Archiving channel: ${channelId}`);
    
    // Check if user has access to the channel
    const hasAccess = await this.channelModel.isUserMember(channelId, userId);
    if (!hasAccess) {
      throw new UnauthorizedError('User does not have access to this channel');
    }

    const channel = await this.channelModel.archive(channelId, userId);
    if (!channel) {
      throw new NotFoundError('Channel not found');
    }

    logger.info(`[ChannelService] Archived channel: ${channelId}`);
    return channel;
  }
} 