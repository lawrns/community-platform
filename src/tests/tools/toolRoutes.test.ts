/**
 * Tool API Routes Tests
 */

import request from 'supertest';
import express from 'express';
import toolRoutes from '../../routes/api/tools';
import { ToolRepository } from '../../models/repositories';
import { ToolStatus } from '../../models';

// Mock authentication middleware
jest.mock('../../middlewares/auth/authMiddleware', () => ({
  authenticate: (req, res, next) => {
    req.user = { id: 1, reputation: 100, email_verified: true };
    next();
  },
  requireVerified: (req, res, next) => next()
}));

// Mock ToolRepository
jest.mock('../../models/repositories', () => ({
  ToolRepository: jest.fn().mockImplementation(() => ({
    findById: jest.fn(),
    findWithVendor: jest.fn(),
    findByStatus: jest.fn(),
    findPopular: jest.fn(),
    search: jest.fn(),
    findByTag: jest.fn(),
    getTags: jest.fn(),
    getReviews: jest.fn(),
    addReview: jest.fn(),
    upvote: jest.fn(),
    claimAsVendor: jest.fn(),
    addClaimProof: jest.fn(),
    approveToolClaim: jest.fn(),
    rejectToolClaim: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    addTags: jest.fn(),
    updateTags: jest.fn()
  })),
}));

