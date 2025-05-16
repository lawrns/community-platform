/**
 * Topic Routes
 * Handles API endpoints for topic management
 */

import { Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import slugify from 'slugify';
import asyncHandler from '../../../utils/asyncHandler';
import { topicRepository } from '../../../models/repositories';
import { authenticate, requireVerified, requirePrivilege } from '../../../middlewares/auth/authMiddleware';
import { BadRequestError, NotFoundError } from '../../../utils/errorHandler';

const router = Router();

/**
 * Get all topics
 * @route GET /api/topics
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const topics = await topicRepository.findAll();
    
    res.json({
      success: true,
      topics,
    });
  })
);

/**
 * Get topic hierarchy
 * @route GET /api/topics/hierarchy
 */
router.get(
  '/hierarchy',
  asyncHandler(async (req, res) => {
    const hierarchy = await topicRepository.getHierarchy();
    
    res.json({
      success: true,
      hierarchy,
    });
  })
);

/**
 * Get popular topics
 * @route GET /api/topics/popular
 */
router.get(
  '/popular',
  asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 10;
    
    const topics = await topicRepository.findPopular(limit);
    
    res.json({
      success: true,
      topics,
    });
  })
);

/**
 * Get top-level topics
 * @route GET /api/topics/top-level
 */
router.get(
  '/top-level',
  asyncHandler(async (req, res) => {
    const topics = await topicRepository.findTopLevel();
    
    res.json({
      success: true,
      topics,
    });
  })
);

/**
 * Get a topic by slug
 * @route GET /api/topics/:slug
 */
router.get(
  '/:slug',
  [param('slug').isString().notEmpty().withMessage('Slug is required')],
  asyncHandler(async (req, res) => {
    // Use the validation middleware helper instead
    const { validateRequest } = require('../../../middlewares/validation');
    validateRequest(req, res, () => {});
    
    const slug = req.params.slug;
    const topic = await topicRepository.findBySlug(slug);
    
    if (!topic) {
      throw new NotFoundError('Topic not found');
    }
    
    // Get child topics
    const children = await topicRepository.findChildren(topic.id);
    
    // Get breadcrumbs
    const breadcrumbs = await topicRepository.getBreadcrumbs(topic.id);
    
    res.json({
      success: true,
      topic,
      children,
      breadcrumbs,
    });
  })
);

/**
 * Get child topics
 * @route GET /api/topics/:id/children
 */
router.get(
  '/:id/children',
  [param('id').isNumeric().withMessage('Topic ID must be a number')],
  asyncHandler(async (req, res) => {
    // Use the validation middleware helper instead
    const { validateRequest } = require('../../../middlewares/validation');
    validateRequest(req, res, () => {});
    
    const topicId = parseInt(req.params.id);
    
    // Ensure topic exists
    const topic = await topicRepository.findById(topicId);
    if (!topic) {
      throw new NotFoundError('Topic not found');
    }
    
    // Get child topics
    const children = await topicRepository.findChildren(topicId);
    
    res.json({
      success: true,
      children,
    });
  })
);

/**
 * Create a new topic
 * @route POST /api/topics
 */
router.post(
  '/',
  authenticate,
  requireVerified,
  requirePrivilege('admin'),
  [
    body('name').isString().isLength({ min: 2, max: 50 })
      .withMessage('Topic name must be between 2-50 characters'),
    body('description').optional().isString().isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters'),
    body('parentId').optional().isNumeric()
      .withMessage('Parent ID must be a number'),
  ],
  asyncHandler(async (req, res) => {
    // Use the validation middleware helper instead
    const { validateRequest } = require('../../../middlewares/validation');
    validateRequest(req, res, () => {});
    
    const { name, description, parentId } = req.body;
    
    // Generate slug from name
    const slug = slugify(name, { lower: true, strict: true });
    
    // Check if topic with this slug already exists
    const existingTopic = await topicRepository.findBySlug(slug);
    if (existingTopic) {
      throw new BadRequestError('A topic with this name already exists');
    }
    
    // If parentId is provided, check if it exists
    if (parentId) {
      const parentTopic = await topicRepository.findById(parseInt(parentId));
      if (!parentTopic) {
        throw new BadRequestError('Parent topic not found');
      }
    }
    
    // Create topic
    const topic = await topicRepository.create({
      name,
      slug,
      description,
      parent_id: parentId ? parseInt(parentId) : null,
      created_at: new Date(),
      updated_at: new Date(),
    });
    
    res.status(201).json({
      success: true,
      message: 'Topic created successfully',
      topic,
    });
  })
);

/**
 * Update a topic
 * @route PUT /api/topics/:id
 */
