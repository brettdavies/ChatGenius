import express from 'express';
import { isAuthenticated } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate-request.js';
import { MessageService } from '../services/message-service.js';
import { MessageError } from '../services/message-service.js';
import {
  messageCreateLimiter,
  messageUpdateLimiter,
  messageDeleteLimiter,
  messageReactionLimiter,
  messageSearchLimiter
} from '../middleware/message-rate-limit.js';

const router = express.Router();
const messageService = new MessageService();

// Create a message
router.post('/', isAuthenticated, messageCreateLimiter, validateRequest, async (req, res, next) => {
  console.log('[MessageRoutes] Creating message:', {
    userId: req.user?.id,
    channelId: req.body.channelId,
    threadId: req.body.threadId,
    contentLength: req.body.content?.length
  });
  
  try {
    const message = await messageService.createMessage(req.user!.id, {
      userId: req.user!.id,
      channelId: req.body.channelId,
      content: req.body.content,
      threadId: req.body.threadId
    });
    console.log('[MessageRoutes] Message created successfully:', { messageId: message.id });
    res.status(201).json(message);
  } catch (error) {
    console.error('[MessageRoutes] Error creating message:', error);
    if (error instanceof MessageError) {
      const status = error.code.includes('NOT_CHANNEL_MEMBER') ? 403 : 400;
      console.log('[MessageRoutes] Sending error response:', { status, code: error.code });
      res.status(status).json({
        message: error.message,
        code: error.code
      });
    } else {
      next(error);
    }
  }
});

// Search messages
router.get('/search', isAuthenticated, messageSearchLimiter, validateRequest, async (req, res, next) => {
  console.log('[MessageRoutes] Searching messages:', {
    userId: req.user?.id,
    query: {
      query: req.query.query,
      channelIds: req.query.channelIds,
      userId: req.query.userId,
      limit: req.query.limit,
      offset: req.query.offset
    }
  });
  
  try {
    const result = await messageService.searchMessages(req.user!.id, {
      query: req.query.query as string,
      channelIds: req.query.channelIds ? (req.query.channelIds as string).split(',') : undefined,
      userId: req.query.userId as string,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset as string, 10) : undefined
    });
    console.log('[MessageRoutes] Messages searched successfully:', {
      messageCount: result.messages.length,
      total: result.total
    });
    res.json(result);
  } catch (error) {
    console.error('[MessageRoutes] Error searching messages:', error);
    next(error);
  }
});

// Get messages in a channel
router.get('/channel/:channelId', isAuthenticated, validateRequest, async (req, res, next) => {
  console.log('[MessageRoutes] Getting channel messages:', {
    channelId: req.params.channelId,
    userId: req.user?.id,
    query: {
      limit: req.query.limit,
      before: req.query.before,
      after: req.query.after
    }
  });
  
  try {
    const result = await messageService.getMessages(req.user!.id, {
      channelId: req.params.channelId,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
      before: req.query.before ? new Date(req.query.before as string) : undefined,
      after: req.query.after ? new Date(req.query.after as string) : undefined
    });
    console.log('[MessageRoutes] Channel messages retrieved successfully:', {
      messageCount: result.messages.length,
      total: result.total
    });
    res.json(result);
  } catch (error) {
    console.error('[MessageRoutes] Error getting channel messages:', error);
    next(error);
  }
});

// Get messages in a thread
router.get('/thread/:threadId', isAuthenticated, validateRequest, async (req, res, next) => {
  console.log('[MessageRoutes] Getting thread messages:', {
    threadId: req.params.threadId,
    userId: req.user?.id,
    query: {
      limit: req.query.limit,
      before: req.query.before
    }
  });
  
  try {
    const result = await messageService.getThreadMessages(req.user!.id, {
      threadId: req.params.threadId,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
      before: req.query.before ? new Date(req.query.before as string) : undefined
    });
    console.log('[MessageRoutes] Thread messages retrieved successfully:', {
      messageCount: result.messages.length,
      total: result.total
    });
    res.json(result);
  } catch (error) {
    console.error('[MessageRoutes] Error getting thread messages:', error);
    next(error);
  }
});

// Get a message by ID
router.get('/:messageId', isAuthenticated, validateRequest, async (req, res, next) => {
  console.log('[MessageRoutes] Getting message:', { messageId: req.params.messageId, userId: req.user?.id });
  
  try {
    const message = await messageService.getMessage(req.user!.id, req.params.messageId);
    console.log('[MessageRoutes] Message retrieved successfully');
    res.json(message);
  } catch (error) {
    console.error('[MessageRoutes] Error getting message:', error);
    next(error);
  }
});

