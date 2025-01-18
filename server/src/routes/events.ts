import express from 'express';
import { isAuthenticated } from '../middleware/auth.js';
import { setupSSE, handleChannelEvents } from '../middleware/sse.js';
import { eventSubscriptionLimiter, typingIndicatorLimiter, presenceUpdateLimiter } from '../middleware/event-rate-limit.js';
import { RealtimeService } from '../services/realtime-service.js';

const router = express.Router();
const realtimeService = RealtimeService.getInstance();

// Subscribe to channel events
router.get('/channels/:channelId/events',
  isAuthenticated,
  eventSubscriptionLimiter,
  setupSSE,
  handleChannelEvents
);

// Start typing indicator
router.post('/channels/:channelId/typing/start',
  isAuthenticated,
  typingIndicatorLimiter,
  async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          message: 'Unauthorized',
          code: 'UNAUTHORIZED'
        });
      }
      await realtimeService.startTyping(req.params.channelId, req.user.id);
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({
        message: 'Failed to start typing indicator',
        code: 'TYPING_START_FAILED'
      });
    }
  }
);

// Stop typing indicator
router.post('/channels/:channelId/typing/stop',
  isAuthenticated,
  typingIndicatorLimiter,
  async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          message: 'Unauthorized',
          code: 'UNAUTHORIZED'
        });
      }
      await realtimeService.stopTyping(req.params.channelId, req.user.id);
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({
        message: 'Failed to stop typing indicator',
        code: 'TYPING_STOP_FAILED'
      });
    }
  }
);

// Update presence status
router.post('/channels/:channelId/presence',
  isAuthenticated,
  presenceUpdateLimiter,
  async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          message: 'Unauthorized',
          code: 'UNAUTHORIZED'
        });
      }
      const { isOnline } = req.body;
      await realtimeService.updatePresence(req.params.channelId, req.user.id, isOnline);
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({
        message: 'Failed to update presence status',
        code: 'PRESENCE_UPDATE_FAILED'
      });
    }
  }
);

export default router; 