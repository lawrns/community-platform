/**
 * Environment Configuration
 * Loads and validates environment variables for the application
 */

import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Define environment variable schema for validation
const envSchema = z.object({
  // Core Application
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  API_URL: z.string().url(),
  FRONTEND_URL: z.string().url(),
  
  // Database
  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number().default(5432),
  DB_NAME: z.string().min(1),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string(),
  
  // Authentication
  AUTH_SECRET: z.string().min(16),
  AUTH_EXPIRES_IN: z.string().default('7d'),
  AUTH_PROVIDER: z.enum(['auth0', 'cognito']),
  AUTH0_DOMAIN: z.string().optional(),
  AUTH0_CLIENT_ID: z.string().optional(),
  AUTH0_CLIENT_SECRET: z.string().optional(),
  
  // Storage
  STORAGE_PROVIDER: z.enum(['s3', 'local']).default('local'),
  S3_BUCKET: z.string().optional(),
  S3_REGION: z.string().optional(),
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),
  
  // Email
  EMAIL_PROVIDER: z.enum(['postmark', 'sendgrid', 'ses']),
  POSTMARK_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().email(),
  
  // Redis
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional(),
  
  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug']).default('info'),
  
  // AI Services
  AI_MODERATION_ENABLED: z.coerce.boolean().default(false),
  OPENAI_API_KEY: z.string().optional(),
  MODERATION_MODEL: z.string().optional(),
  
  // Content Recommendation
  RECOMMENDATION_SERVICE_URL: z.string().url().optional(),
  RECOMMENDATION_API_KEY: z.string().optional(),
  
  // Semantic Search
  VECTOR_SEARCH_ENABLED: z.coerce.boolean().default(false),
  EMBEDDING_MODEL: z.string().default('text-embedding-3-small'),
  VECTOR_SIMILARITY_THRESHOLD: z.coerce.number().default(0.75),
  
  // Feature Flags
  FEATURE_LIVE_EVENTS: z.coerce.boolean().default(false),
  FEATURE_EDUCATIONAL_COHORTS: z.coerce.boolean().default(false),
  FEATURE_NATIVE_APPS: z.coerce.boolean().default(false),
  FEATURE_API_MARKETPLACE: z.coerce.boolean().default(false),
  FEATURE_ENTERPRISE_SPACES: z.coerce.boolean().default(false),
  
  // Performance
  CACHE_TTL: z.coerce.number().default(3600),
  MAX_UPLOAD_SIZE: z.coerce.number().default(5 * 1024 * 1024), // 5MB
  RATE_LIMIT_WINDOW: z.coerce.number().default(60000), // 1 minute
  RATE_LIMIT_MAX: z.coerce.number().default(100), // 100 requests per minute
  
  // Supabase
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1)
});

// Parse and validate environment variables
type Environment = z.infer<typeof envSchema>;

let env: Environment;

try {
  env = envSchema.parse(process.env);
  console.log('Environment variables loaded successfully');
} catch (error) {
  console.error('Error validating environment variables:', error);
  process.exit(1);
}

export default env;
export const config = env;