describe('Tool API Routes', () => {
  let app: express.Application;
  let mockToolRepo: any;
  
  beforeEach(() => {
    // Create express app
    app = express();
    app.use(express.json());
    app.use('/api/tools', toolRoutes);
    
    // Get mocked repository instance
    mockToolRepo = (ToolRepository as jest.Mock).mock.results[0].value;
    
    // Reset all mocks
    jest.clearAllMocks();
  });
  
  describe('GET /api/tools', () => {
    it('should return a list of tools', async () => {
      const mockTools = [
        {
          id: 1,
          name: 'Tool 1',
          description: 'Description 1',
          status: ToolStatus.ACTIVE
        },
        {
          id: 2,
          name: 'Tool 2',
          description: 'Description 2',
          status: ToolStatus.ACTIVE
        }
      ];
      
      // Setup mocks
      mockToolRepo.findPopular.mockResolvedValue(mockTools);
      mockToolRepo.getTags.mockResolvedValue([]);
      
      const response = await request(app)
        .get('/api/tools')
        .expect(200);
      
      expect(mockToolRepo.findPopular).toHaveBeenCalledWith(20, 0);
      expect(mockToolRepo.getTags).toHaveBeenCalledTimes(2);
      
      expect(response.body).toEqual({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({ id: 1, name: 'Tool 1', tags: [] }),
          expect.objectContaining({ id: 2, name: 'Tool 2', tags: [] })
        ])
      });
    });
    
    it('should search for tools with search parameter', async () => {
      const mockSearchResults = [
        {
          id: 1,
          name: 'Search Result',
          description: 'Matching search query',
          status: ToolStatus.ACTIVE
        }
      ];
      
      // Setup mocks
      mockToolRepo.search.mockResolvedValue(mockSearchResults);
      mockToolRepo.getTags.mockResolvedValue([]);
      
      const response = await request(app)
        .get('/api/tools?search=query')
        .expect(200);
      
      expect(mockToolRepo.search).toHaveBeenCalledWith('query', 20, 0);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe('Search Result');
    });
  });
  
  describe('GET /api/tools/:id', () => {
    it('should return a tool by ID with tags and reviews', async () => {
      const mockTool = {
        id: 1,
        name: 'Test Tool',
        description: 'Tool description',
        status: ToolStatus.ACTIVE,
        vendor_id: 2
      };
      
      const mockTags = [
        { id: 1, name: 'Tag1' },
        { id: 2, name: 'Tag2' }
      ];
      
      const mockReviews = [
        {
          id: 1,
          user_id: 3,
          username: 'user1',
          rating: 5,
          content: 'Great tool!'
        }
      ];
      
      // Setup mocks
      mockToolRepo.findWithVendor.mockResolvedValue(mockTool);
      mockToolRepo.getTags.mockResolvedValue(mockTags);
      mockToolRepo.getReviews.mockResolvedValue(mockReviews);
      
      const response = await request(app)
        .get('/api/tools/1')
        .expect(200);
      
      expect(mockToolRepo.findWithVendor).toHaveBeenCalledWith(1);
      expect(mockToolRepo.getTags).toHaveBeenCalledWith(1);
      expect(mockToolRepo.getReviews).toHaveBeenCalledWith(1);
      
      expect(response.body).toEqual({
        success: true,
        data: {
          ...mockTool,
          tags: mockTags,
          reviews: mockReviews
        }
      });
    });
    
    it('should return 404 if tool not found', async () => {
      // Setup mocks
      mockToolRepo.findWithVendor.mockResolvedValue(null);
      
      await request(app)
        .get('/api/tools/999')
        .expect(404);
      
      expect(mockToolRepo.findWithVendor).toHaveBeenCalledWith(999);
    });
  });
  
  describe('POST /api/tools/:id/reviews', () => {
    it('should add a review for a tool', async () => {
      const reviewData = {
        rating: 4,
        title: 'Good tool',
        content: 'This is a good tool with many features'
      };
      
      const mockTool = {
        id: 1,
        name: 'Test Tool',
        description: 'Tool description',
        status: ToolStatus.ACTIVE
      };
      
      const mockReview = {
        id: 1,
        tool_id: 1,
        user_id: 1,
        rating: 4,
        title: 'Good tool',
        content: 'This is a good tool with many features',
        upvotes: 0,
        status: 'published',
        created_at: new Date()
      };
      
      // Setup mocks
      mockToolRepo.findById.mockResolvedValue(mockTool);
      mockToolRepo.addReview.mockResolvedValue(mockReview);
      
      const response = await request(app)
        .post('/api/tools/1/reviews')
        .send(reviewData)
        .expect(201);
      
      expect(mockToolRepo.findById).toHaveBeenCalledWith(1);
      expect(mockToolRepo.addReview).toHaveBeenCalledWith(
        1, 1, 4, 'Good tool', 'This is a good tool with many features'
      );
      
      expect(response.body).toEqual({
        success: true,
        data: mockReview
      });
    });
  });
  
  describe('POST /api/tools/:id/upvote', () => {
    it('should upvote a tool', async () => {
      const mockTool = {
        id: 1,
        name: 'Test Tool',
        description: 'Tool description',
        status: ToolStatus.ACTIVE
      };
      
      // Setup mocks
      mockToolRepo.findById.mockResolvedValue(mockTool);
      mockToolRepo.upvote.mockResolvedValue(true);
      
      const response = await request(app)
        .post('/api/tools/1/upvote')
        .expect(200);
      
      expect(mockToolRepo.findById).toHaveBeenCalledWith(1);
      expect(mockToolRepo.upvote).toHaveBeenCalledWith(1, 1);
      
      expect(response.body).toEqual({
        success: true,
        message: 'Tool upvoted successfully'
      });
    });
  });
  
  describe('POST /api/tools/:id/claim', () => {
    it('should claim a tool as vendor', async () => {
      const mockTool = {
        id: 1,
        name: 'Test Tool',
        description: 'Tool description',
        status: ToolStatus.ACTIVE,
        vendor_id: null
      };
      
      // Setup mocks
      mockToolRepo.findById.mockResolvedValue(mockTool);
      mockToolRepo.claimAsVendor.mockResolvedValue({
        success: true,
        status: 'Your claim has been submitted and is pending review',
        claimId: 1
      });
      
      const response = await request(app)
        .post('/api/tools/1/claim')
        .expect(200);
      
      expect(mockToolRepo.findById).toHaveBeenCalledWith(1);
      expect(mockToolRepo.claimAsVendor).toHaveBeenCalledWith(1, 1);
      
      expect(response.body).toEqual({
        success: true,
        message: 'Your claim has been submitted and is pending review',
        data: {
          claimId: 1
        }
      });
    });
    
    it('should return error if claim fails', async () => {
      const mockTool = {
        id: 1,
        name: 'Test Tool',
        description: 'Tool description',
        status: ToolStatus.ACTIVE,
        vendor_id: 2
      };
      
      // Setup mocks
      mockToolRepo.findById.mockResolvedValue(mockTool);
      mockToolRepo.claimAsVendor.mockResolvedValue({
        success: false,
        status: 'Tool already claimed by another vendor'
      });
      
      await request(app)
        .post('/api/tools/1/claim')
        .expect(400);
      
      expect(mockToolRepo.findById).toHaveBeenCalledWith(1);
      expect(mockToolRepo.claimAsVendor).toHaveBeenCalledWith(1, 1);
    });
  });
  
  describe('POST /api/tools', () => {
    it('should create a new tool', async () => {
      const toolData = {
        name: 'New Tool',
        description: 'A new AI tool',
        website_url: 'https://example.com',
        logo_url: 'https://example.com/logo.png',
        category: 'Productivity',
        pricing_info: { plans: [] },
        features: ['Feature 1', 'Feature 2'],
        tagIds: [1, 2]
      };
      
      const mockCreatedTool = {
        id: 10,
        ...toolData,
        slug: 'new-tool',
        upvotes: 0,
        status: ToolStatus.PENDING,
        is_verified: false,
        vendor_id: 1,
        created_at: new Date(),
        updated_at: new Date()
      };
      
      // Setup mocks
      mockToolRepo.create.mockResolvedValue(mockCreatedTool);
      mockToolRepo.getTags.mockResolvedValue([
        { id: 1, name: 'Tag1' },
        { id: 2, name: 'Tag2' }
      ]);
      
      const response = await request(app)
        .post('/api/tools')
        .send(toolData)
        .expect(201);
      
      expect(mockToolRepo.create).toHaveBeenCalledWith(expect.objectContaining({
        name: 'New Tool',
        slug: expect.any(String),
        description: 'A new AI tool',
        vendor_id: 1,
        status: ToolStatus.PENDING
      }));
      
      expect(mockToolRepo.addTags).toHaveBeenCalledWith(10, [1, 2]);
      expect(mockToolRepo.getTags).toHaveBeenCalledWith(10);
      
      expect(response.body).toEqual({
        success: true,
        data: expect.objectContaining({
          id: 10,
          name: 'New Tool',
          tags: expect.any(Array)
        })
      });
    });
  });
});