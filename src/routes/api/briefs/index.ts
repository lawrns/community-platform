/**
 * Daily Brief API Routes
 * Provides endpoints for accessing and interacting with AI-powered daily briefs
 */

import { Router } from 'express';
import { asyncHandler } from '../../../utils/asyncHandler';
import { authenticateJWT, requireVerified } from '../../../middlewares/auth/authMiddleware';
import { dailyBriefService } from '../../../services/recommendations/dailyBriefService';
import { dailyBriefRepository } from '../../../models/DailyBriefRepository';
import logger from '../../../config/logger';
import { param, query, body } from 'express-validator';
import { z } from 'zod';
import { validate } from '../../../middlewares/validation';

const router = Router();

// Input validation schema for brief preferences
const briefPreferencesSchema = z.object({
  enabled: z.boolean().optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
  content_types: z.array(z.string()).optional(),
  preferred_time: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/).optional(),
  preferred_timezone: z.string().optional(),
  max_items: z.number().int().min(1).max(20).optional(),
  email_delivery: z.boolean().optional()
});

/**
 * @route   GET /api/briefs/latest
 * @desc    Get the latest brief for the authenticated user
 * @access  Private
 */
router.get(
  '/latest',
  authenticateJWT,
  asyncHandler(async (req, res) => {
    const startTime = Date.now();
    const userId = req.user.id;

    try {
      // Get the latest brief for the user
      const brief = await dailyBriefService.getUserBrief(userId.toString());

      if (!brief) {
        return res.status(404).json({
          success: false,
          error: 'No brief found'
        });
      }

      // Prepare response
      const response = {
        success: true,
        brief: brief.brief,
        items: brief.items,
        meta: {
          timing: {
            total: Date.now() - startTime
          }
        }
      };

      return res.json(response);
    } catch (error) {
      logger.error('Error getting latest brief:', error);
      throw error;
    }
  })
);

/**
 * @route   POST /api/briefs/generate
 * @desc    Manually generate a new brief for the authenticated user
 * @access  Private
 */
router.post(
  '/generate',
  authenticateJWT,
  requireVerified,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;

    try {
      // Generate a new brief
      const brief = await dailyBriefService.generateBrief(userId.toString());

      if (!brief) {
        return res.status(400).json({
          success: false,
          error: 'Failed to generate brief'
        });
      }

      return res.json({
        success: true,
        brief,
        message: 'Brief generated successfully'
      });
    } catch (error) {
      logger.error('Error generating brief:', error);
      throw error;
    }
  })
);

/**
 * @route   GET /api/briefs/:briefId
 * @desc    Get a specific brief by ID
 * @access  Private
 */
router.get(
  '/:briefId',
  authenticateJWT,
  [
    param('briefId').isUUID().withMessage('Brief ID must be a valid UUID')
  ],
  validate,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const briefId = req.params.briefId;

    try {
      // Get the brief with its items
      const brief = await dailyBriefRepository.getBriefWithItems(briefId);

      if (!brief) {
        return res.status(404).json({
          success: false,
          error: 'Brief not found'
        });
      }

      // Verify the user owns this brief
      if (brief.brief.user_id !== userId.toString()) {
        return res.status(403).json({
          success: false,
          error: 'You do not have permission to view this brief'
        });
      }

      return res.json({
        success: true,
        brief: brief.brief,
        items: brief.items
      });
    } catch (error) {
      logger.error('Error getting brief by ID:', error);
      throw error;
    }
  })
);

/**
 * @route   POST /api/briefs/:briefId/read
 * @desc    Mark a brief as read
 * @access  Private
 */
router.post(
  '/:briefId/read',
  authenticateJWT,
  [
    param('briefId').isUUID().withMessage('Brief ID must be a valid UUID')
  ],
  validate,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const briefId = req.params.briefId;

    try {
      // Check if the brief exists and belongs to the user
      const brief = await dailyBriefRepository.getBriefWithItems(briefId);

      if (!brief || brief.brief.user_id !== userId.toString()) {
        return res.status(404).json({
          success: false,
          error: 'Brief not found or you do not have permission to access it'
        });
      }

      // Mark the brief as read
      await dailyBriefService.markBriefAsRead(briefId, userId.toString());

      return res.json({
        success: true,
        message: 'Brief marked as read'
      });
    } catch (error) {
      logger.error('Error marking brief as read:', error);
      throw error;
    }
  })
);

/**
 * @route   POST /api/briefs/items/:itemId/interact
 * @desc    Record an interaction with a brief item
 * @access  Private
 */
router.post(
  '/items/:itemId/interact',
  authenticateJWT,
  [
    param('itemId').isUUID().withMessage('Item ID must be a valid UUID'),
    body('interaction').isIn(['click', 'save', 'share', 'dismiss']).withMessage('Invalid interaction type')
  ],
  validate,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const itemId = req.params.itemId;
    const interaction = req.body.interaction as 'click' | 'save' | 'share' | 'dismiss';

    try {
      // Record the interaction
      const success = await dailyBriefService.recordItemInteraction(itemId, userId.toString(), interaction);

      if (!success) {
        return res.status(400).json({
          success: false,
          error: 'Failed to record interaction'
        });
      }

      return res.json({
        success: true,
        message: 'Interaction recorded'
      });
    } catch (error) {
      logger.error('Error recording item interaction:', error);
      throw error;
    }
  })
);

/**
 * @route   GET /api/briefs/preferences
 * @desc    Get user's brief preferences
 * @access  Private
 */
router.get(
  '/preferences',
  authenticateJWT,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;

    try {
      // Get the user's preferences
      const preferences = await dailyBriefRepository.getUserBriefPreferences(userId.toString());

      return res.json({
        success: true,
        preferences
      });
    } catch (error) {
      logger.error('Error getting brief preferences:', error);
      throw error;
    }
  })
);

/**
 * @route   PUT /api/briefs/preferences
 * @desc    Update user's brief preferences
 * @access  Private
 */
router.put(
  '/preferences',
  authenticateJWT,
  requireVerified,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    
    try {
      // Validate the incoming preferences
      const validatedPreferences = briefPreferencesSchema.parse(req.body);
      
      // Update the preferences
      const updatedPreferences = await dailyBriefService.updateBriefPreferences(
        userId.toString(),
        validatedPreferences
      );
      
      return res.json({
        success: true,
        preferences: updatedPreferences,
        message: 'Preferences updated successfully'
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Invalid preferences format',
          details: error.errors
        });
      }
      
      logger.error('Error updating brief preferences:', error);
      throw error;
    }
  })
);

/**
 * @route   GET /api/briefs/history
 * @desc    Get brief history for the authenticated user
 * @access  Private
 */
router.get(
  '/history',
  authenticateJWT,
  [
    query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be between 1 and 20'),
    query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be a non-negative number'),
    query('includeExpired').optional().isBoolean().withMessage('includeExpired must be a boolean')
  ],
  validate,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    const includeExpired = req.query.includeExpired === 'true';
    
    try {
      // Get the user's brief history
      const briefs = await dailyBriefRepository.getUserBriefs(
        userId.toString(),
        limit,
        offset,
        includeExpired
      );
      
      return res.json({
        success: true,
        briefs,
        meta: {
          count: briefs.length,
          limit,
          offset
        }
      });
    } catch (error) {
      logger.error('Error getting brief history:', error);
      throw error;
    }
  })
);

export default router;