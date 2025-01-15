import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getUserById } from '@auth/user-service';
import { AUTH_ERRORS, AUTH_MESSAGES, TOKEN_CONFIG } from '@constants/auth.constants';

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith(`${TOKEN_CONFIG.TOKEN_TYPE} `)) {
    return res.status(401).json({
      message: AUTH_MESSAGES.NO_TOKEN,
      code: AUTH_ERRORS.INVALID_TOKEN
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    const user = await getUserById(decoded.id);

    if (!user) {
      return res.status(401).json({
        message: AUTH_MESSAGES.USER_NOT_FOUND,
        code: AUTH_ERRORS.USER_NOT_FOUND
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        message: AUTH_MESSAGES.TOKEN_EXPIRED,
        code: AUTH_ERRORS.TOKEN_EXPIRED
      });
    }
    return res.status(401).json({
      message: AUTH_MESSAGES.INVALID_TOKEN,
      code: AUTH_ERRORS.INVALID_TOKEN
    });
  }
};

export const optionalAuth = async (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith(`${TOKEN_CONFIG.TOKEN_TYPE} `)) {
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    const user = await getUserById(decoded.id);

    if (user) {
      req.user = user;
    }
  } catch (error) {
    // Ignore token validation errors for optional auth
  }

  next();
}; 