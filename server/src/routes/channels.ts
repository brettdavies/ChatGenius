import express from 'express';
import { ChannelService, ChannelError } from '../services/channel-service.js';
import { isAuthenticated } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate-request.js';
import { 
  validateChannelName, 
  validateChannelDescription, 
  validateChannelMemberCount,
  sanitizeChannelInput 
} from '../utils/channel-validation.js';
import {
  channelCreateLimiter,
  channelUpdateLimiter,
  channelMemberLimiter,
  channelDeleteLimiter,
  channelArchiveLimiter,
  channelReadLimiter
} from '../middleware/channel-rate-limit.js';

const router = express.Router();
const channelService = new ChannelService();

// Get user's channels
router.get('/my', isAuthenticated, async (req, res) => {
  try {
    const { channels, total } = await channelService.getUserChannels(req.user!.id);
    res.json({
      channels,
      total,
      message: 'Channels retrieved successfully',
      errors: []
    });
  } catch (error) {
    console.error('Failed to fetch user channels:', error);
    res.status(500).json({
      message: 'Failed to fetch channels',
      errors: [{
        message: 'Failed to fetch channels',
        code: 'FETCH_ERROR',
        path: '/channels/my'
      }]
    });
  }
});

// Create channel
router.post('/', 
  isAuthenticated, 
  channelCreateLimiter,
  validateRequest, 
  async (req, res) => {
    try {
      // Validate and sanitize inputs
      const name = sanitizeChannelInput(req.body.name);
      const description = req.body.description ? sanitizeChannelInput(req.body.description) : undefined;

      const nameValidation = validateChannelName(name);
      if (!nameValidation.isValid) {
        return res.status(400).json({ 
          message: nameValidation.error,
          code: 'INVALID_CHANNEL_NAME'
        });
      }

      const descValidation = validateChannelDescription(description);
      if (!descValidation.isValid) {
        return res.status(400).json({ 
          message: descValidation.error,
          code: 'INVALID_CHANNEL_DESCRIPTION'
        });
      }

      const channel = await channelService.createChannel({
        name,
        description,
        type: req.body.type,
        createdBy: req.user!.id
      });
      
      res.status(201).json({ channel });
    } catch (error) {
      console.error('Channel creation error:', {
        error,
        body: req.body,
        stack: error instanceof Error ? error.stack : undefined
      });

      if (error instanceof ChannelError) {
        res.status(400).json({ 
          message: error.message, 
          code: error.code 
        });
      } else {
        res.status(500).json({ 
          message: 'Internal server error',
          code: 'INTERNAL_SERVER_ERROR'
        });
      }
    }
});

