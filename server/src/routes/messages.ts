import express from 'express';
import { isAuthenticated, validateSession } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate-request.js';
import { MessageService } from '../services/message-service.js';
import { MessageError } from '../errors/message-error.js';
import {
  messageCreateLimiter,
  messageUpdateLimiter,
  messageDeleteLimiter,
  messageReactionLimiter,
  messageSearchLimiter
} from '../middleware/rate-limit.js';
import { sendResponse, sendError } from '../utils/response.utils.js';

const router = express.Router();
const messageService = new MessageService();

// Create a message
router.post('/', isAuthenticated, validateSession, messageCreateLimiter, validateRequest, async (req, res, _next) => {
  console.log('[MessageRoutes] Creating message:', {
    channelId: req.body.channelId,
    userId: req.user?.id,
    content: req.body.content
  });
  
  try {
    const message = await messageService.createMessage(req.user!.id, {
      channelId: req.body.channelId,
      content: req.body.content,
      threadId: req.body.threadId,
      userId: req.user!.id
    });
    console.log('[MessageRoutes] Message created successfully:', message.id);
    sendResponse(res, 'Message created successfully', 'MESSAGE_CREATED', message, 201);
  } catch (error) {
    console.error('[MessageRoutes] Error creating message:', error);
    if (error instanceof MessageError) {
      const status = error.code === 'CHANNEL_NOT_FOUND' ? 404 : 400;
      sendError(res, error.message, error.code, [{
        message: error.message,
        code: error.code,
        path: '/messages'
      }], status);
    } else {
      sendError(res, 'Failed to create message', 'MESSAGE_CREATE_ERROR', [{
        message: 'Failed to create message',
        code: 'MESSAGE_CREATE_ERROR',
        path: '/messages'
      }], 500);
    }
  }
});

// Search messages
router.get('/search', isAuthenticated, validateSession, messageSearchLimiter, validateRequest, async (req, res, _next) => {
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
    sendResponse(res, 'Messages searched successfully', 'MESSAGES_SEARCHED', result);
  } catch (error) {
    console.error('[MessageRoutes] Error searching messages:', error);
    if (error instanceof MessageError) {
      sendError(res, error.message, error.code, [{
        message: error.message,
        code: error.code,
        path: '/messages/search'
      }], 400);
    } else {
      sendError(res, 'Failed to search messages', 'MESSAGE_SEARCH_ERROR', [{
        message: 'Failed to search messages',
        code: 'MESSAGE_SEARCH_ERROR',
        path: '/messages/search'
      }], 500);
    }
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
    sendResponse(res, 'Messages retrieved successfully', 'MESSAGES_RETRIEVED', result);
  } catch (error) {
    console.error('[MessageRoutes] Error getting channel messages:', error);
    if (error instanceof MessageError) {
      sendError(res, error.message, error.code, [{
        message: error.message,
        code: error.code,
        path: `/messages/channel/${req.params.channelId}`
      }], 400);
    } else {
      next(error);
    }
  }
});

// Get messages in a thread
router.get('/thread/:threadId', isAuthenticated, validateRequest, async (req, res, _next) => {
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
    sendResponse(res, 'Thread messages retrieved successfully', 'THREAD_MESSAGES_RETRIEVED', result);
  } catch (error) {
    console.error('[MessageRoutes] Error getting thread messages:', error);
    if (error instanceof MessageError) {
      sendError(res, error.message, error.code, [{
        message: error.message,
        code: error.code,
        path: `/messages/thread/${req.params.threadId}`
      }], 400);
    } else {
      sendError(res, 'Failed to get thread messages', 'THREAD_MESSAGES_ERROR', [{
        message: 'Failed to get thread messages',
        code: 'THREAD_MESSAGES_ERROR',
        path: `/messages/thread/${req.params.threadId}`
      }], 500);
    }
  }
});

// Get a message by ID
router.get('/:messageId', isAuthenticated, validateRequest, async (req, res, _next) => {
  console.log('[MessageRoutes] Getting message:', { messageId: req.params.messageId, userId: req.user?.id });
  
  try {
    const message = await messageService.getMessage(req.user!.id, req.params.messageId);
    console.log('[MessageRoutes] Message retrieved successfully');
    sendResponse(res, 'Message retrieved successfully', 'MESSAGE_RETRIEVED', { message });
  } catch (error) {
    console.error('[MessageRoutes] Error getting message:', error);
    if (error instanceof MessageError) {
      sendError(res, error.message, error.code, [{
        message: error.message,
        code: error.code,
        path: `/messages/${req.params.messageId}`
      }], 400);
    } else {
      sendError(res, 'Failed to get message', 'MESSAGE_GET_ERROR', [{
        message: 'Failed to get message',
        code: 'MESSAGE_GET_ERROR',
        path: `/messages/${req.params.messageId}`
      }], 500);
    }
  }
});

// Update a message
router.put('/:messageId', isAuthenticated, validateSession, messageUpdateLimiter, validateRequest, async (req, res, _next) => {
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
    sendResponse(res, 'Message updated successfully', 'MESSAGE_UPDATED', { message });
  } catch (error) {
    console.error('[MessageRoutes] Error updating message:', error);
    if (error instanceof MessageError) {
      const status = error.code === 'NOT_MESSAGE_OWNER' ? 403 
        : error.code === 'MESSAGE_NOT_FOUND' ? 404 
        : 400;
      sendError(res, error.message, error.code, [{
        message: error.message,
        code: error.code,
        path: `/messages/${req.params.messageId}`
      }], status);
    } else {
      sendError(res, 'Failed to update message', 'MESSAGE_UPDATE_ERROR', [{
        message: 'Failed to update message',
        code: 'MESSAGE_UPDATE_ERROR',
        path: `/messages/${req.params.messageId}`
      }], 500);
    }
  }
});

