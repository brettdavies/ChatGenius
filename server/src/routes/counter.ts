import { Router, Request, Response } from 'express';
import { requireAuth } from '@auth/middleware';
import { COUNTER_ROUTES } from '@constants/routes.constants';

const router = Router();
let count = 0;

router.get(COUNTER_ROUTES.ROOT, (_req: Request, res: Response) => {
  res.json({ count });
});

router.post(COUNTER_ROUTES.INCREMENT, requireAuth, (_req: Request, res: Response) => {
  count++;
  res.json({ count });
});

export default router; 