/**
 * Email Service Tests
 * Tests for email service functionality
 */

import nodemailer from 'nodemailer';
import EmailService from '../../services/email/emailService';
import env from '../../config/environment';

// Mock dependencies
jest.mock('nodemailer');
jest.mock('../../config/environment', () => ({
  EMAIL_PROVIDER: 'test',
  EMAIL_FROM: 'test@example.com',
  FRONTEND_URL: 'http://localhost:3000',
}));

describe('EmailService', () => {
  let emailService: EmailService;
  let mockTransporter: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create mock transporter
    mockTransporter = {
      sendMail: jest.fn().mockResolvedValue({ messageId: 'mock-id' }),
    };
    
    // Mock nodemailer.createTransport to return our mock transporter
    (nodemailer.createTransport as jest.Mock).mockReturnValue(mockTransporter);
    
    // Create email service instance
    emailService = new EmailService();
  });

  describe('sendVerificationEmail', () => {
    it('should send verification email with correct parameters', async () => {
      // Arrange
      const email = 'user@example.com';
      const name = 'Test User';
      const token = 'verification-token';
      const expectedUrl = `${env.FRONTEND_URL}/verify-email?token=${token}`;
      
      // Act
      const result = await emailService.sendVerificationEmail(email, name, token);
      
      // Assert
      expect(result).toBe(true);
      expect(mockTransporter.sendMail).toHaveBeenCalledTimes(1);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(expect.objectContaining({
        from: env.EMAIL_FROM,
        to: email,
        subject: 'Verify Your Email Address - Community.io',
        html: expect.stringContaining(name),
      }));
      
      // Verify URL is in the email
      const emailHtml = mockTransporter.sendMail.mock.calls[0][0].html;
      expect(emailHtml).toContain(expectedUrl);
    });

    it('should throw error if send fails', async () => {
      // Arrange
      mockTransporter.sendMail.mockRejectedValueOnce(new Error('Send failed'));
      
      // Act & Assert
      await expect(
        emailService.sendVerificationEmail('user@example.com', 'Test User', 'token')
      ).rejects.toThrow('Failed to send verification email');
    });
  });

  describe('sendPasswordResetEmail', () => {
    it('should send password reset email with correct parameters', async () => {
      // Arrange
      const email = 'user@example.com';
      const name = 'Test User';
      const token = 'reset-token';
      const expectedUrl = `${env.FRONTEND_URL}/reset-password?token=${token}`;
      
      // Act
      const result = await emailService.sendPasswordResetEmail(email, name, token);
      
      // Assert
      expect(result).toBe(true);
      expect(mockTransporter.sendMail).toHaveBeenCalledTimes(1);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(expect.objectContaining({
        from: env.EMAIL_FROM,
        to: email,
        subject: 'Reset Your Password - Community.io',
        html: expect.stringContaining(name),
      }));
      
      // Verify URL is in the email
      const emailHtml = mockTransporter.sendMail.mock.calls[0][0].html;
      expect(emailHtml).toContain(expectedUrl);
    });
  });

  describe('sendWelcomeEmail', () => {
    it('should send welcome email with correct parameters', async () => {
      // Arrange
      const email = 'user@example.com';
      const name = 'Test User';
      
      // Act
      const result = await emailService.sendWelcomeEmail(email, name);
      
      // Assert
      expect(result).toBe(true);
      expect(mockTransporter.sendMail).toHaveBeenCalledTimes(1);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(expect.objectContaining({
        from: env.EMAIL_FROM,
        to: email,
        subject: 'Welcome to Community.io!',
        html: expect.stringContaining(name),
      }));
    });
  });

  describe('sendNotificationEmail', () => {
    it('should send notification email with correct parameters', async () => {
      // Arrange
      const email = 'user@example.com';
      const name = 'Test User';
      const subject = 'Test Notification';
      const message = 'This is a test notification.';
      
      // Act
      const result = await emailService.sendNotificationEmail(
        email, name, subject, message
      );
      
      // Assert
      expect(result).toBe(true);
      expect(mockTransporter.sendMail).toHaveBeenCalledTimes(1);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(expect.objectContaining({
        from: env.EMAIL_FROM,
        to: email,
        subject: 'Test Notification - Community.io',
        html: expect.stringContaining(message),
      }));
    });

    it('should include CTA button when provided', async () => {
      // Arrange
      const email = 'user@example.com';
      const name = 'Test User';
      const subject = 'Test Notification';
      const message = 'This is a test notification.';
      const ctaText = 'Click Me';
      const ctaUrl = 'https://example.com/action';
      
      // Act
      const result = await emailService.sendNotificationEmail(
        email, name, subject, message, ctaText, ctaUrl
      );
      
      // Assert
      expect(result).toBe(true);
      
      // Verify CTA is in the email
      const emailHtml = mockTransporter.sendMail.mock.calls[0][0].html;
      expect(emailHtml).toContain(ctaText);
      expect(emailHtml).toContain(ctaUrl);
    });
  });
});