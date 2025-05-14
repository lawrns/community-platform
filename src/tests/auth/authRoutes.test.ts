/**
 * Auth Routes Tests
 * Tests for authentication API routes
 */

import request from 'supertest';
import express from 'express';
import authRoutes from '../../routes/api/auth';
import authService from '../../services/auth/authService';
import { mockUsers, mockJwtToken } from './mocks';

// Mock dependencies
jest.mock('../../services/auth/authService');

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    success: false,
    message: err.message,
    errors: err.errors,
  });
});

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      // Arrange
      const userData = {
        email: 'new@example.com',
        username: 'newuser',
        name: 'New User',
        password: 'password123',
      };

      const mockResponse = {
        user: {
          id: 4,
          email: userData.email,
          username: userData.username,
          name: userData.name,
          reputation: 0,
          email_verified: false,
        },
        verificationToken: 'mock-token',
      };

      (authService.register as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Act
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Assert
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'User registered successfully. Please check your email for verification.');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toEqual({
        id: 4,
        email: userData.email,
        username: userData.username,
        name: userData.name,
      });
      expect(authService.register).toHaveBeenCalledWith(userData);
    });

    it('should return validation errors for invalid input', async () => {
      // Arrange
      const invalidUserData = {
        email: 'invalid-email',
        username: 'u', // Too short
        name: '',
        password: 'short', // Too short
      };

      // Act
      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidUserData)
        .expect(400);

      // Assert
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Validation error');
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toHaveProperty('email');
      expect(response.body.errors).toHaveProperty('username');
      expect(response.body.errors).toHaveProperty('name');
      expect(response.body.errors).toHaveProperty('password');
      expect(authService.register).not.toHaveBeenCalled();
    });

    it('should handle service errors gracefully', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        name: 'Test User',
        password: 'password123',
      };

      (authService.register as jest.Mock).mockRejectedValueOnce(new Error('Email already registered'));

      // Act
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(500);

      // Assert
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Email already registered');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login user with valid credentials', async () => {
      // Arrange
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockResponse = {
        user: mockUsers[0],
        token: mockJwtToken,
      };

      (authService.login as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(200);

      // Assert
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Login successful');
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token', mockJwtToken);
      expect(authService.login).toHaveBeenCalledWith(credentials.email, credentials.password);
    });

    it('should return validation errors for invalid input', async () => {
      // Arrange
      const invalidCredentials = {
        email: 'invalid-email',
        password: '',
      };

      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send(invalidCredentials)
        .expect(400);

      // Assert
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Validation error');
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toHaveProperty('email');
      expect(response.body.errors).toHaveProperty('password');
      expect(authService.login).not.toHaveBeenCalled();
    });

    it('should handle authentication failures gracefully', async () => {
      // Arrange
      const invalidCredentials = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      (authService.login as jest.Mock).mockRejectedValueOnce(new Error('Invalid email or password'));

      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send(invalidCredentials)
        .expect(500);

      // Assert
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Invalid email or password');
    });
  });

  describe('GET /api/auth/verify-email', () => {
    it('should verify email with valid token', async () => {
      // Arrange
      process.env.FRONTEND_URL = 'http://localhost:3000';
      (authService.verifyEmail as jest.Mock).mockResolvedValueOnce(true);

      // Act
      const response = await request(app)
        .get('/api/auth/verify-email')
        .query({ token: 'valid-token' })
        .expect(302); // Redirect

      // Assert
      expect(response.header.location).toBe('http://localhost:3000/login?verified=true');
      expect(authService.verifyEmail).toHaveBeenCalledWith('valid-token');
    });

    it('should return error for missing token', async () => {
      // Act
      const response = await request(app)
        .get('/api/auth/verify-email')
        .expect(400);

      // Assert
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Verification token is required');
      expect(authService.verifyEmail).not.toHaveBeenCalled();
    });

    it('should handle verification failures gracefully', async () => {
      // Arrange
      (authService.verifyEmail as jest.Mock).mockRejectedValueOnce(
        new Error('Invalid or expired verification token')
      );

      // Act
      const response = await request(app)
        .get('/api/auth/verify-email')
        .query({ token: 'invalid-token' })
        .expect(500);

      // Assert
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Invalid or expired verification token');
    });
  });

  describe('POST /api/auth/resend-verification', () => {
    it('should resend verification email successfully', async () => {
      // Arrange
      const requestData = {
        email: 'unverified@example.com',
      };

      (authService.resendVerificationEmail as jest.Mock).mockResolvedValueOnce(true);

      // Act
      const response = await request(app)
        .post('/api/auth/resend-verification')
        .send(requestData)
        .expect(200);

      // Assert
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Verification email sent. Please check your inbox.');
      expect(authService.resendVerificationEmail).toHaveBeenCalledWith(requestData.email);
    });

    it('should return validation errors for invalid email', async () => {
      // Arrange
      const invalidRequest = {
        email: 'invalid-email',
      };

      // Act
      const response = await request(app)
        .post('/api/auth/resend-verification')
        .send(invalidRequest)
        .expect(400);

      // Assert
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Validation error');
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toHaveProperty('email');
      expect(authService.resendVerificationEmail).not.toHaveBeenCalled();
    });

    it('should handle service errors gracefully', async () => {
      // Arrange
      const requestData = {
        email: 'test@example.com',
      };

      (authService.resendVerificationEmail as jest.Mock).mockRejectedValueOnce(
        new Error('Email is already verified')
      );

      // Act
      const response = await request(app)
        .post('/api/auth/resend-verification')
        .send(requestData)
        .expect(500);

      // Assert
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Email is already verified');
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should initiate password reset successfully', async () => {
      // Arrange
      const requestData = {
        email: 'test@example.com',
      };

      (authService.requestPasswordReset as jest.Mock).mockResolvedValueOnce(true);

      // Act
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send(requestData)
        .expect(200);

      // Assert
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'If an account exists with this email, a password reset link has been sent.');
      expect(authService.requestPasswordReset).toHaveBeenCalledWith(requestData.email);
    });

    it('should return validation errors for invalid email', async () => {
      // Arrange
      const invalidRequest = {
        email: 'invalid-email',
      };

      // Act
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send(invalidRequest)
        .expect(400);

      // Assert
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Validation error');
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toHaveProperty('email');
      expect(authService.requestPasswordReset).not.toHaveBeenCalled();
    });
  });

  describe('POST /api/auth/reset-password', () => {
    it('should reset password with valid token', async () => {
      // Arrange
      const requestData = {
        token: 'valid-token',
        password: 'newpassword123',
      };

      (authService.resetPassword as jest.Mock).mockResolvedValueOnce(true);

      // Act
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send(requestData)
        .expect(200);

      // Assert
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Password reset successful. You can now login with your new password.');
      expect(authService.resetPassword).toHaveBeenCalledWith(requestData.token, requestData.password);
    });

    it('should return validation errors for invalid input', async () => {
      // Arrange
      const invalidRequest = {
        token: '',
        password: 'short', // Too short
      };

      // Act
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send(invalidRequest)
        .expect(400);

      // Assert
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Validation error');
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toHaveProperty('token');
      expect(response.body.errors).toHaveProperty('password');
      expect(authService.resetPassword).not.toHaveBeenCalled();
    });

    it('should handle service errors gracefully', async () => {
      // Arrange
      const requestData = {
        token: 'invalid-token',
        password: 'newpassword123',
      };

      (authService.resetPassword as jest.Mock).mockRejectedValueOnce(
        new Error('Invalid or expired reset token')
      );

      // Act
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send(requestData)
        .expect(500);

      // Assert
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Invalid or expired reset token');
    });
  });
});