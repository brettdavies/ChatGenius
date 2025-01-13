import { Router } from 'express';

const router = Router();

/**
 * POST /api/users/sync
 * Sync user data from Auth0 with our database
 */
router.post('/sync', (req, res) => {
  // User data is attached to req.user by syncUser middleware at app level
  res.json(req.user);
});

export const userRoutes = router; 