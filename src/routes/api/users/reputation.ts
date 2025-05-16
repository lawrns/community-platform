import { Router } from 'express';
import { param, query } from 'express-validator';
import { authenticate, requireVerified } from '../../../middlewares/auth/authMiddleware';
import { asyncHandler } from '../../../utils/asyncHandler';
import { reputationRepository } from '../../../models/repositories';
import { PrivilegeType } from '../../../models/ReputationRepository';
import { badgeRepository } from '../../../models/repositories';

const router = Router();

/**
 * @route GET /api/users/:userId/reputation/history
 * @desc Get reputation history for a user
 * @access Private
 */
router.get(
  '/:userId/reputation/history',
  authenticate,
  [
    param('userId').isNumeric().withMessage('User ID must be a number'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
    query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be a non-negative number'),
  ],
  asyncHandler(async (req, res) => {
    const userId = parseInt(req.params.userId);
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    
    // Only allow users to view their own reputation history or admins/moderators
    if (req.user?.id !== userId && !req.user?.isAdmin && !req.user?.isModerator) {
      return res.status(403).json({ error: 'Unauthorized to view this user\'s reputation history' });
    }
    
    const history = await reputationRepository.getReputationHistory(userId, limit, offset);
    
    return res.json({
      success: true,
      data: history
    });
  })
);

/**
 * @route GET /api/users/:userId/reputation/stats
 * @desc Get reputation statistics for a user
 * @access Public
 */
router.get(
  '/:userId/reputation/stats',
  [
    param('userId').isNumeric().withMessage('User ID must be a number'),
  ],
  asyncHandler(async (req, res) => {
    const userId = parseInt(req.params.userId);
    const stats = await reputationRepository.getReputationStats(userId);
    
    return res.json({
      success: true,
      data: stats
    });
  })
);

/**
 * @route GET /api/users/:userId/privileges
 * @desc Get privileges for a user
 * @access Public
 */
router.get(
  '/:userId/privileges',
  [
    param('userId').isNumeric().withMessage('User ID must be a number'),
  ],
  asyncHandler(async (req, res) => {
    const userId = parseInt(req.params.userId);
    const privileges = await reputationRepository.getUserPrivileges(userId);
    
    return res.json({
      success: true,
      data: {
        privileges,
        thresholds: {
          [PrivilegeType.CREATE_POST]: 1,
          [PrivilegeType.UPVOTE]: 15,
          [PrivilegeType.COMMENT]: 50,
          [PrivilegeType.FLAG_CONTENT]: 50,
          [PrivilegeType.DOWNVOTE]: 125,
          [PrivilegeType.EDIT_OTHERS]: 1000,
          [PrivilegeType.MODERATION_TOOLS]: 2000,
          [PrivilegeType.TRUSTED_USER]: 5000,
        }
      }
    });
  })
);

/**
 * @route GET /api/users/:userId/badges
 * @desc Get badges for a user
 * @access Public
 */
router.get(
  '/:userId/badges',
  [
    param('userId').isNumeric().withMessage('User ID must be a number'),
  ],
  asyncHandler(async (req, res) => {
    const userId = parseInt(req.params.userId);
    const badges = await badgeRepository.getUserBadges(userId);
    
    return res.json({
      success: true,
      data: badges
    });
  })
);

/**
 * @route POST /api/users/:userId/badges/check
 * @desc Check and award eligible badges for a user
 * @access Private (self or admin)
 */
router.post(
  '/:userId/badges/check',
  authenticate,
  requireVerified,
  [
    param('userId').isNumeric().withMessage('User ID must be a number'),
  ],
  asyncHandler(async (req, res) => {
    const userId = parseInt(req.params.userId);
    
    // Only allow users to check their own badges or admins
    if (req.user?.id !== userId && !req.user?.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized to check badges for this user' });
    }
    
    const awardedBadges = await badgeRepository.checkAllBadges(userId);
    const newBadges = awardedBadges.length > 0 ? await Promise.all(
      awardedBadges.map(id => badgeRepository.getBadgeById(id))
    ) : [];
    
    return res.json({
      success: true,
      data: {
        awardedCount: awardedBadges.length,
        newBadges
      }
    });
  })
);

export default router;