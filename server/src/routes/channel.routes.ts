import { Router } from 'express';
import { asyncHandler } from '@/middleware/async-handler';
import { authMiddleware } from '@/middleware/auth';
import { ChannelController } from '@/controllers/channel.controller';

const router = Router();
const channelController = new ChannelController();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Channel routes
router.get('/', asyncHandler(channelController.getChannels.bind(channelController)));
router.post('/', asyncHandler(channelController.createChannel.bind(channelController)));
router.get('/:channel_id([a-zA-Z0-9]{10,26})', asyncHandler(channelController.getChannel.bind(channelController)));
router.delete('/:channel_id', asyncHandler(channelController.archiveChannel.bind(channelController)));

export default router; 