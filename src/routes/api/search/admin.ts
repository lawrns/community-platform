/**
 * Search Admin API Routes
 * Handles administrative operations for the search system
 */

import { Router } from 'express';
import { asyncHandler } from '../../../utils/asyncHandler';
import { bulkGenerateContentEmbeddings, bulkGenerateToolEmbeddings } from '../../../services/search/embeddingHooks';
import logger from '../../../config/logger';
import env from '../../../config/environment';
import { requireAdmin } from '../../../middlewares/auth/authMiddleware';

const router = Router();

// All routes require admin authorization
router.use(requireAdmin);

/**
 * @route   POST /api/search/admin/backfill-content
 * @desc    Backfill embeddings for content without vectors
 * @access  Admin
 */
router.post('/backfill-content', asyncHandler(async (req, res) => {
  if (!env.VECTOR_SEARCH_ENABLED) {
    return res.status(400).json({
      success: false,
      error: 'Vector search is not enabled'
    });
  }
  
  // Get batch size (default to 100, max 1000)
  const batchSize = Math.min(
    req.body.batchSize ? parseInt(req.body.batchSize) : 100,
    1000
  );
  
  const startTime = Date.now();
  const result = await bulkGenerateContentEmbeddings(batchSize);
  
  logger.info(`Content backfill completed in ${Date.now() - startTime}ms`, result);
  
  return res.json({
    success: true,
    result,
    timing: {
      ms: Date.now() - startTime
    }
  });
}));

/**
 * @route   POST /api/search/admin/backfill-tools
 * @desc    Backfill embeddings for tools without vectors
 * @access  Admin
 */
router.post('/backfill-tools', asyncHandler(async (req, res) => {
  if (!env.VECTOR_SEARCH_ENABLED) {
    return res.status(400).json({
      success: false,
      error: 'Vector search is not enabled'
    });
  }
  
  // Get batch size (default to 100, max 1000)
  const batchSize = Math.min(
    req.body.batchSize ? parseInt(req.body.batchSize) : 100,
    1000
  );
  
  const startTime = Date.now();
  const result = await bulkGenerateToolEmbeddings(batchSize);
  
  logger.info(`Tool backfill completed in ${Date.now() - startTime}ms`, result);
  
  return res.json({
    success: true,
    result,
    timing: {
      ms: Date.now() - startTime
    }
  });
}));

/**
 * @route   GET /api/search/admin/status
 * @desc    Get search system status
 * @access  Admin
 */
router.get('/status', asyncHandler(async (req, res) => {
  const startTime = Date.now();
  
  // Get counts of items with and without embeddings
  const contentStats = await req.db.query(
    `SELECT 
       COUNT(*) as total,
       COUNT(CASE WHEN body_vector IS NOT NULL THEN 1 END) as with_vector
     FROM content
     WHERE status = 'published'`
  );
  
  const toolStats = await req.db.query(
    `SELECT 
       COUNT(*) as total,
       COUNT(CASE WHEN description_vector IS NOT NULL THEN 1 END) as with_vector
     FROM tools
     WHERE status = 'active'`
  );
  
  return res.json({
    success: true,
    vectorSearchEnabled: !!env.VECTOR_SEARCH_ENABLED,
    openAiConfigured: !!env.OPENAI_API_KEY,
    statistics: {
      content: {
        total: parseInt(contentStats.rows[0].total),
        withVector: parseInt(contentStats.rows[0].with_vector),
        coverage: contentStats.rows[0].total > 0 
          ? Math.round((contentStats.rows[0].with_vector / contentStats.rows[0].total) * 100) 
          : 0
      },
      tools: {
        total: parseInt(toolStats.rows[0].total),
        withVector: parseInt(toolStats.rows[0].with_vector),
        coverage: toolStats.rows[0].total > 0 
          ? Math.round((toolStats.rows[0].with_vector / toolStats.rows[0].total) * 100) 
          : 0
      }
    },
    timing: {
      ms: Date.now() - startTime
    }
  });
}));

export default router;