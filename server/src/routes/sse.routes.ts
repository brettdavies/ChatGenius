import { Router } from 'express';
import { sseController } from '../controllers/sse.controller';
import { sseAuth } from '../middleware/auth';

const router = Router();

router.get('/events', sseAuth, sseController.subscribe);

export default router; 