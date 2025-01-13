import { Router } from 'express';
import { asyncHandler } from '@middleware/async-handler';
import { requireAuth } from '@middleware/auth';
import { syncUser } from '@middleware/sync-user';

const router = Router();

/**
 * POST /api/users/sync
 * Sync user data from Auth0 with our database
 */
router.post('/sync', requireAuth, syncUser, (req, res) => {
  // User data is attached to req.user by syncUser middleware
  res.json(req.user);
});

export const userRoutes = router; 