/**
 * Tool Repository
 * Database operations for AI tools
 */

import Repository from './Repository';
import { Tool, ToolStatus } from './index';
import db from '../config/database';
import { generateToolEmbedding } from '../services/search/embeddingHooks';

/**
 * Repository for tool operations
 */
export default class ToolRepository extends Repository<Tool> {
  protected tableName = 'tools';
  
  /**
   * Override create method to generate embeddings for new tools
   */
  async create(data: Partial<Tool>): Promise<Tool> {
    const tool = await super.create(data);
    
    // Generate embedding for description
    if (tool && tool.description && tool.status === 'active') {
      generateToolEmbedding(tool.id, tool.description).catch(error => {
        console.error(`Error generating embedding for new tool ${tool.id}:`, error);
      });
    }
    
    return tool;
  }
  
  /**
   * Override update method to regenerate embeddings when description changes
   */
  async update(id: number | string, data: Partial<Tool>): Promise<Tool | null> {
    const tool = await super.update(id, data);
    
    // Generate embedding if description was updated
    if (tool && data.description && tool.status === 'active') {
      generateToolEmbedding(tool.id, tool.description).catch(error => {
        console.error(`Error generating embedding for updated tool ${tool.id}:`, error);
      });
    }
    
    return tool;
  }

  /**
   * Find tool with vendor information
   */
  async findWithVendor(id: number): Promise<any | null> {
    const result = await db.query(
      `SELECT t.*, u.username, u.name, u.avatar_url 
       FROM ${this.tableName} t
       LEFT JOIN users u ON t.vendor_id = u.id
       WHERE t.id = $1`,
      [id]
    );
    
    return result.rows.length ? result.rows[0] : null;
  }

