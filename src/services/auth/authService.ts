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
import { emailService } from '../email/emailService';
import { supabase } from '../../config/supabase';

/**
 * Salt rounds for password hashing
 */
const SALT_ROUNDS = 12;

/**
 * Token expiration time in seconds
 */
const TOKEN_EXPIRATION = parseInt(env.AUTH_EXPIRES_IN || '7d', 10) * 24 * 60 * 60; // Convert days to seconds

/**
 * Verification token expiration in seconds
 */
const VERIFICATION_TOKEN_EXPIRATION = 24 * 60 * 60; // 24 hours

/**
 * Determine if we should use Supabase
 */
const useSupabase = !!config.SUPABASE_URL && !!config.SUPABASE_ANON_KEY;

/**
 * Register a new user
 */
async function register(userData: {
  email: string;
  username: string;
  name: string;
  password: string;
}): Promise<{ user: User; token: string }> {
  try {
    // Check if email or username already exists
    const existingEmail = await userRepository.findByEmail(userData.email);
    if (existingEmail) {
      throw new Error('Email already registered');
    }

    const existingUsername = await userRepository.findByUsername(userData.username);
    if (existingUsername) {
      throw new Error('Username already taken');
    }

    if (useSupabase) {
      // Use Supabase Auth for registration
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            username: userData.username,
            name: userData.name,
          },
        },
      });

      if (error) {
        logger.error('Supabase registration error:', error);
        throw new Error(error.message);
      }

      // Get the Supabase user ID
      const supabaseId = data?.user?.id;
      if (!supabaseId) {
        throw new Error('Failed to create user in Supabase');
      }

      // Create the user in our database
      const newUser = await userRepository.create({
        email: userData.email,
        username: userData.username,
        name: userData.name,
        auth_provider: 'supabase',
        auth_provider_id: supabaseId,
        reputation: 0,
        email_verified: false,
        created_at: new Date(),
        updated_at: new Date(),
      });

      // Generate JWT token
      const token = generateToken(newUser);

      // Send email verification
      await sendVerificationEmail(newUser.id);

      return { user: newUser, token };
    } else {
      // Use our own authentication
      const passwordHash = await bcrypt.hash(userData.password, SALT_ROUNDS);

      // Create user
      const newUser = await userRepository.create({
        email: userData.email,
        username: userData.username,
        name: userData.name,
        password_hash: passwordHash,
        reputation: 0,
        email_verified: false,
        created_at: new Date(),
        updated_at: new Date(),
      });

      // Generate JWT token
      const token = generateToken(newUser);

      // Send email verification
      await sendVerificationEmail(newUser.id);

      return { user: newUser, token };
    }
  } catch (error: unknown) {
    logger.error('Registration error:', error);
    
    // Type guard for error objects with a message property
    if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
      const errorMessage = error.message;
      
      if (
        errorMessage.includes('duplicate key') ||
        errorMessage.includes('already registered') ||
        errorMessage.includes('already taken')
      ) {
        if (errorMessage.includes('email')) {
          throw new Error('Email already registered');
        } else if (errorMessage.includes('username')) {
          throw new Error('Username already taken');
        }
      }
    }
    
    // Re-throw as a generic error with a user-friendly message
    throw new Error('Registration failed. Please try again later.');
  }
}

/**
 * Send verification email
 */
async function sendVerificationEmail(userId: number): Promise<void> {
  try {
    // Get user
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    // Store verification token in cache
    await cache.set(
      `verification:${verificationToken}`,
      { userId: user.id },
      VERIFICATION_TOKEN_EXPIRATION
    );

    // Send verification email
    // emailService is already imported
    await emailService.sendVerificationEmail(
      user.email,
      user.name,
      verificationToken
    );
  } catch (error) {
    logger.error('Error sending verification email:', error);
    throw error;
  }
}

/**
 * Verify email with token
 */
