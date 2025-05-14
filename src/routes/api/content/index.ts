/**
 * Content API Routes
 * Handles content creation, editing, versions, and management
 */

import { Router } from 'express';
import { body, param, query } from 'express-validator';
import asyncHandler from '../../../utils/asyncHandler';
import { authenticate, requireVerified } from '../../../middlewares/auth/authMiddleware';
import ContentRepository from '../../../models/ContentRepository';
import { ContentType, ContentStatus } from '../../../models';
import { AppError, BadRequestError, NotFoundError, ForbiddenError } from '../../../utils/errorHandler';
import uploadRoutes from './uploads';

const router = Router();
const contentRepo = new ContentRepository();

// Mount upload routes
router.use('/upload', uploadRoutes);

/**
 * Create draft content
 * POST /api/content/draft
 */
router.post('/draft', 
  authenticate,
  requireVerified,
  [
    body('type').isIn(Object.values(ContentType)).withMessage('Invalid content type'),
    body('title').optional().isString().trim().isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters'),
    body('body').isString().notEmpty().withMessage('Body is required'),
    body('body_html').isString().notEmpty().withMessage('HTML body is required'),
    body('tagIds').optional().isArray().withMessage('Tags must be an array'),
    body('topicIds').optional().isArray().withMessage('Topics must be an array'),
    body('parent_id').optional().isNumeric().withMessage('Parent ID must be a number')
  ],
  asyncHandler(async (req, res) => {
    const { type, title, body, body_html, tagIds, topicIds, parent_id } = req.body;
    
    // Create the draft content
    const draft = await contentRepo.createDraft({
      type,
      title,
      body,
      body_html,
      author_id: req.user.id,
      parent_id: parent_id || null
    });
    
    // Add tags if provided
    if (tagIds && tagIds.length > 0) {
      await contentRepo.addTags(draft.id, tagIds);
    }
    
    // Add topics if provided
    if (topicIds && topicIds.length > 0) {
      await contentRepo.addTopics(draft.id, topicIds);
    }
    
    // Get tags and topics to include in response
    const tags = await contentRepo.getTags(draft.id);
    const topics = await contentRepo.getTopics(draft.id);
    
    res.status(201).json({
      success: true,
      data: {
        ...draft,
        tags,
        topics
      }
    });
  })
);

/**
 * Update draft content
 * PUT /api/content/draft/:id
 */
router.put('/draft/:id',
  authenticate,
  requireVerified,
  [
    param('id').isNumeric().withMessage('ID must be a number'),
    body('title').optional().isString().trim().isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters'),
    body('body').optional().isString().withMessage('Body must be a string'),
    body('body_html').optional().isString().withMessage('HTML body must be a string'),
    body('tagIds').optional().isArray().withMessage('Tags must be an array'),
    body('topicIds').optional().isArray().withMessage('Topics must be an array'),
    body('edit_comment').optional().isString().withMessage('Edit comment must be a string')
  ],
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    const { title, body, body_html, tagIds, topicIds, edit_comment } = req.body;
    
    // Check if content exists and belongs to user
    const content = await contentRepo.findById(id);
    if (!content) {
      throw new NotFoundError('Content not found');
    }
    
    if (content.author_id !== req.user.id) {
      throw new ForbiddenError('You can only edit your own content');
    }
    
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (body !== undefined) updateData.body = body;
    if (body_html !== undefined) updateData.body_html = body_html;
    
    // Update the draft
    const updatedDraft = await contentRepo.updateDraft(id, updateData, req.user.id, edit_comment);
    
    // Update tags if provided
    if (tagIds) {
      await contentRepo.updateTags(id, tagIds);
    }
    
    // Update topics if provided
    if (topicIds) {
      await contentRepo.updateTopics(id, topicIds);
    }
    
    // Get updated tags and topics
    const tags = await contentRepo.getTags(id);
    const topics = await contentRepo.getTopics(id);
    
    res.json({
      success: true,
      data: {
        ...updatedDraft,
        tags,
        topics
      }
    });
  })
);

/**
 * Publish draft content
 * POST /api/content/draft/:id/publish
 */
router.post('/draft/:id/publish',
  authenticate,
  requireVerified,
  [
    param('id').isNumeric().withMessage('ID must be a number')
  ],
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    
    // Check if content exists and belongs to user
    const content = await contentRepo.findById(id);
    if (!content) {
      throw new NotFoundError('Content not found');
    }
    
    if (content.author_id !== req.user.id) {
      throw new ForbiddenError('You can only publish your own content');
    }
    
    // Publish the draft
    const published = await contentRepo.publishDraft(id);
    
    // Get tags and topics to include in response
    const tags = await contentRepo.getTags(id);
    const topics = await contentRepo.getTopics(id);
    
    res.json({
      success: true,
      data: {
        ...published,
        tags,
        topics
      }
    });
  })
);