  /**
   * Find tools by status
   */
  async findByStatus(status: ToolStatus, limit: number = 20, offset: number = 0): Promise<Tool[]> {
    const result = await db.query(
      `SELECT * FROM ${this.tableName} 
       WHERE status = $1
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [status, limit, offset]
    );
    
    return result.rows as Tool[];
  }

  /**
   * Get tags for a tool
   */
  async getTags(toolId: number): Promise<any[]> {
    const result = await db.query(
      `SELECT t.* 
       FROM tags t
       JOIN tool_tags tt ON t.id = tt.tag_id
       WHERE tt.tool_id = $1`,
      [toolId]
    );
    
    return result.rows;
  }

  /**
   * Add tags to a tool
   */
  async addTags(toolId: number, tagIds: number[]): Promise<void> {
    // Use a transaction to ensure all tags are added successfully
    await db.transaction(async (client) => {
      for (const tagId of tagIds) {
        if ('query' in client) {
          await client.query(
            `INSERT INTO tool_tags (tool_id, tag_id, created_at)
             VALUES ($1, $2, NOW())
             ON CONFLICT (tool_id, tag_id) DO NOTHING`,
            [toolId, tagId]
          );
        } else {
          throw new Error('Transaction client missing query method');
        }
      }
    });
  }
  
  /**
   * Update tags for a tool (remove existing and add new ones)
   */
  async updateTags(toolId: number, tagIds: number[]): Promise<void> {
    await db.transaction(async (client) => {
      // Remove existing tags
      if ('query' in client) {
        await client.query(
          `DELETE FROM tool_tags WHERE tool_id = $1`,
          [toolId]
        );
        
        // Add new tags
        for (const tagId of tagIds) {
          await client.query(
            `INSERT INTO tool_tags (tool_id, tag_id, created_at)
             VALUES ($1, $2, NOW())`,
            [toolId, tagId]
          );
        }
      } else {
        throw new Error('Transaction client missing query method');
      }
    });
  }

  /**
   * Get reviews for a tool
   */
  async getReviews(toolId: number, limit: number = 20, offset: number = 0): Promise<any[]> {
    const result = await db.query(
      `SELECT tr.*, u.username, u.name, u.avatar_url 
       FROM tool_reviews tr
       JOIN users u ON tr.user_id = u.id
       WHERE tr.tool_id = $1 AND tr.status = 'published'
       ORDER BY tr.upvotes DESC, tr.created_at DESC 
       LIMIT $2 OFFSET $3`,
      [toolId, limit, offset]
    );
    
    return result.rows;
  }

  /**
   * Add a review for a tool
   */
  async addReview(toolId: number, userId: number, rating: number, title: string | null, content: string): Promise<any> {
    const result = await db.query(
      `INSERT INTO tool_reviews (tool_id, user_id, rating, title, content, upvotes, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, 0, 'published', NOW(), NOW())
       ON CONFLICT (tool_id, user_id) DO UPDATE 
       SET rating = $3, title = $4, content = $5, updated_at = NOW()
       RETURNING *`,
      [toolId, userId, rating, title, content]
    );
    
    return result.rows[0];
  }

  /**
   * Upvote a tool
   */
  async upvote(toolId: number, userId: number): Promise<boolean> {
    try {
      await db.transaction(async (client) => {
        if ('query' in client) {
          // Check if user already voted for this tool
          const existingVote = await client.query(
            `SELECT * FROM user_votes 
             WHERE user_id = $1 AND tool_id = $2`,
            [userId, toolId]
          );
          
          if (existingVote.rows.length > 0) {
            // User already voted, do nothing
            return;
          }
          
          // Create a new vote
          await client.query(
            `INSERT INTO user_votes (user_id, tool_id, vote_type, created_at, updated_at)
             VALUES ($1, $2, 1, NOW(), NOW())`,
            [userId, toolId]
          );
          
          // Increment tool upvotes
          await client.query(
            `UPDATE tools SET upvotes = upvotes + 1 WHERE id = $1`,
            [toolId]
          );
        } else {
          throw new Error('Transaction client missing query method');
        }
      });
      
      return true;
    } catch (error) {
      console.error('Error upvoting tool:', error);
      return false;
    }
  }

  /**
   * Search tools (keyword search)
   */
  async search(query: string, limit: number = 20, offset: number = 0): Promise<any[]> {
    // This is a simple lexical search, vector search would be implemented separately
    const result = await db.query(
      `SELECT t.*, COUNT(tr.id) as review_count, AVG(tr.rating) as avg_rating
       FROM ${this.tableName} t
       LEFT JOIN tool_reviews tr ON t.id = tr.tool_id AND tr.status = 'published'
       WHERE (t.name ILIKE $1 OR t.description ILIKE $1) AND t.status = 'active'
       GROUP BY t.id
       ORDER BY t.upvotes DESC
       LIMIT $2 OFFSET $3`,
      [`%${query}%`, limit, offset]
    );
    
    return result.rows;
  }
  
  /**
   * Vector search (semantic search) for tools
   */
  async vectorSearch(embedding: number[], limit: number = 20, offset: number = 0, threshold: number = 0.75): Promise<any[]> {
    // Convert embedding array to Postgres vector format
    const pgVector = `[${embedding.join(',')}]`;
    
    // Use pgvector's cosine similarity operator (<#>) for semantic search
    const result = await db.query(
      `SELECT t.*, COUNT(tr.id) as review_count, AVG(tr.rating) as avg_rating,
              (t.description_vector <#> $1) as similarity
       FROM ${this.tableName} t
       LEFT JOIN tool_reviews tr ON t.id = tr.tool_id AND tr.status = 'published'
       WHERE t.description_vector IS NOT NULL 
         AND t.status = 'active'
         AND (t.description_vector <#> $1) < $4
       GROUP BY t.id
       ORDER BY similarity ASC
       LIMIT $2 OFFSET $3`,
      [pgVector, limit, offset, 1 - threshold] // Convert threshold (0-1) to distance (1-0)
    );
    
    return result.rows;
  }

  /**
   * Find popular tools
   */
  async findPopular(limit: number = 20, offset: number = 0): Promise<any[]> {
    const result = await db.query(
      `SELECT t.*, COUNT(tr.id) as review_count, AVG(tr.rating) as avg_rating
       FROM ${this.tableName} t
       LEFT JOIN tool_reviews tr ON t.id = tr.tool_id AND tr.status = 'published'
       WHERE t.status = 'active'
       GROUP BY t.id
       ORDER BY t.upvotes DESC, avg_rating DESC NULLS LAST
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    
    return result.rows;
  }

  /**
   * Find tools by tag
   */
  async findByTag(tagId: number, limit: number = 20, offset: number = 0): Promise<any[]> {
    const result = await db.query(
      `SELECT t.*, COUNT(tr.id) as review_count, AVG(tr.rating) as avg_rating
       FROM ${this.tableName} t
       LEFT JOIN tool_reviews tr ON t.id = tr.tool_id AND tr.status = 'published'
       JOIN tool_tags tt ON t.id = tt.tool_id
       WHERE tt.tag_id = $1 AND t.status = 'active'
       GROUP BY t.id
       ORDER BY t.upvotes DESC
       LIMIT $2 OFFSET $3`,
      [tagId, limit, offset]
    );
    
    return result.rows;
  }

  /**
   * Claim a tool as vendor
   */
  async claimAsVendor(toolId: number, userId: number): Promise<{ success: boolean, status: string, claimId?: number }> {
    try {
      // Check if the tool is already claimed
      const tool = await this.findById(toolId);
      
      if (!tool) {
        return { success: false, status: 'Tool not found' };
      }
      
      if (tool.vendor_id) {
        if (tool.vendor_id === userId) {
          return { success: false, status: 'Tool already claimed by you' };
        }
        return { success: false, status: 'Tool already claimed by another vendor' };
      }
      
      // Check if there's already a pending claim
      const pendingClaim = await db.query(
        `SELECT * FROM tool_claims 
         WHERE tool_id = $1 AND status = 'pending'`,
        [toolId]
      );
      
      if (pendingClaim.rows.length > 0) {
        // Check if the current user already has a pending claim
        const userPendingClaim = pendingClaim.rows.find(claim => claim.user_id === userId);
        
        if (userPendingClaim) {
          return { 
            success: false, 
            status: 'You already have a pending claim for this tool',
            claimId: userPendingClaim.id
          };
        }
        
        return { success: false, status: 'This tool already has a pending claim from another user' };
      }
      
      // Create a new claim
      const newClaim = await db.query(
        `INSERT INTO tool_claims (tool_id, user_id, status, proof, created_at, updated_at)
         VALUES ($1, $2, 'pending', NULL, NOW(), NOW())
         RETURNING id`,
        [toolId, userId]
      );
      
      const claimId = newClaim.rows[0].id;
      
      return { 
        success: true, 
        status: 'Your claim has been submitted and is pending review',
        claimId
      };
    } catch (error) {
      console.error('Error claiming tool:', error);
      return { success: false, status: 'Error claiming tool' };
    }
  }
  
  /**
   * Add proof to a tool claim
   */
  async addClaimProof(claimId: number, userId: number, proof: string): Promise<{ success: boolean, status: string }> {
    try {
      // Check if the claim exists and belongs to the user
      const claim = await db.query(
        `SELECT * FROM tool_claims WHERE id = $1`,
        [claimId]
      );
      
      if (claim.rows.length === 0) {
        return { success: false, status: 'Claim not found' };
      }
      
      if (claim.rows[0].user_id !== userId) {
        return { success: false, status: 'You do not own this claim' };
      }
      
      if (claim.rows[0].status !== 'pending') {
        return { success: false, status: `Claim is ${claim.rows[0].status}, not pending` };
      }
      
      // Update the claim with the proof
      await db.query(
        `UPDATE tool_claims SET proof = $1, updated_at = NOW() WHERE id = $2`,
        [proof, claimId]
      );
      
      return { success: true, status: 'Proof added to claim successfully' };
    } catch (error) {
      console.error('Error adding proof to claim:', error);
      return { success: false, status: 'Error adding proof to claim' };
    }
  }
  
  /**
   * Approve a tool claim (admin only)
   */
  async approveToolClaim(claimId: number): Promise<{ success: boolean, status: string }> {
    try {
      // Get the claim
      const claimResult = await db.query(
        `SELECT * FROM tool_claims WHERE id = $1`,
        [claimId]
      );
      
      if (claimResult.rows.length === 0) {
        return { success: false, status: 'Claim not found' };
      }
      
      const claim = claimResult.rows[0];
      
      if (claim.status !== 'pending') {
        return { success: false, status: `Claim is ${claim.status}, not pending` };
      }
      
      // Check if the tool is already claimed
      const tool = await this.findById(claim.tool_id);
      
      if (tool && tool.vendor_id) {
        return { success: false, status: 'Tool is already claimed' };
      }
      
      // Use a transaction to update both the claim and the tool
      await db.transaction(async (client) => {
        if ('query' in client) {
          // Update the claim status
          await client.query(
            `UPDATE tool_claims SET status = 'approved', updated_at = NOW() WHERE id = $1`,
            [claimId]
          );
          
          // Update the tool vendor
          await client.query(
            `UPDATE ${this.tableName} SET vendor_id = $1, is_verified = true, updated_at = NOW() WHERE id = $2`,
            [claim.user_id, claim.tool_id]
          );
          
          // Reject any other pending claims for this tool
          await client.query(
            `UPDATE tool_claims 
             SET status = 'rejected', updated_at = NOW() 
             WHERE tool_id = $1 AND id != $2 AND status = 'pending'`,
            [claim.tool_id, claimId]
          );
        } else {
          throw new Error('Transaction client missing query method');
        }
      });
      
      return { success: true, status: 'Claim approved successfully' };
    } catch (error) {
      console.error('Error approving claim:', error);
      return { success: false, status: 'Error approving claim' };
    }
  }
  
  /**
   * Reject a tool claim (admin only)
   */
  async rejectToolClaim(claimId: number): Promise<{ success: boolean, status: string }> {
    try {
      // Get the claim
      const claimResult = await db.query(
        `SELECT * FROM tool_claims WHERE id = $1`,
        [claimId]
      );
      
      if (claimResult.rows.length === 0) {
        return { success: false, status: 'Claim not found' };
      }
      
      const claim = claimResult.rows[0];
      
      if (claim.status !== 'pending') {
        return { success: false, status: `Claim is ${claim.status}, not pending` };
      }
      
      // Update the claim status
      await db.query(
        `UPDATE tool_claims SET status = 'rejected', updated_at = NOW() WHERE id = $1`,
        [claimId]
      );
      
      return { success: true, status: 'Claim rejected successfully' };
    } catch (error) {
      console.error('Error rejecting claim:', error);
      return { success: false, status: 'Error rejecting claim' };
    }
  }
}