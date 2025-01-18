
import {
  Channel,
  ChannelMember,
  createChannel,
  getChannelById,
  updateChannel,
  archiveChannel,
  softDeleteChannel,
  searchChannels,
  ChannelSearchParams,
  addChannelMember,
  removeChannelMember,
  getChannelMembers,
  getChannelMember,
  updateChannelMember
} from '../db/queries/channels.js';
import { RealtimeService, ChannelEventType } from './realtime-service.js';
import { ErrorCodes } from '../openapi/schemas/common.js';

export class ChannelError extends Error {
  constructor(public code: typeof ErrorCodes[keyof typeof ErrorCodes], message: string) {
    super(message);
    this.name = 'ChannelError';
  }
}

export class ChannelService {
  private realtimeService = RealtimeService.getInstance();

  /**
   * Creates a new channel
   * @throws {ChannelError} If channel creation fails
   */
  async createChannel(input: {
    name: string;
    description?: string;
    type: 'public' | 'private' | 'dm';
    createdBy: string;
  }): Promise<Channel> {
    console.log('[ChannelService] Creating channel:', {
      name: input.name,
      type: input.type,
      createdBy: input.createdBy
    });

    // Validate channel type
    if (!['public', 'private', 'dm'].includes(input.type)) {
      console.error('[ChannelService] Invalid channel type:', input.type);
      throw new ChannelError(
        ErrorCodes.INVALID_CHANNEL_TYPE,
        'Channel type must be public, private, or dm'
      );
    }

    // Validate channel name
    if (input.name.length < 2 || input.name.length > 80) {
      console.error('[ChannelService] Invalid channel name length:', input.name.length);
      throw new ChannelError(
        ErrorCodes.INVALID_NAME,
        'Channel name must be between 2 and 80 characters'
      );
    }

    // Create channel
    const channel = await createChannel(input);
    if (!channel) {
      console.error('[ChannelService] Failed to create channel:', input);
      throw new ChannelError(ErrorCodes.CREATE_FAILED, 'Failed to create channel');
    }

    console.log('[ChannelService] Channel created:', channel.id);

    // Add creator as owner
    try {
      await addChannelMember(channel.id, input.createdBy, 'owner');
      console.log('[ChannelService] Added creator as owner:', input.createdBy);
    } catch (error) {
      console.error('[ChannelService] Failed to add creator as owner:', error);
      throw new ChannelError(ErrorCodes.MEMBER_ADD_FAILED, 'Failed to add creator as owner');
    }

    try {
      await this.realtimeService.emit({
        type: ChannelEventType.CHANNEL_CREATED,
        channelId: channel.id,
        userId: input.createdBy,
        timestamp: new Date(),
        data: channel
      });
      console.log('[ChannelService] Emitted channel created event');
    } catch (error) {
      console.error('[ChannelService] Failed to emit channel created event:', error);
      // Don't fail the request if realtime event fails
    }

    return channel;
  }

  /**
   * Gets a channel by ID
   * @throws {ChannelError} If channel not found
   */
  async getChannelById(id: string): Promise<Channel> {
    const channel = await getChannelById(id);
    if (!channel) {
      throw new ChannelError(ErrorCodes.CHANNEL_NOT_FOUND, 'Channel not found');
    }
    return channel;
  }

  /**
   * Updates a channel
   * @throws {ChannelError} If channel not found or update fails
   */
  async updateChannel(
    id: string,
    updates: Partial<Pick<Channel, 'name' | 'description'>>,
    userId: string
  ): Promise<Channel> {
    // Check if channel exists and user has permission
    const channel = await this.getChannelById(id);
    await this.validateChannelPermission(id, userId, ['owner', 'admin']);

    // Validate updates
    if (updates.name && (updates.name.length < 2 || updates.name.length > 80)) {
      throw new ChannelError(
        ErrorCodes.INVALID_NAME,
        'Channel name must be between 2 and 80 characters'
      );
    }

    const updatedChannel = await updateChannel(id, updates);
    if (!updatedChannel) {
      throw new ChannelError(ErrorCodes.UPDATE_FAILED, 'Failed to update channel');
    }

    await this.realtimeService.emit({
      type: ChannelEventType.CHANNEL_UPDATED,
      channelId: id,
      userId: userId,
      timestamp: new Date(),
      data: updatedChannel
    });

    return updatedChannel;
  }

  /**
   * Archives a channel
   * @throws {ChannelError} If channel not found or archive fails
   */
  async archiveChannel(id: string, userId: string): Promise<Channel> {
    // Check if channel exists and user has permission
    const channel = await this.getChannelById(id);
    await this.validateChannelPermission(id, userId, ['owner']);

    const archivedChannel = await archiveChannel(id, userId);
    if (!archivedChannel) {
      throw new ChannelError(ErrorCodes.ARCHIVE_FAILED, 'Failed to archive channel');
    }

    await this.realtimeService.emit({
      type: ChannelEventType.CHANNEL_ARCHIVED,
      channelId: id,
      userId: userId,
      timestamp: new Date(),
      data: archivedChannel
    });

    return archivedChannel;
  }

  /**
   * Deletes a channel
   * @throws {ChannelError} If channel not found or deletion fails
   */
  async deleteChannel(id: string, userId: string): Promise<void> {
    // Check if channel exists and user has permission
    const channel = await this.getChannelById(id);
    await this.validateChannelPermission(id, userId, ['owner']);

    const deleted = await softDeleteChannel(id);
    if (!deleted) {
      throw new ChannelError(ErrorCodes.DELETE_FAILED, 'Failed to delete channel');
    }

    await this.realtimeService.emit({
      type: ChannelEventType.CHANNEL_DELETED,
      channelId: id,
      userId: userId,
      timestamp: new Date()
    });
  }

