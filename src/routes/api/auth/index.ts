/**
 * Authentication Routes
 * Handles user registration, login, and authentication flows with Supabase support
 */

import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import passport from 'passport';
import asyncHandler from '../../../utils/asyncHandler';
import authService from '../../../services/auth/authService';
import { authenticate, requireVerified } from '../../../middlewares/auth/authMiddleware';
import EmailService from '../../../services/email/emailService';
import { BadRequestError, UnauthorizedError } from '../../../utils/errorHandler';
import { userRepository } from '../../../models/repositories';
import { supabase } from '../../../config/supabase';
import env, { config } from '../../../config/environment';
import logger from '../../../config/logger';

const router = Router();
const emailService = new EmailService();

// Determine if we should use Supabase
const useSupabase = !!config.SUPABASE_URL && !!config.SUPABASE_ANON_KEY;

/**
 * Register a new user
 * @route POST /api/auth/register
 */
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('username')
      .isLength({ min: 3, max: 20 })
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username must be 3-20 characters (letters, numbers, underscore)'),
    body('name').isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
  ],
  asyncHandler(async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError('Validation error', 
        Object.fromEntries(errors.array().map(err => [err.path, err.msg]))
      );
    }

    const { email, username, name, password } = req.body;

    // Register user
    const { user, verificationToken } = await authService.register({
      email,
      username,
      name,
      password,
    });

    // Send response
    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email for verification.',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
      },
    });
  })
);

/**
 * Login a user
 * @route POST /api/auth/login
 */
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  asyncHandler(async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError('Validation error',
        Object.fromEntries(errors.array().map(err => [err.path, err.msg]))
      );
    }

    const { email, password } = req.body;

    // Login user
    const { user, token } = await authService.login(email, password);

    // Send response
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        avatar_url: user.avatar_url,
        bio: user.bio,
        reputation: user.reputation,
      },
      token,
    });
  })
);

/**
 * Verify user email
 * @route GET /api/auth/verify-email
 */
router.get(
  '/verify-email',
  asyncHandler(async (req, res) => {
    if (useSupabase) {
      // For Supabase, email verification is handled automatically
      // This route will only be called if using the traditional email verification
      const token = req.query.token as string;
      
      if (!token) {
        throw new BadRequestError('Verification token is required');
      }

      // Verify email
      await authService.verifyEmail(token);
      
      // Redirect to frontend
      res.redirect(`${process.env.FRONTEND_URL}/login?verified=true`);
    } else {
      const { token } = req.query;

      if (!token || typeof token !== 'string') {
        throw new BadRequestError('Verification token is required');
      }

      // Verify email
      await authService.verifyEmail(token);

      // Redirect to frontend
      res.redirect(`${process.env.FRONTEND_URL}/login?verified=true`);
    }
  })
);

/**
 * Resend verification email
 * @route POST /api/auth/resend-verification
 */
router.post(
  '/resend-verification',
  [body('email').isEmail().withMessage('Valid email is required')],
  asyncHandler(async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError('Validation error',
        Object.fromEntries(errors.array().map(err => [err.path, err.msg]))
      );
    }

    const { email } = req.body;

    // Resend verification email
    await authService.resendVerificationEmail(email);

    // Send response
    res.json({
      success: true,
      message: 'Verification email sent. Please check your inbox.',
    });
  })
);

/**
 * Request password reset
 * @route POST /api/auth/forgot-password
 */
router.post(
  '/forgot-password',
  [body('email').isEmail().withMessage('Valid email is required')],
  asyncHandler(async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError('Validation error',
        Object.fromEntries(errors.array().map(err => [err.path, err.msg]))
      );
    }

    const { email } = req.body;

    // Request password reset
    await authService.requestPasswordReset(email);

    // Send response
    res.json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent.',
    });
  })
);

/**
 * Reset password
 * @route POST /api/auth/reset-password
 */
router.post(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('Token is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters'),
  ],
  asyncHandler(async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError('Validation error',
        Object.fromEntries(errors.array().map(err => [err.path, err.msg]))
      );
    }

    const { token, password } = req.body;

    // Reset password
    await authService.resetPassword(token, password);

    // Send response
    res.json({
      success: true,
      message: 'Password reset successful. You can now login with your new password.',
    });
  })
);

/**
 * Change password (authenticated)
 * @route POST /api/auth/change-password
 */
router.post(
  '/change-password',
  authenticate,
  requireVerified,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters'),
  ],
  asyncHandler(async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError('Validation error',
        Object.fromEntries(errors.array().map(err => [err.path, err.msg]))
      );
    }

    const { currentPassword, newPassword } = req.body;
    const userId = (req.user as any).id;

    // Change password
    await authService.changePassword(userId, currentPassword, newPassword);

    // Send response
    res.json({
      success: true,
      message: 'Password changed successfully.',
    });
  })
);

