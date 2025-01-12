import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { createMockUser } from '../utils/__tests__/test-mocks';

export const mockAuth0Middleware = (req: Request, res: Response, next: NextFunction) => {
  const mockUser = createMockUser();
  (req as AuthenticatedRequest).auth = {
    payload: {
      sub: mockUser.id,
      email: mockUser.email,
      name: mockUser.name
    }
  };
  (req as AuthenticatedRequest).user = mockUser;
  next();
}; 