import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../middleware/auth';
import { channelController } from '../controllers/channel-controller';
import { logger } from '../utils/logger';

const router = Router();

type AuthHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

const withAuth = (handler: AuthHandler) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    await handler(req, res, next);
  } catch (error) {
    logger.error('Error in channel route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create a new channel
router.post('/', authMiddleware, withAuth(channelController.createChannel.bind(channelController)));

// List channels for user
router.get('/', authMiddleware, withAuth(channelController.listChannels.bind(channelController)));

export const channelRoutes = router; 