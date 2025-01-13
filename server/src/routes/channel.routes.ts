import { Router } from 'express';
import { asyncHandler } from '@/middleware/async-handler';
import { ChannelController } from '@/controllers/channel.controller';

const router = Router();
const channelController = new ChannelController();

// Channel routes
router.get('/me', asyncHandler(channelController.getUserChannels.bind(channelController)));
router.get('/', asyncHandler(channelController.getPublicChannels.bind(channelController)));
router.post('/', asyncHandler(channelController.createChannel.bind(channelController)));

// Use short ID (10 chars) for user-facing URLs
router.get('/:short_id([a-zA-Z0-9]{10})', asyncHandler(channelController.getChannelByShortId.bind(channelController)));

// Use full ID (26 chars) for API operations
router.delete('/:channel_id([a-zA-Z0-9]{26})', asyncHandler(channelController.archiveChannel.bind(channelController)));

export default router; 