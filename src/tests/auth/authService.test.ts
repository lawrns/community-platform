/**
 * Auth Service Tests
 * Tests for authentication service functionality
 */

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import authService from '../../services/auth/authService';
import { userRepository } from '../../models/repositories';
import cache from '../../config/cache';
import EmailService from '../../services/email/emailService';
import { 
  mockUsers, 
  mockUserRepository, 
  mockEmailService, 
  mockCache,
  mockJwtToken,
  mockTokenPayload
} from './mocks';

// Mock dependencies
jest.mock('../../models/repositories', () => ({
  userRepository: jest.requireActual('./mocks').mockUserRepository,
}));

jest.mock('../../config/cache', () => jest.requireActual('./mocks').mockCache);

jest.mock('../../services/email/emailService');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock implementations
    (EmailService as jest.Mock).mockImplementation(() => mockEmailService);
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (jwt.sign as jest.Mock).mockReturnValue(mockJwtToken);
    (jwt.verify as jest.Mock).mockReturnValue(mockTokenPayload);
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      // Arrange
      const userData = {
        email: 'new@example.com',
        username: 'newuser',
        name: 'New User',
        password: 'password123',
      };
      
      mockUserRepository.findByEmail.mockResolvedValueOnce(null);
      mockUserRepository.findByUsername.mockResolvedValueOnce(null);

      // Act
      const result = await authService.register(userData);

      // Assert
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('verificationToken');
      expect(mockUserRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        email: userData.email,
        username: userData.username,
        name: userData.name,
        password_hash: 'hashed_password',
        email_verified: false,
      }));
      expect(mockCache.set).toHaveBeenCalled();
      expect(mockEmailService.sendVerificationEmail).toHaveBeenCalledWith(
        userData.email,
        userData.name,
        expect.any(String)
      );
    });

    it('should throw error when email already exists', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com', // Existing email
        username: 'newuser',
        name: 'New User',
        password: 'password123',
      };
      
      mockUserRepository.findByEmail.mockResolvedValueOnce(mockUsers[0]);

      // Act & Assert
      await expect(authService.register(userData)).rejects.toThrow('Email already registered');
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });

    it('should throw error when username already exists', async () => {
      // Arrange
      const userData = {
        email: 'new@example.com',
        username: 'testuser', // Existing username
        name: 'New User',
        password: 'password123',
      };
      
      mockUserRepository.findByEmail.mockResolvedValueOnce(null);
      mockUserRepository.findByUsername.mockResolvedValueOnce(mockUsers[0]);

      // Act & Assert
      await expect(authService.register(userData)).rejects.toThrow('Username already taken');
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should login user with valid credentials', async () => {
      // Arrange
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };
      
      mockUserRepository.findByEmail.mockResolvedValueOnce(mockUsers[0]);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);

      // Act
      const result = await authService.login(credentials.email, credentials.password);

      // Assert
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result.user.id).toBe(mockUsers[0].id);
      expect(result.token).toBe(mockJwtToken);
      expect(jwt.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockUsers[0].id,
          email: mockUsers[0].email,
          username: mockUsers[0].username,
        }),
        expect.any(String),
        expect.any(Object)
      );
    });

    it('should throw error with invalid email', async () => {
      // Arrange
      mockUserRepository.findByEmail.mockResolvedValueOnce(null);

      // Act & Assert
      await expect(authService.login('wrong@example.com', 'password123'))
        .rejects.toThrow('Invalid email or password');
    });

    it('should throw error with invalid password', async () => {
      // Arrange
      mockUserRepository.findByEmail.mockResolvedValueOnce(mockUsers[0]);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

      // Act & Assert
      await expect(authService.login('test@example.com', 'wrongpassword'))
        .rejects.toThrow('Invalid email or password');
    });

    it('should throw error when email is not verified', async () => {
      // Arrange
      mockUserRepository.findByEmail.mockResolvedValueOnce(mockUsers[1]); // Unverified user

      // Act & Assert
      await expect(authService.login('unverified@example.com', 'password123'))
        .rejects.toThrow('Please verify your email before logging in');
    });

    it('should throw error when trying to login with OAuth user credentials', async () => {
      // Arrange
      const oauthUser = { ...mockUsers[2], password_hash: undefined };
      mockUserRepository.findByEmail.mockResolvedValueOnce(oauthUser);

      // Act & Assert
      await expect(authService.login('oauth@example.com', 'password123'))
        .rejects.toThrow('Please log in with your OAuth provider');
    });
  });

  describe('verifyEmail', () => {
    it('should verify email with valid token', async () => {
      // Arrange
      const validToken = 'valid-token';
      mockCache.get.mockResolvedValueOnce({ userId: 2 });
      mockUserRepository.findById.mockResolvedValueOnce(mockUsers[1]);

      // Act
      const result = await authService.verifyEmail(validToken);

      // Assert
      expect(result).toBe(true);
      expect(mockUserRepository.update).toHaveBeenCalledWith(2, { email_verified: true });
      expect(mockCache.del).toHaveBeenCalledWith(`verification:${validToken}`);
    });

    it('should throw error with invalid token', async () => {
      // Arrange
      mockCache.get.mockResolvedValueOnce(null);

      // Act & Assert
      await expect(authService.verifyEmail('invalid-token'))
        .rejects.toThrow('Invalid or expired verification token');
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    it('should throw error if user not found', async () => {
      // Arrange
      mockCache.get.mockResolvedValueOnce({ userId: 999 });
      mockUserRepository.findById.mockResolvedValueOnce(null);

      // Act & Assert
      await expect(authService.verifyEmail('valid-token'))
        .rejects.toThrow('User not found');
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('resendVerificationEmail', () => {
    it('should resend verification email for unverified user', async () => {
      // Arrange
      mockUserRepository.findByEmail.mockResolvedValueOnce(mockUsers[1]);

      // Act
      const result = await authService.resendVerificationEmail('unverified@example.com');

      // Assert
      expect(result).toBe(true);
      expect(mockCache.set).toHaveBeenCalled();
      expect(mockEmailService.sendVerificationEmail).toHaveBeenCalledWith(
        mockUsers[1].email,
        mockUsers[1].name,
        expect.any(String)
      );
    });

    it('should throw error if email is already verified', async () => {
      // Arrange
      mockUserRepository.findByEmail.mockResolvedValueOnce(mockUsers[0]);

      // Act & Assert
      await expect(authService.resendVerificationEmail('test@example.com'))
        .rejects.toThrow('Email is already verified');
      expect(mockEmailService.sendVerificationEmail).not.toHaveBeenCalled();
    });

    it('should throw error if user not found', async () => {
      // Arrange
      mockUserRepository.findByEmail.mockResolvedValueOnce(null);

      // Act & Assert
      await expect(authService.resendVerificationEmail('nonexistent@example.com'))
        .rejects.toThrow('User not found');
    });
  });

  describe('requestPasswordReset', () => {
    it('should generate reset token for existing user', async () => {
      // Arrange
      mockUserRepository.findByEmail.mockResolvedValueOnce(mockUsers[0]);

      // Act
      const result = await authService.requestPasswordReset('test@example.com');

      // Assert
      expect(result).toBe(true);
      expect(mockCache.set).toHaveBeenCalled();
      expect(mockEmailService.sendPasswordResetEmail).toHaveBeenCalledWith(
        mockUsers[0].email,
        mockUsers[0].name,
        expect.any(String)
      );
    });

    it('should return true even if user does not exist (to prevent email enumeration)', async () => {
      // Arrange
      mockUserRepository.findByEmail.mockResolvedValueOnce(null);

      // Act
      const result = await authService.requestPasswordReset('nonexistent@example.com');

      // Assert
      expect(result).toBe(true);
      expect(mockCache.set).not.toHaveBeenCalled();
      expect(mockEmailService.sendPasswordResetEmail).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('should reset password with valid token', async () => {
      // Arrange
      const validToken = 'valid-token';
      const newPassword = 'newpassword123';
      mockCache.get.mockResolvedValueOnce({ userId: 1 });
      mockUserRepository.findById.mockResolvedValueOnce(mockUsers[0]);

      // Act
      const result = await authService.resetPassword(validToken, newPassword);

      // Assert
      expect(result).toBe(true);
      expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, expect.any(Number));
      expect(mockUserRepository.update).toHaveBeenCalledWith(1, { password_hash: 'hashed_password' });
      expect(mockCache.del).toHaveBeenCalledWith(`reset:${validToken}`);
    });

    it('should throw error with invalid token', async () => {
      // Arrange
      mockCache.get.mockResolvedValueOnce(null);

      // Act & Assert
      await expect(authService.resetPassword('invalid-token', 'newpassword123'))
        .rejects.toThrow('Invalid or expired reset token');
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    it('should throw error if user not found', async () => {
      // Arrange
      mockCache.get.mockResolvedValueOnce({ userId: 999 });
      mockUserRepository.findById.mockResolvedValueOnce(null);

      // Act & Assert
      await expect(authService.resetPassword('valid-token', 'newpassword123'))
        .rejects.toThrow('User not found');
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('processOAuthUser', () => {
    it('should return existing user if OAuth account exists', async () => {
      // Arrange
      mockUserRepository.findByAuthProviderId.mockResolvedValueOnce(mockUsers[2]);

      // Act
      const result = await authService.processOAuthUser(
        'auth0',
        'auth0|12345',
        'oauth@example.com',
        'OAuth User',
        {}
      );

      // Assert
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('isNewUser', false);
      expect(result.user.id).toBe(mockUsers[2].id);
    });

    it('should link account if email exists but OAuth provider is different', async () => {
      // Arrange
      mockUserRepository.findByAuthProviderId.mockResolvedValueOnce(null);
      mockUserRepository.findByEmail.mockResolvedValueOnce(mockUsers[0]);

      // Act
      const result = await authService.processOAuthUser(
        'google',
        'google|12345',
        'test@example.com',
        'Test User',
        {}
      );

      // Assert
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('isNewUser', false);
      expect(mockUserRepository.update).toHaveBeenCalledWith(1, {
        auth_provider: 'google',
        auth_provider_id: 'google|12345',
      });
    });

    it('should create new user if OAuth account and email are new', async () => {
      // Arrange
      mockUserRepository.findByAuthProviderId.mockResolvedValueOnce(null);
      mockUserRepository.findByEmail.mockResolvedValueOnce(null);
      mockUserRepository.findByUsername.mockResolvedValue(null);

      // Act
      const result = await authService.processOAuthUser(
        'github',
        'github|12345',
        'github@example.com',
        'GitHub User',
        {}
      );

      // Assert
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('isNewUser', true);
      expect(mockUserRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        email: 'github@example.com',
        name: 'GitHub User',
        auth_provider: 'github',
        auth_provider_id: 'github|12345',
        email_verified: true,
      }));
    });

    it('should generate unique username when creating a new OAuth user', async () => {
      // Arrange
      mockUserRepository.findByAuthProviderId.mockResolvedValueOnce(null);
      mockUserRepository.findByEmail.mockResolvedValueOnce(null);
      
      // First username check returns a match, second one doesn't
      mockUserRepository.findByUsername
        .mockResolvedValueOnce(mockUsers[0])
        .mockResolvedValueOnce(null);

      // Act
      const result = await authService.processOAuthUser(
        'github',
        'github|12345',
        'testuser@example.com',
        'New User',
        {}
      );

      // Assert
      expect(result).toHaveProperty('isNewUser', true);
      expect(mockUserRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'testuser1', // Should append 1 to make it unique
        })
      );
    });
  });

  describe('validateToken', () => {
    it('should return payload for valid token', async () => {
      // Act
      const result = await authService.validateToken(mockJwtToken);

      // Assert
      expect(result).toEqual(mockTokenPayload);
      expect(jwt.verify).toHaveBeenCalledWith(mockJwtToken, expect.any(String));
    });

    it('should return null for invalid token', async () => {
      // Arrange
      (jwt.verify as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Invalid token');
      });

      // Act
      const result = await authService.validateToken('invalid-token');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('changePassword', () => {
    it('should change password with valid credentials', async () => {
      // Arrange
      mockUserRepository.findById.mockResolvedValueOnce(mockUsers[0]);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);

      // Act
      const result = await authService.changePassword(1, 'currentPassword', 'newPassword');

      // Assert
      expect(result).toBe(true);
      expect(bcrypt.hash).toHaveBeenCalledWith('newPassword', expect.any(Number));
      expect(mockUserRepository.update).toHaveBeenCalledWith(1, expect.objectContaining({
        password_hash: 'hashed_password',
      }));
    });

    it('should throw error if user not found', async () => {
      // Arrange
      mockUserRepository.findById.mockResolvedValueOnce(null);

      // Act & Assert
      await expect(authService.changePassword(999, 'currentPassword', 'newPassword'))
        .rejects.toThrow('User not found');
    });

    it('should throw error for OAuth users without password', async () => {
      // Arrange
      const oauthUser = { ...mockUsers[2], password_hash: undefined };
      mockUserRepository.findById.mockResolvedValueOnce(oauthUser);

      // Act & Assert
      await expect(authService.changePassword(3, 'currentPassword', 'newPassword'))
        .rejects.toThrow('OAuth users cannot change password');
    });

    it('should throw error with incorrect current password', async () => {
      // Arrange
      mockUserRepository.findById.mockResolvedValueOnce(mockUsers[0]);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

      // Act & Assert
      await expect(authService.changePassword(1, 'wrongPassword', 'newPassword'))
        .rejects.toThrow('Current password is incorrect');
    });
  });
});