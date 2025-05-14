/**
 * Authentication Service
 * Handles user authentication, registration, and token management with Supabase Auth support
 */

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { userRepository } from '../../models/repositories';
import env, { config } from '../../config/environment';
import logger from '../../config/logger';
import cache from '../../config/cache';
import { User } from '../../models';
import EmailService from '../email/emailService';
import { supabase } from '../../config/supabase';

/**
 * Salt rounds for password hashing
 */
const SALT_ROUNDS = 12;

/**
 * Token expiration time in seconds
 */
const TOKEN_EXPIRATION = '7d'; // 7 days

/**
 * Verification token expiration time in seconds
 */
const VERIFICATION_TOKEN_EXPIRATION = 24 * 60 * 60; // 24 hours

// Determine if we should use Supabase
const useSupabase = !!config.SUPABASE_URL && !!config.SUPABASE_ANON_KEY;

/**
 * AuthService class for managing user authentication
 */
class AuthService {
  /**
   * Register a new user
   */
  async register(userData: {
    email: string;
    username: string;
    name: string;
    password: string;
  }): Promise<{ user: User; verificationToken: string }> {
    // Check if user already exists
    const existingUser = await userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Check if username is taken
    const existingUsername = await userRepository.findByUsername(userData.username);
    if (existingUsername) {
      throw new Error('Username already taken');
    }

    let user: User;
    let verificationToken: string;

    if (useSupabase) {
      // Register user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            username: userData.username,
            name: userData.name,
          }
        }
      });

      if (authError) {
        logger.error('Error registering user with Supabase Auth:', authError);
        throw new Error(`Registration failed: ${authError.message}`);
      }

      if (!authData.user) {
        throw new Error('Failed to create user account');
      }

      // Create user profile in users table
      user = await userRepository.create({
        email: userData.email,
        username: userData.username,
        name: userData.name,
        auth_provider: 'supabase',
        auth_provider_id: authData.user.id,
        reputation: 0,
        email_verified: false,
        created_at: new Date(),
        updated_at: new Date(),
      });

      // Use Supabase's built-in email verification
      verificationToken = 'supabase-verification';
    } else {
      // Traditional registration with local auth
      const passwordHash = await bcrypt.hash(userData.password, SALT_ROUNDS);

      // Create user
      user = await userRepository.create({
        email: userData.email,
        username: userData.username,
        name: userData.name,
        password_hash: passwordHash,
        reputation: 0,
        email_verified: false,
        created_at: new Date(),
        updated_at: new Date(),
      });

      // Generate verification token
      verificationToken = crypto.randomBytes(32).toString('hex');
      
      // Store verification token in cache
      await cache.set(
        `verification:${verificationToken}`,
        { userId: user.id },
        VERIFICATION_TOKEN_EXPIRATION
      );

      // Send verification email
      const emailService = new EmailService();
      await emailService.sendVerificationEmail(
        user.email,
        user.name,
        verificationToken
      );
    }

    return { user, verificationToken };
  }

  /**
   * Login a user
   */
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    if (useSupabase) {
      // Login with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        logger.error('Supabase Auth login error:', authError);
        throw new Error('Invalid email or password');
      }

      if (!authData.user) {
        throw new Error('Authentication failed');
      }

      // Find user in our users table
      let user = await userRepository.findByEmail(email);
      
      if (!user) {
        // User exists in Supabase Auth but not in our users table - create profile
        user = await userRepository.create({
          email: authData.user.email,
          username: authData.user.user_metadata.username || email.split('@')[0],
          name: authData.user.user_metadata.name || 'User',
          auth_provider: 'supabase',
          auth_provider_id: authData.user.id,
          reputation: 0,
          email_verified: authData.user.email_confirmed_at !== null,
          created_at: new Date(),
          updated_at: new Date(),
        });
      }

      // Check if email is verified
      if (!user.email_verified && authData.user.email_confirmed_at) {
        // Update email_verified in our users table
        await userRepository.update(user.id, { email_verified: true });
        user.email_verified = true;
      }

      // Generate a JWT token (we'll use our own JWT for consistency)
      const token = this.generateToken(user);

      return { user, token };
    } else {
      // Traditional login
      // Find user by email
      const user = await userRepository.findByEmail(email);
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Check if user has password (might be OAuth user)
      if (!user.password_hash) {
        throw new Error('Please log in with your OAuth provider');
      }

      // Check if email is verified
      if (!user.email_verified) {
        throw new Error('Please verify your email before logging in');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Generate JWT token
      const token = this.generateToken(user);

      return { user, token };
    }
  }

  /**
   * Verify a user's email
   */
  async verifyEmail(token: string): Promise<boolean> {
    if (useSupabase && token === 'supabase-verification') {
      // Supabase handles email verification automatically
      return true;
    } else {
      // Traditional email verification
      // Get verification data from cache
      const verificationData = await cache.get<{ userId: number }>(`verification:${token}`);
      
      if (!verificationData) {
        throw new Error('Invalid or expired verification token');
      }

      // Find user
      const user = await userRepository.findById(verificationData.userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Update user verification status
      await userRepository.update(user.id, { email_verified: true });

      // Remove token from cache
      await cache.del(`verification:${token}`);

      return true;
    }
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(email: string): Promise<boolean> {
    // Find user by email
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    // Check if already verified
    if (user.email_verified) {
      throw new Error('Email is already verified');
    }

    if (useSupabase) {
      // Resend verification email with Supabase Auth
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      });

      if (error) {
        logger.error('Error resending verification email:', error);
        throw new Error(`Failed to resend verification email: ${error.message}`);
      }
    } else {
      // Traditional email verification
      // Generate verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      
      // Store verification token in cache
      await cache.set(
        `verification:${verificationToken}`,
        { userId: user.id },
        VERIFICATION_TOKEN_EXPIRATION
      );

      // Send verification email
      const emailService = new EmailService();
      await emailService.sendVerificationEmail(
        user.email,
        user.name,
        verificationToken
      );
    }

    return true;
  }

  /**
   * Initiate password reset
   */
  async requestPasswordReset(email: string): Promise<boolean> {
    // Find user by email
    const user = await userRepository.findByEmail(email);
    if (!user) {
      // Return true even if user doesn't exist to prevent email enumeration
      return true;
    }

    if (useSupabase) {
      // Use Supabase Auth for password reset
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${env.FRONTEND_URL}/reset-password`,
      });

      if (error) {
        logger.error('Error requesting password reset:', error);
        // Still return true to prevent email enumeration
      }
    } else {
      // Traditional password reset
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      
      // Store reset token in cache
      await cache.set(
        `reset:${resetToken}`,
        { userId: user.id },
        VERIFICATION_TOKEN_EXPIRATION
      );

      // Send password reset email
      const emailService = new EmailService();
      await emailService.sendPasswordResetEmail(
        user.email,
        user.name,
        resetToken
      );
    }

    return true;
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    if (useSupabase) {
      // For Supabase Auth, the token is handled via the URL in the frontend
      // Here we just update the password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        logger.error('Error updating password:', error);
        throw new Error(`Failed to reset password: ${error.message}`);
      }

      return true;
    } else {
      // Traditional password reset
      // Get reset data from cache
      const resetData = await cache.get<{ userId: number }>(`reset:${token}`);
      
      if (!resetData) {
        throw new Error('Invalid or expired reset token');
      }

      // Find user
      const user = await userRepository.findById(resetData.userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Hash new password
      const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

      // Update user password
      await userRepository.update(user.id, { password_hash: passwordHash });

      // Remove token from cache
      await cache.del(`reset:${token}`);

      return true;
    }
  }

  /**
   * Process OAuth login/registration
   */
  async processOAuthUser(
    provider: string,
    providerUserId: string,
    email: string,
    name: string,
    profileData: any
  ): Promise<{ user: User; token: string; isNewUser: boolean }> {
    let user = await userRepository.findByAuthProviderId(provider, providerUserId);
    let isNewUser = false;

    if (!user) {
      // Check if user exists with the same email
      user = await userRepository.findByEmail(email);

      if (user) {
        // Link accounts if email already exists
        await userRepository.update(user.id, {
          auth_provider: provider,
          auth_provider_id: providerUserId,
        });
      } else {
        // Create new user
        isNewUser = true;
        
        // Generate unique username from email
        const baseUsername = email.split('@')[0];
        let username = baseUsername;
        let counter = 1;
        
        // Check username availability and add counter if needed
        while (await userRepository.findByUsername(username)) {
          username = `${baseUsername}${counter}`;
          counter++;
        }

        if (useSupabase && provider === 'auth0') {
          // Create user in Supabase Auth
          const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email,
            email_confirm: true,
            user_metadata: {
              provider,
              provider_id: providerUserId,
              name,
            },
          });

          if (authError) {
            logger.error('Error creating Supabase Auth user from OAuth:', authError);
            throw new Error(`OAuth login failed: ${authError.message}`);
          }

          // Create user in our database
          user = await userRepository.create({
            email,
            username,
            name,
            auth_provider: provider,
            auth_provider_id: providerUserId,
            reputation: 0,
            email_verified: true, // OAuth emails are pre-verified
            created_at: new Date(),
            updated_at: new Date(),
          });
        } else {
          // Create user directly in our database
          user = await userRepository.create({
            email,
            username,
            name,
            auth_provider: provider,
            auth_provider_id: providerUserId,
            reputation: 0,
            email_verified: true, // OAuth emails are pre-verified
            created_at: new Date(),
            updated_at: new Date(),
          });
        }
      }
    }

    // Generate JWT token
    const token = this.generateToken(user);

    return { user, token, isNewUser };
  }

  /**
   * Sign out a user
   */
  async signOut(token: string): Promise<boolean> {
    if (useSupabase) {
      // Sign out of Supabase Auth
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        logger.error('Error signing out:', error);
        throw new Error(`Sign out failed: ${error.message}`);
      }
    }
    
    // Additional sign out logic if needed
    // e.g., invalidate token in a blocklist
    
    return true;
  }

  /**
   * Generate JWT token for a user
   */
  generateToken(user: User): string {
    const payload = {
      userId: user.id,
      email: user.email,
      username: user.username,
    };

    return jwt.sign(payload, env.AUTH_SECRET, {
      expiresIn: env.AUTH_EXPIRES_IN,
    });
  }

  /**
   * Validate JWT token
   */
  async validateToken(token: string): Promise<{ userId: number; email: string; username: string } | null> {
    try {
      const decoded = jwt.verify(token, env.AUTH_SECRET) as {
        userId: number;
        email: string;
        username: string;
      };
      
      return decoded;
    } catch (error) {
      logger.error('Token validation error:', error);
      return null;
    }
  }

  /**
   * Change user password
   */
  async changePassword(userId: number | string, currentPassword: string, newPassword: string): Promise<boolean> {
    // Find user
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (useSupabase) {
      // First verify current password
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword
      });

      if (signInError || !authData.user) {
        throw new Error('Current password is incorrect');
      }

      // Update password with Supabase Auth
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        logger.error('Error changing password:', updateError);
        throw new Error(`Failed to change password: ${updateError.message}`);
      }
    } else {
      // Traditional password change
      // Check if user has password (might be OAuth user)
      if (!user.password_hash) {
        throw new Error('OAuth users cannot change password');
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

      // Update user password
      await userRepository.update(user.id, { 
        password_hash: passwordHash,
        updated_at: new Date()
      });
    }

    return true;
  }
}

export default new AuthService();