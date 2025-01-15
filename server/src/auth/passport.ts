import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { comparePassword } from '../utils/hashPassword.js';
import { findUserByEmail, findUserById } from '../db/queries/users.js';
import { User } from './types.js';
import { AUTH_MESSAGES } from '../constants/auth.constants.js';

// Configure Passport's Local Strategy
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email: string, password: string, done) => {
  try {
    const user = await findUserByEmail(email);
    
    if (!user) {
      return done(null, false, { message: AUTH_MESSAGES.USER_NOT_FOUND });
    }

    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return done(null, false, { message: AUTH_MESSAGES.INVALID_CREDENTIALS });
    }

    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

// Serialize user for the session
passport.serializeUser((user: Express.User, done) => {
  done(null, (user as User).id);
});

// Deserialize user from the session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await findUserById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport; 