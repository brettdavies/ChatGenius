import { Store } from 'express-session';
import { ErrorCodes } from '../openapi/schemas/common.js';

export class SessionError extends Error {
  constructor(public code: typeof ErrorCodes[keyof typeof ErrorCodes], message: string) {
    super(message);
    this.name = 'SessionError';
  }
}

/**
 * Cleans up expired sessions from the session store
 * @param store The session store to clean up
 * @param maxAge Maximum age of sessions in milliseconds
 * @throws {SessionError} If cleanup fails or store is invalid
 */
export async function cleanupExpiredSessions(store: Store, maxAge: number): Promise<void> {
  // Verify store implements required methods
  if (typeof store.destroy !== 'function' || typeof store.all !== 'function') {
    console.error('[SessionCleanup] Invalid session store:', { 
      hasDestroy: typeof store.destroy === 'function',
      hasAll: typeof store.all === 'function'
    });
    throw new SessionError(
      ErrorCodes.SESSION_STORE_ERROR,
      'Session store must implement destroy and all methods'
    );
  }

  try {
    // Get all sessions
    const sessions = await new Promise<{ [sid: string]: any }>((resolve, reject) => {
      if (!store.all) {
        reject(new Error('Session store does not implement all() method'));
        return;
      }
      store.all((err, sessions) => {
        if (err) reject(err);
        else resolve(sessions || {});
      });
    });

    console.log('[SessionCleanup] Found sessions:', { count: Object.keys(sessions).length });

    // Find expired sessions
    const now = Date.now();
    const expiredSids = Object.entries(sessions)
      .filter(([_, session]) => {
        const lastAccessed = new Date(session.cookie?.expires || 0).getTime();
        return now - lastAccessed > maxAge;
      })
      .map(([sid]) => sid);

    console.log('[SessionCleanup] Found expired sessions:', { count: expiredSids.length });

    // Delete expired sessions
    await Promise.all(
      expiredSids.map(
        sid =>
          new Promise<void>((resolve, reject) => {
            store.destroy(sid, (err) => {
              if (err) {
                console.error('[SessionCleanup] Failed to delete session:', { sid, error: err });
                reject(err);
              } else {
                resolve();
              }
            });
          })
      )
    );

    console.log('[SessionCleanup] Successfully cleaned up expired sessions');
  } catch (error) {
    console.error('[SessionCleanup] Failed to cleanup sessions:', error);
    throw new SessionError(
      ErrorCodes.SESSION_CLEANUP_FAILED,
      'Failed to cleanup expired sessions'
    );
  }
} 