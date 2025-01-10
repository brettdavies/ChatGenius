import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { listenForNotifications } from './config/database';
import { setupTunnel } from './config/tunnel';
// import { checkJwt, handleAuthError } from './middleware/auth';
// import sseRoutes from './routes/sse.routes';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Routes
// app.use('/api/sse', sseRoutes);

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working' });
});

// Error handling
// app.use(handleAuthError);
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// Start server
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Set up SSH tunnel first
    await setupTunnel();
    console.log('SSH tunnel established');

    // Start the server
    app.listen(PORT, async () => {
      console.log(`Server is running on port ${PORT}`);
      
      // Set up PostgreSQL notification listeners
      await listenForNotifications();
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app; 