// Delete a message
router.delete('/:messageId', isAuthenticated, validateSession, messageDeleteLimiter, validateRequest, async (req, res) => {
  console.log('[MessageRoutes] Deleting message:', { messageId: req.params.messageId, userId: req.user?.id });
  
  try {
    await messageService.deleteMessage(req.params.messageId, req.user!.id);
    sendResponse(res, 'Message deleted successfully', 'MESSAGE_DELETED');
  } catch (error) {
    console.error('Message deletion error:', error);
    if (error instanceof MessageError) {
      sendError(res, error.message, error.code, [{
        message: error.message,
        code: error.code,
        path: `/messages/${req.params.messageId}`
      }], 400);
    } else {
      sendError(res, 'Failed to delete message', 'MESSAGE_DELETE_ERROR', [{
        message: 'Failed to delete message',
        code: 'MESSAGE_DELETE_ERROR',
        path: `/messages/${req.params.messageId}`
      }], 500);
    }
  }
});

// Add a reaction to a message
router.post('/:messageId/reactions', isAuthenticated, validateSession, messageReactionLimiter, validateRequest, async (req, res, _next) => {
  console.log('[MessageRoutes] Adding reaction:', {
    messageId: req.params.messageId,
    userId: req.user?.id,
    emoji: req.body.emoji
  });
  
  try {
    await messageService.addReaction(req.user!.id, {
      userId: req.user!.id,
      messageId: req.params.messageId,
      emoji: req.body.emoji
    });
    console.log('[MessageRoutes] Reaction added successfully');
    sendResponse(res, 'Reaction added successfully', 'REACTION_ADDED', {
      messageId: req.params.messageId,
      userId: req.user!.id,
      emoji: req.body.emoji
    }, 201);
  } catch (error) {
    console.error('[MessageRoutes] Error adding reaction:', error);
    if (error instanceof MessageError) {
      const status = error.code === 'REACTION_EXISTS' ? 409 
        : error.code === 'MESSAGE_NOT_FOUND' ? 404 
        : 400;
      sendError(res, error.message, error.code, [{
        message: error.message,
        code: error.code,
        path: `/messages/${req.params.messageId}/reactions`
      }], status);
    } else {
      sendError(res, 'Failed to add reaction', 'REACTION_ADD_ERROR', [{
        message: 'Failed to add reaction',
        code: 'REACTION_ADD_ERROR',
        path: `/messages/${req.params.messageId}/reactions`
      }], 500);
    }
  }
});

// Remove a reaction from a message
router.delete('/:messageId/reactions/:emoji', isAuthenticated, validateRequest, async (req, res, _next) => {
  console.log('[MessageRoutes] Removing reaction:', {
    messageId: req.params.messageId,
    userId: req.user?.id,
    emoji: req.params.emoji
  });
  
  try {
    await messageService.removeReaction(req.user!.id, req.params.messageId, req.params.emoji);
    console.log('[MessageRoutes] Reaction removed successfully');
    sendResponse(res, 'Reaction removed successfully', 'REACTION_REMOVED');
  } catch (error) {
    console.error('[MessageRoutes] Error removing reaction:', error);
    if (error instanceof MessageError) {
      sendError(res, error.message, error.code, [{
        message: error.message,
        code: error.code,
        path: `/messages/${req.params.messageId}/reactions/${req.params.emoji}`
      }], 400);
    } else {
      sendError(res, 'Failed to remove reaction', 'REACTION_REMOVE_ERROR', [{
        message: 'Failed to remove reaction',
        code: 'REACTION_REMOVE_ERROR',
        path: `/messages/${req.params.messageId}/reactions/${req.params.emoji}`
      }], 500);
    }
  }
});

// Get reactions for a message
router.get('/:messageId/reactions', isAuthenticated, validateRequest, async (req, res, _next) => {
  console.log('[MessageRoutes] Getting message reactions:', {
    messageId: req.params.messageId,
    userId: req.user?.id
  });
  
  try {
    const reactions = await messageService.getMessageReactions(req.user!.id, req.params.messageId);
    console.log('[MessageRoutes] Message reactions retrieved successfully:', {
      reactionCount: reactions.length
    });
    sendResponse(res, 'Message reactions retrieved successfully', 'MESSAGE_REACTIONS_RETRIEVED', { reactions });
  } catch (error) {
    console.error('[MessageRoutes] Error getting message reactions:', error);
    if (error instanceof MessageError) {
      sendError(res, error.message, error.code, [{
        message: error.message,
        code: error.code,
        path: `/messages/${req.params.messageId}/reactions`
      }], 400);
    } else {
      sendError(res, 'Failed to get message reactions', 'MESSAGE_REACTIONS_ERROR', [{
        message: 'Failed to get message reactions',
        code: 'MESSAGE_REACTIONS_ERROR',
        path: `/messages/${req.params.messageId}/reactions`
      }], 500);
    }
  }
});

export default router; 