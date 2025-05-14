/**
 * Embedding Service
 * Handles text embedding generation using OpenAI's API
 */

import { OpenAI } from 'openai';
import env from '../../config/environment';
import logger from '../../config/logger';

class EmbeddingService {
  private openai: OpenAI;
  private embeddingModel: string = 'text-embedding-3-small';
  private batchSize: number = 100; // Maximum number of texts to embed in one API call

  constructor() {
    if (!env.OPENAI_API_KEY) {
      logger.warn('OpenAI API key not provided. Vector search will not work correctly.');
    }

    this.openai = new OpenAI({
      apiKey: env.OPENAI_API_KEY
    });
  }

  /**
   * Generate embeddings for a single text
   */
  async generateEmbedding(text: string): Promise<number[] | null> {
    try {
      const truncatedText = this.truncateText(text);
      
      const response = await this.openai.embeddings.create({
        model: this.embeddingModel,
        input: truncatedText,
        encoding_format: 'float'
      });

      return response.data[0].embedding;
    } catch (error) {
      logger.error('Error generating embedding:', error);
      return null;
    }
  }

  /**
   * Generate embeddings for multiple texts in batches
   */
  async generateEmbeddings(texts: string[]): Promise<(number[] | null)[]> {
    try {
      // Process in batches to avoid API limits
      const embeddings: (number[] | null)[] = [];
      
      // Process texts in batches
      for (let i = 0; i < texts.length; i += this.batchSize) {
        const batch = texts.slice(i, i + this.batchSize);
        const truncatedBatch = batch.map(text => this.truncateText(text));
        
        const response = await this.openai.embeddings.create({
          model: this.embeddingModel,
          input: truncatedBatch,
          encoding_format: 'float'
        });

        // Extract embeddings from response
        const batchEmbeddings = response.data.map(item => item.embedding);
        embeddings.push(...batchEmbeddings);
      }

      return embeddings;
    } catch (error) {
      logger.error('Error generating batch embeddings:', error);
      return texts.map(() => null);
    }
  }

  /**
   * OpenAI has token limits, so we truncate long text to ensure we stay within limits
   */
  private truncateText(text: string): string {
    // A rough estimate - for embeddings, 3-small has an 8k token context window
    // This is approximately 6000 words or about 30,000 characters
    const maxLength = 30000;
    if (text.length <= maxLength) {
      return text;
    }
    
    return text.substring(0, maxLength);
  }
}

// Create and export a singleton instance
export const embeddingService = new EmbeddingService();