// Get channel by ID
router.get('/:channelId', 
  isAuthenticated, 
  channelReadLimiter,
  async (req, res) => {
    try {
      const channel = await channelService.getChannelById(req.params.channelId);
      res.json({ channel });
    } catch (error) {
      if (error instanceof ChannelError) {
        if (error.code === 'CHANNEL_NOT_FOUND') {
          res.status(404).json({ message: error.message, code: error.code });
        } else {
          res.status(400).json({ message: error.message, code: error.code });
        }
      } else {
        console.error('Channel fetch error:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }
);

// Update channel
router.put('/:channelId', 
  isAuthenticated, 
  channelUpdateLimiter,
  validateRequest, 
  async (req, res) => {
    try {
      // Validate and sanitize inputs
      if (req.body.name) {
        const nameValidation = validateChannelName(sanitizeChannelInput(req.body.name));
        if (!nameValidation.isValid) {
          return res.status(400).json({ 
            message: nameValidation.error,
            code: 'INVALID_CHANNEL_NAME'
          });
        }
      }

      if (req.body.description) {
        const descValidation = validateChannelDescription(sanitizeChannelInput(req.body.description));
        if (!descValidation.isValid) {
          return res.status(400).json({ 
            message: descValidation.error,
            code: 'INVALID_CHANNEL_DESCRIPTION'
          });
        }
      }

      const channel = await channelService.updateChannel(
        req.params.channelId,
        {
          name: req.body.name ? sanitizeChannelInput(req.body.name) : undefined,
          description: req.body.description ? sanitizeChannelInput(req.body.description) : undefined
        },
        req.user!.id
      );
      res.json({ channel });
    } catch (error) {
      if (error instanceof ChannelError) {
        if (error.code === 'CHANNEL_NOT_FOUND') {
          res.status(404).json({ message: error.message, code: error.code });
        } else {
          res.status(400).json({ message: error.message, code: error.code });
        }
      } else {
        console.error('Channel update error:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    }
});

// Archive channel
router.post('/:channelId/archive', 
  isAuthenticated, 
  channelArchiveLimiter,
  async (req, res) => {
    try {
      const channel = await channelService.archiveChannel(
        req.params.channelId,
        req.user!.id
      );
      res.json({ channel });
    } catch (error) {
      if (error instanceof ChannelError) {
        if (error.code === 'CHANNEL_NOT_FOUND') {
          res.status(404).json({ message: error.message, code: error.code });
        } else {
          res.status(400).json({ message: error.message, code: error.code });
        }
      } else {
        console.error('Channel archive error:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }
);

// Delete channel
router.delete('/:channelId', 
  isAuthenticated, 
  channelDeleteLimiter,
  async (req, res) => {
    try {
      await channelService.deleteChannel(req.params.channelId, req.user!.id);
      res.status(204).send();
    } catch (error) {
      if (error instanceof ChannelError) {
        if (error.code === 'CHANNEL_NOT_FOUND') {
          res.status(404).json({ message: error.message, code: error.code });
        } else {
          res.status(400).json({ message: error.message, code: error.code });
        }
      } else {
        console.error('Channel deletion error:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }
);

// Search channels
router.get('/', 
  isAuthenticated, 
  channelReadLimiter,
  async (req, res) => {
    try {
      const { channels, total } = await channelService.searchChannels({
        name: req.query.name as string | undefined,
        type: req.query.type as 'public' | 'private' | 'dm' | undefined,
        userId: req.query.userId as string | undefined,
        includeArchived: req.query.includeArchived === 'true',
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset as string) : undefined
      });
      res.json({ channels, total });
    } catch (error) {
      console.error('Channel search error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// Add channel member
router.post('/:channelId/members', 
  isAuthenticated, 
  channelMemberLimiter,
  validateRequest, 
  async (req, res) => {
    try {
      // Validate member count
      const channel = await channelService.getChannelById(req.params.channelId);
      const memberCount = await channelService.getChannelMembers(req.params.channelId, req.user!.id);
      
      const countValidation = validateChannelMemberCount(memberCount.total, channel.type.toUpperCase() as 'PUBLIC' | 'PRIVATE' | 'DM');
      if (!countValidation.isValid) {
        return res.status(400).json({ 
          message: countValidation.error,
          code: 'MEMBER_LIMIT_EXCEEDED'
        });
      }

      const member = await channelService.addChannelMember(
        req.params.channelId,
        req.user!.id,
        req.body.userId,
        req.body.role
      );
      res.status(201).json({ member });
    } catch (error) {
      if (error instanceof ChannelError) {
        if (error.code === 'CHANNEL_NOT_FOUND') {
          res.status(404).json({ message: error.message, code: error.code });
        } else {
          res.status(400).json({ message: error.message, code: error.code });
        }
      } else {
        console.error('Member addition error:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    }
});

// Remove channel member
router.delete('/:channelId/members/:userId', 
  isAuthenticated, 
  channelMemberLimiter,
  async (req, res) => {
    try {
      await channelService.removeChannelMember(
        req.params.channelId,
        req.user!.id,
        req.params.userId
      );
      res.status(204).send();
    } catch (error) {
      if (error instanceof ChannelError) {
        if (error.code === 'CHANNEL_NOT_FOUND') {
          res.status(404).json({ message: error.message, code: error.code });
        } else {
          res.status(400).json({ message: error.message, code: error.code });
        }
      } else {
        console.error('Member removal error:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }
);

// Get channel members
router.get('/:channelId/members', 
  isAuthenticated, 
  channelReadLimiter,
  async (req, res) => {
    try {
      const { members, total } = await channelService.getChannelMembers(
        req.params.channelId,
        req.user!.id,
        {
          limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
          offset: req.query.offset ? parseInt(req.query.offset as string) : undefined
        }
      );
      res.json({ members, total });
    } catch (error) {
      if (error instanceof ChannelError) {
        if (error.code === 'CHANNEL_NOT_FOUND') {
          res.status(404).json({ message: error.message, code: error.code });
        } else {
          res.status(400).json({ message: error.message, code: error.code });
        }
      } else {
        console.error('Member list error:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }
);

// Update channel member
router.put('/:channelId/members/:userId', isAuthenticated, validateRequest, async (req, res) => {
  try {
    const member = await channelService.updateChannelMember(
      req.params.channelId,
      req.user!.id,
      req.params.userId,
      { role: req.body.role }
    );
    res.json({ member });
  } catch (error) {
    if (error instanceof ChannelError) {
      if (error.code === 'CHANNEL_NOT_FOUND') {
        res.status(404).json({ message: error.message, code: error.code });
      } else {
        res.status(400).json({ message: error.message, code: error.code });
      }
    } else {
      console.error('Member update error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
});

export default router; 