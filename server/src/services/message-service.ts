import { RealtimeService, ChannelEventType } from './realtime-service.js';
import { ChannelService } from './channel-service.js';
import * as messageQueries from '../db/queries/messages.js';
import { Message, CreateMessageInput, UpdateMessageInput, GetMessagesOptions, GetThreadMessagesOptions, SearchMessagesOptions } from '../db/queries/messages.js';
import { CreateReactionInput } from '../db/queries/reactions.js';
import { ErrorCodes } from '../openapi/schemas/common.js';

export class MessageError extends Error {
  constructor(public code: typeof ErrorCodes[keyof typeof ErrorCodes], message: string) {
    super(message);
    this.name = 'MessageError';
  }
}

export class MessageService {
  private realtimeService = RealtimeService.getInstance();
  private channelService = new ChannelService();

  async createMessage(userId: string, input: CreateMessageInput): Promise<Message> {
    console.log('[MessageService] Creating message:', { userId, channelId: input.channelId, threadId: input.threadId });
    
    // Check channel access
    console.log('[MessageService] Checking channel access');
    const channel = await this.channelService.getChannelById(input.channelId);
    await this.channelService.validateChannelPermission(channel.id, userId, ['owner', 'admin', 'member']);

    // If it's a thread message, verify parent exists and is not already a thread
    if (input.threadId) {
      console.log('[MessageService] Validating thread parent:', { threadId: input.threadId });
      const parentMessage = await messageQueries.getMessageById(input.threadId);
      if (!parentMessage) {
        console.log('[MessageService] Thread parent not found:', { threadId: input.threadId });
        throw new MessageError(ErrorCodes.PARENT_MESSAGE_NOT_FOUND, 'Parent message not found');
      }
      if (parentMessage.threadId) {
        console.log('[MessageService] Invalid thread depth:', { threadId: input.threadId });
        throw new MessageError(ErrorCodes.INVALID_THREAD_DEPTH, 'Cannot create a thread within a thread');
      }
    }

    // Create message
    console.log('[MessageService] Creating message in database');
    const message = await messageQueries.createMessage(input);
    if (!message) {
      throw new MessageError(ErrorCodes.CREATE_FAILED, 'Failed to create message');
    }

    // Emit real-time event
    console.log('[MessageService] Emitting real-time event');
    await this.realtimeService.emit({
      type: ChannelEventType.MESSAGE_CREATED,
      channelId: input.channelId,
      userId,
      timestamp: new Date(),
      data: message
    });

    console.log('[MessageService] Message created successfully:', { messageId: message.id });
    return message;
  }

  async getMessage(userId: string | undefined, messageId: string): Promise<Message> {
    if (!userId) {
      throw new MessageError(ErrorCodes.UNAUTHORIZED, 'User not authenticated');
    }
    
    const message = await messageQueries.getMessageById(messageId);
    if (!message) {
      throw new MessageError(ErrorCodes.MESSAGE_NOT_FOUND, 'Message not found');
    }

    // Check if user has access to the channel
    await this.channelService.validateChannelPermission(message.channelId, userId, ['owner', 'admin', 'member']);
    
    return message;
  }

  async updateMessage(userId: string, messageId: string, input: UpdateMessageInput): Promise<Message> {
    console.log('[MessageService] Updating message:', { userId, messageId });
    
    const message = await messageQueries.getMessageById(messageId);
    if (!message) {
      console.log('[MessageService] Message not found:', { messageId });
      throw new MessageError(ErrorCodes.MESSAGE_NOT_FOUND, 'Message not found');
    }

    // Check ownership
    if (message.userId !== userId) {
      console.log('[MessageService] Access denied: user is not message owner', { userId, messageId, ownerId: message.userId });
      throw new MessageError(ErrorCodes.NOT_MESSAGE_OWNER, 'Cannot edit another user\'s message');
    }

    // Check if content is actually different
    if (message.content === input.content) {
      console.log('[MessageService] No changes detected, returning existing message');
      return message;
    }

    // Update message
    console.log('[MessageService] Updating message in database');
    const updatedMessage = await messageQueries.updateMessage(messageId, input);
    if (!updatedMessage) {
      console.log('[MessageService] Failed to update message:', { messageId });
      throw new MessageError(ErrorCodes.UPDATE_FAILED, 'Failed to update message');
    }

    // Emit real-time event
    console.log('[MessageService] Emitting real-time event');
    await this.realtimeService.emit({
      type: ChannelEventType.MESSAGE_UPDATED,
      channelId: message.channelId,
      userId,
      timestamp: new Date(),
      data: updatedMessage
    });

    console.log('[MessageService] Message updated successfully');
    return updatedMessage;
  }

