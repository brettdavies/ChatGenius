import { Router } from 'express';
import { SSEController } from '@/controllers/sse.controller';

const router = Router();

router.get('/', new SSEController().handleSSE);

export const sseRoutes = router; 