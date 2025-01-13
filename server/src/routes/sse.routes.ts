import { Router } from 'express';
import { authMiddleware } from '@/middleware/auth';
import { SSEController } from '@/controllers/sse.controller';

const router = Router();

router.get('/', authMiddleware, new SSEController().handleSSE);

export const sseRoutes = router; 