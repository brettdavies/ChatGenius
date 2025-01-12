import { Request, Response } from 'express';
import { SSEService } from '../services/sse-service';
import { getUserId } from '../middleware/auth';
import { logger } from '../utils/logger';

const sseService = new SSEService();

export const sseController = {
  async handleSSE(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      const connectionId = sseService.addConnection(userId, res);
      logger.info(`SSE connection established for user ${userId}, connection ${connectionId}`);

      const channel = req.query.channel;
      if (typeof channel === 'string') {
        sseService.subscribeToChannel(connectionId, channel);
        logger.info(`User ${userId} subscribed to channel ${channel}`);
      }

      req.on('close', () => {
        sseService.removeConnection(connectionId);
        logger.info(`SSE connection closed for user ${userId}, connection ${connectionId}`);
      });
    } catch (error) {
      logger.error('Error handling SSE connection:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}; 