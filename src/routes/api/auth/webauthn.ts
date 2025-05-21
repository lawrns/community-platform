/**
 * WebAuthn Authentication Routes
 * Handles WebAuthn PassKey registration and authentication
 */

import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import asyncHandler from '../../../utils/asyncHandler';
import { authenticate } from '../../../middlewares/auth/authMiddleware';
import webAuthnService from '../../../services/auth/webAuthnService';
import { handleValidationErrors } from '../../../utils/validationHelper';
import { BadRequestError, UnauthorizedError } from '../../../utils/errorHandler';
import logger from '../../../config/logger';

const router = Router();

/**
 * Generate registration options for WebAuthn
 * @route POST /api/auth/webauthn/register-options
 */
router.post(
  '/register-options',
  authenticate,
  asyncHandler(async (req, res) => {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedError('Not authenticated');
    }

    // Generate registration options
    const options = await webAuthnService.generateRegistrationOpts(
      req.user.id,
      req.user.username,
      req.user.name
    );

    res.status(200).json({
      success: true,
      options
    });
  })
);

/**
 * Verify registration response
 * @route POST /api/auth/webauthn/register-verification
 */
router.post(
  '/register-verification',
  authenticate,
  [
    body('response').notEmpty().withMessage('Registration response is required'),
    body('credentialName').optional().isString().withMessage('Credential name must be a string')
  ],
  asyncHandler(async (req, res) => {
    // Validate request
    handleValidationErrors(validationResult(req));

    if (!req.user || !req.user.id) {
      throw new UnauthorizedError('Not authenticated');
    }

    const { response, credentialName } = req.body;

    // Verify registration
    const verification = await webAuthnService.verifyRegistration(
      req.user.id,
      response,
      credentialName
    );

    if (!verification.verified) {
      throw new BadRequestError('Registration verification failed');
    }

    res.status(200).json({
      success: true,
      message: 'Passkey registration successful',
      verified: verification.verified
    });
  })
);

/**
 * Generate authentication options for WebAuthn
 * @route POST /api/auth/webauthn/login-options
 */
router.post(
  '/login-options',
  [
    body('username').optional().isString().withMessage('Username must be a string')
  ],
  asyncHandler(async (req, res) => {
    // Validate request
    handleValidationErrors(validationResult(req));

    const { username } = req.body;

    // Generate authentication options
    const options = await webAuthnService.generateAuthenticationOpts(username);

    res.status(200).json({
      success: true,
      options
    });
  })
);

/**
 * Verify authentication response
 * @route POST /api/auth/webauthn/login-verification
 */
router.post(
  '/login-verification',
  [
    body('response').notEmpty().withMessage('Authentication response is required'),
    body('username').optional().isString().withMessage('Username must be a string')
  ],
  asyncHandler(async (req, res) => {
    // Validate request
    handleValidationErrors(validationResult(req));

    const { response, username } = req.body;

    // Verify authentication
    const { verification, user, token } = await webAuthnService.verifyAuthentication(response, username);

    if (!verification.verified) {
      throw new BadRequestError('Authentication verification failed');
    }

    res.status(200).json({
      success: true,
      message: 'Passkey authentication successful',
      verified: verification.verified,
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
 * Get user credentials
 * @route GET /api/auth/webauthn/credentials
 */
router.get(
  '/credentials',
  authenticate,
  asyncHandler(async (req, res) => {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedError('Not authenticated');
    }

    // Get user credentials
    const credentials = await webAuthnService.getUserCredentials(req.user.id);

    res.status(200).json({
      success: true,
      credentials
    });
  })
);

/**
 * Delete credential
 * @route DELETE /api/auth/webauthn/credentials/:credentialId
 */
router.delete(
  '/credentials/:credentialId',
  authenticate,
  asyncHandler(async (req, res) => {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedError('Not authenticated');
    }

    const { credentialId } = req.params;

    // Delete credential
    const success = await webAuthnService.deleteCredential(req.user.id, credentialId);

    if (!success) {
      throw new BadRequestError('Failed to delete credential');
    }

    res.status(200).json({
      success: true,
      message: 'Credential deleted successfully'
    });
  })
);

/**
 * Rename credential
 * @route PUT /api/auth/webauthn/credentials/:credentialId
 */
router.put(
  '/credentials/:credentialId',
  authenticate,
  [
    body('name').notEmpty().isString().withMessage('Credential name is required')
  ],
  asyncHandler(async (req, res) => {
    // Validate request
    handleValidationErrors(validationResult(req));

    if (!req.user || !req.user.id) {
      throw new UnauthorizedError('Not authenticated');
    }

    const { credentialId } = req.params;
    const { name } = req.body;

    // Rename credential
    const success = await webAuthnService.renameCredential(req.user.id, credentialId, name);

    if (!success) {
      throw new BadRequestError('Failed to rename credential');
    }

    res.status(200).json({
      success: true,
      message: 'Credential renamed successfully'
    });
  })
);

export default router;