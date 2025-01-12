import { Router } from 'express';
import { authMiddleware, attachUser } from '../middleware/auth';
import { sseController } from '../controllers/sse.controller';

const router = Router();

router.get('/', authMiddleware, attachUser, sseController.handleSSE);

export const sseRoutes = router; 