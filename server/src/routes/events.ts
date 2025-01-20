import express from 'express';
import { validateSession, isAuthenticated } from '../middleware/auth.js';
import { setupSSE, handleChannelEvents } from '../middleware/sse.js';
import { 
  eventSubscriptionLimiter,
  typingIndicatorLimiter,
  presenceUpdateLimiter 
} from '../middleware/rate-limit.js';
import { RealtimeService } from '../services/realtime-service.js';
import { sendResponse, sendError } from '../utils/response.utils.js';

const router = express.Router();
const realtimeService = RealtimeService.getInstance();

// Subscribe to channel events
router.get('/channels/:channelId/events', 
  isAuthenticated, 
  validateSession, 
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
        return sendError(res, 'Unauthorized', 'UNAUTHORIZED', [{
          message: 'Unauthorized',
          code: 'UNAUTHORIZED',
          path: `/channels/${req.params.channelId}/typing/start`
        }], 401);
      }
      await realtimeService.startTyping(req.params.channelId, req.user.id);
      sendResponse(res, 'Typing indicator started', 'TYPING_STARTED');
    } catch (error) {
      sendError(res, 'Failed to start typing indicator', 'TYPING_START_FAILED', [{
        message: 'Failed to start typing indicator',
        code: 'TYPING_START_FAILED',
        path: `/channels/${req.params.channelId}/typing/start`
      }], 500);
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
        return sendError(res, 'Unauthorized', 'UNAUTHORIZED', [{
          message: 'Unauthorized',
          code: 'UNAUTHORIZED',
          path: `/channels/${req.params.channelId}/typing/stop`
        }], 401);
      }
      await realtimeService.stopTyping(req.params.channelId, req.user.id);
      sendResponse(res, 'Typing indicator stopped', 'TYPING_STOPPED');
    } catch (error) {
      sendError(res, 'Failed to stop typing indicator', 'TYPING_STOP_FAILED', [{
        message: 'Failed to stop typing indicator',
        code: 'TYPING_STOP_FAILED',
        path: `/channels/${req.params.channelId}/typing/stop`
      }], 500);
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
        return sendError(res, 'Unauthorized', 'UNAUTHORIZED', [{
          message: 'Unauthorized',
          code: 'UNAUTHORIZED',
          path: `/channels/${req.params.channelId}/presence`
        }], 401);
      }
      const { isOnline } = req.body;
      await realtimeService.updatePresence(req.params.channelId, req.user.id, isOnline);
      sendResponse(res, 'Presence status updated', 'PRESENCE_UPDATED');
    } catch (error) {
      sendError(res, 'Failed to update presence status', 'PRESENCE_UPDATE_FAILED', [{
        message: 'Failed to update presence status',
        code: 'PRESENCE_UPDATE_FAILED',
        path: `/channels/${req.params.channelId}/presence`
      }], 500);
    }
  }
);

export default router; 