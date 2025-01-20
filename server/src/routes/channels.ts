import express from 'express';
import { ChannelService, ChannelError } from '../services/channel-service.js';
import { Channel } from '../db/queries/channels.js';
import { isAuthenticated, validateSession } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate-request.js';
import { 
  validateChannelName, 
  validateChannelDescription, 
  sanitizeChannelInput 
} from '../utils/channel-validation.js';
import {
  channelCreateLimiter,
  channelUpdateLimiter,
  channelMemberLimiter,
  channelDeleteLimiter,
  channelArchiveLimiter,
  channelReadLimiter
} from '../middleware/rate-limit.js';
import { sendResponse, sendError } from '../utils/response.utils.js';

const router = express.Router();
const channelService = new ChannelService();

// Get user's channels
router.get('/my', isAuthenticated, async (req, res) => {
  try {
    const { channels, total } = await channelService.getUserChannels(req.user!.id);
    sendResponse(res, 'Channels retrieved successfully', 'CHANNELS_RETRIEVED', { channels, total });
  } catch (error) {
    console.error('Failed to fetch user channels:', error);
    sendError(res, 'Failed to fetch channels', 'FETCH_ERROR', [{
      message: 'Failed to fetch channels',
      code: 'FETCH_ERROR',
      path: '/channels/my'
    }], 500);
  }
});

// Create channel
router.post('/', isAuthenticated, validateSession, channelCreateLimiter, validateRequest, async (req, res) => {
  try {
    // Validate and sanitize inputs
    const name = sanitizeChannelInput(req.body.name || '');
    const description = req.body.description ? sanitizeChannelInput(req.body.description) : '';

    const nameValidation = validateChannelName(name);
    if (!nameValidation.isValid) {
      return sendError(res, nameValidation.error || 'Invalid channel name', 'INVALID_CHANNEL_NAME', [{
        message: nameValidation.error || 'Invalid channel name',
        code: 'INVALID_CHANNEL_NAME',
        path: '/channels'
      }], 400);
    }

    const descValidation = validateChannelDescription(description);
    if (!descValidation.isValid) {
      return sendError(res, descValidation.error || 'Invalid channel description', 'INVALID_CHANNEL_DESCRIPTION', [{
        message: descValidation.error || 'Invalid channel description',
        code: 'INVALID_CHANNEL_DESCRIPTION',
        path: '/channels'
      }], 400);
    }

    const channel = await channelService.createChannel({
      name,
      description,
      type: req.body.type,
      createdBy: req.user!.id
    });
    
    sendResponse(res, 'Channel created successfully', 'CHANNEL_CREATED', { channel }, 201);
  } catch (error) {
    console.error('Channel creation error:', error);
    if (error instanceof ChannelError) {
      sendError(res, error.message, error.code, [{
        message: error.message,
        code: error.code,
        path: '/channels'
      }], 400);
    } else {
      sendError(res, 'Failed to create channel', 'CHANNEL_CREATE_ERROR', [{
        message: 'Failed to create channel',
        code: 'CHANNEL_CREATE_ERROR',
        path: '/channels'
      }], 500);
    }
  }
});

// Get channel by ID
router.get('/:channelId', isAuthenticated, validateSession, channelReadLimiter, validateRequest, async (req, res) => {
  try {
    const channel = await channelService.getChannelById(req.params.channelId);
    sendResponse(res, 'Channel retrieved successfully', 'CHANNEL_RETRIEVED', { channel });
  } catch (error) {
    if (error instanceof ChannelError) {
      const status = error.code === 'CHANNEL_NOT_FOUND' ? 404 : 400;
      sendError(res, error.message, error.code, [{
        message: error.message,
        code: error.code,
        path: `/channels/${req.params.channelId}`
      }], status);
    } else {
      console.error('Channel fetch error:', error);
      sendError(res, 'Internal server error', 'INTERNAL_SERVER_ERROR', [{
        message: 'Internal server error',
        code: 'INTERNAL_SERVER_ERROR',
        path: `/channels/${req.params.channelId}`
      }], 500);
    }
  }
});

