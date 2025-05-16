/**
 * Search Service
 * Handles both lexical and semantic search across content and tools
 */

import ContentRepository from '../../models/ContentRepository';
import ToolRepository from '../../models/ToolRepository';
import { embeddingService } from './embeddingService';
import logger from '../../config/logger';
import env from '../../config/environment';
import db from '../../config/database';

const contentRepository = new ContentRepository();
const toolRepository = new ToolRepository();

// Result types interface
export enum SearchResultType {
  CONTENT = 'content',
  TOOL = 'tool'
}

export interface SearchResult {
  type: SearchResultType;
  item: any;
  similarity?: number;
}

class SearchService {
  private readonly vectorSearchEnabled: boolean;
  
  constructor() {
    // Check if vector search is enabled
    this.vectorSearchEnabled = !!env.VECTOR_SEARCH_ENABLED && !!env.OPENAI_API_KEY;
    
    if (!this.vectorSearchEnabled) {
      logger.warn('Vector search is disabled. Using lexical search only.');
    }
  }

  /**
   * Search for content and tools that match the query
   * Uses semantic search if available, with lexical fallback
   */
  async search(query: string, options: {
    contentLimit?: number;
    toolLimit?: number;
    offset?: number;
    contentOnly?: boolean;
    toolsOnly?: boolean;
    useVector?: boolean;
  } = {}): Promise<{
    content: any[];
    tools: any[];
    isVectorSearch: boolean;
    timing: {
      total: number;
      embedding?: number;
      contentSearch?: number;
      toolSearch?: number;
    };
  }> {
    const startTime = Date.now();
    const timing: {
      total: number;
      embedding?: number;
      contentSearch?: number;
      toolSearch?: number;
    } = { total: 0 };
    
    const {
      contentLimit = 10,
      toolLimit = 10,
      offset = 0,
      contentOnly = false,
      toolsOnly = false,
      useVector = true
    } = options;
    
    // Initialize results
    let contentResults: any[] = [];
    let toolResults: any[] = [];
    let isVectorSearch = false;
    
    // Check if we should use vector search and it's available
    if (useVector && this.vectorSearchEnabled && query.trim().length > 0) {
      try {
        // Generate embeddings for the query
        const embeddingStart = Date.now();
        const embedding = await embeddingService.generateEmbedding(query);
        timing.embedding = Date.now() - embeddingStart;
        
        if (embedding) {
          isVectorSearch = true;
          
          // Search content with vector similarity
          if (!toolsOnly) {
            const contentStart = Date.now();
            contentResults = await contentRepository.vectorSearch(embedding, contentLimit, offset);
            timing.contentSearch = Date.now() - contentStart;
          }
          
          // Search tools with vector similarity
          if (!contentOnly) {
            const toolStart = Date.now();
            toolResults = await toolRepository.vectorSearch(embedding, toolLimit, offset);
            timing.toolSearch = Date.now() - toolStart;
          }
        } else {
          logger.warn('Failed to generate embeddings for search query. Falling back to lexical search.');
          isVectorSearch = false;
        }
      } catch (error) {
        logger.error('Error in vector search:', error);
        isVectorSearch = false;
      }
    }
    
    // Fall back to lexical search if vector search wasn't successful
    if (!isVectorSearch) {
      // Search content with lexical search
      if (!toolsOnly) {
        const contentStart = Date.now();
        contentResults = await contentRepository.search(query, contentLimit, offset);
        timing.contentSearch = Date.now() - contentStart;
      }
      
      // Search tools with lexical search
      if (!contentOnly) {
        const toolStart = Date.now();
        toolResults = await toolRepository.search(query, toolLimit, offset);
        timing.toolSearch = Date.now() - toolStart;
      }
    }
    
    // Calculate total time
    timing.total = Date.now() - startTime;
    
    // Log search timing for performance monitoring
    logger.info(`Search completed in ${timing.total}ms`, {
      query_length: query.length,
      is_vector_search: isVectorSearch,
      content_count: contentResults.length,
      tool_count: toolResults.length,
      timing
    });
    
    return {
      content: contentResults,
      tools: toolResults,
      isVectorSearch,
      timing
    };
  }
  
  /**
   * Add tags to search results for content items
   */
  async enrichContentResults(results: any[]): Promise<any[]> {
    if (results.length === 0) return results;
    
    const enriched = await Promise.all(results.map(async (content) => {
      try {
        const tags = await contentRepository.getTags(content.id);
        const topics = await contentRepository.getTopics(content.id);
        
        return {
          ...content,
          tags,
          topics
        };
      } catch (error) {
        logger.error(`Error enriching content ${content.id}:`, error);
        return content;
      }
    }));
    
    return enriched;
  }
  
  /**
   * Add tags to search results for tool items
   */
  async enrichToolResults(results: any[]): Promise<any[]> {
    if (results.length === 0) return results;
    
    const enriched = await Promise.all(results.map(async (tool) => {
      try {
        const tags = await toolRepository.getTags(tool.id);
        
        return {
          ...tool,
          tags
        };
      } catch (error) {
        logger.error(`Error enriching tool ${tool.id}:`, error);
        return tool;
      }
    }));
    
    return enriched;
  }
  
  /**
   * Combined enriched search
   */
  async searchEnriched(query: string, options = {}): Promise<{
    content: any[];
    tools: any[];
    isVectorSearch: boolean;
    timing: {
      total: number;
      embedding?: number;
      contentSearch?: number;
      toolSearch?: number;
      enrichment?: number;
    };
  }> {
    // First get the basic search results
    const results = await this.search(query, options);
    
    // Then enrich them
    const enrichmentStart = Date.now();
    const enrichedContent = await this.enrichContentResults(results.content);
    const enrichedTools = await this.enrichToolResults(results.tools);
    const enrichmentTime = Date.now() - enrichmentStart;
    
    // Update timing information
    const timing = {
      ...results.timing,
      enrichment: enrichmentTime,
      total: results.timing.total + enrichmentTime
    };
    
    return {
      content: enrichedContent,
      tools: enrichedTools,
      isVectorSearch: results.isVectorSearch,
      timing
    };
  }
}

// Create and export a singleton instance
export const searchService = new SearchService();