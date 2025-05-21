import { Router } from 'express';
import { param, query } from 'express-validator';
import { authenticate, requireVerified } from '../../../middlewares/auth/authMiddleware';
import { asyncHandler } from '../../../utils/asyncHandler';
import { reputationRepository } from '../../../models/repositories';
import { badgeRepository } from '../../../models/repositories';
import { PrivilegeType, REPUTATION_TIERS } from '../../../models/ReputationRepository';

const router = Router();

// Helpers for mapping and formatting
function humanizePrivilege(priv: PrivilegeType): string {
  return priv
    .replace(/_/g, ' ')
    .replace(/\b\w/g, m => m.toUpperCase());
}

function getReasonDescription(reason: string): string {
  const map: Record<string, string> = {
    upvote: 'Received an upvote',
    downvote: 'Received a downvote',
    accepted_answer: 'Your answer was accepted',
    accept_answer: 'Accepted an answer',
    bounty_offered: 'Offered a bounty',
    bounty_received: 'Received a bounty',
    edit_approved: 'Your edit was approved',
    post_flagged: 'Your post was flagged',
    vote_reversal: 'Reversed a vote',
    vote_removed: 'Removed a vote',
    content_removed: 'Content was removed',
    admin_adjustment: 'Reputation adjusted by admin',
    tool_review: 'Received a tool review',
    comment: 'Your comment was upvoted'
  };
  return map[reason] || reason;
}

/**
 * @route GET /api/users/:userId/reputation
 * @desc Get reputation summary (points, tier, progress) for a user
 * @access Public
 */
router.get(
  '/:userId/reputation',
  [param('userId').isNumeric().withMessage('User ID must be a number')],
  asyncHandler(async (req, res) => {
    const userId = parseInt(req.params.userId);
    const stats = await reputationRepository.getReputationStats(userId);
    const userPrivs = await reputationRepository.getUserPrivileges(userId);
    const thresholds = REPUTATION_TIERS;
    const order = Object.keys(thresholds) as PrivilegeType[];
    let current: PrivilegeType | null = null;
    for (const tier of order) {
      if (userPrivs.includes(tier)) current = tier;
      else break;
    }
    const tier = current ? humanizePrivilege(current) : 'New User';
    const nextTier = current
      ? order[order.indexOf(current) + 1] || null
      : order[0];
    const next_tier = nextTier ? humanizePrivilege(nextTier) : null;
    const points = stats.total;
    const points_to_next_tier = nextTier && thresholds[nextTier]! > points
      ? thresholds[nextTier]! - points
      : null;
    return res.json({ points, tier, next_tier, points_to_next_tier });
  })
);

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
    query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be a non-negative number')
  ],
  asyncHandler(async (req, res) => {
    const userId = parseInt(req.params.userId);
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;

    if (req.user.id !== userId && !req.user.isAdmin && !req.user.isModerator) {
      return res.status(403).json({ error: 'Unauthorized to view this user\'s reputation history' });
    }

    const repHistory = await reputationRepository.getReputationHistory(userId, limit, offset);
    const badgeHistory = await badgeRepository.getUserBadges(userId);

    const events = repHistory.map(entry => {
      const type = entry.reason === 'accepted_answer' || entry.reason === 'accept_answer'
        ? 'answer_accepted'
        : entry.reason;
      return {
        id: entry.id,
        type,
        points: entry.change,
        description: getReasonDescription(entry.reason),
        created_at: entry.created_at
      };
    });
    badgeHistory.forEach(badge => events.push({
      id: badge.id,
      type: 'badge_earned',
      points: 0,
      description: badge.name,
      created_at: badge.awarded_at
    }));

    const sorted = events.sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    return res.json({ history: sorted.slice(offset, offset + limit) });
  })
);

/**
 * @route GET /api/users/:userId/reputation/stats
 * @desc Get reputation statistics for a user
 * @access Public
 */
router.get(
  '/:userId/reputation/stats',
  [param('userId').isNumeric().withMessage('User ID must be a number')],
  asyncHandler(async (req, res) => {
    const userId = parseInt(req.params.userId);
    const stats = await reputationRepository.getReputationStats(userId);
    return res.json({ total: stats.total, byReason: stats.byReason, rank: stats.rank, percentile: stats.percentile });
  })
);

/**
 * @route GET /api/users/:userId/privileges
 * @desc Get privileges for a user
 * @access Public
 */
router.get(
  '/:userId/privileges',
  [param('userId').isNumeric().withMessage('User ID must be a number')],
  asyncHandler(async (req, res) => {
    const userId = parseInt(req.params.userId);
    const privileges = await reputationRepository.getUserPrivileges(userId);
    return res.json({ privileges, thresholds: REPUTATION_TIERS });
  })
);

/**
 * @route GET /api/users/:userId/badges
 * @desc Get badges for a user
 * @access Public
 */
router.get(
  '/:userId/badges',
  [param('userId').isNumeric().withMessage('User ID must be a number')],
  asyncHandler(async (req, res) => {
    const userId = parseInt(req.params.userId);
    const badges = await badgeRepository.getUserBadges(userId);
    return res.json({ badges });
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
  [param('userId').isNumeric().withMessage('User ID must be a number')],
  asyncHandler(async (req, res) => {
    const userId = parseInt(req.params.userId);
    if (req.user.id !== userId && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized to check badges for this user' });
    }
    const awarded = await badgeRepository.checkAllBadges(userId);
    const newBadges = awarded.length
      ? await Promise.all(awarded.map(id => badgeRepository.getBadgeById(id)))
      : [];
    return res.json({ awardedCount: awarded.length, newBadges });
  })
);

export default router;