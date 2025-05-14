/**
 * Tool Repository Tests
 */

import { ToolRepository } from '../../models/repositories';
import { ToolStatus } from '../../models';
import db from '../../config/database';

// Mock database
jest.mock('../../config/database', () => ({
  query: jest.fn(),
  transaction: jest.fn((callback) => callback({ query: jest.fn() }))
}));

describe('ToolRepository', () => {
  let toolRepo: ToolRepository;
  let mockTool: any;
  
  beforeEach(() => {
    toolRepo = new ToolRepository();
    
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock tool object
    mockTool = {
      id: 1,
      name: 'Test Tool',
      slug: 'test-tool',
      description: 'A test tool for AI',
      website_url: 'https://example.com',
      logo_url: 'https://example.com/logo.png',
      pricing_info: { plans: [] },
      features: [],
      is_verified: false,
      vendor_id: null,
      upvotes: 0,
      status: ToolStatus.ACTIVE,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    // Setup default mocks
    (db.query as jest.Mock).mockResolvedValue({ rows: [mockTool], rowCount: 1 });
  });
  
  describe('findById', () => {
    it('should return tool when it exists', async () => {
      const result = await toolRepo.findById(1);
      
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM tools WHERE id = $1'),
        [1]
      );
      expect(result).toEqual(mockTool);
    });
    
    it('should return null when tool does not exist', async () => {
      (db.query as jest.Mock).mockResolvedValue({ rows: [], rowCount: 0 });
      
      const result = await toolRepo.findById(999);
      
      expect(result).toBeNull();
    });
  });
  
  describe('findWithVendor', () => {
    it('should return tool with vendor information', async () => {
      const mockToolWithVendor = {
        ...mockTool,
        vendor_id: 5,
        username: 'vendoruser',
        name: 'Vendor Name',
        avatar_url: 'https://example.com/avatar.jpg'
      };
      
      (db.query as jest.Mock).mockResolvedValue({ rows: [mockToolWithVendor] });
      
      const result = await toolRepo.findWithVendor(1);
      
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT t.*, u.username, u.name, u.avatar_url'),
        [1]
      );
      expect(result).toEqual(mockToolWithVendor);
    });
  });
  
  describe('search', () => {
    it('should search for tools by query', async () => {
      const searchResults = [
        { ...mockTool, review_count: '5', avg_rating: '4.5' },
        { ...mockTool, id: 2, name: 'Another Test Tool', review_count: '3', avg_rating: '4.0' }
      ];
      
      (db.query as jest.Mock).mockResolvedValue({ rows: searchResults });
      
      const result = await toolRepo.search('test', 10, 0);
      
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT t.*, COUNT(tr.id) as review_count, AVG(tr.rating) as avg_rating'),
        ['%test%', 10, 0]
      );
      expect(result).toEqual(searchResults);
    });
  });
  
  describe('addReview', () => {
    it('should add a review for a tool', async () => {
      const mockReview = {
        id: 1,
        tool_id: 1,
        user_id: 10,
        rating: 4,
        title: 'Good tool',
        content: 'This is a good tool',
        upvotes: 0,
        status: 'published',
        created_at: new Date(),
        updated_at: new Date()
      };
      
      (db.query as jest.Mock).mockResolvedValue({ rows: [mockReview] });
      
      const result = await toolRepo.addReview(1, 10, 4, 'Good tool', 'This is a good tool');
      
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO tool_reviews'),
        [1, 10, 4, 'Good tool', 'This is a good tool']
      );
      expect(result).toEqual(mockReview);
    });
  });
  
  describe('claimAsVendor', () => {
    it('should create a new claim for a tool', async () => {
      // Mock for findById
      (db.query as jest.Mock).mockImplementation((sql, params) => {
        if (sql.includes('SELECT * FROM tools')) {
          return { rows: [{ ...mockTool, vendor_id: null }] };
        } else if (sql.includes('SELECT * FROM tool_claims')) {
          return { rows: [] }; // No existing claims
        } else if (sql.includes('INSERT INTO tool_claims')) {
          return { rows: [{ id: 1 }] };
        }
        return { rows: [] };
      });
      
      const result = await toolRepo.claimAsVendor(1, 10);
      
      expect(result.success).toBe(true);
      expect(result.status).toContain('submitted and is pending review');
      expect(result.claimId).toBe(1);
      
      // Check that the claim was created
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO tool_claims'),
        [1, 10]
      );
    });
    
    it('should return error if tool is already claimed', async () => {
      // Mock a tool that is already claimed
      (db.query as jest.Mock).mockImplementation((sql) => {
        if (sql.includes('SELECT * FROM tools')) {
          return { rows: [{ ...mockTool, vendor_id: 5 }] };
        }
        return { rows: [] };
      });
      
      const result = await toolRepo.claimAsVendor(1, 10);
      
      expect(result.success).toBe(false);
      expect(result.status).toContain('already claimed');
    });
    
    it('should return error if there is already a pending claim', async () => {
      // Mock a tool with a pending claim
      (db.query as jest.Mock).mockImplementation((sql) => {
        if (sql.includes('SELECT * FROM tools')) {
          return { rows: [{ ...mockTool, vendor_id: null }] };
        } else if (sql.includes('SELECT * FROM tool_claims')) {
          return { rows: [{ tool_id: 1, user_id: 5, status: 'pending' }] };
        }
        return { rows: [] };
      });
      
      const result = await toolRepo.claimAsVendor(1, 10);
      
      expect(result.success).toBe(false);
      expect(result.status).toContain('pending claim from another user');
    });
  });
  
  describe('addClaimProof', () => {
    it('should add proof to a claim', async () => {
      // Mock a valid claim
      (db.query as jest.Mock).mockImplementation((sql) => {
        if (sql.includes('SELECT * FROM tool_claims')) {
          return { rows: [{ id: 1, tool_id: 1, user_id: 10, status: 'pending' }] };
        }
        return { rows: [] };
      });
      
      const result = await toolRepo.addClaimProof(1, 10, 'This is my proof');
      
      expect(result.success).toBe(true);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE tool_claims SET proof = $1'),
        ['This is my proof', 1]
      );
    });
    
    it('should return error if claim does not exist', async () => {
      // Mock no claim found
      (db.query as jest.Mock).mockResolvedValue({ rows: [] });
      
      const result = await toolRepo.addClaimProof(999, 10, 'This is my proof');
      
      expect(result.success).toBe(false);
      expect(result.status).toContain('Claim not found');
    });
    
    it('should return error if claim belongs to another user', async () => {
      // Mock a claim belonging to another user
      (db.query as jest.Mock).mockResolvedValue({ 
        rows: [{ id: 1, tool_id: 1, user_id: 5, status: 'pending' }] 
      });
      
      const result = await toolRepo.addClaimProof(1, 10, 'This is my proof');
      
      expect(result.success).toBe(false);
      expect(result.status).toContain('do not own this claim');
    });
  });
  
  describe('approveToolClaim', () => {
    it('should approve a claim and update the tool', async () => {
      // Mock for claim and tool
      (db.query as jest.Mock).mockImplementation((sql) => {
        if (sql.includes('SELECT * FROM tool_claims')) {
          return { rows: [{ id: 1, tool_id: 1, user_id: 10, status: 'pending' }] };
        } else if (sql.includes('SELECT * FROM tools')) {
          return { rows: [{ ...mockTool, vendor_id: null }] };
        }
        return { rows: [] };
      });
      
      const result = await toolRepo.approveToolClaim(1);
      
      expect(result.success).toBe(true);
      expect(result.status).toContain('approved successfully');
      
      // Transaction should have been used
      expect(db.transaction).toHaveBeenCalled();
    });
    
    it('should return error if claim does not exist', async () => {
      // Mock no claim found
      (db.query as jest.Mock).mockResolvedValue({ rows: [] });
      
      const result = await toolRepo.approveToolClaim(999);
      
      expect(result.success).toBe(false);
      expect(result.status).toContain('Claim not found');
    });
    
    it('should return error if claim is not pending', async () => {
      // Mock a claim that is already approved
      (db.query as jest.Mock).mockResolvedValue({ 
        rows: [{ id: 1, tool_id: 1, user_id: 10, status: 'approved' }] 
      });
      
      const result = await toolRepo.approveToolClaim(1);
      
      expect(result.success).toBe(false);
      expect(result.status).toContain('Claim is approved, not pending');
    });
  });
});