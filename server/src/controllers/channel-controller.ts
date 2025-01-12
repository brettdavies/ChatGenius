import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import { channelService } from '../services/channel-service';

class ChannelController {
  /**
   * Creates a new channel for the authenticated user
   */
  async createChannel(req: Request, res: Response) {
    try {
      const userId = req.user?.db_id;
      if (!userId) {
        throw new Error('User not found');
      }

      const { name, description, isPrivate = false } = req.body;
      
      const channelId = await channelService.createChannel(userId, {
        name,
        description,
        type: isPrivate ? 'private' : 'public'
      });

      res.status(201).json({ id: channelId });
    } catch (error) {
      logger.error('Error creating channel:', error);
      res.status(500).json({ error: 'Failed to create channel' });
    }
  }

  /**
   * Lists all channels accessible to the authenticated user
   */
  async listChannels(req: Request, res: Response) {
    try {
      const userId = req.user?.db_id;
      if (!userId) {
        throw new Error('User not found');
      }

      const channels = await channelService.listChannels(userId);
      res.json(channels);
    } catch (error) {
      logger.error('Error listing channels:', error);
      res.status(500).json({ error: 'Failed to list channels' });
    }
  }
}

export const channelController = new ChannelController(); 