router.put(
  '/:id',
  authenticate,
  requireVerified,
  requirePrivilege('admin'),
  [
    param('id').isNumeric().withMessage('Topic ID must be a number'),
    body('name').optional().isString().isLength({ min: 2, max: 50 })
      .withMessage('Topic name must be between 2-50 characters'),
    body('description').optional().isString().isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters'),
  ],
  asyncHandler(async (req, res) => {
    // Use the validation middleware helper instead
    const { validateRequest } = require('../../../middlewares/validation');
    validateRequest(req, res, () => {});
    
    const topicId = parseInt(req.params.id);
    const updates: Record<string, any> = {};
    
    // Only include provided fields in updates
    if (req.body.name) {
      updates.name = req.body.name;
      // Update slug if name changes
      updates.slug = slugify(req.body.name, { lower: true, strict: true });
      
      // Check if a different topic with this slug already exists
      const existingTopic = await topicRepository.findBySlug(updates.slug);
      if (existingTopic && existingTopic.id !== topicId) {
        throw new BadRequestError('A topic with this name already exists');
      }
    }
    
    if (req.body.description !== undefined) {
      updates.description = req.body.description;
    }
    
    updates.updated_at = new Date();
    
    // Update topic
    const topic = await topicRepository.update(topicId, updates);
    
    if (!topic) {
      throw new NotFoundError('Topic not found');
    }
    
    res.json({
      success: true,
      message: 'Topic updated successfully',
      topic,
    });
  })
);

/**
 * Move a topic to a new parent
 * @route POST /api/topics/:id/move
 */
router.post(
  '/:id/move',
  authenticate,
  requireVerified,
  requirePrivilege('admin'),
  [
    param('id').isNumeric().withMessage('Topic ID must be a number'),
    body('parentId').optional({ nullable: true }).isNumeric()
      .withMessage('Parent ID must be a number or null'),
  ],
  asyncHandler(async (req, res) => {
    // Use the validation middleware helper instead
    const { validateRequest } = require('../../../middlewares/validation');
    validateRequest(req, res, () => {});
    
    const topicId = parseInt(req.params.id);
    const parentId = req.body.parentId !== null ? parseInt(req.body.parentId) : null;
    
    // Ensure topic exists
    const topic = await topicRepository.findById(topicId);
    if (!topic) {
      throw new NotFoundError('Topic not found');
    }
    
    // If parentId is provided, check if it exists
    if (parentId !== null) {
      const parentTopic = await topicRepository.findById(parentId);
      if (!parentTopic) {
        throw new BadRequestError('Parent topic not found');
      }
    }
    
    // Move topic to new parent
    const updatedTopic = await topicRepository.moveToParent(topicId, parentId);
    
    res.json({
      success: true,
      message: 'Topic moved successfully',
      topic: updatedTopic,
    });
  })
);

/**
 * Delete a topic
 * @route DELETE /api/topics/:id
 */
router.delete(
  '/:id',
  authenticate,
  requireVerified,
  requirePrivilege('admin'),
  [param('id').isNumeric().withMessage('Topic ID must be a number')],
  asyncHandler(async (req, res) => {
    // Use the validation middleware helper instead
    const { validateRequest } = require('../../../middlewares/validation');
    validateRequest(req, res, () => {});
    
    const topicId = parseInt(req.params.id);
    
    // Ensure topic exists
    const topic = await topicRepository.findById(topicId);
    if (!topic) {
      throw new NotFoundError('Topic not found');
    }
    
    // Check if topic has children
    const children = await topicRepository.findChildren(topicId);
    if (children.length > 0) {
      throw new BadRequestError('Cannot delete a topic with children. Move or delete children first.');
    }
    
    // Delete topic
    await topicRepository.delete(topicId);
    
    res.json({
      success: true,
      message: 'Topic deleted successfully',
    });
  })
);

/**
 * Get topic statistics
 * @route GET /api/topics/:id/stats
 */
router.get(
  '/:id/stats',
  [param('id').isNumeric().withMessage('Topic ID must be a number')],
  asyncHandler(async (req, res) => {
    // Use the validation middleware helper instead
    const { validateRequest } = require('../../../middlewares/validation');
    validateRequest(req, res, () => {});
    
    const topicId = parseInt(req.params.id);
    
    // Ensure topic exists
    const topic = await topicRepository.findById(topicId);
    if (!topic) {
      throw new NotFoundError('Topic not found');
    }
    
    // Get usage statistics
    const result = await topicRepository.query(
      `SELECT 
         COUNT(*) as total_content,
         SUM(CASE WHEN c.type = 'question' THEN 1 ELSE 0 END) as questions,
         SUM(CASE WHEN c.type = 'answer' THEN 1 ELSE 0 END) as answers,
         SUM(CASE WHEN c.type = 'post' THEN 1 ELSE 0 END) as posts,
         SUM(CASE WHEN c.type = 'tutorial' THEN 1 ELSE 0 END) as tutorials
       FROM content_topics ct
       JOIN content c ON ct.content_id = c.id
       WHERE ct.topic_id = $1`,
      [topicId]
    );
    
    const stats = result.rows[0];
    
    res.json({
      success: true,
      topic,
      stats,
    });
  })
);

export default router;