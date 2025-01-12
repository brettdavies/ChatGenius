import { Request, Response } from 'express';
import { Pool } from 'pg';
import { ChannelService } from '../services/channel-service';
import { EventService } from '../services/event-service';
import { getUserId } from '../middleware/auth';
import { logger } from '../utils/logger';

declare global {
  var pool: Pool;
  var eventService: EventService;
}

class ChannelController {
  private channelService: ChannelService;

  constructor() {
    this.channelService = new ChannelService(global.pool);
  }

  /**
   * Creates a new channel for the authenticated user
   * @param req Express request with channel data in body: { name: string, description?: string, isPrivate?: boolean }
   * @param res Express response
   * @returns Created channel ID with 201 status, or error with 500 status
   */
  async createChannel(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      const { name, description, isPrivate = false } = req.body;
      
      const channelId = await this.channelService.createChannel(userId, {
        name,
        description,
        isPrivate
      });

      res.status(201).json({ id: channelId });
    } catch (error) {
      logger.error('Error creating channel:', error);
      res.status(500).json({ error: 'Failed to create channel' });
    }
  }

  /**
   * Lists all channels accessible to the authenticated user
   * @param req Express request
   * @param res Express response
   * @returns Array of channels with 200 status, or error with 500 status
   */
  async listChannels(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      const channels = await this.channelService.listChannels(userId);
      res.json(channels);
    } catch (error) {
      logger.error('Error listing channels:', error);
      res.status(500).json({ error: 'Failed to list channels' });
    }
  }
}

export const channelController = new ChannelController(); 