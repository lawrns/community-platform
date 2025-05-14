/**
 * Tools API Routes
 * Handles tool listing, details, reviews, and vendor claiming
 */

import { Router } from 'express';
import { body, param, query } from 'express-validator';
import asyncHandler from '../../../utils/asyncHandler';
import { authenticate, requireVerified } from '../../../middlewares/auth/authMiddleware';
import ToolRepository from '../../../models/ToolRepository';
import { ToolStatus } from '../../../models';
import { AppError, BadRequestError, NotFoundError, ForbiddenError } from '../../../utils/errorHandler';

const router = Router();
const toolRepo = new ToolRepository();

/**
 * Get tools with optional filtering
 * GET /api/tools
 */
router.get('/',
  [
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be a non-negative integer'),
    query('search').optional().isString().withMessage('Search query must be a string'),
    query('status').optional().isIn(Object.values(ToolStatus)).withMessage('Invalid status'),
    query('tag').optional().isNumeric().withMessage('Tag ID must be a number')
  ],
  asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    const search = req.query.search as string;
    const status = req.query.status as ToolStatus;
    const tagId = req.query.tag ? parseInt(req.query.tag as string) : undefined;
    
    let tools;
    
    // Apply filters if provided
    if (search) {
      tools = await toolRepo.search(search, limit, offset);
    } else if (tagId) {
      tools = await toolRepo.findByTag(tagId, limit, offset);
    } else if (status) {
      tools = await toolRepo.findByStatus(status, limit, offset);
    } else {
      tools = await toolRepo.findPopular(limit, offset);
    }
    
    // Get tags for each tool
    const toolsWithTags = await Promise.all(
      tools.map(async (tool) => {
        const tags = await toolRepo.getTags(tool.id);
        return { ...tool, tags };
      })
    );
    
    res.json({
      success: true,
      data: toolsWithTags
    });
  })
);

/**
 * Get tool by ID
 * GET /api/tools/:id
 */
router.get('/:id',
  [
    param('id').isNumeric().withMessage('ID must be a number')
  ],
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    
    // Get tool with vendor information
    const tool = await toolRepo.findWithVendor(id);
    if (!tool) {
      throw new NotFoundError('Tool not found');
    }
    
    // Get tags for the tool
    const tags = await toolRepo.getTags(id);
    
    // Get reviews for the tool
    const reviews = await toolRepo.getReviews(id);
    
    res.json({
      success: true,
      data: {
        ...tool,
        tags,
        reviews
      }
    });
  })
);

/**
 * Add a review for a tool
 * POST /api/tools/:id/reviews
 */
router.post('/:id/reviews',
  authenticate,
  requireVerified,
  [
    param('id').isNumeric().withMessage('ID must be a number'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('title').optional().isString().trim().isLength({ max: 200 }).withMessage('Title must be less than 200 characters'),
    body('content').isString().trim().isLength({ min: 10, max: 2000 }).withMessage('Content must be between 10 and 2000 characters')
  ],
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    const { rating, title, content } = req.body;
    
    // Check if tool exists
    const tool = await toolRepo.findById(id);
    if (!tool) {
      throw new NotFoundError('Tool not found');
    }
    
    // Add the review
    const review = await toolRepo.addReview(id, req.user.id, rating, title || null, content);
    
    res.status(201).json({
      success: true,
      data: review
    });
  })
);

/**
 * Upvote a tool
 * POST /api/tools/:id/upvote
 */
router.post('/:id/upvote',
  authenticate,
  requireVerified,
  [
    param('id').isNumeric().withMessage('ID must be a number')
  ],
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    
    // Check if tool exists
    const tool = await toolRepo.findById(id);
    if (!tool) {
      throw new NotFoundError('Tool not found');
    }
    
    // Upvote the tool
    const success = await toolRepo.upvote(id, req.user.id);
    
    res.json({
      success,
      message: success ? 'Tool upvoted successfully' : 'Failed to upvote tool (may have already voted)'
    });
  })
);

/**
 * Claim a tool as vendor
 * POST /api/tools/:id/claim
 */
router.post('/:id/claim',
  authenticate,
  requireVerified,
  [
    param('id').isNumeric().withMessage('ID must be a number')
  ],
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    
    // Check if tool exists
    const tool = await toolRepo.findById(id);
    if (!tool) {
      throw new NotFoundError('Tool not found');
    }
    
    // Submit claim
    const result = await toolRepo.claimAsVendor(id, req.user.id);
    
    if (!result.success) {
      throw new BadRequestError(result.status);
    }
    
    res.json({
      success: true,
      message: result.status,
      data: {
        claimId: result.claimId
      }
    });
  })
);

/**
 * Add proof to a tool claim
 * POST /api/tools/claims/:id/proof
 */
router.post('/claims/:id/proof',
  authenticate,
  requireVerified,
  [
    param('id').isNumeric().withMessage('ID must be a number'),
    body('proof').isString().trim().isLength({ min: 10 }).withMessage('Proof must be at least 10 characters')
  ],
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    const { proof } = req.body;
    
    // Add proof to claim
    const result = await toolRepo.addClaimProof(id, req.user.id, proof);
    
    if (!result.success) {
      throw new BadRequestError(result.status);
    }
    
    res.json({
      success: true,
      message: 'Proof added to claim successfully'
    });
  })
);

