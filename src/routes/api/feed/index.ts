/**
 * Feed API Routes
 * Provides personalized content feed and recommendations
 */

import { Router } from 'express';
import { asyncHandler } from '../../../utils/asyncHandler';
import { authenticateJWT } from '../../../middlewares/auth/authMiddleware';
import { recommendationService } from '../../../services/recommendations/recommendationService';
import logger from '../../../config/logger';
import { z } from 'zod';

const router = Router();

// Input validation schema for feed requests
const feedSchema = z.object({
  limit: z.number().int().min(1).max(50).optional().default(20),
  offset: z.number().int().min(0).optional().default(0),
  contentTypes: z.array(z.string()).optional(),
  freshContentRatio: z.number().min(0).max(1).optional().default(0.3),
  includeFollowing: z.boolean().optional().default(true),
  includeTrending: z.boolean().optional().default(true)
});

/**
 * @route   GET /api/feed
 * @desc    Get personalized feed for the authenticated user
 * @access  Private
 */
router.get('/', authenticateJWT, asyncHandler(async (req, res) => {
  const startTime = Date.now();
  const userId = req.user.id;

  try {
    // Validate query parameters
    const params = feedSchema.parse({
      limit: req.query.limit ? parseInt(req.query.limit.toString()) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset.toString()) : undefined,
      contentTypes: req.query.contentTypes ? JSON.parse(req.query.contentTypes.toString()) : undefined,
      freshContentRatio: req.query.freshContentRatio ? parseFloat(req.query.freshContentRatio.toString()) : undefined,
      includeFollowing: req.query.includeFollowing !== 'false',
      includeTrending: req.query.includeTrending !== 'false'
    });

    // Get recommendations
    const recommendations = await recommendationService.getRecommendations(userId, {
      limit: params.limit,
      offset: params.offset,
      includeContentTypes: params.contentTypes,
      freshContentRatio: params.freshContentRatio
    });

    // Get feed settings to shape the response
    const userSettings = await req.db.query(
      `SELECT feed_preferences FROM user_settings WHERE user_id = $1`,
      [userId]
    );

    const feedPreferences = userSettings.rows.length > 0 
      ? userSettings.rows[0].feed_preferences
      : {
          showTrending: true,
          showFollowing: true,
          contentTypes: ['question', 'post', 'tutorial'],
          hideViewed: false,
          freshContentRatio: 0.3
        };

    // Prepare response
    const response = {
      success: true,
      recommendations,
      meta: {
        count: recommendations.length,
        preferences: feedPreferences,
        timing: {
          total: Date.now() - startTime
        }
      }
    };

    return res.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid feed parameters',
        details: error.errors
      });
    }

    logger.error('Feed API error:', error);
    throw error;
  }
}));

/**
 * @route   GET /api/feed/trending
 * @desc    Get trending content
 * @access  Public
 */
router.get('/trending', asyncHandler(async (req, res) => {
  const startTime = Date.now();

  try {
    // Validate query parameters
    const params = feedSchema.parse({
      limit: req.query.limit ? parseInt(req.query.limit.toString()) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset.toString()) : undefined,
      contentTypes: req.query.contentTypes ? JSON.parse(req.query.contentTypes.toString()) : undefined
    });

    // Get trending content
    const trendingContent = await recommendationService.getTrendingContent(
      params.limit,
      params.offset,
      params.contentTypes
    );

    // Prepare response
    const response = {
      success: true,
      content: trendingContent,
      meta: {
        count: trendingContent.length,
        timing: {
          total: Date.now() - startTime
        }
      }
    };

    return res.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid trending parameters',
        details: error.errors
      });
    }

    logger.error('Trending feed API error:', error);
    throw error;
  }
}));

/**
 * @route   GET /api/feed/following
 * @desc    Get content from followed users, topics, and tags
 * @access  Private
 */