/**
 * Get current user info
 * @route GET /api/auth/me
 */
router.get(
  '/me',
  authenticate,
  asyncHandler(async (req, res) => {
    const userId = (req.user as any).id;
    
    // Get user from database (to get latest data)
    const user = await userRepository.findById(userId);
    
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    // Get user stats
    const stats = await userRepository.getStats(userId);
    
    // Get user badges
    const badges = await userRepository.getBadges(userId);

    // Send response
    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        avatar_url: user.avatar_url,
        bio: user.bio,
        reputation: user.reputation,
        email_verified: user.email_verified,
        created_at: user.created_at,
        auth_provider: user.auth_provider,
        stats,
        badges,
      },
    });
  })
);

/**
 * Update user profile
 * @route PUT /api/auth/profile
 */
router.put(
  '/profile',
  authenticate,
  requireVerified,
  [
    body('name').optional().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
    body('bio').optional().isLength({ max: 500 }).withMessage('Bio must be max 500 characters'),
    body('avatar_url').optional().isURL().withMessage('Avatar URL must be a valid URL'),
  ],
  asyncHandler(async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError('Validation error',
        Object.fromEntries(errors.array().map(err => [err.path, err.msg]))
      );
    }

    const userId = (req.user as any).id;
    const { name, bio, avatar_url } = req.body;

    // Update user profile
    const updates: any = {};
    if (name) updates.name = name;
    if (bio !== undefined) updates.bio = bio;
    if (avatar_url) updates.avatar_url = avatar_url;

    const updatedUser = await userRepository.update(userId, updates);

    // Also update Supabase Auth user metadata if using Supabase
    if (useSupabase && (req.user as any).auth_provider === 'supabase') {
      try {
        await supabase.auth.admin.updateUserById(
          (req.user as any).auth_provider_id,
          {
            user_metadata: {
              name: name || (req.user as any).name,
              bio: bio || (req.user as any).bio,
              avatar_url: avatar_url || (req.user as any).avatar_url
            }
          }
        );
      } catch (error) {
        // Log error but don't fail the request if metadata update fails
        logger.error('Error updating Supabase user metadata:', error);
      }
    }

    // Send response
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        name: updatedUser.name,
        avatar_url: updatedUser.avatar_url,
        bio: updatedUser.bio,
        reputation: updatedUser.reputation,
      },
    });
  })
);

/**
 * Sign out a user
 * @route POST /api/auth/signout
 */
router.post(
  '/signout',
  authenticate,
  asyncHandler(async (req, res) => {
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1];
    
    if (token) {
      await authService.signOut(token);
    }
    
    res.json({
      success: true,
      message: 'Signed out successfully',
    });
  })
);

// Additional Supabase specific routes
if (useSupabase) {
  /**
   * Process Supabase OAuth callback
   * @route GET /api/auth/callback
   */
  router.get(
    '/callback',
    asyncHandler(async (req, res) => {
      const { code, state } = req.query;
      
      if (!code) {
        throw new BadRequestError('Authorization code is required');
      }
      
      // Exchange code for session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code as string);
      
      if (error || !data.session) {
        logger.error('Error exchanging code for session:', error);
        throw new BadRequestError('Failed to authenticate');
      }
      
      // Get user from database
      let user = await userRepository.findByAuthProviderId('supabase', data.user.id);
      
      // Create user if not exists
      if (!user) {
        user = await userRepository.create({
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
      }
      
      // Generate token
      const token = authService.generateToken(user);
      
      // Redirect to frontend with token
      res.redirect(`${env.FRONTEND_URL}/auth/callback?token=${token}`);
    })
  );
}

// Auth0 authentication routes (if using Auth0)
if (env.AUTH_PROVIDER === 'auth0') {
  /**
   * Initiate Auth0 login
   * @route GET /api/auth/auth0
   */
  router.get('/auth0', passport.authenticate('auth0', {
    scope: 'openid email profile'
  }));

  /**
   * Auth0 callback
   * @route GET /api/auth/auth0/callback
   */
  router.get('/auth0/callback', passport.authenticate('auth0', { session: false }), 
  asyncHandler(async (req, res) => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication failed');
    }

    // Generate token
    const token = authService.generateToken(req.user as any);

    // Redirect to frontend with token
    res.redirect(`${env.FRONTEND_URL}/auth/callback?token=${token}`);
  }));
}

export default router;