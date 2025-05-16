/**
 * Embedding Hooks
 * Hooks to automatically generate embeddings for new content and tools
 */

import { embeddingService } from './embeddingService';
import logger from '../../config/logger';
import db from '../../config/database';
import env from '../../config/environment';

/**
 * Hook to generate and store embeddings for content
 */
export async function generateContentEmbedding(
  contentId: number,
  content: string
): Promise<boolean> {
  if (!env.VECTOR_SEARCH_ENABLED) {
    return false;
  }
  
  try {
    // Generate embedding
    const startTime = Date.now();
    const embedding = await embeddingService.generateEmbedding(content);
    
    if (!embedding) {
      logger.error(`Failed to generate embedding for content ${contentId}`);
      return false;
    }
    
    // Store embedding in database
    const pgVector = `[${embedding.join(',')}]`;
    
    await db.query(
      `UPDATE content SET body_vector = $1 WHERE id = $2`,
      [pgVector, contentId]
    );
    
    logger.info(`Generated and stored embedding for content ${contentId} in ${Date.now() - startTime}ms`);
    return true;
  } catch (error) {
    logger.error(`Error generating embedding for content ${contentId}:`, error);
    return false;
  }
}

/**
 * Hook to generate and store embeddings for tools
 */
export async function generateToolEmbedding(
  toolId: number,
  description: string
): Promise<boolean> {
  if (!env.VECTOR_SEARCH_ENABLED) {
    return false;
  }
  
  try {
    // Generate embedding
    const startTime = Date.now();
    const embedding = await embeddingService.generateEmbedding(description);
    
    if (!embedding) {
      logger.error(`Failed to generate embedding for tool ${toolId}`);
      return false;
    }
    
    // Store embedding in database
    const pgVector = `[${embedding.join(',')}]`;
    
    await db.query(
      `UPDATE tools SET description_vector = $1 WHERE id = $2`,
      [pgVector, toolId]
    );
    
    logger.info(`Generated and stored embedding for tool ${toolId} in ${Date.now() - startTime}ms`);
    return true;
  } catch (error) {
    logger.error(`Error generating embedding for tool ${toolId}:`, error);
    return false;
  }
}

/**
 * Bulk update embeddings for content (e.g., for backfilling)
 */
export async function bulkGenerateContentEmbeddings(limit: number = 100): Promise<{
  processed: number;
  successful: number;
  failed: number;
}> {
  if (!env.VECTOR_SEARCH_ENABLED) {
    return { processed: 0, successful: 0, failed: 0 };
  }
  
  let processed = 0;
  let successful = 0;
  let failed = 0;
  
  try {
    // Get content items without embeddings
    const contentResult = await db.query(
      `SELECT id, body FROM content 
       WHERE body_vector IS NULL AND status = 'published'
       LIMIT $1`,
      [limit]
    );
    
    const contentItems = contentResult.rows;
    processed = contentItems.length;
    
    if (contentItems.length === 0) {
      logger.info('No content items found without embeddings');
      return { processed, successful, failed };
    }
    
    // Generate embeddings in batches
    const texts = contentItems.map((item: { body: string }) => item.body);
    const embeddings = await embeddingService.generateEmbeddings(texts);
    
    // Update database with embeddings
    for (let i = 0; i < contentItems.length; i++) {
      const contentId = contentItems[i].id;
      const embedding = embeddings[i];
      
      if (embedding) {
        const pgVector = `[${embedding.join(',')}]`;
        
        await db.query(
          `UPDATE content SET body_vector = $1 WHERE id = $2`,
          [pgVector, contentId]
        );
        
        successful++;
      } else {
        failed++;
        logger.error(`Failed to generate embedding for content ${contentId}`);
      }
    }
    
    logger.info(`Bulk embedding generation complete: ${successful} successful, ${failed} failed`);
    return { processed, successful, failed };
  } catch (error) {
    logger.error('Error in bulk generating content embeddings:', error);
    return { processed, successful, failed };
  }
}

/**
 * Bulk update embeddings for tools (e.g., for backfilling)
 */
export async function bulkGenerateToolEmbeddings(limit: number = 100): Promise<{
  processed: number;
  successful: number;
  failed: number;
}> {
  if (!env.VECTOR_SEARCH_ENABLED) {
    return { processed: 0, successful: 0, failed: 0 };
  }
  
  let processed = 0;
  let successful = 0;
  let failed = 0;
  
  try {
    // Get tool items without embeddings
    const toolResult = await db.query(
      `SELECT id, description FROM tools 
       WHERE description_vector IS NULL AND status = 'active'
       LIMIT $1`,
      [limit]
    );
    
    const toolItems = toolResult.rows;
    processed = toolItems.length;
    
    if (toolItems.length === 0) {
      logger.info('No tool items found without embeddings');
      return { processed, successful, failed };
    }
    
    // Generate embeddings in batches
    const texts = toolItems.map((item: { description: string }) => item.description);
    const embeddings = await embeddingService.generateEmbeddings(texts);
    
    // Update database with embeddings
    for (let i = 0; i < toolItems.length; i++) {
      const toolId = toolItems[i].id;
      const embedding = embeddings[i];
      
      if (embedding) {
        const pgVector = `[${embedding.join(',')}]`;
        
        await db.query(
          `UPDATE tools SET description_vector = $1 WHERE id = $2`,
          [pgVector, toolId]
        );
        
        successful++;
      } else {
        failed++;
        logger.error(`Failed to generate embedding for tool ${toolId}`);
      }
    }
    
    logger.info(`Bulk tool embedding generation complete: ${successful} successful, ${failed} failed`);
    return { processed, successful, failed };
  } catch (error) {
    logger.error('Error in bulk generating tool embeddings:', error);
    return { processed, successful, failed };
  }
}