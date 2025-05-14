/**
 * Tag Routes
 * Handles API endpoints for tag management
 */

import { Router } from 'express';
import { body, query, param, validationResult } from 'express-validator';
import slugify from 'slugify';
import asyncHandler from '../../../utils/asyncHandler';
import { tagRepository } from '../../../models/repositories';
import { authenticate, requireVerified, requireReputation } from '../../../middlewares/auth/authMiddleware';
import { BadRequestError, NotFoundError } from '../../../utils/errorHandler';

const router = Router();

/**
 * Get all tags
 * @route GET /api/tags
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    
    const tags = await tagRepository.findAll(limit, offset);
    const count = await tagRepository.count();
    
    res.json({
      success: true,
      tags,
      pagination: {
        total: count,
        offset,
        limit,
      },
    });
  })
);

/**
 * Get popular tags
 * @route GET /api/tags/popular
 */
router.get(
  '/popular',
  asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 20;
    
    const tags = await tagRepository.findPopular(limit);
    
    res.json({
      success: true,
      tags,
    });
  })
);

/**
 * Get tag suggestions (for autocomplete)
 * @route GET /api/tags/suggest
 */
router.get(
  '/suggest',
  [query('prefix').isString().notEmpty().withMessage('Prefix is required')],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError('Validation error', 
        Object.fromEntries(errors.array().map(err => [err.path, err.msg]))
      );
    }
    
    const prefix = req.query.prefix as string;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const tags = await tagRepository.findByNamePrefix(prefix, limit);
    
    res.json({
      success: true,
      tags,
    });
  })
);

/**
 * Get similar tags (for typo suggestions)
 * @route GET /api/tags/similar
 */
router.get(
  '/similar',
  [query('name').isString().notEmpty().withMessage('Tag name is required')],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError('Validation error', 
        Object.fromEntries(errors.array().map(err => [err.path, err.msg]))
      );
    }
    
    const name = req.query.name as string;
    const limit = parseInt(req.query.limit as string) || 5;
    
    const tags = await tagRepository.findSimilar(name, limit);
    
    res.json({
      success: true,
      tags,
    });
  })
);

/**
 * Get a specific tag by slug
 * @route GET /api/tags/:slug
 */
router.get(
  '/:slug',
  [param('slug').isString().notEmpty().withMessage('Slug is required')],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError('Validation error', 
        Object.fromEntries(errors.array().map(err => [err.path, err.msg]))
      );
    }
    
    const slug = req.params.slug;
    const tag = await tagRepository.findBySlug(slug);
    
    if (!tag) {
      throw new NotFoundError('Tag not found');
    }
    
    // Get related tags
    const relatedTags = await tagRepository.getRelatedTags(tag.id);
    
    res.json({
      success: true,
      tag,
      relatedTags,
    });
  })
);

/**
 * Create a new tag
 * @route POST /api/tags
 */
router.post(
  '/',
  authenticate,
  requireVerified,
  requireReputation(100), // Require 100 reputation to create tags
  [
    body('name').isString().isLength({ min: 2, max: 30 })
      .withMessage('Tag name must be between 2-30 characters')
      .matches(/^[a-zA-Z0-9\-\+ ]+$/)
      .withMessage('Tag name can only contain letters, numbers, spaces, hyphens, and plus signs'),
    body('description').optional().isString().isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters'),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError('Validation error', 
        Object.fromEntries(errors.array().map(err => [err.path, err.msg]))
      );
    }
    
    const { name, description } = req.body;
    
    // Generate slug from name
    const slug = slugify(name, { lower: true, strict: true });
    
    // Check if tag with this slug already exists
    const existingTag = await tagRepository.findBySlug(slug);
    if (existingTag) {
      throw new BadRequestError('A tag with this name already exists');
    }
    
    // Create tag
    const tag = await tagRepository.create({
      name,
      slug,
      description,
      created_at: new Date(),
      updated_at: new Date(),
    });
    
    res.status(201).json({
      success: true,
      message: 'Tag created successfully',
      tag,
    });
  })
);

/**
 * Update a tag
 * @route PUT /api/tags/:id
 */
