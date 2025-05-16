import { Router } from 'express';
import { param, body } from 'express-validator';
import { authenticate, requireVerified } from '../../../middlewares/auth/authMiddleware';
import { asyncHandler } from '../../../utils/asyncHandler';
import { userRepository } from '../../../models/repositories';
import reputationRoutes from './reputation';
import notificationRoutes from './notifications';
import onboardingRoutes from './onboarding';

const router = Router();

// Use sub-routes
router.use('/', reputationRoutes);
router.use('/notifications', notificationRoutes);
router.use('/onboarding', onboardingRoutes);

/**
 * @route GET /api/users
 * @desc Get list of users
 * @access Public
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    const users = await userRepository.findAll(limit, offset);

    return res.json({
      success: true,
      data: users
    });
  })
);

/**
 * @route GET /api/users/:userId
 * @desc Get user profile
 * @access Public
 */
router.get(
  '/:userId',
  [
    param('userId').isNumeric().withMessage('User ID must be a number'),
  ],
  asyncHandler(async (req, res) => {
    const userId = parseInt(req.params.userId);
    const user = await userRepository.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      success: true,
      data: user
    });
  })
);

/**
 * @route PUT /api/users/:userId
 * @desc Update user profile
 * @access Private
 */
router.put(
  '/:userId',
  authenticate,
  requireVerified,
  [
    param('userId').isNumeric().withMessage('User ID must be a number'),
    body('name').optional().isString().isLength({ min: 1, max: 255 }),
    body('bio').optional().isString().isLength({ max: 1000 }),
    body('avatar_url').optional().isString().isURL(),
  ],
  asyncHandler(async (req, res) => {
    const userId = parseInt(req.params.userId);

    // Only allow users to update their own profile or admins
    if (req.user.id !== userId && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized to update this user profile' });
    }

    const updateData = {
      name: req.body.name,
      bio: req.body.bio,
      avatar_url: req.body.avatar_url
    };

    // Filter out undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const updatedUser = await userRepository.update(userId, updateData);

    return res.json({
      success: true,
      data: updatedUser
    });
  })
);

/**
 * @route GET /api/users/:userId/content
 * @desc Get content created by a user
 * @access Public
 */
router.get(
  '/:userId/content',
  [
    param('userId').isNumeric().withMessage('User ID must be a number'),
  ],
  asyncHandler(async (req, res) => {
    const userId = parseInt(req.params.userId);
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    const type = req.query.type as string | undefined;

    // Use contentRepository to get user content
    const content = await userRepository.findContentByUser(userId, limit, offset, type);

    return res.json({
      success: true,
      data: content
    });
  })
);

export default router;