// Update a message
router.put('/:messageId', isAuthenticated, messageUpdateLimiter, validateRequest, async (req, res, next) => {
  console.log('[MessageRoutes] Updating message:', {
    messageId: req.params.messageId,
    userId: req.user?.id,
    contentLength: req.body.content?.length
  });
  
  try {
    const message = await messageService.updateMessage(req.user!.id, req.params.messageId, {
      content: req.body.content
    });
    console.log('[MessageRoutes] Message updated successfully');
    res.json(message);
  } catch (error) {
    console.error('[MessageRoutes] Error updating message:', error);
    if (error instanceof MessageError) {
      const status = error.code === 'NOT_MESSAGE_OWNER' ? 403 
        : error.code === 'MESSAGE_NOT_FOUND' ? 404 
        : 400;
      console.log('[MessageRoutes] Sending error response:', { status, code: error.code });
      res.status(status).json({
        message: error.message,
        code: error.code
      });
    } else {
      next(error);
    }
  }
});

// Delete a message
router.delete('/:messageId', isAuthenticated, messageDeleteLimiter, validateRequest, async (req, res, next) => {
  console.log('[MessageRoutes] Deleting message:', { messageId: req.params.messageId, userId: req.user?.id });
  
  try {
    await messageService.deleteMessage(req.user!.id, req.params.messageId);
    console.log('[MessageRoutes] Message deleted successfully');
    res.status(204).end();
  } catch (error) {
    console.error('[MessageRoutes] Error deleting message:', error);
    if (error instanceof MessageError) {
      const status = error.code === 'NOT_MESSAGE_OWNER' ? 403 
        : error.code === 'MESSAGE_NOT_FOUND' ? 404 
        : 400;
      console.log('[MessageRoutes] Sending error response:', { status, code: error.code });
      res.status(status).json({
        message: error.message,
        code: error.code
      });
    } else {
      next(error);
    }
  }
});

// Add a reaction to a message
router.post('/:messageId/reactions', isAuthenticated, messageReactionLimiter, validateRequest, async (req, res, next) => {
  console.log('[MessageRoutes] Adding reaction:', {
    messageId: req.params.messageId,
    userId: req.user?.id,
    emoji: req.body.emoji
  });
  
  try {
    const reaction = await messageService.addReaction(req.user!.id, {
      userId: req.user!.id,
      messageId: req.params.messageId,
      emoji: req.body.emoji
    });
    console.log('[MessageRoutes] Reaction added successfully');
    res.status(201).json(reaction);
  } catch (error) {
    console.error('[MessageRoutes] Error adding reaction:', error);
    if (error instanceof MessageError) {
      const status = error.code === 'REACTION_EXISTS' ? 409 
        : error.code === 'MESSAGE_NOT_FOUND' ? 404 
        : 400;
      console.log('[MessageRoutes] Sending error response:', { status, code: error.code });
      res.status(status).json({
        message: error.message,
        code: error.code
      });
    } else {
      next(error);
    }
  }
});

// Remove a reaction from a message
router.delete('/:messageId/reactions/:emoji', isAuthenticated, messageReactionLimiter, validateRequest, async (req, res, next) => {
  console.log('[MessageRoutes] Removing reaction:', {
    messageId: req.params.messageId,
    userId: req.user?.id,
    emoji: req.params.emoji
  });
  
  try {
    await messageService.removeReaction(req.user!.id, req.params.messageId, req.params.emoji);
    console.log('[MessageRoutes] Reaction removed successfully');
    res.status(204).end();
  } catch (error) {
    console.error('[MessageRoutes] Error removing reaction:', error);
    next(error);
  }
});

// Get reactions for a message
router.get('/:messageId/reactions', isAuthenticated, validateRequest, async (req, res, next) => {
  console.log('[MessageRoutes] Getting message reactions:', {
    messageId: req.params.messageId,
    userId: req.user?.id
  });
  
  try {
    const reactions = await messageService.getMessageReactions(req.user!.id, req.params.messageId);
    console.log('[MessageRoutes] Message reactions retrieved successfully:', {
      reactionCount: reactions.length
    });
    res.json(reactions);
  } catch (error) {
    console.error('[MessageRoutes] Error getting message reactions:', error);
    next(error);
  }
});

export default router; 