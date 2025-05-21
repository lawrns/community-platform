/**
 * WebAuthn Service
 * Handles PassKey authentication and WebAuthn credential management
 */

import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import type {
  GenerateRegistrationOptionsOpts,
  GenerateAuthenticationOptionsOpts,
  VerifyRegistrationResponseOpts,
  VerifyAuthenticationResponseOpts,
  VerifiedRegistrationResponse,
  VerifiedAuthenticationResponse,
} from '@simplewebauthn/server';
import { webAuthnCredentialRepository, userRepository } from '../../models/repositories';
import env, { config } from '../../config/environment';
import logger from '../../config/logger';
import authService from './authService';
import { User } from '../../models';

// Get origin and domain from environment
const rpID = env.WEBAUTHN_RP_ID || new URL(env.FRONTEND_URL || 'http://localhost:3000').hostname;
const rpName = env.WEBAUTHN_RP_NAME || 'Community Platform';
const expectedOrigin = env.FRONTEND_URL || 'http://localhost:3000';

// Session storage for registration and authentication
const registrationChallenges = new Map<number, string>();
const authenticationChallenges = new Map<string, string>();

/**
 * Generate registration options for WebAuthn
 */
async function generateRegistrationOpts(userId: number, username: string, displayName: string): Promise<any> {
  try {
    // Get user
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Get existing credentials
    const existingCredentials = await webAuthnCredentialRepository.findAllByUserId(userId);
    
    // Convert credentials to the format expected by the WebAuthn API
    const excludeCredentials = existingCredentials.map((cred) => ({
      id: Buffer.from(cred.credential_id, 'base64url'),
      type: 'public-key',
      transports: cred.transports || undefined,
    }));

    // Generate registration options
    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userID: userId.toString(),
      userName: username,
      userDisplayName: displayName,
      attestationType: 'none',
      excludeCredentials,
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
        authenticatorAttachment: 'platform',
      },
    });

    // Store challenge for verification
    registrationChallenges.set(userId, options.challenge);

    return options;
  } catch (error) {
    logger.error('Error generating registration options:', error);
    throw error;
  }
}

/**
 * Verify registration response from browser
 */
async function verifyRegistration(
  userId: number,
  response: any,
  credentialName?: string
): Promise<VerifiedRegistrationResponse> {
  try {
    // Get stored challenge
    const expectedChallenge = registrationChallenges.get(userId);
    if (!expectedChallenge) {
      throw new Error('Registration challenge not found');
    }

    // Verify registration response
    const verification = await verifyRegistrationResponse({
      response,
      expectedChallenge,
      expectedOrigin,
      expectedRPID: rpID,
      requireUserVerification: true,
    });

    if (verification.verified && verification.registrationInfo) {
      // Convert credential ID to string
      const credentialId = Buffer.from(
        verification.registrationInfo.credentialID
      ).toString('base64url');

      // Convert public key to string
      const publicKey = Buffer.from(
        verification.registrationInfo.credentialPublicKey
      ).toString('base64url');

      // Store credential in database
      await webAuthnCredentialRepository.create({
        user_id: userId,
        credential_id: credentialId,
        public_key: publicKey,
        counter: verification.registrationInfo.counter,
        credential_device_type: response.response.transports ? 'platform' : 'cross-platform',
        credential_backed_up: verification.registrationInfo.credentialBackedUp,
        transports: response.response.transports || [],
        name: credentialName || 'Passkey',
        created_at: new Date(),
      });

      // Enable WebAuthn for user
      await webAuthnCredentialRepository.enableWebAuthnForUser(userId);

      // Remove challenge
      registrationChallenges.delete(userId);
    }

    return verification;
  } catch (error) {
    logger.error('Error verifying registration:', error);
    throw error;
  }
}

/**
 * Generate authentication options for WebAuthn
 */
async function generateAuthenticationOpts(
  username?: string
): Promise<any> {
  try {
    let userVerification = 'preferred' as const;
    let allowCredentials: { id: Buffer; type: string; transports?: string[] }[] | undefined = undefined;

    // If username is provided, get user and their credentials
    if (username) {
      const user = await userRepository.findByUsername(username);
      if (!user) {
        throw new Error('User not found');
      }

      const credentials = await webAuthnCredentialRepository.findAllByUserId(user.id);
      
      if (credentials.length === 0) {
        throw new Error('No credentials found for user');
      }
      
      // Convert credentials to the format expected by the WebAuthn API
      allowCredentials = credentials.map((cred) => ({
        id: Buffer.from(cred.credential_id, 'base64url'),
        type: 'public-key',
        transports: cred.transports || undefined,
      }));
    }

    // Generate authentication options
    const options = await generateAuthenticationOptions({
      timeout: 60000,
      allowCredentials,
      userVerification,
      rpID,
    });

    // Store challenge for verification
    const challengeKey = username || 'default';
    authenticationChallenges.set(challengeKey, options.challenge);

    return options;
  } catch (error) {
    logger.error('Error generating authentication options:', error);
    throw error;
  }
}

