import { Request, Response } from 'express';
import { sseService } from '@/services/sse-service';
import { logger } from '@/utils/logger';
import { getUserId } from '@/middleware/auth';
import { AuthenticatedRequest } from '@/types/express';

export class SSEController {
  private clients: Map<string, Response> = new Map();

  handleSSE(req: AuthenticatedRequest, res: Response) {
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
} 