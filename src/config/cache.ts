/**
 * Cache Configuration
 * Sets up and manages Redis cache
 */

import Redis from 'ioredis';
import env from './environment';
import logger from './logger';

// Check if Redis is configured
const isRedisConfigured = !!(env.REDIS_HOST && env.REDIS_PORT);

// Create Redis client if configured
const redisClient = isRedisConfigured 
  ? new Redis({
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      password: env.REDIS_PASSWORD || undefined,
      retryStrategy: (times: number) => {
        // Retry with exponential backoff up to 30 seconds
        const delay = Math.min(times * 50, 30000);
        return delay;
      },
    })
  : null;

// Log connection events if Redis is configured
if (redisClient) {
  redisClient.on('connect', () => {
    logger.info('Connected to Redis cache');
  });

  redisClient.on('error', (err) => {
    logger.error('Redis connection error:', err);
  });
} else {
  logger.warn('Redis not configured. Using memory cache instead.');
}

// Memory cache for fallback when Redis is not configured
const memoryCache: Record<string, { value: any; expiry: number }> = {};

/**
 * Set a value in the cache
 */
async function set<T>(key: string, value: T, ttlSeconds = env.CACHE_TTL): Promise<void> {
  try {
    if (redisClient) {
      await redisClient.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } else {
      // Use memory cache fallback
      memoryCache[key] = {
        value,
        expiry: Date.now() + (ttlSeconds * 1000)
      };
    }
  } catch (error) {
    logger.error(`Cache set error for key ${key}:`, error);
  }
}

/**
 * Get a value from the cache
 */
async function get<T>(key: string): Promise<T | null> {
  try {
    if (redisClient) {
      const data = await redisClient.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } else {
      // Use memory cache fallback
      const item = memoryCache[key];
      if (!item) return null;
      
      // Check if expired
      if (item.expiry < Date.now()) {
        delete memoryCache[key];
        return null;
      }
      
      return item.value as T;
    }
  } catch (error) {
    logger.error(`Cache get error for key ${key}:`, error);
    return null;
  }
}

/**
 * Delete a value from the cache
 */
async function del(key: string): Promise<void> {
  try {
    if (redisClient) {
      await redisClient.del(key);
    } else {
      // Use memory cache fallback
      delete memoryCache[key];
    }
  } catch (error) {
    logger.error(`Cache delete error for key ${key}:`, error);
  }
}

/**
 * Clear the entire cache (use with caution)
 */
async function clear(): Promise<void> {
  try {
    if (redisClient) {
      await redisClient.flushdb();
    } else {
      // Clear memory cache
      Object.keys(memoryCache).forEach(key => delete memoryCache[key]);
    }
    logger.info('Cache cleared successfully');
  } catch (error) {
    logger.error('Cache clear error:', error);
  }
}

/**
 * Close the Redis connection
 */
async function close(): Promise<void> {
  try {
    if (redisClient) {
      await redisClient.quit();
      logger.info('Redis connection closed');
    }
  } catch (error) {
    logger.error('Error closing Redis connection:', error);
  }
}

export default {
  set,
  get,
  del,
  clear,
  close,
  client: redisClient,
  isRedisConfigured,
};