  async deleteMessage(userId: string, messageId: string): Promise<void> {
    console.log('[MessageService] Deleting message:', { userId, messageId });
    const message = await messageQueries.getMessageById(messageId);
    if (!message) {
      console.log('[MessageService] Message not found:', { messageId });
      throw new MessageError(ErrorCodes.MESSAGE_NOT_FOUND, 'Message not found');
    }

    // Check ownership
    if (message.userId !== userId) {
      console.log('[MessageService] Access denied: user is not message owner', { userId, messageId, ownerId: message.userId });
      throw new MessageError(ErrorCodes.NOT_MESSAGE_OWNER, 'Cannot delete another user\'s message');
    }

    // Soft delete message
    console.log('[MessageService] Soft deleting message in database');
    const deleted = await messageQueries.softDeleteMessage(messageId);
    if (!deleted) {
      console.log('[MessageService] Failed to delete message:', { messageId });
      throw new MessageError(ErrorCodes.DELETE_FAILED, 'Failed to delete message');
    }

    // Emit real-time event
    console.log('[MessageService] Emitting real-time event');
    await this.realtimeService.emit({
      type: ChannelEventType.MESSAGE_DELETED,
      channelId: message.channelId,
      userId,
      timestamp: new Date(),
      data: { messageId }
    });

    console.log('[MessageService] Message deleted successfully');
  }

  async getMessages(userId: string, options: GetMessagesOptions): Promise<{ messages: Message[]; total: number }> {
    console.log('[MessageService] Getting messages:', { userId, channelId: options.channelId, options });
    
    // Check channel access
    console.log('[MessageService] Checking channel access');
    await this.channelService.validateChannelPermission(options.channelId, userId, ['owner', 'admin', 'member']);

    // Validate limit
    if (options.limit && (options.limit < 1 || options.limit > 100)) {
      console.log('[MessageService] Invalid limit:', { limit: options.limit });
      throw new MessageError(ErrorCodes.INVALID_LIMIT, 'Limit must be between 1 and 100');
    }

    console.log('[MessageService] Fetching messages from database');
    const result = await messageQueries.getMessages(options);
    console.log('[MessageService] Messages retrieved successfully:', { count: result.messages.length, total: result.total });
    return result;
  }

  async getThreadMessages(userId: string, options: GetThreadMessagesOptions): Promise<{ messages: Message[]; total: number }> {
    console.log('[MessageService] Getting thread messages:', { userId, threadId: options.threadId, options });
    
    // Get parent message to check channel access
    console.log('[MessageService] Getting parent message');
    const parentMessage = await messageQueries.getMessageById(options.threadId);
    if (!parentMessage) {
      console.log('[MessageService] Thread not found:', { threadId: options.threadId });
      throw new MessageError(ErrorCodes.THREAD_NOT_FOUND, 'Thread not found');
    }

    // Check channel access
    console.log('[MessageService] Checking channel access');
    await this.channelService.validateChannelPermission(parentMessage.channelId, userId, ['owner', 'admin', 'member']);

    console.log('[MessageService] Fetching thread messages from database');
    const result = await messageQueries.getThreadMessages(options);
    console.log('[MessageService] Thread messages retrieved successfully:', { count: result.messages.length, total: result.total });
    return result;
  }

  async searchMessages(userId: string, options: SearchMessagesOptions): Promise<{ messages: Message[]; total: number }> {
    console.log('[MessageService] Searching messages:', { userId, options });
    
    // If channelIds provided, verify access to all channels
    if (options.channelIds) {
      console.log('[MessageService] Validating channel access for search');
      for (const channelId of options.channelIds) {
        await this.channelService.validateChannelPermission(channelId, userId, ['owner', 'admin', 'member']);
      }
    }

    console.log('[MessageService] Searching messages in database');
    const result = await messageQueries.searchMessages(options);
    console.log('[MessageService] Messages searched successfully:', { count: result.messages.length, total: result.total });
    return result;
  }

