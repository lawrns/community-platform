/**
 * Email Service
 * Handles sending emails for authentication and notifications
 */

import nodemailer from 'nodemailer';
import { renderFile } from 'ejs'; // @ts-ignore
import path from 'path';
import env from '../../config/environment';
import logger from '../../config/logger';

/**
 * Service for sending emails
 */
class EmailService {
  private transporter: nodemailer.Transporter;
  private templatesDir: string;

  constructor() {
    // Set the templates directory
    this.templatesDir = path.join(__dirname, 'templates');

    // Initialize email transporter based on environment config
    switch (env.EMAIL_PROVIDER) {
      case 'postmark':
        this.transporter = nodemailer.createTransport({
          service: 'Postmark',
          auth: {
            user: env.POSTMARK_API_KEY,
            pass: env.POSTMARK_API_KEY,
          },
        });
        break;
      case 'sendgrid':
        this.transporter = nodemailer.createTransport({
          service: 'SendGrid',
          auth: {
            user: 'apikey',
            pass: (env as any).SENDGRID_API_KEY,
          },
        });
        break;
      case 'ses':
        this.transporter = nodemailer.createTransport({
          service: 'SES',
          auth: {
            user: (env as any).SES_ACCESS_KEY || env.S3_ACCESS_KEY,
            pass: (env as any).SES_SECRET_KEY || env.S3_SECRET_KEY,
          },
        });
        break;
      default:
        // Development SMTP setup
        this.transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: 'ethereal_user',
            pass: 'ethereal_pass',
          },
        });
        logger.warn('Using development email transport. Emails will not be delivered.');
    }
  }

  /**
   * Send email using an EJS template
   */
  async sendTemplateEmail(
    email: string,
    subject: string,
    template: string,
    context: Record<string, any>
  ): Promise<boolean> {
    try {
      // Render the template
      const templatePath = path.join(this.templatesDir, `${template}.ejs`);
      const html = await renderFile(templatePath, {
        ...context,
        process: { env },
      });

      // Send the email
      await this.transporter.sendMail({
        from: env.EMAIL_FROM,
        to: email,
        subject: `${subject} - Community.io`,
        html,
      });
      
      logger.info(`Template email '${template}' sent to ${email}`);
      return true;
    } catch (error) {
      logger.error(`Error sending template email '${template}':`, error);
      throw new Error(`Failed to send template email: ${(error as Error).message}`);
    }
  }

  /**
   * Send verification email
   */
  async sendVerificationEmail(
    email: string,
    name: string,
    token: string
  ): Promise<boolean> {
    const verificationUrl = `${env.FRONTEND_URL}/verify-email?token=${token}`;

    // In a real implementation, we would use EJS templates
    // For now, we'll use a simple HTML string
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Verify Your Email Address</h2>
        <p>Hello ${name},</p>
        <p>Welcome to Community.io! Please verify your email address to complete your registration.</p>
        <p>
          <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px;">
            Verify Email
          </a>
        </p>
        <p>Or copy and paste this link into your browser:</p>
        <p>${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <p>If you did not sign up for Community.io, you can ignore this email.</p>
        <p>Thanks,<br>The Community.io Team</p>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: env.EMAIL_FROM,
        to: email,
        subject: 'Verify Your Email Address - Community.io',
        html,
      });
      
      logger.info(`Verification email sent to ${email}`);
      return true;
    } catch (error) {
      logger.error('Error sending verification email:', error);
      throw new Error('Failed to send verification email');
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(
    email: string,
    name: string,
    token: string
  ): Promise<boolean> {
    const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${token}`;

    // Simple HTML template
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Reset Your Password</h2>
        <p>Hello ${name},</p>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        <p>
          <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px;">
            Reset Password
          </a>
        </p>
        <p>Or copy and paste this link into your browser:</p>
        <p>${resetUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <p>If you did not request a password reset, you can ignore this email.</p>
        <p>Thanks,<br>The Community.io Team</p>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: env.EMAIL_FROM,
        to: email,
        subject: 'Reset Your Password - Community.io',
        html,
      });
      
      logger.info(`Password reset email sent to ${email}`);
      return true;
    } catch (error) {
      logger.error('Error sending password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    // Simple HTML template
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to Community.io!</h2>
        <p>Hello ${name},</p>
        <p>Thank you for joining our community of AI practitioners, researchers, and enthusiasts.</p>
        <p>Here are a few things you can do to get started:</p>
        <ul>
          <li>Complete your profile</li>
          <li>Browse the AI tool directory</li>
          <li>Join discussions on topics that interest you</li>
          <li>Share your knowledge by creating content</li>
        </ul>
        <p>If you have any questions, check out our <a href="${env.FRONTEND_URL}/faq">FAQ</a> or contact our support team.</p>
        <p>Thanks,<br>The Community.io Team</p>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: env.EMAIL_FROM,
        to: email,
        subject: 'Welcome to Community.io!',
        html,
      });
      
      logger.info(`Welcome email sent to ${email}`);
      return true;
    } catch (error) {
      logger.error('Error sending welcome email:', error);
      throw new Error('Failed to send welcome email');
    }
  }

  /**
   * Send general notification email
   */
  async sendNotificationEmail(
    email: string,
    name: string,
    subject: string,
    message: string,
    ctaText?: string,
    ctaUrl?: string
  ): Promise<boolean> {
    // Simple HTML template
    let html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>${subject}</h2>
        <p>Hello ${name},</p>
        <p>${message}</p>
    `;

    // Add CTA button if provided
    if (ctaText && ctaUrl) {
      html += `
        <p>
          <a href="${ctaUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px;">
            ${ctaText}
          </a>
        </p>
      `;
    }

    html += `
        <p>Thanks,<br>The Community.io Team</p>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: env.EMAIL_FROM,
        to: email,
        subject: `${subject} - Community.io`,
        html,
      });
      
      logger.info(`Notification email sent to ${email}`);
      return true;
    } catch (error) {
      logger.error('Error sending notification email:', error);
      throw new Error('Failed to send notification email');
    }
  }
}

// Create and export an instance of the EmailService
export const emailService = new EmailService();

// Default export for backwards compatibility
export default emailService;