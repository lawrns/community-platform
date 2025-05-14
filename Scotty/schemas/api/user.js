/**
 * User API Schema Definitions
 * 
 * This file contains type definitions and schema validation for user-related API endpoints.
 * These schemas are shared between frontend and backend to ensure consistency.
 */

// User entity schema
const userSchema = {
  type: 'object',
  required: ['id', 'username', 'email', 'role', 'createdAt'],
  properties: {
    id: { type: 'string', format: 'uuid' },
    username: { type: 'string', minLength: 3, maxLength: 50 },
    email: { type: 'string', format: 'email' },
    role: { type: 'string', enum: ['admin', 'user', 'guest'] },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' }
  }
};

// User create request schema
const userCreateRequestSchema = {
  type: 'object',
  required: ['username', 'email', 'password'],
  properties: {
    username: { type: 'string', minLength: 3, maxLength: 50 },
    email: { type: 'string', format: 'email' },
    password: { type: 'string', minLength: 8 },
    role: { type: 'string', enum: ['user', 'guest'] }
  }
};

// User create response schema
const userCreateResponseSchema = {
  type: 'object',
  required: ['id', 'success'],
  properties: {
    id: { type: 'string', format: 'uuid' },
    success: { type: 'boolean' },
    message: { type: 'string' }
  }
};

// User update request schema
const userUpdateRequestSchema = {
  type: 'object',
  properties: {
    username: { type: 'string', minLength: 3, maxLength: 50 },
    email: { type: 'string', format: 'email' },
    password: { type: 'string', minLength: 8 },
    role: { type: 'string', enum: ['admin', 'user', 'guest'] }
  }
};

// User authentication request schema
const userAuthRequestSchema = {
  type: 'object',
  required: ['email', 'password'],
  properties: {
    email: { type: 'string', format: 'email' },
    password: { type: 'string' }
  }
};

// User authentication response schema
const userAuthResponseSchema = {
  type: 'object',
  required: ['token', 'user'],
  properties: {
    token: { type: 'string' },
    refreshToken: { type: 'string' },
    user: userSchema
  }
};

// Export schemas for use in both frontend and backend
module.exports = {
  userSchema,
  userCreateRequestSchema,
  userCreateResponseSchema,
  userUpdateRequestSchema,
  userAuthRequestSchema,
  userAuthResponseSchema
};

// Type definitions in JSDoc format for TypeScript-like intellisense in JS

/**
 * @typedef {Object} User
 * @property {string} id - Unique identifier for the user
 * @property {string} username - Username
 * @property {string} email - User's email address
 * @property {'admin'|'user'|'guest'} role - User's role in the system
 * @property {string} createdAt - ISO date string of when the user was created
 * @property {string} [updatedAt] - ISO date string of when the user was last updated
 */

/**
 * @typedef {Object} UserCreateRequest
 * @property {string} username - Username (3-50 characters)
 * @property {string} email - User's email address
 * @property {string} password - Password (minimum 8 characters)
 * @property {'user'|'guest'} [role] - User's role in the system
 */

/**
 * @typedef {Object} UserCreateResponse
 * @property {string} id - Unique identifier for the created user
 * @property {boolean} success - Whether the creation was successful
 * @property {string} [message] - Optional message with additional information
 */

/**
 * @typedef {Object} UserUpdateRequest
 * @property {string} [username] - Username (3-50 characters)
 * @property {string} [email] - User's email address
 * @property {string} [password] - Password (minimum 8 characters)
 * @property {'admin'|'user'|'guest'} [role] - User's role in the system
 */

/**
 * @typedef {Object} UserAuthRequest
 * @property {string} email - User's email address
 * @property {string} password - User's password
 */

/**
 * @typedef {Object} UserAuthResponse
 * @property {string} token - JWT token for authentication
 * @property {string} refreshToken - Refresh token for obtaining new JWT tokens
 * @property {User} user - User information
 */