async function verifyEmail(token: string): Promise<User | null> {
  try {
    // Check token from cache
    const data = await cache.get<{ userId: number }>(`verification:${token}`);
    if (!data || !data.userId) {
      throw new Error('Invalid or expired verification token');
    }

    // Get user
    const user = await userRepository.findById(data.userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Update user verification status
    const updatedUser = await userRepository.update(user.id, {
      email_verified: true,
      updated_at: new Date(),
    });

    // Remove token from cache
    await cache.del(`verification:${token}`);

    // Send welcome email
    if (updatedUser) {
      await emailService.sendWelcomeEmail(updatedUser.email, updatedUser.name);
    }

    return updatedUser;
  } catch (error) {
    logger.error('Email verification error:', error);
    throw error;
  }
}

/**
 * Resend verification email
 */
async function resendVerification(email: string): Promise<void> {
  try {
    // Get user by email
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.email_verified) {
      throw new Error('Email already verified');
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    // Store verification token in cache
    await cache.set(
      `verification:${verificationToken}`,
      { userId: user.id },
      VERIFICATION_TOKEN_EXPIRATION
    );

    // Send verification email
    // emailService is already imported
    await emailService.sendVerificationEmail(
      user.email,
      user.name,
      verificationToken
    );
  } catch (error) {
    logger.error('Resend verification error:', error);
    throw error;
  }
}

/**
 * Send password reset email
 */
async function sendPasswordResetEmail(email: string): Promise<void> {
  try {
    // Get user by email
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Store reset token in cache
    await cache.set(
      `reset:${resetToken}`,
      { userId: user.id },
      VERIFICATION_TOKEN_EXPIRATION
    );

    // Send password reset email
    // emailService is already imported
    await emailService.sendPasswordResetEmail(
      user.email,
      user.name,
      resetToken
    );
  } catch (error) {
    logger.error('Send password reset error:', error);
    throw error;
  }
}

/**
 * Reset password with token
 */
async function resetPassword(token: string, newPassword: string): Promise<boolean> {
  try {
    // Check token from cache
    const data = await cache.get<{ userId: number }>(`reset:${token}`);
    if (!data || !data.userId) {
      throw new Error('Invalid or expired reset token');
    }

    // Get user
    const user = await userRepository.findById(data.userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (useSupabase && user.auth_provider === 'supabase') {
      // Reset password in Supabase
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        logger.error('Supabase password reset error:', error);
        throw new Error(error.message);
      }
    } else {
      // Update password in our database
      const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
      await userRepository.update(user.id, {
        password_hash: passwordHash,
        updated_at: new Date(),
      });
    }

    // Remove token from cache
    await cache.del(`reset:${token}`);

    return true;
  } catch (error) {
    logger.error('Password reset error:', error);
    throw error;
  }
}

/**
 * Login user
 */
async function login(email: string, password: string): Promise<{ user: User; token: string }> {
  try {
    // Get user by email
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (useSupabase && user.auth_provider === 'supabase') {
      // Use Supabase Auth for login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        logger.error('Supabase login error:', error);
        throw new Error('Invalid email or password');
      }

      // Generate JWT token
      const token = generateToken(user);

      return { user, token };
    } else {
      // Use our own authentication
      if (!user.password_hash) {
        throw new Error('Invalid email or password');
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        throw new Error('Invalid email or password');
      }

      // Generate JWT token
      const token = generateToken(user);

      return { user, token };
    }
  } catch (error) {
    logger.error('Login error:', error);
    throw error;
  }
}

/**
 * Generate JWT token
 */
function generateToken(user: User): string {
  return jwt.sign(
    { id: user.id, email: user.email, username: user.username },
    env.AUTH_SECRET as string,
    { expiresIn: TOKEN_EXPIRATION }
  );
}

/**
 * Verify JWT token
 */
function verifyToken(token: string): any {
  return jwt.verify(token, env.AUTH_SECRET as string);
}

/**
 * Get user profile
 */
async function getProfile(userId: number): Promise<User | null> {
  return userRepository.findById(userId);
}

/**
 * Update user profile
 */
async function updateProfile(
  userId: number,
  userData: {
    name?: string;
    username?: string;
    bio?: string;
    avatar_url?: string;
  }
): Promise<User | null> {
  // Check if username already exists
  if (userData.username) {
    const existingUser = await userRepository.findByUsername(userData.username);
    if (existingUser && existingUser.id !== userId) {
      throw new Error('Username already taken');
    }
  }

  // Update user
  return userRepository.update(userId, {
    ...userData,
    updated_at: new Date(),
  });
}

/**
 * Change password
 */
async function changePassword(
  userId: number,
  currentPassword: string,
  newPassword: string
): Promise<boolean> {
  // Get user
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  if (useSupabase && user.auth_provider === 'supabase') {
    // Change password in Supabase
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      logger.error('Supabase password change error:', error);
      throw new Error(error.message);
    }
  } else {
    // Verify current password
    if (!user.password_hash) {
      throw new Error('Cannot change password for external auth provider');
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      throw new Error('Current password is incorrect');
    }

    // Update password
    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await userRepository.update(userId, {
      password_hash: passwordHash,
      updated_at: new Date(),
    });
  }

  return true;
}

/**
 * Process OAuth user from providers like Auth0, Google, GitHub, etc.
 */
