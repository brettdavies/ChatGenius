import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { syncUser } from '../middleware/user-sync';

const router = Router();

/**
 * POST /api/users/sync
 * Sync user data from Auth0 with our database
 */
router.post('/sync', authMiddleware, syncUser, (req, res) => {
  // User data is attached to req.user by syncUser middleware
  res.json(req.user);
});

export const userRoutes = router; 