router.get('/following', authenticateJWT, asyncHandler(async (req, res) => {
  const startTime = Date.now();
  const userId = req.user.id;

  try {
    // Validate query parameters
    const params = feedSchema.parse({
      limit: req.query.limit ? parseInt(req.query.limit.toString()) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset.toString()) : undefined,
      contentTypes: req.query.contentTypes ? JSON.parse(req.query.contentTypes.toString()) : undefined
    });

    // Get user's followed entities
    const [followedUsers, followedTopics, followedTags] = await Promise.all([
      req.db.query(
        `SELECT followed_id FROM user_follows WHERE follower_id = $1`,
        [userId]
      ),
      req.db.query(
        `SELECT topic_id FROM user_topic_follows WHERE user_id = $1`,
        [userId]
      ),
      req.db.query(
        `SELECT tag_id FROM user_tag_follows WHERE user_id = $1`,
        [userId]
      )
    ]);

    const userIds = followedUsers.rows.map(row => row.followed_id);
    const topicIds = followedTopics.rows.map(row => row.topic_id);
    const tagIds = followedTags.rows.map(row => row.tag_id);

    // If user doesn't follow anything, return empty response
    if (userIds.length === 0 && topicIds.length === 0 && tagIds.length === 0) {
      return res.json({
        success: true,
        content: [],
        meta: {
          count: 0,
          timing: {
            total: Date.now() - startTime
          }
        }
      });
    }

    // Build query to get content from followed entities
    let query = `
      SELECT DISTINCT c.*, 
        u.username,
        u.name AS author_name,
        u.avatar_url,
        ARRAY(
          SELECT t.name 
          FROM tags t
          JOIN content_tags ct ON t.id = ct.tag_id
          WHERE ct.content_id = c.id
        ) AS tags
      FROM content c
      JOIN users u ON c.author_id = u.id
      LEFT JOIN content_topics ct ON c.id = ct.content_id
      LEFT JOIN content_tags ctg ON c.id = ctg.content_id
      WHERE c.status = 'published'
    `;

    const queryParams: any[] = [];
    let conditions: string[] = [];

    // Add content types filter
    if (params.contentTypes && params.contentTypes.length > 0) {
      queryParams.push(params.contentTypes);
      conditions.push(`c.type = ANY($${queryParams.length})`);
    }

    // Add followed users condition
    if (userIds.length > 0) {
      queryParams.push(userIds);
      conditions.push(`c.author_id = ANY($${queryParams.length})`);
    }

    // Add followed topics condition
    if (topicIds.length > 0) {
      queryParams.push(topicIds);
      conditions.push(`ct.topic_id = ANY($${queryParams.length})`);
    }

    // Add followed tags condition
    if (tagIds.length > 0) {
      queryParams.push(tagIds);
      conditions.push(`ctg.tag_id = ANY($${queryParams.length})`);
    }

    // Combine conditions with OR
    if (conditions.length > 0) {
      query += ` AND (${conditions.join(' OR ')})`;
    }

    // Add order, limit and offset
    query += ` ORDER BY c.created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(params.limit, params.offset);

    // Execute query
    const result = await req.db.query(query, queryParams);

    // Prepare response
    const response = {
      success: true,
      content: result.rows,
      meta: {
        count: result.rows.length,
        following: {
          users: userIds.length,
          topics: topicIds.length,
          tags: tagIds.length
        },
        timing: {
          total: Date.now() - startTime
        }
      }
    };

    return res.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid following parameters',
        details: error.errors
      });
    }

    logger.error('Following feed API error:', error);
    throw error;
  }
}));

/**
 * @route   POST /api/feed/view/:contentId
 * @desc    Record that a user viewed content (for personalization)
 * @access  Private
 */
router.post('/view/:contentId', authenticateJWT, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const contentId = parseInt(req.params.contentId);

  if (isNaN(contentId)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid content ID'
    });
  }

  // Record view
  await recommendationService.recordContentView(userId, contentId);

  return res.json({
    success: true
  });
}));

export default router;