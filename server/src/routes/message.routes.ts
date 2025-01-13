import { Router } from 'express';
import { asyncHandler } from '@/middleware/async-handler';
import { MessageController } from '@/controllers/message.controller';

const router = Router();
const messageController = new MessageController();

// Message routes
router.get('/channels/:channelId/messages', asyncHandler(messageController.getChannelMessages.bind(messageController)));
router.post('/channels/:channelId/messages', asyncHandler(messageController.createMessage.bind(messageController)));

export default router; 