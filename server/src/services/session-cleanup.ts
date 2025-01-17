import { Store, SessionData } from 'express-session';
import { ENV } from '../config/env.js';

interface CleanupStats {
  deletedCount: number;
  duration: number;
}

interface SessionWithCookie extends SessionData {
  cookie: {
    expires: Date;
    originalMaxAge: number | null;
    secure?: boolean;
    httpOnly?: boolean;
    domain?: string;
    path?: string;
    sameSite?: boolean | 'lax' | 'strict' | 'none';
  };
}

export class SessionCleanupService {
  private isRunning: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;

  constructor(private store: Store) {
    if (!store || typeof store.destroy !== 'function' || typeof store.all !== 'function') {
      throw new Error('Session store must implement destroy and all methods');
    }
  }

  /**
   * Start the cleanup job
   * @param intervalMs How often to run the cleanup (default: 1 hour)
   */
  start(intervalMs: number = 60 * 60 * 1000): void {
    if (this.isRunning) {
      console.warn('Session cleanup job is already running');
      return;
    }

    this.isRunning = true;
    this.intervalId = setInterval(() => this.cleanup(), intervalMs);
    console.log('Session cleanup job started');
  }

  /**
   * Stop the cleanup job
   */
  stop(): void {
    if (!this.isRunning) {
      console.warn('Session cleanup job is not running');
      return;
    }

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    this.isRunning = false;
    console.log('Session cleanup job stopped');
  }

  /**
   * Run a single cleanup iteration
   */
  private async cleanup(): Promise<CleanupStats> {
    const startTime = Date.now();
    let deletedCount = 0;

    try {
      // Get all sessions
      const sessions = await new Promise<{ [sid: string]: SessionWithCookie }>((resolve, reject) => {
        if (!this.store.all) {
          reject(new Error('Session store must implement all method'));
          return;
        }
        
        this.store.all((err, obj) => {
          if (err) reject(err);
          else resolve(obj as { [sid: string]: SessionWithCookie } || {});
        });
      });

      // Filter and delete expired sessions
      const now = Date.now();

      for (const [sid, session] of Object.entries(sessions)) {
        if (!session?.cookie?.expires) continue;
        
        const expiryTime = new Date(session.cookie.expires).getTime();
        if (expiryTime <= now) {
          await new Promise<void>((resolve, reject) => {
            this.store.destroy(sid, (err) => {
              if (err) reject(err);
              else resolve();
            });
          });
          deletedCount++;
        }
      }

      const duration = Date.now() - startTime;
      console.log(`Session cleanup completed: ${deletedCount} sessions deleted in ${duration}ms`);
      
      return { deletedCount, duration };
    } catch (error) {
      console.error('Error during session cleanup:', error);
      throw error;
    }
  }
} 