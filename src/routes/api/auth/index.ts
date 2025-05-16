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
import { emailService } from '../../../services/email/emailService';
import { BadRequestError, UnauthorizedError } from '../../../utils/errorHandler';
import { handleValidationErrors } from '../../../utils/validationHelper';
import { userRepository } from '../../../models/repositories';
import { supabase } from '../../../config/supabase';
import env, { config } from '../../../config/environment';
import logger from '../../../config/logger';

const router = Router();
// emailService is already imported as an instance

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
    handleValidationErrors(validationResult(req));

    const { email, username, name, password } = req.body;

    // Register user
    const result = await authService.register({
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
        id: result.user.id,
        email: result.user.email,
        username: result.user.username,
        name: result.user.name,
      },
    });
  })
);

/**
 * Login user
 * @route POST /api/auth/login
 */
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  asyncHandler(async (req, res): Promise<any> => {
    // Validate request
    handleValidationErrors(validationResult(req));

    const { email, password } = req.body;

    // Login user
    const { user, token } = await authService.login(email, password);

    // Check if email is verified
    if (!user.email_verified) {
      return res.status(200).json({
        success: true,
        message: 'Login successful, but email verification is required.',
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          name: user.name,
          email_verified: false
        },
        token,
        requiresVerification: true
      });
    }
    
    // Otherwise continue with normal login

    // Send response
    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        email_verified: user.email_verified,
        bio: user.bio,
        avatar_url: user.avatar_url,
        reputation: user.reputation
      },
      token
    });
  })
);

/**
 * Verify email
 * @route POST /api/auth/verify-email
 */
router.post(
  '/verify-email',
  [
    body('token').notEmpty().withMessage('Verification token is required')
  ],
  asyncHandler(async (req, res) => {
    // Validate request
    handleValidationErrors(validationResult(req));

    // Verify email
    const user = await authService.verifyEmail(req.body.token);

    if (!user) {
      throw new BadRequestError('Invalid or expired verification token');
    }

    res.status(200).json({
      success: true,
      message: 'Email verified successfully. You can now login.'
    });
  })
);

/**
 * Resend verification email
 * @route POST /api/auth/resend-verification
 */
router.post(
  '/resend-verification',
  [
    body('email').isEmail().withMessage('Valid email is required')
  ],
  asyncHandler(async (req, res) => {
    // Validate request
    handleValidationErrors(validationResult(req));

    // Resend verification email
    await authService.resendVerification(req.body.email);

    res.status(200).json({
      success: true,
      message: 'Verification email resent. Please check your email.'
    });
  })
);

/**
 * Request password reset
 * @route POST /api/auth/forgot-password
 */
router.post(
  '/forgot-password',
  [
    body('email').isEmail().withMessage('Valid email is required')
  ],
  asyncHandler(async (req, res) => {
    // Validate request
    handleValidationErrors(validationResult(req));

    // Send password reset email
    await authService.sendPasswordResetEmail(req.body.email);

    res.status(200).json({
      success: true,
      message: 'Password reset email sent. Please check your email.'
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
    body('token').notEmpty().withMessage('Reset token is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
  ],
  asyncHandler(async (req, res) => {
    // Validate request
    handleValidationErrors(validationResult(req));

    // Reset password
    const success = await authService.resetPassword(
      req.body.token,
      req.body.password
    );

    if (!success) {
      throw new BadRequestError('Failed to reset password');
    }

    res.status(200).json({
      success: true,
      message: 'Password reset successful. You can now login with your new password.'
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
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters')
  ],
  asyncHandler(async (req, res) => {
    // Validate request
    handleValidationErrors(validationResult(req));

    // Change password
    if (!req.user || !req.user.id) {
      throw new UnauthorizedError('You must be logged in to change your password');
    }

    const success = await authService.changePassword(
      req.user.id,
      req.body.currentPassword,
      req.body.newPassword
    );

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  })
);

/**
 * Get user profile (authenticated)
 * @route GET /api/auth/profile
 */
router.get(
  '/profile',
  authenticate,
  asyncHandler(async (req, res) => {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedError('Not authenticated');
    }

    const user = await authService.getProfile(req.user.id);

    if (!user) {
      throw new BadRequestError('User not found');
    }

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        bio: user.bio,
        avatar_url: user.avatar_url,
        reputation: user.reputation,
        email_verified: user.email_verified,
        created_at: user.created_at
      }
    });
  })
);

/**
 * Update user profile (authenticated)
 * @route PUT /api/auth/profile
 */
router.put(
  '/profile',
  authenticate,
  [
    body('name').optional().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
    body('username')
      .optional()
      .isLength({ min: 3, max: 20 })
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username must be 3-20 characters (letters, numbers, underscore)'),
    body('bio').optional().isLength({ max: 500 }).withMessage('Bio must be at most 500 characters'),
    body('avatar_url').optional().isURL().withMessage('Avatar URL must be a valid URL')
  ],
  asyncHandler(async (req, res) => {
    // Validate request
    handleValidationErrors(validationResult(req));

    if (!req.user || !req.user.id) {
      throw new UnauthorizedError('Not authenticated');
    }

    const { name, username, bio, avatar_url } = req.body;

    // Update profile
    const updatedUser = await authService.updateProfile(req.user.id, {
      name,
      username,
      bio,
      avatar_url
    });

    if (!updatedUser) {
      throw new BadRequestError('Failed to update profile');
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        name: updatedUser.name,
        bio: updatedUser.bio,
        avatar_url: updatedUser.avatar_url,
        reputation: updatedUser.reputation
      }
    });
  })
);

/**
 * Supabase token exchange
 * @route POST /api/auth/supabase-exchange
 * Exchange a Supabase JWT for our application JWT
 */
router.post(
  '/supabase-exchange',
  [
    body('supabaseToken').notEmpty().withMessage('Supabase token is required')
  ],
  asyncHandler(async (req, res) => {
    if (!useSupabase) {
      throw new BadRequestError('Supabase authentication is not enabled');
    }

    // Validate request
    handleValidationErrors(validationResult(req));

    // Exchange token
    const { user, token } = await authService.supabaseExchange(req.body.supabaseToken);

    res.status(200).json({
      success: true,
      message: 'Token exchanged successfully',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        bio: user.bio,
        avatar_url: user.avatar_url,
        reputation: user.reputation,
        email_verified: user.email_verified
      },
      token
    });
  })
);

/**
 * Refresh token
 * @route POST /api/auth/refresh
 */
router.post(
  '/refresh',
  authenticate,
  asyncHandler(async (req, res) => {
    if (!req.user) {
      throw new UnauthorizedError('Not authenticated');
    }

    const token = authService.generateToken(req.user);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      token
    });
  })
);

// Social login callback handling for various providers
// These routes handle the OAuth callbacks from providers

/**
 * OAuth 2.0 callback
 * @route GET /api/auth/callback/:provider
 */
router.get(
  '/callback/:provider',
  asyncHandler(async (req, res) => {
    const { provider } = req.params;
    const { code, state } = req.query;

    if (!code) {
      throw new BadRequestError('Authorization code is required');
    }

    // Handle provider-specific logic
    switch (provider) {
      case 'auth0':
        // Handle Auth0 callback
        break;
      case 'google':
        // Handle Google callback  
        break;
      case 'github':
        // Handle GitHub callback
        break;
      default:
        throw new BadRequestError(`Unsupported provider: ${provider}`);
    }

    // In a real implementation, you would generate a token here
    const token = 'placeholder-token'; // This would be a real token
    
    // Redirect to frontend with token
    res.redirect(`${env.FRONTEND_URL}/auth/callback?token=${token}`);
  })
);

export default router;