/**
 * Get user's draft content
 * GET /api/content/drafts
 */
router.get('/drafts',
  authenticate,
  asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    
    const drafts = await contentRepo.findDrafts(req.user.id, limit, offset);
    
    // Get tags and topics for each draft
    const draftsWithDetails = await Promise.all(
      drafts.map(async (draft) => {
        const tags = await contentRepo.getTags(draft.id);
        const topics = await contentRepo.getTopics(draft.id);
        return { ...draft, tags, topics };
      })
    );
    
    res.json({
      success: true,
      data: draftsWithDetails
    });
  })
);

/**
 * Get content by ID
 * GET /api/content/:id
 */
router.get('/:id',
  [
    param('id').isNumeric().withMessage('ID must be a number')
  ],
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    
    const content = await contentRepo.findWithAuthor(id);
    if (!content) {
      throw new NotFoundError('Content not found');
    }
    
    // Check if content is draft or hidden
    if (content.status === ContentStatus.DRAFT || content.status === ContentStatus.HIDDEN) {
      // If user is not authenticated, they can't see draft/hidden content
      if (!req.user) {
        throw new NotFoundError('Content not found');
      }
      
      // Only author can see their own drafts
      if (content.author_id !== req.user.id) {
        throw new NotFoundError('Content not found');
      }
    }
    
    // Increment view count for published content
    if (content.status === ContentStatus.PUBLISHED) {
      await contentRepo.incrementViews(id);
    }
    
    // Get tags and topics
    const tags = await contentRepo.getTags(id);
    const topics = await contentRepo.getTopics(id);
    
    res.json({
      success: true,
      data: {
        ...content,
        tags,
        topics
      }
    });
  })
);

/**
 * Update published content
 * PUT /api/content/:id
 */
router.put('/:id',
  authenticate,
  requireVerified,
  [
    param('id').isNumeric().withMessage('ID must be a number'),
    body('title').optional().isString().trim().isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters'),
    body('body').optional().isString().withMessage('Body must be a string'),
    body('body_html').optional().isString().withMessage('HTML body must be a string'),
    body('tagIds').optional().isArray().withMessage('Tags must be an array'),
    body('topicIds').optional().isArray().withMessage('Topics must be an array'),
    body('edit_comment').optional().isString().withMessage('Edit comment must be a string')
  ],
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    const { title, body, body_html, tagIds, topicIds, edit_comment } = req.body;
    
    // Check if content exists and belongs to user or user has edit privileges
    const content = await contentRepo.findById(id);
    if (!content) {
      throw new NotFoundError('Content not found');
    }
    
    if (content.author_id !== req.user.id && req.user.reputation < 2000) {
      throw new ForbiddenError('You do not have permission to edit this content');
    }
    
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (body !== undefined) updateData.body = body;
    if (body_html !== undefined) updateData.body_html = body_html;
    
    // Update the content
    const updatedContent = await contentRepo.updateContent(id, updateData, req.user.id, edit_comment);
    
    // Update tags if provided
    if (tagIds) {
      await contentRepo.updateTags(id, tagIds);
    }
    
    // Update topics if provided
    if (topicIds) {
      await contentRepo.updateTopics(id, topicIds);
    }
    
    // Get updated tags and topics
    const tags = await contentRepo.getTags(id);
    const topics = await contentRepo.getTopics(id);
    
    res.json({
      success: true,
      data: {
        ...updatedContent,
        tags,
        topics
      }
    });
  })
);

/**
 * Autosave content
 * POST /api/content/:id/autosave
 */
router.post('/:id/autosave',
  authenticate,
  [
    param('id').isNumeric().withMessage('ID must be a number'),
    body('title').optional().isString(),
    body('body').isString().notEmpty().withMessage('Body is required'),
    body('body_html').isString().notEmpty().withMessage('HTML body is required')
  ],
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    const { title, body, body_html } = req.body;
    
    // Check if content exists and belongs to user
    const content = await contentRepo.findById(id);
    if (!content) {
      throw new NotFoundError('Content not found');
    }
    
    if (content.author_id !== req.user.id) {
      throw new ForbiddenError('You can only autosave your own content');
    }
    
    // Autosave without creating a new version
    const success = await contentRepo.autosaveContent(id, title || null, body, body_html);
    
    res.json({
      success,
      message: success ? 'Content autosaved successfully' : 'Failed to autosave content'
    });
  })
);

/**
 * Get content versions
 * GET /api/content/:id/versions
 */
