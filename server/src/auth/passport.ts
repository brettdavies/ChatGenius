import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { getUserById, validateCredentials } from './user-service.js';
import { User } from './types.js';

// Configure local strategy
passport.use(
  new LocalStrategy(async (username: string, password: string, done) => {
    try {
      const user = await validateCredentials(username, password);
      return done(null, user);
    } catch (error) {
      if (error instanceof Error) {
        return done(null, false, { message: error.message });
      }
      return done(error);
    }
  })
);

// Serialize user for the session
passport.serializeUser((user: Express.User, done) => {
  done(null, (user as User).id);
});

// Deserialize user from the session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await getUserById(id);
    if (!user) {
      return done(null, false);
    }
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport; 