  // Reaction methods
  async addReaction(userId: string, input: CreateReactionInput): Promise<void> {
    console.log('[MessageService] Adding reaction:', { userId, messageId: input.messageId, emoji: input.emoji });
    
    // Check message exists and user has access
    console.log('[MessageService] Checking message access');
    const message = await this.getMessage(userId, input.messageId);

    // Update reactions in message
    console.log('[MessageService] Updating message reactions');
    const reactions = { ...message.reactions } || {};
    if (!reactions[input.emoji]) {
      reactions[input.emoji] = [];
    }
    
    // Check if user already reacted
    if (reactions[input.emoji].includes(userId)) {
      console.log('[MessageService] Reaction already exists');
      throw new MessageError(ErrorCodes.REACTION_EXISTS, 'User has already reacted with this emoji');
    }

    reactions[input.emoji].push(userId);

    // Update message with new reactions while preserving other fields
    console.log('[MessageService] Updating message with reactions:', reactions);
    const updatedMessage = await messageQueries.updateMessage(input.messageId, {
      content: message.content,
      edited: message.edited,
      reactions
    });

    if (!updatedMessage) {
      throw new MessageError(ErrorCodes.UPDATE_FAILED, 'Failed to update message reactions');
    }

    // Emit real-time event
    console.log('[MessageService] Emitting real-time event');
    await this.realtimeService.emit({
      type: ChannelEventType.REACTION_ADDED,
      channelId: message.channelId,
      userId,
      timestamp: new Date(),
      data: { messageId: input.messageId, emoji: input.emoji, userId }
    });

    console.log('[MessageService] Reaction added successfully');
  }

  async removeReaction(userId: string, messageId: string, emoji: string): Promise<void> {
    console.log('[MessageService] Removing reaction:', { userId, messageId, emoji });
    
    // Check message exists and user has access
    console.log('[MessageService] Checking message access');
    const message = await this.getMessage(userId, messageId);

    // Update reactions in message
    console.log('[MessageService] Updating message reactions');
    const reactions = { ...message.reactions } || {};
    
    // Check if reaction exists
    if (!reactions[emoji] || !reactions[emoji].includes(userId)) {
      console.log('[MessageService] Reaction not found');
      throw new MessageError(ErrorCodes.REACTION_NOT_FOUND, 'Reaction not found');
    }

    // Remove user's reaction
    reactions[emoji] = reactions[emoji].filter(id => id !== userId);
    
    // Remove emoji key if no reactions left
    if (reactions[emoji].length === 0) {
      delete reactions[emoji];
    }

    // Update message with new reactions while preserving other fields
    console.log('[MessageService] Updating message with reactions:', reactions);
    const updatedMessage = await messageQueries.updateMessage(messageId, {
      content: message.content,
      edited: message.edited,
      reactions
    });

    if (!updatedMessage) {
      throw new MessageError(ErrorCodes.UPDATE_FAILED, 'Failed to update message reactions');
    }

    // Emit real-time event
    console.log('[MessageService] Emitting real-time event');
    await this.realtimeService.emit({
      type: ChannelEventType.REACTION_REMOVED,
      channelId: message.channelId,
      userId,
      timestamp: new Date(),
      data: { messageId, emoji, userId }
    });

    console.log('[MessageService] Reaction removed successfully');
  }

  async getMessageReactions(userId: string, messageId: string): Promise<{ emoji: string; userId: string; messageId: string }[]> {
    console.log('[MessageService] Getting message reactions:', { userId, messageId });
    
    // Check message exists and user has access
    console.log('[MessageService] Checking message access');
    const message = await this.getMessage(userId, messageId);

    // Convert JSONB reactions to array format
    const reactions: { emoji: string; userId: string; messageId: string }[] = [];
    Object.entries(message.reactions || {}).forEach(([emoji, userIds]) => {
      userIds.forEach(userId => {
        reactions.push({ messageId, emoji, userId });
      });
    });

    console.log('[MessageService] Reactions retrieved successfully:', { count: reactions.length });
    return reactions;
  }
} 