router.put(
  '/:id',
  authenticate,
  requireVerified,
  requireReputation(1000), // Require 1000 reputation to edit tags
  [
    param('id').isNumeric().withMessage('Tag ID must be a number'),
    body('name').optional().isString().isLength({ min: 2, max: 30 })
      .withMessage('Tag name must be between 2-30 characters')
      .matches(/^[a-zA-Z0-9\-\+ ]+$/)
      .withMessage('Tag name can only contain letters, numbers, spaces, hyphens, and plus signs'),
    body('description').optional().isString().isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters'),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError('Validation error', 
        Object.fromEntries(errors.array().map(err => [err.path, err.msg]))
      );
    }
    
    const tagId = parseInt(req.params.id);
    const updates: Record<string, any> = {};
    
    // Only include provided fields in updates
    if (req.body.name) {
      updates.name = req.body.name;
      // Update slug if name changes
      updates.slug = slugify(req.body.name, { lower: true, strict: true });
      
      // Check if a different tag with this slug already exists
      const existingTag = await tagRepository.findBySlug(updates.slug);
      if (existingTag && existingTag.id !== tagId) {
        throw new BadRequestError('A tag with this name already exists');
      }
    }
    
    if (req.body.description !== undefined) {
      updates.description = req.body.description;
    }
    
    updates.updated_at = new Date();
    
    // Update tag
    const tag = await tagRepository.update(tagId, updates);
    
    if (!tag) {
      throw new NotFoundError('Tag not found');
    }
    
    res.json({
      success: true,
      message: 'Tag updated successfully',
      tag,
    });
  })
);

/**
 * Merge a tag into another tag
 * @route POST /api/tags/:id/merge
 */
router.post(
  '/:id/merge',
  authenticate,
  requireVerified,
  requireReputation(5000), // Require high reputation to merge tags
  [
    param('id').isNumeric().withMessage('Source tag ID must be a number'),
    body('targetTagId').isNumeric().withMessage('Target tag ID must be a number'),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError('Validation error', 
        Object.fromEntries(errors.array().map(err => [err.path, err.msg]))
      );
    }
    
    const sourceTagId = parseInt(req.params.id);
    const targetTagId = parseInt(req.body.targetTagId);
    
    // Ensure source and target tags exist
    const sourceTag = await tagRepository.findById(sourceTagId);
    const targetTag = await tagRepository.findById(targetTagId);
    
    if (!sourceTag || !targetTag) {
      throw new NotFoundError('One or both tags not found');
    }
    
    // Don't merge a tag into itself
    if (sourceTagId === targetTagId) {
      throw new BadRequestError('Cannot merge a tag into itself');
    }
    
    // Use a transaction to merge tags
    await tagRepository.transaction(async (client) => {
      // Update content_tags entries to point to the target tag
      await client.query(
        `UPDATE content_tags 
         SET tag_id = $1
         WHERE tag_id = $2`,
        [targetTagId, sourceTagId]
      );
      
      // Delete the source tag
      await client.query(
        `DELETE FROM tags WHERE id = $1`,
        [sourceTagId]
      );
    });
    
    res.json({
      success: true,
      message: `Tag "${sourceTag.name}" merged into "${targetTag.name}" successfully`,
    });
  })
);

/**
 * Get tag usage statistics
 * @route GET /api/tags/:id/stats
 */
router.get(
  '/:id/stats',
  [param('id').isNumeric().withMessage('Tag ID must be a number')],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError('Validation error', 
        Object.fromEntries(errors.array().map(err => [err.path, err.msg]))
      );
    }
    
    const tagId = parseInt(req.params.id);
    
    // Ensure tag exists
    const tag = await tagRepository.findById(tagId);
    if (!tag) {
      throw new NotFoundError('Tag not found');
    }
    
    // Get usage statistics
    const result = await tagRepository.query(
      `SELECT 
         COUNT(*) as total_content,
         SUM(CASE WHEN c.type = 'question' THEN 1 ELSE 0 END) as questions,
         SUM(CASE WHEN c.type = 'answer' THEN 1 ELSE 0 END) as answers,
         SUM(CASE WHEN c.type = 'post' THEN 1 ELSE 0 END) as posts,
         SUM(CASE WHEN c.type = 'tutorial' THEN 1 ELSE 0 END) as tutorials
       FROM content_tags ct
       JOIN content c ON ct.content_id = c.id
       WHERE ct.tag_id = $1`,
      [tagId]
    );
    
    const stats = result.rows[0];
    
    res.json({
      success: true,
      tag,
      stats,
    });
  })
);

export default router;