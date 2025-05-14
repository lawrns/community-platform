/**
 * Moderation API Routes
 * Handles content moderation, flagging, and appeals
 */

import { Router } from 'express';
import { body, param, query } from 'express-validator';
import asyncHandler from '../../../utils/asyncHandler';
import { authenticate, requireVerified, isModerator } from '../../../middlewares/auth/authMiddleware';
import { 
  moderationRepository, 
  flagRepository, 
  appealRepository,
  contentRepository 
} from '../../../models/repositories';
import { 
  ModerationActionType, 
  ModerationActionStatus, 
  FlagReason, 
  FlagStatus, 
  FlagType,
  AppealStatus 
} from '../../../models';
import { AppError, BadRequestError, NotFoundError, ForbiddenError } from '../../../utils/errorHandler';

const router = Router();

/**
 * Flag content
 * POST /api/moderation/flag/content/:id
 */
router.post('/flag/content/:id',
  authenticate,
  requireVerified,
  [
    param('id').isNumeric().withMessage('ID must be a number'),
    body('reason').isIn(Object.values(FlagReason)).withMessage('Invalid reason'),
    body('description').optional().isString().trim().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters')
  ],
  asyncHandler(async (req, res) => {
    const contentId = parseInt(req.params.id);
    const { reason, description } = req.body;
    
    // Check if content exists
    const content = await contentRepository.findById(contentId);
    if (!content) {
      throw new NotFoundError('Content not found');
    }
    
    // Check if user is flagging their own content
    if (content.author_id === req.user.id) {
      throw new BadRequestError('You cannot flag your own content');
    }
    
    // Create the flag
    const flag = await flagRepository.flagContent(contentId, req.user.id, reason, description);
    
    // Automatically check for spam
    const spamCheck = await moderationRepository.checkForSpam(content.body, FlagType.CONTENT);
    
    // If AI detects spam with high confidence, hide the content
    if (spamCheck.isSpam && spamCheck.score > 0.85) {
      await moderationRepository.createContentAction(
        ModerationActionType.HIDE,
        contentId,
        0, // System user ID
        'Automatically detected as spam',
        flag.id,
        { detected: true, score: spamCheck.score, reason: spamCheck.reason }
      );
      
      // Update the flag status to approved
      await flagRepository.updateStatus(flag.id, FlagStatus.APPROVED);
    }
    
    res.json({
      success: true,
      message: 'Content flagged successfully',
      data: { flagId: flag.id }
    });
  })
);

/**
 * Flag user
 * POST /api/moderation/flag/user/:id
 */
router.post('/flag/user/:id',
  authenticate,
  requireVerified,
  [
    param('id').isNumeric().withMessage('ID must be a number'),
    body('reason').isIn(Object.values(FlagReason)).withMessage('Invalid reason'),
    body('description').optional().isString().trim().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters')
  ],
  asyncHandler(async (req, res) => {
    const userId = parseInt(req.params.id);
    const { reason, description } = req.body;
    
    // Can't flag self
    if (userId === req.user.id) {
      throw new BadRequestError('You cannot flag yourself');
    }
    
    // Create the flag
    const flag = await flagRepository.flagUser(userId, req.user.id, reason, description);
    
    res.json({
      success: true,
      message: 'User flagged successfully',
      data: { flagId: flag.id }
    });
  })
);

/**
 * Get moderation queue
 * GET /api/moderation/queue
 */
router.get('/queue',
  authenticate,
  requireVerified,
  isModerator,
  [
    query('limit').optional().isNumeric().withMessage('Limit must be a number'),
    query('offset').optional().isNumeric().withMessage('Offset must be a number')
  ],
  asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    
    // Get pending flags
    const pendingFlags = await flagRepository.findPending(limit, offset);
    
    // Get counts
    const pendingCount = await flagRepository.countByStatus(FlagStatus.PENDING);
    const pendingAppeals = await appealRepository.countByStatus(AppealStatus.PENDING);
    
    res.json({
      success: true,
      data: {
        flags: pendingFlags,
        counts: {
          pendingFlags: pendingCount,
          pendingAppeals: pendingAppeals
        }
      }
    });
  })
);

/**
 * Resolve flag
 * POST /api/moderation/flag/:id/resolve
 */
router.post('/flag/:id/resolve',
  authenticate,
  requireVerified,
  isModerator,
  [
    param('id').isNumeric().withMessage('ID must be a number'),
    body('status').isIn([FlagStatus.APPROVED, FlagStatus.REJECTED]).withMessage('Invalid status'),
    body('action_type').optional().isIn(Object.values(ModerationActionType)).withMessage('Invalid action type'),
    body('reason').optional().isString().trim().isLength({ max: 1000 }).withMessage('Reason must be less than 1000 characters')
  ],
  asyncHandler(async (req, res) => {
    const flagId = parseInt(req.params.id);
    const { status, action_type, reason } = req.body;
    
    // Get the flag
    const flag = await flagRepository.findById(flagId);
    if (!flag) {
      throw new NotFoundError('Flag not found');
    }
    
    // Can't resolve a flag that's not pending
    if (flag.status !== FlagStatus.PENDING) {
      throw new BadRequestError(`Flag is already ${flag.status}`);
    }
    
    // If the flag is approved and an action is provided, take that action
    if (status === FlagStatus.APPROVED && action_type) {
      let entityId;
      
      switch (flag.type) {
        case FlagType.CONTENT:
          entityId = flag.content_id;
          await moderationRepository.createContentAction(
            action_type,
            entityId!,
            req.user.id,
            reason,
            flagId
          );
          break;
        case FlagType.USER:
          entityId = flag.user_id;
          await moderationRepository.createUserAction(
            action_type,
            entityId!,
            req.user.id,
            reason,
            flagId
          );
          break;
        // Similar cases for other flag types
      }
    }
    
    // Update the flag status
    await flagRepository.updateStatus(flagId, status);
    
    res.json({
      success: true,
      message: `Flag ${status} successfully`
    });
  })
);