async function processOAuthUser(
  provider: string,
  providerId: string,
  email: string,
  name: string,
  profile?: any,
  username?: string
): Promise<{ user: User; isNewUser: boolean }> {
  try {
    // Check if user already exists with this provider
    let user = await userRepository.findByProviderAndProviderId(provider, providerId);
    let isNewUser = false;

    if (!user) {
      // Check if email already exists
      user = await userRepository.findByEmail(email);

      if (user) {
        // Update existing user with provider info
        user = await userRepository.update(user.id, {
          auth_provider: provider,
          auth_provider_id: providerId,
          updated_at: new Date(),
        });
      } else {
        // Generate unique username if not provided
        if (!username) {
          // Use name, then email prefix as fallback
          username = (name || email.split('@')[0])
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '')
            .substring(0, 15);

          // Ensure uniqueness by adding random suffix if needed
          let isUnique = false;
          let attemptCount = 0;
          let candidateUsername = username;

          while (!isUnique && attemptCount < 5) {
            const existing = await userRepository.findByUsername(candidateUsername);
            if (!existing) {
              isUnique = true;
            } else {
              // Add random suffix and try again
              candidateUsername = `${username}${Math.floor(Math.random() * 1000)}`;
              attemptCount++;
            }
          }

          username = candidateUsername;
        }

        // Create new user
        user = await userRepository.create({
          email,
          username,
          name,
          auth_provider: provider,
          auth_provider_id: providerId,
          reputation: 0,
          email_verified: true, // Social logins are pre-verified
          created_at: new Date(),
          updated_at: new Date(),
        });

        isNewUser = true;
      }
    }

    return { user: user!, isNewUser };
  } catch (error) {
    logger.error('OAuth user processing error:', error);
    throw error;
  }
}

/**
 * Social login (Auth0, Google, GitHub, etc.)
 */
async function socialLogin(
  provider: string,
  providerId: string,
  email: string,
  name: string,
  username?: string
): Promise<{ user: User; token: string; isNewUser: boolean }> {
  try {
    // Check if user already exists with this provider
    let user = await userRepository.findByProviderAndProviderId(provider, providerId);
    let isNewUser = false;

    if (!user) {
      // Check if email already exists
      user = await userRepository.findByEmail(email);

      if (user) {
        // Update existing user with provider info
        user = await userRepository.update(user.id, {
          auth_provider: provider,
          auth_provider_id: providerId,
          updated_at: new Date(),
        });
      } else {
        // Generate unique username if not provided
        if (!username) {
          // Use name, then email prefix as fallback
          username = (name || email.split('@')[0])
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '')
            .substring(0, 15);

          // Ensure uniqueness by adding random suffix if needed
          let isUnique = false;
          let attemptCount = 0;
          let candidateUsername = username;

          while (!isUnique && attemptCount < 5) {
            const existing = await userRepository.findByUsername(candidateUsername);
            if (!existing) {
              isUnique = true;
            } else {
              // Add random suffix and try again
              candidateUsername = `${username}${Math.floor(Math.random() * 1000)}`;
              attemptCount++;
            }
          }

          username = candidateUsername;
        }

        // Create new user
        user = await userRepository.create({
          email,
          username,
          name,
          auth_provider: provider,
          auth_provider_id: providerId,
          reputation: 0,
          email_verified: true, // Social logins are pre-verified
          created_at: new Date(),
          updated_at: new Date(),
        });

        isNewUser = true;
      }
    }

    // Generate JWT token
    const token = generateToken(user!);

    return { user: user!, token, isNewUser };
  } catch (error) {
    logger.error('Social login error:', error);
    throw error;
  }
}

/**
 * Supabase Exchange
 * Exchange Supabase JWT for our application JWT
 */
async function supabaseExchange(supabaseToken: string): Promise<{ user: User; token: string }> {
  try {
    // Validate the Supabase token
    const { data: authData, error: authError } = await supabase.auth.getUser(supabaseToken);

    if (authError || !authData.user) {
      logger.error('Supabase token validation error:', authError);
      throw new Error('Invalid Supabase token');
    }

    // Get user by Supabase ID
    let user = await userRepository.findByProviderAndProviderId('supabase', authData.user.id);

    if (!user) {
      // User exists in Supabase but not in our database
      // This can happen if user registered directly with Supabase
      const userData = authData.user.user_metadata || {};
      let username = userData.username;
      
      // If no username exists, try to create one from email
      if (!username && authData.user.email) {
        username = authData.user.email.split('@')[0];
      } else {
        // Fallback username if no email or metadata username
        username = `user_${Date.now()}`;
      }
      
      // Create user in our database
      user = await userRepository.create({
        email: authData.user.email || '',
        username,
        name: userData.name || username,
        auth_provider: 'supabase',
        auth_provider_id: authData.user.id,
        reputation: 0,
        email_verified: authData.user.email_confirmed_at ? true : false,
        created_at: new Date(),
        updated_at: new Date(),
      });
    }

    // Generate JWT token
    const token = generateToken(user);

    return { user, token };
  } catch (error) {
    logger.error('Supabase exchange error:', error);
    throw error;
  }
}

/**
 * Validate JWT token
 */
function validateToken(token: string): any {
  try {
    return jwt.verify(token, env.AUTH_SECRET as string);
  } catch (error) {
    logger.error('Token validation error:', error);
    return null;
  }
}

export default {
  register,
  login,
  verifyEmail,
  resendVerification,
  sendPasswordResetEmail,
  resetPassword,
  getProfile,
  updateProfile,
  changePassword,
  socialLogin,
  processOAuthUser,
  supabaseExchange,
  generateToken,
  verifyToken,
  validateToken,
};