/**
 * Approve a tool claim (admin only)
 * POST /api/tools/claims/:id/approve
 */
router.post('/claims/:id/approve',
  authenticate,
  requireVerified,
  [
    param('id').isNumeric().withMessage('ID must be a number')
  ],
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    
    // Check if user is an admin (reputation > 10000 for this example)
    if (req.user.reputation < 10000) {
      throw new ForbiddenError('Only administrators can approve claims');
    }
    
    // Approve the claim
    const result = await toolRepo.approveToolClaim(id);
    
    if (!result.success) {
      throw new BadRequestError(result.status);
    }
    
    res.json({
      success: true,
      message: 'Claim approved successfully'
    });
  })
);

/**
 * Reject a tool claim (admin only)
 * POST /api/tools/claims/:id/reject
 */
router.post('/claims/:id/reject',
  authenticate,
  requireVerified,
  [
    param('id').isNumeric().withMessage('ID must be a number')
  ],
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    
    // Check if user is an admin (reputation > 10000 for this example)
    if (req.user.reputation < 10000) {
      throw new ForbiddenError('Only administrators can reject claims');
    }
    
    // Reject the claim
    const result = await toolRepo.rejectToolClaim(id);
    
    if (!result.success) {
      throw new BadRequestError(result.status);
    }
    
    res.json({
      success: true,
      message: 'Claim rejected successfully'
    });
  })
);

/**
 * Create a new tool
 * POST /api/tools
 */
router.post('/',
  authenticate,
  requireVerified,
  [
    body('name').isString().trim().isLength({ min: 3, max: 100 }).withMessage('Name must be between 3 and 100 characters'),
    body('description').isString().trim().isLength({ min: 10, max: 500 }).withMessage('Description must be between 10 and 500 characters'),
    body('website_url').isURL().withMessage('Website URL must be a valid URL'),
    body('logo_url').optional().isURL().withMessage('Logo URL must be a valid URL'),
    body('category').isString().trim().withMessage('Category is required'),
    body('pricing_info').isObject().withMessage('Pricing info must be an object'),
    body('features').isArray().withMessage('Features must be an array'),
    body('tagIds').optional().isArray().withMessage('Tags must be an array')
  ],
  asyncHandler(async (req, res) => {
    const { 
      name, description, website_url, logo_url, 
      category, pricing_info, features, tagIds 
    } = req.body;
    
    // Create the tool
    const tool = await toolRepo.create({
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      description,
      website_url,
      logo_url: logo_url || null,
      pricing_info,
      features,
      is_verified: false,
      vendor_id: req.user.id,
      upvotes: 0,
      status: ToolStatus.PENDING
    });
    
    // Add tags if provided
    if (tagIds && tagIds.length > 0) {
      await toolRepo.addTags(tool.id, tagIds);
    }
    
    // Get tags to include in response
    const tags = await toolRepo.getTags(tool.id);
    
    res.status(201).json({
      success: true,
      data: {
        ...tool,
        tags
      }
    });
  })
);

/**
 * Update a tool (vendor only)
 * PUT /api/tools/:id
 */
router.put('/:id',
  authenticate,
  requireVerified,
  [
    param('id').isNumeric().withMessage('ID must be a number'),
    body('name').optional().isString().trim().isLength({ min: 3, max: 100 }).withMessage('Name must be between 3 and 100 characters'),
    body('description').optional().isString().trim().isLength({ min: 10, max: 500 }).withMessage('Description must be between 10 and 500 characters'),
    body('website_url').optional().isURL().withMessage('Website URL must be a valid URL'),
    body('logo_url').optional().isURL().withMessage('Logo URL must be a valid URL'),
    body('pricing_info').optional().isObject().withMessage('Pricing info must be an object'),
    body('features').optional().isArray().withMessage('Features must be an array'),
    body('tagIds').optional().isArray().withMessage('Tags must be an array')
  ],
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    
    // Check if tool exists and user is the vendor
    const tool = await toolRepo.findById(id);
    if (!tool) {
      throw new NotFoundError('Tool not found');
    }
    
    if (tool.vendor_id !== req.user.id) {
      throw new ForbiddenError('You are not authorized to update this tool');
    }
    
    // Update the tool
    const updateData: any = {};
    
    if (req.body.name) {
      updateData.name = req.body.name;
      updateData.slug = req.body.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }
    
    if (req.body.description) updateData.description = req.body.description;
    if (req.body.website_url) updateData.website_url = req.body.website_url;
    if (req.body.logo_url) updateData.logo_url = req.body.logo_url;
    if (req.body.pricing_info) updateData.pricing_info = req.body.pricing_info;
    if (req.body.features) updateData.features = req.body.features;
    
    // Only update if there are changes
    if (Object.keys(updateData).length > 0) {
      updateData.updated_at = new Date();
      await toolRepo.update(id, updateData);
    }
    
    // Update tags if provided
    if (req.body.tagIds) {
      // Implementation needed for updateTags method
      // For now, we'll use addTags as a workaround
      await toolRepo.addTags(id, req.body.tagIds);
    }
    
    // Get updated tool with tags
    const updatedTool = await toolRepo.findWithVendor(id);
    const tags = await toolRepo.getTags(id);
    
    res.json({
      success: true,
      data: {
        ...updatedTool,
        tags
      }
    });
  })
);

export default router;