  /**
   * Searches for channels
   */
  async searchChannels(params: ChannelSearchParams): Promise<{
    channels: Channel[];
    total: number;
  }> {
    return searchChannels(params);
  }

  /**
   * Adds a member to a channel
   * @throws {ChannelError} If channel not found or member addition fails
   */
  async addChannelMember(
    channelId: string,
    userId: string,
    memberId: string,
    role: 'admin' | 'member' = 'member'
  ): Promise<ChannelMember> {
    // Check if channel exists and user has permission
    const channel = await this.getChannelById(channelId);
    await this.validateChannelPermission(channelId, userId, ['owner', 'admin']);

    // Check if user is already a member
    const existingMember = await getChannelMember(channelId, memberId);
    if (existingMember && !existingMember.deletedAt) {
      throw new ChannelError(ErrorCodes.ALREADY_MEMBER, 'User is already a channel member');
    }

    // Add member
    const member = await addChannelMember(channelId, memberId, role);

    await this.realtimeService.emit({
      type: ChannelEventType.MEMBER_JOINED,
      channelId: channelId,
      userId: memberId,
      timestamp: new Date(),
      data: { role: member.role }
    });

    return member;
  }

  /**
   * Removes a member from a channel
   * @throws {ChannelError} If channel not found or member removal fails
   */
  async removeChannelMember(
    channelId: string,
    userId: string,
    memberId: string
  ): Promise<void> {
    // Check if channel exists and user has permission
    const channel = await this.getChannelById(channelId);
    
    // Allow self-removal or removal by owner/admin
    if (userId !== memberId) {
      await this.validateChannelPermission(channelId, userId, ['owner', 'admin']);
    }

    // Check if user is a member
    const member = await getChannelMember(channelId, memberId);
    if (!member || member.deletedAt) {
      throw new ChannelError(ErrorCodes.NOT_MEMBER, 'User is not a channel member');
    }

    // Prevent removal of channel owner
    if (member.role === 'owner') {
      throw new ChannelError(
        ErrorCodes.CANNOT_REMOVE_OWNER,
        'Cannot remove channel owner'
      );
    }

    const removed = await removeChannelMember(channelId, memberId);
    if (!removed) {
      throw new ChannelError(ErrorCodes.DELETE_FAILED, 'Failed to remove channel member');
    }

    await this.realtimeService.emit({
      type: ChannelEventType.MEMBER_LEFT,
      channelId: channelId,
      userId: memberId,
      timestamp: new Date()
    });
  }

  /**
   * Gets channel members
   * @throws {ChannelError} If channel not found
   */
  async getChannelMembers(
    channelId: string,
    userId: string,
    params: { limit?: number; offset?: number } = {}
  ): Promise<{ members: ChannelMember[]; total: number }> {
    // Check if channel exists and user has access
    const channel = await this.getChannelById(channelId);
    
    // For private channels, verify membership
    if (channel.type === 'private') {
      const member = await getChannelMember(channelId, userId);
      if (!member || member.deletedAt) {
        throw new ChannelError(ErrorCodes.NOT_MEMBER, 'User is not a channel member');
      }
    }

    return getChannelMembers(channelId, params);
  }

  /**
   * Updates a channel member's role
   * @throws {ChannelError} If channel not found or update fails
   */
  async updateChannelMember(
    channelId: string,
    userId: string,
    memberId: string,
    updates: { role: 'admin' | 'member' }
  ): Promise<ChannelMember> {
    // Check if channel exists and user has permission
    const channel = await this.getChannelById(channelId);
    await this.validateChannelPermission(channelId, userId, ['owner']);

    // Check if target user is a member
    const member = await getChannelMember(channelId, memberId);
    if (!member || member.deletedAt) {
      throw new ChannelError(ErrorCodes.NOT_MEMBER, 'User is not a channel member');
    }

    // Prevent role change for channel owner
    if (member.role === 'owner') {
      throw new ChannelError(
        ErrorCodes.CANNOT_MODIFY_OWNER,
        'Cannot modify channel owner role'
      );
    }

    const updatedMember = await updateChannelMember(channelId, memberId, updates);
    if (!updatedMember) {
      throw new ChannelError(ErrorCodes.UPDATE_FAILED, 'Failed to update channel member');
    }

    await this.realtimeService.emit({
      type: ChannelEventType.MEMBER_UPDATED,
      channelId: channelId,
      userId: memberId,
      timestamp: new Date(),
      data: { role: updatedMember.role }
    });

    return updatedMember;
  }

  /**
   * Validates if a user has the required permission for a channel action
   * @throws {ChannelError} If user doesn't have required permission
   */
  async validateChannelPermission(
    channelId: string,
    userId: string,
    allowedRoles: ('owner' | 'admin' | 'member')[]
  ): Promise<void> {
    const member = await getChannelMember(channelId, userId);
    if (!member || member.deletedAt) {
      throw new ChannelError(ErrorCodes.NOT_MEMBER, 'User is not a channel member');
    }

    if (!allowedRoles.includes(member.role)) {
      throw new ChannelError(
        ErrorCodes.INSUFFICIENT_PERMISSIONS,
        'User does not have required permissions'
      );
    }
  }

  /**
   * Gets all channels where a user is a member
   * @param userId - The user's ID
   * @returns List of channels and total count
   */
  async getUserChannels(userId: string): Promise<{ channels: Channel[]; total: number }> {
    return searchChannels({
      userId,
      includeArchived: false
    });
  }
} 