import { Request, Response } from 'express';
import eventEmitter from '../config/events';

export const sseController = {
  subscribe: (req: Request, res: Response) => {
    const userId = req.auth?.payload.sub;
    
    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // Helper function to send events
    const sendEvent = (channel: string, data: any) => {
      // Filter events based on user's permissions
      if (shouldSendEvent(userId, channel, data)) {
        res.write(`event: ${channel}\n`);
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      }
    };

    // Subscribe to different event types
    const channels = [
      'message_change',
      'reaction_change',
      'user_status_change',
      'channel_member_change'
    ];

    channels.forEach(channel => {
      eventEmitter.on(channel, (data) => sendEvent(channel, data));
    });

    // Send initial connection success
    sendEvent('connected', { status: 'connected' });

    // Handle client disconnect
    req.on('close', () => {
      channels.forEach(channel => {
        eventEmitter.removeAllListeners(channel);
      });
      res.end();
    });
  }
};

// Helper function to filter events based on user permissions
function shouldSendEvent(userId: string, channel: string, data: any): boolean {
  // Add your event filtering logic here
  // For example, only send messages from channels the user is a member of
  
  switch (channel) {
    case 'message_change':
    case 'reaction_change':
      // TODO: Check if user is member of the channel
      return true;
      
    case 'user_status_change':
      // Everyone can see user status changes
      return true;
      
    case 'channel_member_change':
      // Only send if user is member of the channel
      return true;
      
    default:
      return false;
  }
} 