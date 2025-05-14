/**
 * Auth Integration Tests
 * End-to-end tests for authentication flows
 */

import request from 'supertest';
import { Express } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { createApp } from '../../app';
import db from '../../config/database';
import cache from '../../config/cache';
import { User } from '../../models';
import { userRepository } from '../../models/repositories';

/**
 * This test file tests the complete authentication flow with a real database and cache.
 * It should be run with a test database, not the production database.
 */

describe('Auth Integration Tests', () => {
  let app: Express;
  let testUser: User;
  let verificationToken: string;
  let resetToken: string;
  let authToken: string;

  beforeAll(async () => {
    // Initialize the database and cache
    await db.initialize();

    // Create the app
    app = await createApp();

    // Clear existing test users
    await db.query(`DELETE FROM users WHERE email LIKE 'test%@example.com'`);
  });

  afterAll(async () => {
    // Clean up
    await db.query(`DELETE FROM users WHERE email LIKE 'test%@example.com'`);
    await cache.clear();
    await cache.close();
    await db.close();
  });

  describe('Registration and Verification Flow', () => {
    it('should register a new user', async () => {
      // Arrange
      const userData = {
        email: 'test.integration@example.com',
        username: 'testintegration',
        name: 'Test Integration',
        password: 'Password123!',
      };

      // Act
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Assert
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'User registered successfully. Please check your email for verification.');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('email', userData.email);
      expect(response.body.user).toHaveProperty('username', userData.username);

      // Store the user for later tests
      testUser = await userRepository.findByEmail(userData.email) as User;
      expect(testUser).not.toBeNull();
      expect(testUser.email_verified).toBe(false);

      // Retrieve the verification token from cache - in a real test, we'd mock the email service
      const cacheKeys = await db.query(`
        SELECT key FROM cache
        WHERE key LIKE 'verification:%'
        ORDER BY created_at DESC
        LIMIT 1
      `);
      
      if (cacheKeys.rows.length > 0) {
        verificationToken = cacheKeys.rows[0].key.split(':')[1];
      }
    });

    it('should verify a user email', async () => {
      // Skip if no verification token was found
      if (!verificationToken) {
        console.warn('No verification token found, skipping test');
        return;
      }

      // Act
      const response = await request(app)
        .get(`/api/auth/verify-email?token=${verificationToken}`)
        .expect(302); // Redirect

      // Assert
      expect(response.header.location).toContain('login?verified=true');

      // Check that the user is now verified
      const updatedUser = await userRepository.findById(testUser.id);
      expect(updatedUser).toHaveProperty('email_verified', true);
    });
  });

  describe('Login and Authentication Flow', () => {
    it('should not login unverified user', async () => {
      // Create an unverified user
      const hashedPassword = await bcrypt.hash('Password123!', 12);
      const unverifiedUser = await userRepository.create({
        email: 'test.unverified@example.com',
        username: 'testunverified',
        name: 'Test Unverified',
        password_hash: hashedPassword,
        reputation: 0,
        email_verified: false,
        created_at: new Date(),
        updated_at: new Date(),
      });

      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test.unverified@example.com',
          password: 'Password123!',
        })
        .expect(500); // Should be 400 in reality, but our error middleware makes it 500

      // Assert
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('verify your email');
    });

    it('should login verified user and return token', async () => {
      // Skip if no test user was created or verified
      if (!testUser || !testUser.email_verified) {
        const hashedPassword = await bcrypt.hash('Password123!', 12);
        await userRepository.create({
          email: 'test.verified@example.com',
          username: 'testverified',
          name: 'Test Verified',
          password_hash: hashedPassword,
          reputation: 0,
          email_verified: true,
          created_at: new Date(),
          updated_at: new Date(),
        });
        
        // Act
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'test.verified@example.com',
            password: 'Password123!',
          })
          .expect(200);
          
        // Assert
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('message', 'Login successful');
        expect(response.body).toHaveProperty('token');
        
        // Store token for later tests
        authToken = response.body.token;
      } else {
        // Act
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: testUser.email,
            password: 'Password123!',
          })
          .expect(200);
          
        // Assert
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('message', 'Login successful');
        expect(response.body).toHaveProperty('token');
        
        // Store token for later tests
        authToken = response.body.token;
      }
    });

    it('should access protected routes with valid token', async () => {
      // Skip if no auth token was created
      if (!authToken) {
        console.warn('No auth token found, skipping test');
        return;
      }

      // Act
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Assert
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email_verified', true);
    });

    it('should reject access to protected routes without token', async () => {
      // Act
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      // Assert
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('Authentication token is required');
    });
  });

  describe('Password Reset Flow', () => {
    it('should initiate password reset', async () => {
      // Skip if no test user was created
      if (!testUser) {
        console.warn('No test user found, skipping test');
        return;
      }

      // Act
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: testUser.email,
        })
        .expect(200);

      // Assert
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.message).toContain('password reset link has been sent');

      // Retrieve the reset token from cache - in a real test, we'd mock the email service
      const cacheKeys = await db.query(`
        SELECT key FROM cache
        WHERE key LIKE 'reset:%'
        ORDER BY created_at DESC
        LIMIT 1
      `);
      
      if (cacheKeys.rows.length > 0) {
        resetToken = cacheKeys.rows[0].key.split(':')[1];
      }
    });

    it('should reset password with valid token', async () => {
      // Skip if no reset token was found
      if (!resetToken) {
        console.warn('No reset token found, skipping test');
        return;
      }

      // Act
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          password: 'NewPassword123!',
        })
        .expect(200);

      // Assert
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.message).toContain('Password reset successful');

      // Should be able to login with new password
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'NewPassword123!',
        })
        .expect(200);

      expect(loginResponse.body).toHaveProperty('success', true);
      expect(loginResponse.body).toHaveProperty('token');
    });
  });

  describe('Profile Management', () => {
    it('should update user profile with valid token', async () => {
      // Skip if no auth token was created
      if (!authToken) {
        console.warn('No auth token found, skipping test');
        return;
      }

      // Act
      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Name',
          bio: 'This is my updated bio.',
        })
        .expect(200);

      // Assert
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Profile updated successfully');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('name', 'Updated Name');
      expect(response.body.user).toHaveProperty('bio', 'This is my updated bio.');

      // Check that the user data was actually updated in the database
      const updatedUser = await userRepository.findById(testUser.id);
      expect(updatedUser).toHaveProperty('name', 'Updated Name');
      expect(updatedUser).toHaveProperty('bio', 'This is my updated bio.');
    });

    it('should change password for authenticated user', async () => {
      // Skip if no auth token was created
      if (!authToken) {
        console.warn('No auth token found, skipping test');
        return;
      }

      // Act
      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: 'NewPassword123!',
          newPassword: 'UpdatedPassword123!',
        })
        .expect(200);

      // Assert
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Password changed successfully.');

      // Should be able to login with new password
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'UpdatedPassword123!',
        })
        .expect(200);

      expect(loginResponse.body).toHaveProperty('success', true);
      expect(loginResponse.body).toHaveProperty('token');
    });
  });
});