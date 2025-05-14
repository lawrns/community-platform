/**
 * @fileoverview User schema definitions for the community.io API
 * @description Defines the schema for user-related API endpoints and database models
 */

const Joi = require('joi');

/**
 * Base user schema for validation
 */
const userSchema = {
  id: Joi.string().uuid().description('Unique user identifier'),
  email: Joi.string().email().required().description('User email address'),
  name: Joi.string().min(2).max(100).required().description('User display name'),
  password: Joi.string().min(8).max(100).description('User password (only used for registration/update)'),
  created_at: Joi.date().iso().description('User creation timestamp'),
  updated_at: Joi.date().iso().description('User last update timestamp'),
  last_login: Joi.date().iso().allow(null).description('User last login timestamp'),
  email_verified: Joi.boolean().default(false).description('Whether user email is verified'),
  reputation: Joi.number().integer().min(0).default(0).description('User reputation points'),
  profile: Joi.object({
    bio: Joi.string().max(500).allow('').description('User biography'),
    avatar_url: Joi.string().uri().allow('').description('User avatar URL'),
    location: Joi.string().max(100).allow('').description('User location'),
    website: Joi.string().uri().allow('').description('User website URL'),
    social: Joi.object({
      twitter: Joi.string().allow('').description('Twitter username'),
      github: Joi.string().allow('').description('GitHub username'),
      linkedin: Joi.string().allow('').description('LinkedIn username')
    }).description('User social media profiles')
  }).description('User profile information'),
  preferences: Joi.object({
    email_notifications: Joi.object({
      digest: Joi.string().valid('daily', 'weekly', 'never').default('daily').description('Email digest frequency'),
      mentions: Joi.boolean().default(true).description('Email notifications for mentions'),
      replies: Joi.boolean().default(true).description('Email notifications for replies'),
      upvotes: Joi.boolean().default(false).description('Email notifications for upvotes')
    }).description('Email notification preferences'),
    in_app_notifications: Joi.object({
      mentions: Joi.boolean().default(true).description('In-app notifications for mentions'),
      replies: Joi.boolean().default(true).description('In-app notifications for replies'),
      upvotes: Joi.boolean().default(true).description('In-app notifications for upvotes')
    }).description('In-app notification preferences'),
    display: Joi.object({
      theme: Joi.string().valid('light', 'dark', 'system').default('system').description('UI theme preference'),
      code_theme: Joi.string().valid('github', 'vscode', 'dracula').default('github').description('Code block theme')
    }).description('Display preferences')
  }).description('User preferences')
};

/**
 * Schema for user registration
 */
const userRegistrationSchema = Joi.object({
  email: userSchema.email,
  name: userSchema.name,
  password: userSchema.password.required(),
  profile: Joi.object({
    bio: Joi.string().max(500).allow(''),
    location: Joi.string().max(100).allow('')
  }).optional()
}).description('User registration payload');

/**
 * Schema for user login
 */
const userLoginSchema = Joi.object({
  email: userSchema.email,
  password: userSchema.password.required()
}).description('User login payload');

/**
 * Schema for user profile update
 */
const userUpdateSchema = Joi.object({
  name: userSchema.name.optional(),
  password: userSchema.password.optional(),
  profile: Joi.object({
    bio: Joi.string().max(500).allow(''),
    avatar_url: Joi.string().uri().allow(''),
    location: Joi.string().max(100).allow(''),
    website: Joi.string().uri().allow(''),
    social: Joi.object({
      twitter: Joi.string().allow(''),
      github: Joi.string().allow(''),
      linkedin: Joi.string().allow('')
    }).optional()
  }).optional(),
  preferences: Joi.object({
    email_notifications: Joi.object({
      digest: Joi.string().valid('daily', 'weekly', 'never'),
      mentions: Joi.boolean(),
      replies: Joi.boolean(),
      upvotes: Joi.boolean()
    }).optional(),
    in_app_notifications: Joi.object({
      mentions: Joi.boolean(),
      replies: Joi.boolean(),
      upvotes: Joi.boolean()
    }).optional(),
    display: Joi.object({
      theme: Joi.string().valid('light', 'dark', 'system'),
      code_theme: Joi.string().valid('github', 'vscode', 'dracula')
    }).optional()
  }).optional()
}).description('User profile update payload');

/**
 * Schema for user response (what is returned to the client)
 */
const userResponseSchema = Joi.object({
  id: userSchema.id.required(),
  email: userSchema.email,
  name: userSchema.name,
  created_at: userSchema.created_at.required(),
  updated_at: userSchema.updated_at.required(),
  last_login: userSchema.last_login,
  email_verified: userSchema.email_verified.required(),
  reputation: userSchema.reputation.required(),
  profile: userSchema.profile.required(),
  preferences: userSchema.preferences.required()
}).description('User response payload');

/**
 * Schema for user list response
 */
const userListResponseSchema = Joi.object({
  users: Joi.array().items(userResponseSchema).description('List of users'),
  pagination: Joi.object({
    total: Joi.number().integer().min(0).required().description('Total number of users'),
    page: Joi.number().integer().min(1).required().description('Current page number'),
    limit: Joi.number().integer().min(1).required().description('Number of users per page'),
    pages: Joi.number().integer().min(0).required().description('Total number of pages')
  }).required().description('Pagination information')
}).description('User list response payload');

/**
 * Database model for users
 */
const userModel = {
  tableName: 'users',
  columns: {
    id: { type: 'uuid', primaryKey: true, defaultValue: 'uuid_generate_v4()' },
    email: { type: 'varchar(255)', unique: true, notNull: true },
    name: { type: 'varchar(100)', notNull: true },
    password_hash: { type: 'varchar(255)', notNull: true },
    created_at: { type: 'timestamp', notNull: true, defaultValue: 'now()' },
    updated_at: { type: 'timestamp', notNull: true, defaultValue: 'now()' },
    last_login: { type: 'timestamp' },
    email_verified: { type: 'boolean', notNull: true, defaultValue: false },
    reputation: { type: 'integer', notNull: true, defaultValue: 0 },
    profile: { type: 'jsonb', notNull: true, defaultValue: '{}' },
    preferences: { type: 'jsonb', notNull: true, defaultValue: '{}' }
  },
  indexes: [
    { name: 'users_email_idx', columns: ['email'] },
    { name: 'users_reputation_idx', columns: ['reputation'] }
  ],
  relations: {
    content: { table: 'content', foreignKey: 'author_id', type: 'oneToMany' },
    comments: { table: 'comments', foreignKey: 'author_id', type: 'oneToMany' },
    upvotes: { table: 'upvotes', foreignKey: 'user_id', type: 'oneToMany' },
    badges: { table: 'user_badges', foreignKey: 'user_id', type: 'oneToMany' }
  }
};

module.exports = {
  userSchema,
  userRegistrationSchema,
  userLoginSchema,
  userUpdateSchema,
  userResponseSchema,
  userListResponseSchema,
  userModel
};