/**
 * Verify authentication response from browser
 */
async function verifyAuthentication(
  response: any,
  username?: string
): Promise<{ verification: VerifiedAuthenticationResponse; user: User; token: string }> {
  try {
    // Get credential from database
    const credentialId = Buffer.from(response.id, 'base64url').toString('base64url');
    const credential = await webAuthnCredentialRepository.findByCredentialId(credentialId);
    
    if (!credential) {
      throw new Error('Credential not found');
    }

    // Get user
    const user = await userRepository.findById(credential.user_id);
    if (!user) {
      throw new Error('User not found');
    }

    // Get stored challenge
    const challengeKey = username || 'default';
    const expectedChallenge = authenticationChallenges.get(challengeKey);
    if (!expectedChallenge) {
      throw new Error('Authentication challenge not found');
    }

    // Verify authentication response
    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge,
      expectedOrigin,
      expectedRPID: rpID,
      authenticator: {
        credentialID: Buffer.from(credential.credential_id, 'base64url'),
        credentialPublicKey: Buffer.from(credential.public_key, 'base64url'),
        counter: credential.counter,
        transports: credential.transports,
      },
      requireUserVerification: true,
    });

    if (verification.verified) {
      // Update counter
      await webAuthnCredentialRepository.updateCounter(credential.credential_id, verification.authenticationInfo.newCounter);

      // Generate token for user
      const token = authService.generateToken(user);

      // Remove challenge
      authenticationChallenges.delete(challengeKey);

      return { verification, user, token };
    } else {
      throw new Error('Authentication failed');
    }
  } catch (error) {
    logger.error('Error verifying authentication:', error);
    throw error;
  }
}

/**
 * Get all credentials for a user
 */
async function getUserCredentials(userId: number): Promise<any[]> {
  try {
    const credentials = await webAuthnCredentialRepository.findAllByUserId(userId);
    
    // Format for client display (exclude sensitive data)
    return credentials.map((cred) => ({
      id: cred.credential_id,
      name: cred.name,
      deviceType: cred.credential_device_type,
      createdAt: cred.created_at,
      lastUsedAt: cred.last_used_at,
    }));
  } catch (error) {
    logger.error('Error getting user credentials:', error);
    throw error;
  }
}

/**
 * Delete a credential
 */
async function deleteCredential(userId: number, credentialId: string): Promise<boolean> {
  try {
    // Verify credential belongs to user
    const credential = await webAuthnCredentialRepository.findByCredentialId(credentialId);
    if (!credential || credential.user_id !== userId) {
      throw new Error('Credential not found or does not belong to user');
    }

    // Delete credential
    await webAuthnCredentialRepository.deleteByCredentialId(credentialId);

    // Check if user has any credentials left
    const hasCredentials = await webAuthnCredentialRepository.userHasCredentials(userId);
    
    // If no credentials left, disable WebAuthn for user
    if (!hasCredentials) {
      await webAuthnCredentialRepository.disableWebAuthnForUser(userId);
    }

    return true;
  } catch (error) {
    logger.error('Error deleting credential:', error);
    return false;
  }
}

/**
 * Rename a credential
 */
async function renameCredential(userId: number, credentialId: string, name: string): Promise<boolean> {
  try {
    // Verify credential belongs to user
    const credential = await webAuthnCredentialRepository.findByCredentialId(credentialId);
    if (!credential || credential.user_id !== userId) {
      throw new Error('Credential not found or does not belong to user');
    }

    // Rename credential
    await webAuthnCredentialRepository.renameCredential(credentialId, name);

    return true;
  } catch (error) {
    logger.error('Error renaming credential:', error);
    return false;
  }
}

/**
 * Check if user has WebAuthn enabled
 */
async function isWebAuthnEnabled(userId: number): Promise<boolean> {
  try {
    const user = await userRepository.findById(userId);
    return user ? !!user.webauthn_enabled : false;
  } catch (error) {
    logger.error('Error checking if WebAuthn is enabled:', error);
    return false;
  }
}

export default {
  generateRegistrationOpts,
  verifyRegistration,
  generateAuthenticationOpts,
  verifyAuthentication,
  getUserCredentials,
  deleteCredential,
  renameCredential,
  isWebAuthnEnabled,
};