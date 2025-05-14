/**
 * Search API Routes
 * Handles search across content and tools
 */

import { Router } from 'express';
import { searchService } from '../../../services/search/searchService';
import { asyncHandler } from '../../../utils/asyncHandler';
import { z } from 'zod';
import logger from '../../../config/logger';
import adminRoutes from './admin';

const router = Router();

// Admin routes
router.use('/admin', adminRoutes);

// Input validation schema for search
const searchSchema = z.object({
  query: z.string().min(1).max(500),
  limit: z.number().int().min(1).max(50).optional().default(20),
  offset: z.number().int().min(0).optional().default(0),
  contentOnly: z.boolean().optional().default(false),
  toolsOnly: z.boolean().optional().default(false),
  useVector: z.boolean().optional().default(true),
  enrich: z.boolean().optional().default(true)
});

/**
 * @route   GET /api/search
 * @desc    Search content and tools
 * @access  Public
 */
router.get('/', asyncHandler(async (req, res) => {
  const startTime = Date.now();
  
  try {
    // Validate input parameters
    const params = searchSchema.parse({
      query: req.query.q?.toString() || '',
      limit: req.query.limit ? parseInt(req.query.limit.toString()) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset.toString()) : undefined,
      contentOnly: req.query.contentOnly === 'true',
      toolsOnly: req.query.toolsOnly === 'true',
      useVector: req.query.useVector !== 'false',
      enrich: req.query.enrich !== 'false'
    });
    
    // Special case for empty query
    if (!params.query.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Search query cannot be empty'
      });
    }
    
    // Calculate content and tool limits based on contentOnly/toolsOnly flags
    const options = {
      contentLimit: params.contentOnly ? params.limit : Math.floor(params.limit / 2),
      toolLimit: params.toolsOnly ? params.limit : Math.floor(params.limit / 2),
      offset: params.offset,
      contentOnly: params.contentOnly,
      toolsOnly: params.toolsOnly,
      useVector: params.useVector
    };
    
    // Perform search
    const searchResult = params.enrich 
      ? await searchService.searchEnriched(params.query, options)
      : await searchService.search(params.query, options);
    
    // Prepare response
    const response = {
      success: true,
      query: params.query,
      results: {
        content: searchResult.content,
        tools: searchResult.tools
      },
      meta: {
        isVectorSearch: searchResult.isVectorSearch,
        contentCount: searchResult.content.length,
        toolCount: searchResult.tools.length,
        timing: {
          ...searchResult.timing,
          api: Date.now() - startTime
        }
      }
    };
    
    // Log search request for analytics
    logger.info('Search request', {
      query: params.query,
      results_count: searchResult.content.length + searchResult.tools.length,
      is_vector: searchResult.isVectorSearch,
      response_time: Date.now() - startTime
    });
    
    return res.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid search parameters',
        details: error.errors
      });
    }
    
    logger.error('Search API error:', error);
    throw error;
  }
}));

/**
 * @route   GET /api/search/content
 * @desc    Search content only
 * @access  Public
 */
router.get('/content', asyncHandler(async (req, res) => {
  const startTime = Date.now();
  
  try {
    // Validate input parameters
    const params = searchSchema.parse({
      query: req.query.q?.toString() || '',
      limit: req.query.limit ? parseInt(req.query.limit.toString()) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset.toString()) : undefined,
      contentOnly: true,
      toolsOnly: false,
      useVector: req.query.useVector !== 'false',
      enrich: req.query.enrich !== 'false'
    });
    
    // Special case for empty query
    if (!params.query.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Search query cannot be empty'
      });
    }
    
    // Perform search
    const searchResult = params.enrich 
      ? await searchService.searchEnriched(params.query, {
          contentLimit: params.limit,
          offset: params.offset,
          contentOnly: true,
          useVector: params.useVector
        })
      : await searchService.search(params.query, {
          contentLimit: params.limit,
          offset: params.offset,
          contentOnly: true,
          useVector: params.useVector
        });
    
    // Prepare response
    const response = {
      success: true,
      query: params.query,
      results: searchResult.content,
      meta: {
        isVectorSearch: searchResult.isVectorSearch,
        count: searchResult.content.length,
        timing: {
          ...searchResult.timing,
          api: Date.now() - startTime
        }
      }
    };
    
    return res.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid search parameters',
        details: error.errors
      });
    }
    
    logger.error('Content search API error:', error);
    throw error;
  }
}));

/**
 * @route   GET /api/search/tools
 * @desc    Search tools only
 * @access  Public
 */
router.get('/tools', asyncHandler(async (req, res) => {
  const startTime = Date.now();
  
  try {
    // Validate input parameters
    const params = searchSchema.parse({
      query: req.query.q?.toString() || '',
      limit: req.query.limit ? parseInt(req.query.limit.toString()) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset.toString()) : undefined,
      contentOnly: false,
      toolsOnly: true,
      useVector: req.query.useVector !== 'false',
      enrich: req.query.enrich !== 'false'
    });
    
    // Special case for empty query
    if (!params.query.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Search query cannot be empty'
      });
    }
    
    // Perform search
    const searchResult = params.enrich 
      ? await searchService.searchEnriched(params.query, {
          toolLimit: params.limit,
          offset: params.offset,
          toolsOnly: true,
          useVector: params.useVector
        })
      : await searchService.search(params.query, {
          toolLimit: params.limit,
          offset: params.offset,
          toolsOnly: true,
          useVector: params.useVector
        });
    
    // Prepare response
    const response = {
      success: true,
      query: params.query,
      results: searchResult.tools,
      meta: {
        isVectorSearch: searchResult.isVectorSearch,
        count: searchResult.tools.length,
        timing: {
          ...searchResult.timing,
          api: Date.now() - startTime
        }
      }
    };
    
    return res.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid search parameters',
        details: error.errors
      });
    }
    
    logger.error('Tools search API error:', error);
    throw error;
  }
}));

export default router;