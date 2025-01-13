import express from 'express';
import cors from 'cors';
import { config } from '@/config';
import channelRoutes from '@/routes/channel.routes';
import messageRoutes from '@/routes/message.routes';
import { pool } from '@/db/pool';
import { UnauthorizedError } from 'express-oauth2-jwt-bearer';
import { authMiddleware } from '@/middleware/auth';
import { syncUser } from '@/middleware/user-sync';

const app = express();

// Basic middleware
app.use(cors({
  origin: config.corsOrigin,
  credentials: true
}));
app.use(express.json());

// Auth middleware (applied to all routes)
app.use(authMiddleware);
app.use(syncUser);

// Routes
app.use('/api/channels', channelRoutes);
app.use('/api', messageRoutes);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error details:', {
    name: err.name,
    message: err.message,
    stack: err.stack
  });

  // Handle Auth0 errors
  if (err instanceof UnauthorizedError) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: err.message,
      code: 'unauthorized'
    });
  }

  // Handle known application errors
  if (err.status && err.message) {
    return res.status(err.status).json({
      error: err.name || 'Error',
      message: err.message,
      code: err.code
    });
  }

  // Handle unknown errors
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'An unexpected error occurred',
    code: 'internal_error'
  });
});

// Test database connection
pool.connect()
  .then(client => {
    console.log('Database connected successfully');
    client.release();
  })
  .catch(err => {
    console.error('Database connection error:', err.message);
    process.exit(1);
  });

const server = app.listen(config.port, () => {
  console.log(`Server is running on http://localhost:${config.port}`);
  console.log('Environment:', config.nodeEnv);
  console.log('CORS Origin:', config.corsOrigin);
  console.log('Auth0 Domain:', config.auth0.domain);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.info('SIGTERM signal received.');
  Promise.all([
    new Promise(resolve => server.close(resolve)),
    pool.end()
  ]).then(() => {
    console.log('Server and database connections closed');
    process.exit(0);
  });
}); 
