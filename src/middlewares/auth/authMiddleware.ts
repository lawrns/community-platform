/**
 * Authentication Middleware
 * Middleware functions for authenticating and authorizing requests with Supabase support
 */

import { Request, Response, NextFunction } from 'express';
import { expressjwt } from 'express-jwt';
import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as Auth0Strategy } from 'passport-auth0';
import { userRepository } from '../../models/repositories';
import env, { config } from '../../config/environment';
import { UnauthorizedError, ForbiddenError } from '../../utils/errorHandler';
import authService from '../../services/auth/authService';
import logger from '../../config/logger';
import { supabase } from '../../config/supabase';

// Determine if we should use Supabase
const useSupabase = !!config.SUPABASE_URL && !!config.SUPABASE_ANON_KEY;

// Setup JWT options
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: env.AUTH_SECRET,
};

// Initialize passport strategies
export const configurePassport = () => {
  // JWT Strategy for our own tokens
  passport.use(
    new JwtStrategy(jwtOptions, async (payload, done) => {
      try {
        const user = await userRepository.findById(payload.userId);
        if (!user) {
          return done(null, false);
        }
        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    })
  );

  // Local Strategy (username/password)
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
      },
      async (email, password, done) => {
        try {
          const { user } = await authService.login(email, password);
          return done(null, user);
        } catch (error) {
          return done(error, false);
        }
      }
    )
  );

  // Auth0 Strategy (if AUTH_PROVIDER is auth0)
  if (env.AUTH_PROVIDER === 'auth0') {
    passport.use(
      new Auth0Strategy(
        {
          domain: env.AUTH0_DOMAIN,
          clientID: env.AUTH0_CLIENT_ID,
          clientSecret: env.AUTH0_CLIENT_SECRET,
          callbackURL: `${env.API_URL}/auth/callback`,
        },
        async (accessToken, refreshToken, extraParams, profile, done) => {
          try {
            // Extract email from Auth0 profile
            const email = profile.emails?.[0]?.value;
            
            if (!email) {
              return done(new Error('Email not provided by Auth0'), false);
            }

            const { user, isNewUser } = await authService.processOAuthUser(
              'auth0',
              profile.id,
              email,
              profile.displayName || 'User',
              profile
            );

            return done(null, user);
          } catch (error) {
            return done(error, false);
          }
        }
      )
    );
  }

  // Serialize/deserialize user
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await userRepository.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
};

/**
 * Middleware to authenticate JWT token
 */
export const authenticateJwt = expressjwt({
  secret: env.AUTH_SECRET,
  algorithms: ['HS256'],
  getToken: (req) => {
    // Extract token from Authorization header or query parameter
    if (req.headers.authorization?.split(' ')[0] === 'Bearer') {
      return req.headers.authorization.split(' ')[1];
    } 
    if (req.query && req.query.token) {
      return req.query.token as string;
    }
    return null;
  },
});

/**
 * Verify Supabase JWT
 */
const verifySupabaseToken = async (token: string) => {
  try {
    // Verify token with Supabase
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data.user) {
      logger.error('Error verifying Supabase token:', error);
      return null;
    }
    
    // Look up user in our database
    const user = await userRepository.findByAuthProviderId('supabase', data.user.id);
    
    if (!user) {
      // User exists in Supabase but not in our database - create entry
      const newUser = await userRepository.create({
        email: data.user.email,
        username: data.user.user_metadata?.username || data.user.email.split('@')[0],
        name: data.user.user_metadata?.name || 'User',
        auth_provider: 'supabase',
        auth_provider_id: data.user.id,
        reputation: 0,
        email_verified: data.user.email_confirmed_at !== null,
        created_at: new Date(),
        updated_at: new Date(),
      });
      
      return newUser;
    }
    
    return user;
  } catch (error) {
    logger.error('Error verifying Supabase token:', error);
    return null;
  }
};

