import { Router } from 'express';
import { param, query, body } from 'express-validator';
import { authenticate, requireVerified } from '../../../middlewares/auth/authMiddleware';
import { asyncHandler } from '../../../utils/asyncHandler';
import { notificationRepository } from '../../../models/NotificationRepository';
import { validate } from '../../../middlewares/validation';

const router = Router();

/**
 * @route GET /api/users/:userId/notifications
 * @desc Get user notifications
 * @access Private
 */
router.get(
  '/:userId/notifications',
  authenticate,
  [
    param('userId').isNumeric().withMessage('User ID must be a number'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
    query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be a non-negative number'),
    query('includeRead').optional().isBoolean().withMessage('includeRead must be a boolean')
  ],
  validate,
  asyncHandler(async (req, res) => {
    const userId = parseInt(req.params.userId);
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    const includeRead = req.query.includeRead === 'true';
    
    // Only allow users to access their own notifications
    if (req.user.id !== userId) {
      return res.status(403).json({ error: 'Unauthorized to access these notifications' });
    }
    
    const notifications = await notificationRepository.getUserNotifications(
      userId, 
      limit, 
      offset, 
      includeRead
    );
    
    // Get the total unread count
    const unreadCount = await notificationRepository.getNotificationCount(userId, true);
    
    res.json({
      success: true,
      data: { 
        notifications,
        unreadCount
      }
    });
  })
);

/**
 * @route POST /api/users/:userId/notifications/read
 * @desc Mark notifications as read
 * @access Private
 */
router.post(
  '/:userId/notifications/read',
  authenticate,
  requireVerified,
  [
    param('userId').isNumeric().withMessage('User ID must be a number'),
    body('notificationIds').isArray().withMessage('notificationIds must be an array')
  ],
  validate,
  asyncHandler(async (req, res) => {
    const userId = parseInt(req.params.userId);
    const { notificationIds } = req.body;
    
    // Only allow users to mark their own notifications
    if (req.user.id !== userId) {
      return res.status(403).json({ error: 'Unauthorized to update these notifications' });
    }
    
    await notificationRepository.markAsRead(notificationIds);
    
    res.json({
      success: true,
      message: 'Notifications marked as read'
    });
  })
);

/**
 * @route POST /api/users/:userId/notifications/read-all
 * @desc Mark all notifications as read
 * @access Private
 */
router.post(
  '/:userId/notifications/read-all',
  authenticate,
  requireVerified,
  [
    param('userId').isNumeric().withMessage('User ID must be a number')
  ],
  validate,
  asyncHandler(async (req, res) => {
    const userId = parseInt(req.params.userId);
    
    // Only allow users to mark their own notifications
    if (req.user.id !== userId) {
      return res.status(403).json({ error: 'Unauthorized to update these notifications' });
    }
    
    await notificationRepository.markAllAsRead(userId);
    
    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  })
);

/**
 * @route DELETE /api/users/:userId/notifications/:notificationId
 * @desc Delete a notification
 * @access Private
 */
router.delete(
  '/:userId/notifications/:notificationId',
  authenticate,
  requireVerified,
  [
    param('userId').isNumeric().withMessage('User ID must be a number'),
    param('notificationId').isNumeric().withMessage('Notification ID must be a number')
  ],
  validate,
  asyncHandler(async (req, res) => {
    const userId = parseInt(req.params.userId);
    const notificationId = parseInt(req.params.notificationId);
    
    // Only allow users to delete their own notifications
    if (req.user.id !== userId) {
      return res.status(403).json({ error: 'Unauthorized to delete this notification' });
    }
    
    await notificationRepository.deleteNotification(notificationId);
    
    res.json({
      success: true,
      message: 'Notification deleted'
    });
  })
);

/**
 * @route GET /api/users/:userId/notification-preferences
 * @desc Get user notification preferences
 * @access Private
 */
router.get(
  '/:userId/notification-preferences',
  authenticate,
  [
    param('userId').isNumeric().withMessage('User ID must be a number')
  ],
  validate,
  asyncHandler(async (req, res) => {
    const userId = parseInt(req.params.userId);
    
    // Only allow users to access their own preferences
    if (req.user.id !== userId) {
      return res.status(403).json({ error: 'Unauthorized to access these preferences' });
    }
    
    const preferences = await notificationRepository.getUserNotificationPreferences(userId);
    
    res.json({
      success: true,
      data: preferences
    });
  })
);

/**
 * @route PUT /api/users/:userId/notification-preferences
 * @desc Update user notification preferences
 * @access Private
 */
router.put(
  '/:userId/notification-preferences',
  authenticate,
  requireVerified,
  [
    param('userId').isNumeric().withMessage('User ID must be a number'),
    body('preferences').isObject().withMessage('preferences must be an object')
  ],
  validate,
  asyncHandler(async (req, res) => {
    const userId = parseInt(req.params.userId);
    const { preferences } = req.body;
    
    // Only allow users to update their own preferences
    if (req.user.id !== userId) {
      return res.status(403).json({ error: 'Unauthorized to update these preferences' });
    }
    
    await notificationRepository.updateNotificationPreferences(userId, preferences);
    
    res.json({
      success: true,
      message: 'Notification preferences updated'
    });
  })
);

export default router;