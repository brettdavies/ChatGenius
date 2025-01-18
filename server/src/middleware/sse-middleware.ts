import { Request, Response, NextFunction } from 'express';
import { RealtimeService, ChannelEvent } from '../services/realtime-service.js';

/**
 * Middleware to setup SSE connection
 */
export const setupSSE = (req: Request, res: Response, next: NextFunction) => {
  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable Nginx buffering

  // Send initial connection message
  res.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);

  // Keep connection alive
  const keepAlive = setInterval(() => {
    res.write(': keepalive\n\n');
  }, 30000); // Send keepalive every 30 seconds

  // Clean up on client disconnect
  req.on('close', () => {
    clearInterval(keepAlive);
    next();
  });

  next();
};

/**
 * Middleware to handle channel events subscription
 */
export const handleChannelEvents = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const channelId = req.params.channelId;
  const realtimeService = RealtimeService.getInstance();

  // Subscribe to channel events
  await realtimeService.subscribe(channelId, userId);

  // Handle channel events
  const eventHandler = (event: ChannelEvent) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  };

  realtimeService.onChannelEvent(channelId, eventHandler);

  // Clean up on client disconnect
  req.on('close', async () => {
    await realtimeService.unsubscribe(channelId, userId);
    realtimeService.removeChannelEventListener(channelId, eventHandler);
  });
}; 