// Update channel
router.put('/:channelId', isAuthenticated, validateSession, channelUpdateLimiter, validateRequest, async (req, res) => {
  try {
    const updateData: Partial<Pick<Channel, 'name' | 'description'>> = {
      name: req.body.name ? sanitizeChannelInput(req.body.name) : undefined,
      description: req.body.description ? sanitizeChannelInput(req.body.description) : undefined
    };

    const channel = await channelService.updateChannel(
      req.params.channelId,
      updateData,
      req.user!.id
    );
    sendResponse(res, 'Channel updated successfully', 'CHANNEL_UPDATED', { channel });
  } catch (error) {
    if (error instanceof ChannelError) {
      const status = error.code === 'CHANNEL_NOT_FOUND' ? 404 : 400;
      sendError(res, error.message, error.code, [{
        message: error.message,
        code: error.code,
        path: `/channels/${req.params.channelId}`
      }], status);
    } else {
      console.error('Channel update error:', error);
      sendError(res, 'Failed to update channel', 'CHANNEL_UPDATE_ERROR', [{
        message: 'Failed to update channel',
        code: 'CHANNEL_UPDATE_ERROR',
        path: `/channels/${req.params.channelId}`
      }], 500);
    }
  }
});

// Archive channel
router.post('/:channelId/archive', isAuthenticated, validateSession, channelArchiveLimiter, validateRequest, async (req, res) => {
  try {
    const channel = await channelService.archiveChannel(
      req.params.channelId,
      req.user!.id
    );
    sendResponse(res, 'Channel archived successfully', 'CHANNEL_ARCHIVED', { channel });
  } catch (error) {
    if (error instanceof ChannelError) {
      const status = error.code === 'CHANNEL_NOT_FOUND' ? 404 : 400;
      sendError(res, error.message, error.code, [{
        message: error.message,
        code: error.code,
        path: `/channels/${req.params.channelId}/archive`
      }], status);
    } else {
      console.error('Channel archive error:', error);
      sendError(res, 'Failed to archive channel', 'CHANNEL_ARCHIVE_ERROR', [{
        message: 'Failed to archive channel',
        code: 'CHANNEL_ARCHIVE_ERROR',
        path: `/channels/${req.params.channelId}/archive`
      }], 500);
    }
  }
});

// Delete channel
router.delete('/:channelId', isAuthenticated, validateSession, channelDeleteLimiter, validateRequest, async (req, res) => {
  try {
    await channelService.deleteChannel(req.params.channelId, req.user!.id);
    sendResponse(res, 'Channel deleted successfully', 'CHANNEL_DELETED');
  } catch (error) {
    if (error instanceof ChannelError) {
      const status = error.code === 'CHANNEL_NOT_FOUND' ? 404 : 400;
      sendError(res, error.message, error.code, [{
        message: error.message,
        code: error.code,
        path: `/channels/${req.params.channelId}`
      }], status);
    } else {
      console.error('Channel deletion error:', error);
      sendError(res, 'Failed to delete channel', 'CHANNEL_DELETE_ERROR', [{
        message: 'Failed to delete channel',
        code: 'CHANNEL_DELETE_ERROR',
        path: `/channels/${req.params.channelId}`
      }], 500);
    }
  }
});

// Search channels
router.get('/', isAuthenticated, validateSession, channelReadLimiter, validateRequest, async (req, res) => {
  try {
    const { channels, total } = await channelService.searchChannels({
      name: req.query.name as string | undefined,
      type: req.query.type as 'public' | 'private' | 'dm' | undefined,
      userId: req.query.userId as string | undefined,
      includeArchived: req.query.includeArchived === 'true',
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset as string) : undefined
    });
    sendResponse(res, 'Channels retrieved successfully', 'CHANNELS_RETRIEVED', { channels, total });
  } catch (error) {
    console.error('Channel search error:', error);
    sendError(res, 'Failed to search channels', 'CHANNEL_SEARCH_ERROR', [{
      message: 'Failed to search channels',
      code: 'CHANNEL_SEARCH_ERROR',
      path: '/channels'
    }], 500);
  }
});

