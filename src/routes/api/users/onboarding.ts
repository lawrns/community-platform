/**
 * User Onboarding API Routes
 * Handles user onboarding process and interest collection
 */

import { Router } from 'express';
import { asyncHandler } from '../../../utils/asyncHandler';
import { authenticateJWT } from '../../../middlewares/auth/authMiddleware';
import logger from '../../../config/logger';
import { z } from 'zod';

const router = Router();

// Input validation schema for user interests
const interestsSchema = z.object({
  topics: z.array(z.number()).optional().default([]),
  tags: z.array(z.number()).optional().default([]),
  toolCategories: z.array(z.number()).optional().default([]),
  experienceLevel: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
  aiInterests: z.array(z.string()).optional()
});

/**
 * @route   POST /api/users/onboarding/interests
 * @desc    Save user's interests during onboarding
 * @access  Private
 */
router.post('/interests', authenticateJWT, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  
  try {
    // Validate input parameters
    const interests = interestsSchema.parse(req.body);
    
    // Start a transaction
    await req.db.transaction(async (client) => {
      // Clear existing interests
      await client.query(
        `DELETE FROM user_interests WHERE user_id = $1`,
        [userId]
      );
      
      // Insert topic interests
      if (interests.topics.length > 0) {
        // Verify topics exist and insert them
        const topics = await client.query(
          `SELECT id FROM topics WHERE id = ANY($1)`,
          [interests.topics]
        );
        
        const validTopicIds = topics.rows.map(row => row.id);
        
        for (const topicId of validTopicIds) {
          await client.query(
            `INSERT INTO user_interests (user_id, interest_type, interest_id, strength, created_at, updated_at)
             VALUES ($1, 'topic', $2, 1.0, NOW(), NOW())
             ON CONFLICT (user_id, interest_type, interest_id) 
             DO UPDATE SET strength = 1.0, updated_at = NOW()`,
            [userId, topicId]
          );
          
          // Also follow the topic
          await client.query(
            `INSERT INTO user_topic_follows (user_id, topic_id, created_at)
             VALUES ($1, $2, NOW())
             ON CONFLICT (user_id, topic_id) DO NOTHING`,
            [userId, topicId]
          );
        }
      }
      
      // Insert tag interests
      if (interests.tags.length > 0) {
        // Verify tags exist and insert them
        const tags = await client.query(
          `SELECT id FROM tags WHERE id = ANY($1)`,
          [interests.tags]
        );
        
        const validTagIds = tags.rows.map(row => row.id);
        
        for (const tagId of validTagIds) {
          await client.query(
            `INSERT INTO user_interests (user_id, interest_type, interest_id, strength, created_at, updated_at)
             VALUES ($1, 'tag', $2, 1.0, NOW(), NOW())
             ON CONFLICT (user_id, interest_type, interest_id) 
             DO UPDATE SET strength = 1.0, updated_at = NOW()`,
            [userId, tagId]
          );
          
          // Also follow the tag
          await client.query(
            `INSERT INTO user_tag_follows (user_id, tag_id, created_at)
             VALUES ($1, $2, NOW())
             ON CONFLICT (user_id, tag_id) DO NOTHING`,
            [userId, tagId]
          );
        }
      }
      
      // Insert tool category interests
      if (interests.toolCategories.length > 0) {
        for (const categoryId of interests.toolCategories) {
          await client.query(
            `INSERT INTO user_interests (user_id, interest_type, interest_id, strength, created_at, updated_at)
             VALUES ($1, 'tool_category', $2, 1.0, NOW(), NOW())
             ON CONFLICT (user_id, interest_type, interest_id) 
             DO UPDATE SET strength = 1.0, updated_at = NOW()`,
            [userId, categoryId]
          );
        }
      }
      
      // Update user's experience level
      if (interests.experienceLevel) {
        await client.query(
          `UPDATE users SET metadata = jsonb_set(
             COALESCE(metadata, '{}'), 
             '{experienceLevel}', 
             $1::jsonb
           ) WHERE id = $2`,
          [JSON.stringify(interests.experienceLevel), userId]
        );
      }
      
      // Update user's AI interests
      if (interests.aiInterests && interests.aiInterests.length > 0) {
        await client.query(
          `UPDATE users SET metadata = jsonb_set(
             COALESCE(metadata, '{}'), 
             '{aiInterests}', 
             $1::jsonb
           ) WHERE id = $2`,
          [JSON.stringify(interests.aiInterests), userId]
        );
      }
      
      // Mark onboarding as completed
      await client.query(
        `UPDATE users SET metadata = jsonb_set(
           COALESCE(metadata, '{}'), 
           '{onboardingCompleted}', 
           'true'::jsonb
         ) WHERE id = $1`,
        [userId]
      );
    });
    
    // Return success
    return res.json({
      success: true,
      message: "User interests saved successfully"
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid interest data',
        details: error.errors
      });
    }
    
    logger.error('Error saving user interests:', error);
    throw error;
  }
}));

/**
 * @route   GET /api/users/onboarding/popular-interests
 * @desc    Get popular topics and tags for onboarding
 * @access  Private
 */
router.get('/popular-interests', authenticateJWT, asyncHandler(async (req, res) => {
  try {
    // Get popular topics
    const popularTopics = await req.db.query(
      `SELECT t.id, t.name, t.slug, t.description,
        COUNT(ct.content_id) as content_count,
        COUNT(DISTINCT utf.user_id) as follower_count
       FROM topics t
       LEFT JOIN content_topics ct ON t.id = ct.topic_id
       LEFT JOIN user_topic_follows utf ON t.id = utf.topic_id
       GROUP BY t.id
       ORDER BY follower_count DESC, content_count DESC
       LIMIT 15`
    );
    
    // Get popular tags
    const popularTags = await req.db.query(
      `SELECT t.id, t.name, t.slug, t.description,
        COUNT(ct.content_id) as content_count,
        COUNT(DISTINCT utf.user_id) as follower_count
       FROM tags t
       LEFT JOIN content_tags ct ON t.id = ct.tag_id
       LEFT JOIN user_tag_follows utf ON t.id = utf.tag_id
       GROUP BY t.id
       ORDER BY follower_count DESC, content_count DESC
       LIMIT 20`
    );
    
    // Get tool categories
    const toolCategories = await req.db.query(
      `SELECT DISTINCT jsonb_object_keys(features) as category
       FROM tools
       WHERE status = 'active'
       AND features IS NOT NULL`
    );
    
    // Return data for onboarding
    return res.json({
      success: true,
      topics: popularTopics.rows,
      tags: popularTags.rows,
      toolCategories: toolCategories.rows.map(row => row.category)
    });
  } catch (error) {
    logger.error('Error getting popular interests:', error);
    throw error;
  }
}));

/**
 * @route   GET /api/users/onboarding/status
 * @desc    Check if user has completed onboarding
 * @access  Private
 */
router.get('/status', authenticateJWT, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  
  try {
    // Get user's onboarding status
    const result = await req.db.query(
      `SELECT metadata->>'onboardingCompleted' as onboarding_completed FROM users WHERE id = $1`,
      [userId]
    );
    
    const onboardingCompleted = result.rows.length > 0 && 
      result.rows[0].onboarding_completed === 'true';
    
    return res.json({
      success: true,
      onboardingCompleted
    });
  } catch (error) {
    logger.error('Error checking onboarding status:', error);
    throw error;
  }
}));

export default router;