/**
 * Get appeals queue
 * GET /api/moderation/appeals
 */
router.get('/appeals',
  authenticate,
  requireVerified,
  isModerator,
  [
    query('limit').optional().isNumeric().withMessage('Limit must be a number'),
    query('offset').optional().isNumeric().withMessage('Offset must be a number')
  ],
  asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    
    // Get pending appeals
    const pendingAppeals = await appealRepository.findPending(limit, offset);
    
    res.json({
      success: true,
      data: {
        appeals: pendingAppeals
      }
    });
  })
);

/**
 * Submit appeal
 * POST /api/moderation/appeal
 */
router.post('/appeal',
  authenticate,
  requireVerified,
  [
    body('moderation_action_id').isNumeric().withMessage('Moderation action ID must be a number'),
    body('reason').isString().trim().isLength({ min: 20, max: 1000 }).withMessage('Reason must be between 20 and 1000 characters')
  ],
  asyncHandler(async (req, res) => {
    const { moderation_action_id, reason } = req.body;
    
    // Get the moderation action
    const action = await moderationRepository.findById(moderation_action_id);
    if (!action) {
      throw new NotFoundError('Moderation action not found');
    }
    
    // Check if the user is the target of the moderation action
    let isTargetUser = false;
    
    if (action.content_id) {
      const content = await contentRepository.findById(action.content_id);
      isTargetUser = content?.author_id === req.user.id;
    } else if (action.user_id) {
      isTargetUser = action.user_id === req.user.id;
    }
    // Similar checks for other entity types
    
    if (!isTargetUser) {
      throw new ForbiddenError('You can only appeal actions taken against your own content or account');
    }
    
    // Check if action is already reverted
    if (action.status === ModerationActionStatus.REVERTED) {
      throw new BadRequestError('This action has already been reverted');
    }
    
    // Check if there's already a pending appeal
    const existingAppeals = await appealRepository.findByUser(req.user.id);
    const hasPendingAppeal = existingAppeals.some(a => 
      a.moderation_action_id === moderation_action_id && 
      a.status === AppealStatus.PENDING
    );
    
    if (hasPendingAppeal) {
      throw new BadRequestError('You already have a pending appeal for this action');
    }
    
    // Create the appeal
    const appeal = await appealRepository.createAppeal(moderation_action_id, req.user.id, reason);
    
    res.status(201).json({
      success: true,
      message: 'Appeal submitted successfully',
      data: { appealId: appeal.id }
    });
  })
);

/**
 * Resolve appeal
 * POST /api/moderation/appeal/:id/resolve
 */
router.post('/appeal/:id/resolve',
  authenticate,
  requireVerified,
  isModerator,
  [
    param('id').isNumeric().withMessage('ID must be a number'),
    body('status').isIn([AppealStatus.APPROVED, AppealStatus.REJECTED]).withMessage('Invalid status'),
    body('notes').optional().isString().trim().isLength({ max: 1000 }).withMessage('Notes must be less than 1000 characters')
  ],
  asyncHandler(async (req, res) => {
    const appealId = parseInt(req.params.id);
    const { status, notes } = req.body;
    
    // Get the appeal
    const appeal = await appealRepository.findById(appealId);
    if (!appeal) {
      throw new NotFoundError('Appeal not found');
    }
    
    // Can't resolve an appeal that's not pending
    if (appeal.status !== AppealStatus.PENDING) {
      throw new BadRequestError(`Appeal is already ${appeal.status}`);
    }
    
    let resolvedAppeal;
    
    if (status === AppealStatus.APPROVED) {
      // Approve the appeal and revert the action
      resolvedAppeal = await appealRepository.approveAppeal(appealId, req.user.id, notes);
    } else {
      // Reject the appeal
      resolvedAppeal = await appealRepository.rejectAppeal(appealId, req.user.id, notes);
    }
    
    if (!resolvedAppeal) {
      throw new Error('Failed to resolve appeal');
    }
    
    res.json({
      success: true,
      message: `Appeal ${status} successfully`
    });
  })
);

/**
 * Get moderation actions
 * GET /api/moderation/actions/content/:id
 */
router.get('/actions/content/:id',
  [
    param('id').isNumeric().withMessage('ID must be a number')
  ],
  asyncHandler(async (req, res) => {
    const contentId = parseInt(req.params.id);
    
    // Get actions for the content
    const actions = await moderationRepository.findByEntity(FlagType.CONTENT, contentId);
    
    res.json({
      success: true,
      data: actions
    });
  })
);

export default router;