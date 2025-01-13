import { MessageModel } from '@/models/message.model';
import { ChannelService } from '@/services/channel-service';
import { UnauthorizedError, NotFoundError } from '@/errors';
import { logger } from '@/utils/logger';

interface CreateMessageParams {
  channelId: string;
  userId: string;
  content: string;
  threadId?: string;
}

export class MessageService {
  private messageModel: MessageModel;
  private channelService: ChannelService;

  constructor() {
    this.messageModel = new MessageModel();
    this.channelService = new ChannelService();
  }

  /**
   * Get messages for a channel
   */
  async getChannelMessages(channelId: string, userId: string) {
    // Verify user has access to channel
    const channel = await this.channelService.getChannelByShortId(channelId, userId);
    if (!channel) {
      throw new NotFoundError('Channel not found');
    }

    logger.info(`Getting messages for channel ${channelId}`);
    const messages = await this.messageModel.findByChannelId(channel.id);
    return messages;
  }

  /**
   * Create a new message
   */
  async createMessage(params: CreateMessageParams) {
    const { channelId, userId, content, threadId } = params;

    // Verify user has access to channel
    const channel = await this.channelService.getChannelByShortId(channelId, userId);
    if (!channel) {
      throw new UnauthorizedError('User does not have access to this channel');
    }

    // If this is a thread reply, verify the parent message exists
    if (threadId) {
      const parentMessage = await this.messageModel.findById(threadId);
      if (!parentMessage) {
        throw new NotFoundError('Parent message not found');
      }
    }

    logger.info(`Creating message in channel ${channelId}`);
    const message = await this.messageModel.create({
      channelId: channel.id,
      userId,
      content,
      threadId
    });

    return message;
  }
} 