/**
 * Custom middleware to authenticate user and attach to request
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check for token in header or query
    const token = 
      (req.headers.authorization?.startsWith('Bearer ') 
        ? req.headers.authorization.split(' ')[1] 
        : null) ||
      (req.query.token as string);

    if (!token) {
      return next(new UnauthorizedError('Authentication token is required'));
    }

    let user;
    
    if (useSupabase) {
      // Try Supabase token first
      user = await verifySupabaseToken(token);
      
      if (!user) {
        // Fall back to our own JWT
        const payload = await authService.validateToken(token);
        if (!payload) {
          return next(new UnauthorizedError('Invalid or expired token'));
        }
        
        // Get user from database
        user = await userRepository.findById(payload.userId);
      }
    } else {
      // Traditional JWT validation
      const payload = await authService.validateToken(token);
      if (!payload) {
        return next(new UnauthorizedError('Invalid or expired token'));
      }
      
      // Get user from database
      user = await userRepository.findById(payload.userId);
    }
    
    if (!user) {
      return next(new UnauthorizedError('User not found'));
    }

    // Attach user to request
    req.user = user;
    return next();
  } catch (error) {
    logger.error('Authentication error:', error);
    return next(new UnauthorizedError('Authentication failed'));
  }
};

/**
 * Middleware to check if user is verified
 */
export const requireVerified = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return next(new UnauthorizedError('Authentication required'));
  }

  if (!(req.user as any).email_verified) {
    return next(new ForbiddenError('Email verification required'));
  }

  return next();
};

/**
 * Middleware to check if user has sufficient reputation
 */
export const requireReputation = (minReputation: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if ((req.user as any).reputation < minReputation) {
      return next(
        new ForbiddenError(
          `Insufficient reputation. Required: ${minReputation}`
        )
      );
    }

    return next();
  };
};

/**
 * Middleware to check if user has a specific privilege
 */
export const requirePrivilege = (privilege: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    try {
      const hasPrivilege = await userRepository.hasPrivilege(
        (req.user as any).id,
        privilege
      );

      if (!hasPrivilege) {
        return next(
          new ForbiddenError(`Missing required privilege: ${privilege}`)
        );
      }

      return next();
    } catch (error) {
      logger.error('Privilege check error:', error);
      return next(new ForbiddenError('Failed to check privileges'));
    }
  };
};

/**
 * Optional authentication middleware
 * Adds user to request if token is valid, but doesn't require authentication
 */
export const optionalAuthenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check for token in header or query
    const token = 
      (req.headers.authorization?.startsWith('Bearer ') 
        ? req.headers.authorization.split(' ')[1] 
        : null) ||
      (req.query.token as string);

    if (token) {
      let user;
      
      if (useSupabase) {
        // Try Supabase token first
        user = await verifySupabaseToken(token);
        
        if (!user) {
          // Fall back to our own JWT
          const payload = await authService.validateToken(token);
          if (payload) {
            user = await userRepository.findById(payload.userId);
          }
        }
      } else {
        // Traditional JWT validation
        const payload = await authService.validateToken(token);
        if (payload) {
          user = await userRepository.findById(payload.userId);
        }
      }
      
      if (user) {
        // Attach user to request
        req.user = user;
      }
    }

    // Continue regardless of authentication result
    return next();
  } catch (error) {
    // Continue without authentication on error
    return next();
  }
};

/**
 * Middleware to check if user is a moderator
 * Moderators are users with reputation >= 5000 or with the 'moderator' privilege
 */
export const isModerator = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return next(new UnauthorizedError('Authentication required'));
  }

  try {
    // Check if user has high enough reputation
    if ((req.user as any).reputation >= 5000) {
      return next();
    }

    // Check if user has the moderator privilege
    const hasPrivilege = await userRepository.hasPrivilege(
      (req.user as any).id,
      'moderator'
    );

    if (!hasPrivilege) {
      return next(
        new ForbiddenError('Moderator privileges required')
      );
    }

    return next();
  } catch (error) {
    logger.error('Moderator check error:', error);
    return next(new ForbiddenError('Failed to check moderator privileges'));
  }
};