router.get('/:id/versions',
  [
    param('id').isNumeric().withMessage('ID must be a number')
  ],
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    
    // Check if content exists
    const content = await contentRepo.findById(id);
    if (!content) {
      throw new NotFoundError('Content not found');
    }
    
    // Check if it's a draft or hidden - only author can see versions
    if ((content.status === ContentStatus.DRAFT || content.status === ContentStatus.HIDDEN) && 
        (!req.user || content.author_id !== req.user.id)) {
      throw new NotFoundError('Content not found');
    }
    
    const versions = await contentRepo.getVersions(id);
    
    res.json({
      success: true,
      data: versions
    });
  })
);

/**
 * Get specific content version
 * GET /api/content/:id/versions/:versionNumber
 */
router.get('/:id/versions/:versionNumber',
  [
    param('id').isNumeric().withMessage('ID must be a number'),
    param('versionNumber').isNumeric().withMessage('Version number must be a number')
  ],
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    const versionNumber = parseInt(req.params.versionNumber);
    
    // Check if content exists
    const content = await contentRepo.findById(id);
    if (!content) {
      throw new NotFoundError('Content not found');
    }
    
    // Check if it's a draft or hidden - only author can see versions
    if ((content.status === ContentStatus.DRAFT || content.status === ContentStatus.HIDDEN) && 
        (!req.user || content.author_id !== req.user.id)) {
      throw new NotFoundError('Content not found');
    }
    
    const version = await contentRepo.getVersion(id, versionNumber);
    
    if (!version) {
      throw new NotFoundError('Version not found');
    }
    
    res.json({
      success: true,
      data: version
    });
  })
);

/**
 * Revert to a specific version
 * POST /api/content/:id/versions/:versionId/revert
 */
router.post('/:id/versions/:versionId/revert',
  authenticate,
  requireVerified,
  [
    param('id').isNumeric().withMessage('ID must be a number'),
    param('versionId').isNumeric().withMessage('Version ID must be a number')
  ],
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    const versionId = parseInt(req.params.versionId);
    
    // Check if content exists and belongs to user or user has edit privileges
    const content = await contentRepo.findById(id);
    if (!content) {
      throw new NotFoundError('Content not found');
    }
    
    if (content.author_id !== req.user.id && req.user.reputation < 2000) {
      throw new ForbiddenError('You do not have permission to revert this content');
    }
    
    // Revert to the specified version
    const updated = await contentRepo.revertToVersion(id, versionId, req.user.id);
    
    // Get tags and topics
    const tags = await contentRepo.getTags(id);
    const topics = await contentRepo.getTopics(id);
    
    res.json({
      success: true,
      data: {
        ...updated,
        tags,
        topics
      }
    });
  })
);

/**
 * Vote on content
 * POST /api/content/:id/vote
 */
router.post('/:id/vote',
  authenticate,
  requireVerified,
  [
    param('id').isNumeric().withMessage('ID must be a number'),
    body('vote_type').isIn([1, -1]).withMessage('Vote type must be 1 (upvote) or -1 (downvote)')
  ],
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    const { vote_type } = req.body;
    
    // Check if content exists and is published
    const content = await contentRepo.findById(id);
    if (!content || content.status !== ContentStatus.PUBLISHED) {
      throw new NotFoundError('Content not found');
    }
    
    // Can't vote on your own content
    if (content.author_id === req.user.id) {
      throw new BadRequestError('You cannot vote on your own content');
    }
    
    // Vote on content
    const success = await contentRepo.vote(req.user.id, id, vote_type);
    
    res.json({
      success,
      message: success 
        ? `Successfully ${vote_type === 1 ? 'upvoted' : 'downvoted'} content` 
        : 'Failed to vote on content'
    });
  })
);

/**
 * Delete content (soft delete)
 * DELETE /api/content/:id
 */
router.delete('/:id',
  authenticate,
  requireVerified,
  [
    param('id').isNumeric().withMessage('ID must be a number')
  ],
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    
    // Check if content exists and belongs to user or user has delete privileges
    const content = await contentRepo.findById(id);
    if (!content) {
      throw new NotFoundError('Content not found');
    }
    
    if (content.author_id !== req.user.id && req.user.reputation < 5000) {
      throw new ForbiddenError('You do not have permission to delete this content');
    }
    
    // Soft delete the content
    const success = await contentRepo.softDelete(id);
    
    res.json({
      success,
      message: success ? 'Content deleted successfully' : 'Failed to delete content'
    });
  })
);

/**
 * Get latest content
 * GET /api/content
 */
router.get('/',
  asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    const type = req.query.type as ContentType;
    
    let content;
    if (type) {
      content = await contentRepo.findByType(type, limit, offset);
    } else {
      content = await contentRepo.findRecent(limit, offset);
    }
    
    // Get tags and topics for each content
    const contentWithDetails = await Promise.all(
      content.map(async (item) => {
        const tags = await contentRepo.getTags(item.id);
        const topics = await contentRepo.getTopics(item.id);
        return { ...item, tags, topics };
      })
    );
    
    res.json({
      success: true,
      data: contentWithDetails
    });
  })
);

export default router;