// Add channel member
router.post('/:channelId/members', isAuthenticated, validateSession, channelMemberLimiter, validateRequest, async (req, res) => {
  try {
    const role = req.body.role as 'admin' | 'member' | undefined;
    const member = await channelService.addChannelMember(
      req.params.channelId,
      req.user!.id,
      req.body.userId,
      role
    );
    sendResponse(res, 'Member added successfully', 'CHANNEL_MEMBER_ADDED', { member });
  } catch (error) {
    if (error instanceof ChannelError) {
      const status = error.code === 'CHANNEL_NOT_FOUND' ? 404 : 400;
      sendError(res, error.message, error.code, [{
        message: error.message,
        code: error.code,
        path: `/channels/${req.params.channelId}/members`
      }], status);
    } else {
      console.error('Member add error:', error);
      sendError(res, 'Failed to add member', 'CHANNEL_MEMBER_ADD_ERROR', [{
        message: 'Failed to add member',
        code: 'CHANNEL_MEMBER_ADD_ERROR',
        path: `/channels/${req.params.channelId}/members`
      }], 500);
    }
  }
});

// Remove channel member
router.delete('/:channelId/members/:userId', isAuthenticated, validateSession, channelMemberLimiter, validateRequest, async (req, res) => {
  try {
    await channelService.removeChannelMember(
      req.params.channelId,
      req.user!.id,
      req.params.userId
    );
    sendResponse(res, 'Member removed successfully', 'CHANNEL_MEMBER_REMOVED');
  } catch (error) {
    if (error instanceof ChannelError) {
      const status = error.code === 'CHANNEL_NOT_FOUND' ? 404 : 400;
      sendError(res, error.message, error.code, [{
        message: error.message,
        code: error.code,
        path: `/channels/${req.params.channelId}/members/${req.params.userId}`
      }], status);
    } else {
      console.error('Member remove error:', error);
      sendError(res, 'Failed to remove member', 'CHANNEL_MEMBER_REMOVE_ERROR', [{
        message: 'Failed to remove member',
        code: 'CHANNEL_MEMBER_REMOVE_ERROR',
        path: `/channels/${req.params.channelId}/members/${req.params.userId}`
      }], 500);
    }
  }
});

// Get channel members
router.get('/:channelId/members', isAuthenticated, validateSession, channelReadLimiter, validateRequest, async (req, res) => {
  try {
    const { limit, offset } = req.query;
    const members = await channelService.getChannelMembers(
      req.params.channelId,
      req.user!.id,
      {
        limit: limit ? parseInt(limit as string, 10) : undefined,
        offset: offset ? parseInt(offset as string, 10) : undefined
      }
    );
    sendResponse(res, 'Channel members retrieved successfully', 'CHANNEL_MEMBERS_RETRIEVED', { members });
  } catch (error) {
    if (error instanceof ChannelError) {
      const status = error.code === 'CHANNEL_NOT_FOUND' ? 404 : 400;
      sendError(res, error.message, error.code, [{
        message: error.message,
        code: error.code,
        path: `/channels/${req.params.channelId}/members`
      }], status);
    } else {
      console.error('Channel members fetch error:', error);
      sendError(res, 'Failed to fetch channel members', 'CHANNEL_MEMBERS_FETCH_ERROR', [{
        message: 'Failed to fetch channel members',
        code: 'CHANNEL_MEMBERS_FETCH_ERROR',
        path: `/channels/${req.params.channelId}/members`
      }], 500);
    }
  }
});

// Update channel member
router.put('/:channelId/members/:userId', isAuthenticated, validateSession, validateRequest, async (req, res) => {
  try {
    const member = await channelService.updateChannelMember(
      req.params.channelId,
      req.user!.id,
      req.params.userId,
      { role: req.body.role }
    );
    sendResponse(res, 'Member updated successfully', 'CHANNEL_MEMBER_UPDATED', { member });
  } catch (error) {
    if (error instanceof ChannelError) {
      const status = error.code === 'CHANNEL_NOT_FOUND' ? 404 : 400;
      sendError(res, error.message, error.code, [{
        message: error.message,
        code: error.code,
        path: `/channels/${req.params.channelId}/members/${req.params.userId}`
      }], status);
    } else {
      console.error('Member update error:', error);
      sendError(res, 'Failed to update member', 'CHANNEL_MEMBER_UPDATE_ERROR', [{
        message: 'Failed to update member',
        code: 'CHANNEL_MEMBER_UPDATE_ERROR',
        path: `/channels/${req.params.channelId}/members/${req.params.userId}`
      }], 500);
    }
  }
});

export default router; 