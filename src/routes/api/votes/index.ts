/**
 * Quadratic Voting Routes
 * Handles voting with weighted votes using credits system
 */

import { Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import asyncHandler from '../../../utils/asyncHandler';
import { authenticate } from '../../../middlewares/auth/authMiddleware';
import { voteRepository } from '../../../models/repositories';
import { handleValidationErrors } from '../../../utils/validationHelper';
import { BadRequestError, UnauthorizedError } from '../../../utils/errorHandler';
import logger from '../../../config/logger';

const router = Router();

/**
 * Cast a quadratic vote
 * @route POST /api/votes/:targetType/:targetId
 */
router.post(
  '/:targetType/:targetId',
  authenticate,
  [
    param('targetType')
      .isIn(['content', 'tool', 'review'])
      .withMessage('Target type must be content, tool, or review'),
    param('targetId')
      .isInt({ min: 1 })
      .withMessage('Target ID must be a positive integer'),
    body('voteWeight')
      .isInt({ min: 1, max: 10 })
      .withMessage('Vote weight must be between 1 and 10'),
    body('voteType')
      .isIn([1, -1])
      .withMessage('Vote type must be 1 (upvote) or -1 (downvote)')
  ],
  asyncHandler(async (req, res) => {
    // Validate request
    handleValidationErrors(validationResult(req));

    if (!req.user || !req.user.id) {
      throw new UnauthorizedError('Not authenticated');
    }

    const { targetType, targetId } = req.params;
    const { voteWeight, voteType } = req.body;

    // Cast vote
    const result = await voteRepository.quadraticVote(
      req.user.id,
      parseInt(targetId),
      targetType as 'content' | 'tool' | 'review',
      voteWeight,
      voteType
    );

    if (!result.success) {
      throw new BadRequestError(result.message);
    }

    res.status(200).json(result);
  })
);

/**
 * Remove a quadratic vote
 * @route DELETE /api/votes/:targetType/:targetId
 */
router.delete(
  '/:targetType/:targetId',
  authenticate,
  [
    param('targetType')
      .isIn(['content', 'tool', 'review'])
      .withMessage('Target type must be content, tool, or review'),
    param('targetId')
      .isInt({ min: 1 })
      .withMessage('Target ID must be a positive integer')
  ],
  asyncHandler(async (req, res) => {
    // Validate request
    handleValidationErrors(validationResult(req));

    if (!req.user || !req.user.id) {
      throw new UnauthorizedError('Not authenticated');
    }

    const { targetType, targetId } = req.params;

    // Remove vote
    const result = await voteRepository.removeQuadraticVote(
      req.user.id,
      parseInt(targetId),
      targetType as 'content' | 'tool' | 'review'
    );

    if (!result.success) {
      throw new BadRequestError(result.message);
    }

    res.status(200).json(result);
  })
);

/**
 * Get vote credits for the authenticated user
 * @route GET /api/votes/credits
 */
router.get(
  '/credits',
  authenticate,
  asyncHandler(async (req, res) => {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedError('Not authenticated');
    }

    // Get user's vote credits
    const credits = await voteRepository.getUserVoteCredits(req.user.id);

    res.status(200).json({
      success: true,
      credits
    });
  })
);

/**
 * Get credit transaction history for the authenticated user
 * @route GET /api/votes/credits/history
 */
router.get(
  '/credits/history',
  authenticate,
  asyncHandler(async (req, res) => {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedError('Not authenticated');
    }

    const page = parseInt(req.query.page as string || '1');
    const limit = parseInt(req.query.limit as string || '20');
    const offset = (page - 1) * limit;

    // Get user's credit transaction history
    const { transactions, total } = await voteRepository.getVoteCreditHistory(
      req.user.id,
      limit,
      offset
    );

    res.status(200).json({
      success: true,
      transactions,
      total,
      page,
      pageCount: Math.ceil(total / limit)
    });
  })
);

/**
 * Get a specific vote
 * @route GET /api/votes/:targetType/:targetId
 */
router.get(
  '/:targetType/:targetId',
  authenticate,
  [
    param('targetType')
      .isIn(['content', 'tool', 'review'])
      .withMessage('Target type must be content, tool, or review'),
    param('targetId')
      .isInt({ min: 1 })
      .withMessage('Target ID must be a positive integer')
  ],
  asyncHandler(async (req, res) => {
    // Validate request
    handleValidationErrors(validationResult(req));

    if (!req.user || !req.user.id) {
      throw new UnauthorizedError('Not authenticated');
    }

    const { targetType, targetId } = req.params;

    // Get vote
    const vote = await voteRepository.getVote(
      req.user.id,
      parseInt(targetId),
      targetType as 'content' | 'tool' | 'review'
    );

    res.status(200).json({
      success: true,
      vote
    });
  })
);

/**
 * Get all votes by the authenticated user
 * @route GET /api/votes
 */
router.get(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedError('Not authenticated');
    }

    const targetType = req.query.type as 'content' | 'tool' | 'review' | undefined;
    const page = parseInt(req.query.page as string || '1');
    const limit = parseInt(req.query.limit as string || '20');
    const offset = (page - 1) * limit;

    // Get user's votes
    const { votes, total } = await voteRepository.getUserVotes(
      req.user.id,
      targetType,
      limit,
      offset
    );

    res.status(200).json({
      success: true,
      votes,
      total,
      page,
      pageCount: Math.ceil(total / limit)
    });
  })
);

export default router;