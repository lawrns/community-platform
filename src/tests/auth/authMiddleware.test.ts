/**
 * Auth Middleware Tests
 * Tests for authentication middleware
 */

import { Request, Response, NextFunction } from 'express';
import { 
  authenticate, 
  requireVerified, 
  requireReputation,
  requirePrivilege,
  optionalAuthenticate
} from '../../middlewares/auth/authMiddleware';
import authService from '../../services/auth/authService';
import { userRepository } from '../../models/repositories';
import { mockUsers, mockTokenPayload } from './mocks';

// Mock dependencies
jest.mock('../../services/auth/authService');
jest.mock('../../models/repositories', () => ({
  userRepository: {
    findById: jest.fn(),
    hasPrivilege: jest.fn()
  }
}));

// Mock request, response, and next function
const mockRequest = () => {
  const req: Partial<Request> = {
    headers: {},
    query: {}
  };
  return req;
};

const mockResponse = () => {
  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis()
  };
  return res;
};

const mockNext: NextFunction = jest.fn();

describe('Auth Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('authenticate', () => {
    it('should authenticate valid token in Authorization header', async () => {
      // Arrange
      const req = mockRequest();
      req.headers = { authorization: 'Bearer valid-token' };
      
      (authService.validateToken as jest.Mock).mockResolvedValueOnce(mockTokenPayload);
      (userRepository.findById as jest.Mock).mockResolvedValueOnce(mockUsers[0]);
      
      // Act
      await authenticate(req as Request, {} as Response, mockNext);
      
      // Assert
      expect(authService.validateToken).toHaveBeenCalledWith('valid-token');
      expect(userRepository.findById).toHaveBeenCalledWith(mockTokenPayload.userId);
      expect(req.user).toEqual(mockUsers[0]);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should authenticate valid token in query parameter', async () => {
      // Arrange
      const req = mockRequest();
      req.query = { token: 'valid-token' };
      
      (authService.validateToken as jest.Mock).mockResolvedValueOnce(mockTokenPayload);
      (userRepository.findById as jest.Mock).mockResolvedValueOnce(mockUsers[0]);
      
      // Act
      await authenticate(req as Request, {} as Response, mockNext);
      
      // Assert
      expect(authService.validateToken).toHaveBeenCalledWith('valid-token');
      expect(req.user).toEqual(mockUsers[0]);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should return error when no token is provided', async () => {
      // Arrange
      const req = mockRequest();
      
      // Act
      await authenticate(req as Request, {} as Response, mockNext);
      
      // Assert
      expect(authService.validateToken).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Authentication token is required'
      }));
    });

    it('should return error for invalid token', async () => {
      // Arrange
      const req = mockRequest();
      req.headers = { authorization: 'Bearer invalid-token' };
      
      (authService.validateToken as jest.Mock).mockResolvedValueOnce(null);
      
      // Act
      await authenticate(req as Request, {} as Response, mockNext);
      
      // Assert
      expect(authService.validateToken).toHaveBeenCalledWith('invalid-token');
      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Invalid or expired token'
      }));
    });

    it('should return error when user is not found', async () => {
      // Arrange
      const req = mockRequest();
      req.headers = { authorization: 'Bearer valid-token' };
      
      (authService.validateToken as jest.Mock).mockResolvedValueOnce(mockTokenPayload);
      (userRepository.findById as jest.Mock).mockResolvedValueOnce(null);
      
      // Act
      await authenticate(req as Request, {} as Response, mockNext);
      
      // Assert
      expect(userRepository.findById).toHaveBeenCalledWith(mockTokenPayload.userId);
      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: 'User not found'
      }));
    });
  });

  describe('requireVerified', () => {
    it('should allow access for verified users', () => {
      // Arrange
      const req = mockRequest();
      req.user = { ...mockUsers[0], email_verified: true };
      
      // Act
      requireVerified(req as Request, {} as Response, mockNext);
      
      // Assert
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should block access for unverified users', () => {
      // Arrange
      const req = mockRequest();
      req.user = { ...mockUsers[1], email_verified: false };
      
      // Act
      requireVerified(req as Request, {} as Response, mockNext);
      
      // Assert
      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Email verification required'
      }));
    });

    it('should block access for unauthenticated requests', () => {
      // Arrange
      const req = mockRequest();
      
      // Act
      requireVerified(req as Request, {} as Response, mockNext);
      
      // Assert
      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Authentication required'
      }));
    });
  });

  describe('requireReputation', () => {
    it('should allow access for users with sufficient reputation', () => {
      // Arrange
      const req = mockRequest();
      req.user = { ...mockUsers[0], reputation: 100 };
      const middleware = requireReputation(50);
      
      // Act
      middleware(req as Request, {} as Response, mockNext);
      
      // Assert
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should block access for users with insufficient reputation', () => {
      // Arrange
      const req = mockRequest();
      req.user = { ...mockUsers[0], reputation: 10 };
      const middleware = requireReputation(50);
      
      // Act
      middleware(req as Request, {} as Response, mockNext);
      
      // Assert
      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Insufficient reputation. Required: 50'
      }));
    });

    it('should block access for unauthenticated requests', () => {
      // Arrange
      const req = mockRequest();
      const middleware = requireReputation(50);
      
      // Act
      middleware(req as Request, {} as Response, mockNext);
      
      // Assert
      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Authentication required'
      }));
    });
  });

  describe('requirePrivilege', () => {
    it('should allow access for users with the required privilege', async () => {
      // Arrange
      const req = mockRequest();
      req.user = mockUsers[0];
      const middleware = requirePrivilege('moderator');
      
      (userRepository.hasPrivilege as jest.Mock).mockResolvedValueOnce(true);
      
      // Act
      await middleware(req as Request, {} as Response, mockNext);
      
      // Assert
      expect(userRepository.hasPrivilege).toHaveBeenCalledWith(mockUsers[0].id, 'moderator');
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should block access for users without the required privilege', async () => {
      // Arrange
      const req = mockRequest();
      req.user = mockUsers[0];
      const middleware = requirePrivilege('admin');
      
      (userRepository.hasPrivilege as jest.Mock).mockResolvedValueOnce(false);
      
      // Act
      await middleware(req as Request, {} as Response, mockNext);
      
      // Assert
      expect(userRepository.hasPrivilege).toHaveBeenCalledWith(mockUsers[0].id, 'admin');
      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Missing required privilege: admin'
      }));
    });

    it('should block access for unauthenticated requests', async () => {
      // Arrange
      const req = mockRequest();
      const middleware = requirePrivilege('admin');
      
      // Act
      await middleware(req as Request, {} as Response, mockNext);
      
      // Assert
      expect(userRepository.hasPrivilege).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Authentication required'
      }));
    });
  });

  describe('optionalAuthenticate', () => {
    it('should attach user to request if valid token is provided', async () => {
      // Arrange
      const req = mockRequest();
      req.headers = { authorization: 'Bearer valid-token' };
      
      (authService.validateToken as jest.Mock).mockResolvedValueOnce(mockTokenPayload);
      (userRepository.findById as jest.Mock).mockResolvedValueOnce(mockUsers[0]);
      
      // Act
      await optionalAuthenticate(req as Request, {} as Response, mockNext);
      
      // Assert
      expect(authService.validateToken).toHaveBeenCalledWith('valid-token');
      expect(userRepository.findById).toHaveBeenCalledWith(mockTokenPayload.userId);
      expect(req.user).toEqual(mockUsers[0]);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should continue without user if no token is provided', async () => {
      // Arrange
      const req = mockRequest();
      
      // Act
      await optionalAuthenticate(req as Request, {} as Response, mockNext);
      
      // Assert
      expect(authService.validateToken).not.toHaveBeenCalled();
      expect(req.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should continue without user for invalid token', async () => {
      // Arrange
      const req = mockRequest();
      req.headers = { authorization: 'Bearer invalid-token' };
      
      (authService.validateToken as jest.Mock).mockResolvedValueOnce(null);
      
      // Act
      await optionalAuthenticate(req as Request, {} as Response, mockNext);
      
      // Assert
      expect(authService.validateToken).toHaveBeenCalledWith('invalid-token');
      expect(req.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should continue without user when user is not found', async () => {
      // Arrange
      const req = mockRequest();
      req.headers = { authorization: 'Bearer valid-token' };
      
      (authService.validateToken as jest.Mock).mockResolvedValueOnce(mockTokenPayload);
      (userRepository.findById as jest.Mock).mockResolvedValueOnce(null);
      
      // Act
      await optionalAuthenticate(req as Request, {} as Response, mockNext);
      
      // Assert
      expect(userRepository.findById).toHaveBeenCalledWith(mockTokenPayload.userId);
      expect(req.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalledWith();
    });
  });
});