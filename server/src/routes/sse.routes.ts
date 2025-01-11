import { Router } from 'express';
import { checkJwt } from '../middleware/auth';
import { sseService } from '../services/sse-service';
import { SSEError } from '../utils/sse';

const router = Router();

/**
 * Establish SSE connection
 * @route GET /api/sse/connect
 * @auth required
 */
router.get('/connect', checkJwt, async (req, res, next) => {
  try {
    const userId = req.auth?.payload.sub;
    if (!userId) {
      return res.status(401).json({ error: 'User ID not found in token' });
    }

    const connection = await sseService.addConnection(userId, res);
    console.log(`SSE connection established for user ${userId}`);

    // Subscribe to default channels based on user's permissions
    // This will be expanded when RBAC is implemented
    sseService.subscribeToChannel(connection.id, 'message_change');
    sseService.subscribeToChannel(connection.id, 'reaction_change');
    sseService.subscribeToChannel(connection.id, 'user_status_change');
    sseService.subscribeToChannel(connection.id, 'channel_member_change');
  } catch (error) {
    if (error instanceof SSEError && error.code === 'CONNECTION_LIMIT') {
      return res.status(429).json({ error: error.message });
    }
    next(error);
  }
});

/**
 * Subscribe to a channel
 * @route POST /api/sse/subscribe/:channel
 * @auth required
 */
router.post('/subscribe/:channel', checkJwt, (req, res) => {
  const { connectionId } = req.body;
  const { channel } = req.params;

  if (!connectionId) {
    return res.status(400).json({ error: 'Connection ID is required' });
  }

  try {
    sseService.subscribeToChannel(connectionId, channel);
    res.json({ message: 'Subscribed to channel' });
  } catch (error) {
    if (error instanceof SSEError && error.code === 'INVALID_CONNECTION') {
      return res.status(404).json({ error: error.message });
    }
    throw error;
  }
});

/**
 * Unsubscribe from a channel
 * @route POST /api/sse/unsubscribe/:channel
 * @auth required
 */
router.post('/unsubscribe/:channel', checkJwt, (req, res) => {
  const { connectionId } = req.body;
  const { channel } = req.params;

  if (!connectionId) {
    return res.status(400).json({ error: 'Connection ID is required' });
  }

  try {
    sseService.unsubscribeFromChannel(connectionId, channel);
    res.json({ message: 'Unsubscribed from channel' });
  } catch (error) {
    if (error instanceof SSEError && error.code === 'INVALID_CONNECTION') {
      return res.status(404).json({ error: error.message });
    }
    throw error;
  }
});

/**
 * Get connection status
 * @route GET /api/sse/status/:connectionId
 * @auth required
 */
router.get('/status/:connectionId', checkJwt, (req, res) => {
  const { connectionId } = req.params;
  const status = sseService.getConnectionStatus(connectionId);
  res.json({ status });
});

/**
 * Get active connections count
 * @route GET /api/sse/connections/count
 * @auth required
 */
router.get('/connections/count', checkJwt, (req, res) => {
  const count = sseService.getActiveConnections();
  res.json({ count });
});

export default router; 