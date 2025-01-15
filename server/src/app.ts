import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { securityMiddleware } from '@config/security';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';
import { ENV } from '@config/env';
import { API_ROUTES } from '@constants/routes.constants';

// Route imports
import authRoutes from '@routes/auth';
import counterRoutes from '@routes/counter';

const app: Express = express();

// Apply security middleware (helmet, rate limiting, etc.)
app.use(securityMiddleware);

// CORS config
app.use(cors({
  origin: ENV.API_URL || 'http://localhost:5173',
  credentials: true,
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Sessions & Passport
app.use(session({
  secret: ENV.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: ENV.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
}));

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use(API_ROUTES.AUTH, authRoutes);
app.use(API_ROUTES.COUNTER, counterRoutes);

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: ENV.NODE_ENV === 'development' ? err.message : undefined
  });
});

export default app; 