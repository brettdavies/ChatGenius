import { Request, Response, NextFunction } from 'express';
import { RealtimeService } from '../services/realtime-service.js';
import { sendError } from '../utils/response.utils.js';

export function setupSSE(req: Request, res: Response, next: NextFunction): void {
  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Send initial connection message
  res.write('data: {"type":"connected"}\n\n');

  // Keep connection alive
  const keepAlive = setInterval(() => {
    res.write(': keepalive\n\n');
  }, 30000);

  // Clean up on client disconnect
  req.on('close', () => {
    clearInterval(keepAlive);
    res.end();
  });

  next();
}

export async function handleChannelEvents(req: Request, res: Response): Promise<void> {
  const { channelId } = req.params;
  const userId = req.user!.id;
  const realtimeService = RealtimeService.getInstance();

  try {
    // Subscribe to channel events
    await realtimeService.subscribe(channelId, userId, res);

    // Clean up on client disconnect
    req.on('close', async () => {
      await realtimeService.unsubscribe(channelId, userId);
    });
  } catch (error) {
    console.error('Error handling channel events:', error);
    sendError(res, 'Failed to subscribe to channel events', 'EVENT_SUBSCRIPTION_FAILED', [{
      message: 'Failed to subscribe to channel events',
      code: 'EVENT_SUBSCRIPTION_FAILED',
      path: `/channels/${channelId}/events`
    }], 500);
  }
} 