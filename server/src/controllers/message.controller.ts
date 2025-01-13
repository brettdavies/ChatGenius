import { Response } from 'express';
import { AuthenticatedRequest } from '@/types/auth.types';
import { UnauthorizedError } from '@/errors';
import { MessageService } from '@/services/message-service';

export class MessageController {
  private messageService: MessageService;

  constructor() {
    this.messageService = new MessageService();
  }

  private getUserId(req: AuthenticatedRequest): string {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedError('User not authenticated');
    }
    return userId;
  }

  /**
   * Get messages for a channel
   */
  async getChannelMessages(req: AuthenticatedRequest, res: Response) {
    const { channelId } = req.params;
    const userId = this.getUserId(req);
    
    const messages = await this.messageService.getChannelMessages(channelId, userId);
    res.json(messages);
  }

  /**
   * Create a new message in a channel
   */
  async createMessage(req: AuthenticatedRequest, res: Response) {
    const { channelId } = req.params;
    const userId = this.getUserId(req);
    const { content } = req.body;

    const message = await this.messageService.createMessage({
      channelId,
      userId,
      content
    });

    res.status(201).json(message);
  }
} 