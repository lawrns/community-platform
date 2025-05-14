/**
 * Content API Routes Tests
 */

import request from 'supertest';
import express from 'express';
import contentRoutes from '../../routes/api/content';
import { ContentRepository } from '../../models/repositories';
import { ContentType, ContentStatus } from '../../models';

// Mock authentication middleware
jest.mock('../../middlewares/auth/authMiddleware', () => ({
  authenticate: (req, res, next) => {
    req.user = { id: 1, reputation: 100, email_verified: true };
    next();
  },
  requireVerified: (req, res, next) => next()
}));

// Mock ContentRepository
jest.mock('../../models/repositories', () => ({
  ContentRepository: jest.fn().mockImplementation(() => ({
    findById: jest.fn(),
    findWithAuthor: jest.fn(),
    createDraft: jest.fn(),
    updateDraft: jest.fn(),
    publishDraft: jest.fn(),
    findDrafts: jest.fn(),
    updateContent: jest.fn(),
    getVersions: jest.fn(),
    getVersion: jest.fn(),
    revertToVersion: jest.fn(),
    vote: jest.fn(),
    softDelete: jest.fn(),
    findByType: jest.fn(),
    findRecent: jest.fn(),
    getTags: jest.fn(),
    getTopics: jest.fn(),
    addTags: jest.fn(),
    addTopics: jest.fn(),
    updateTags: jest.fn(),
    updateTopics: jest.fn(),
    incrementViews: jest.fn(),
    autosaveContent: jest.fn()
  })),
}));

describe('Content API Routes', () => {
  let app: express.Application;
  let mockContentRepo: any;
  
  beforeEach(() => {
    // Create express app
    app = express();
    app.use(express.json());
    app.use('/api/content', contentRoutes);
    
    // Get mocked repository instance
    mockContentRepo = (ContentRepository as jest.Mock).mock.results[0].value;
    
    // Reset all mocks
    jest.clearAllMocks();
  });
  
  describe('POST /api/content/draft', () => {
    it('should create a draft content', async () => {
      const draftData = {
        type: ContentType.POST,
        title: 'Test Draft',
        body: 'Draft content',
        body_html: '<p>Draft content</p>',
        tagIds: [1, 2],
        topicIds: [3]
      };
      
      const mockDraft = {
        id: 1,
        ...draftData,
        author_id: 1,
        status: ContentStatus.DRAFT,
        created_at: new Date(),
        updated_at: new Date()
      };
      
      // Setup mocks
      mockContentRepo.createDraft.mockResolvedValue(mockDraft);
      mockContentRepo.getTags.mockResolvedValue([{ id: 1, name: 'Tag1' }, { id: 2, name: 'Tag2' }]);
      mockContentRepo.getTopics.mockResolvedValue([{ id: 3, name: 'Topic1' }]);
      
      const response = await request(app)
        .post('/api/content/draft')
        .send(draftData)
        .expect(201);
      
      expect(mockContentRepo.createDraft).toHaveBeenCalledWith(
        expect.objectContaining({
          type: draftData.type,
          title: draftData.title,
          body: draftData.body,
          body_html: draftData.body_html,
          author_id: 1
        })
      );
      
      expect(mockContentRepo.addTags).toHaveBeenCalledWith(1, [1, 2]);
      expect(mockContentRepo.addTopics).toHaveBeenCalledWith(1, [3]);
      expect(mockContentRepo.getTags).toHaveBeenCalledWith(1);
      expect(mockContentRepo.getTopics).toHaveBeenCalledWith(1);
      
      expect(response.body).toEqual({
        success: true,
        data: expect.objectContaining({
          id: 1,
          title: 'Test Draft',
          tags: [{ id: 1, name: 'Tag1' }, { id: 2, name: 'Tag2' }],
          topics: [{ id: 3, name: 'Topic1' }]
        })
      });
    });
  });
  
  describe('GET /api/content/:id', () => {
    it('should return content by ID', async () => {
      const mockContent = {
        id: 1,
        type: ContentType.POST,
        title: 'Test Post',
        body: 'Test content',
        body_html: '<p>Test content</p>',
        author_id: 1,
        status: ContentStatus.PUBLISHED,
        created_at: new Date(),
        updated_at: new Date()
      };
      
      // Setup mocks
      mockContentRepo.findWithAuthor.mockResolvedValue(mockContent);
      mockContentRepo.getTags.mockResolvedValue([{ id: 1, name: 'Tag1' }]);
      mockContentRepo.getTopics.mockResolvedValue([{ id: 2, name: 'Topic1' }]);
      
      const response = await request(app)
        .get('/api/content/1')
        .expect(200);
      
      expect(mockContentRepo.findWithAuthor).toHaveBeenCalledWith(1);
      expect(mockContentRepo.incrementViews).toHaveBeenCalledWith(1);
      expect(mockContentRepo.getTags).toHaveBeenCalledWith(1);
      expect(mockContentRepo.getTopics).toHaveBeenCalledWith(1);
      
      expect(response.body).toEqual({
        success: true,
        data: expect.objectContaining({
          id: 1,
          title: 'Test Post',
          tags: [{ id: 1, name: 'Tag1' }],
          topics: [{ id: 2, name: 'Topic1' }]
        })
      });
    });
    
    it('should return 404 if content not found', async () => {
      // Setup mocks
      mockContentRepo.findWithAuthor.mockResolvedValue(null);
      
      await request(app)
        .get('/api/content/999')
        .expect(404);
      
      expect(mockContentRepo.findWithAuthor).toHaveBeenCalledWith(999);
    });
  });
  
  describe('PUT /api/content/:id', () => {
    it('should update content and create new version', async () => {
      const updateData = {
        title: 'Updated Post',
        body: 'Updated content',
        body_html: '<p>Updated content</p>',
        tagIds: [1, 3],
        topicIds: [2],
        edit_comment: 'Fixed typos'
      };
      
      const mockContent = {
        id: 1,
        type: ContentType.POST,
        author_id: 1,
        status: ContentStatus.PUBLISHED
      };
      
      const updatedContent = {
        ...mockContent,
        title: updateData.title,
        body: updateData.body,
        body_html: updateData.body_html,
        updated_at: new Date()
      };
      
      // Setup mocks
      mockContentRepo.findById.mockResolvedValue(mockContent);
      mockContentRepo.updateContent.mockResolvedValue(updatedContent);
      mockContentRepo.getTags.mockResolvedValue([{ id: 1, name: 'Tag1' }, { id: 3, name: 'Tag3' }]);
      mockContentRepo.getTopics.mockResolvedValue([{ id: 2, name: 'Topic1' }]);
      
      const response = await request(app)
        .put('/api/content/1')
        .send(updateData)
        .expect(200);
      
      expect(mockContentRepo.findById).toHaveBeenCalledWith(1);
      expect(mockContentRepo.updateContent).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          title: updateData.title,
          body: updateData.body,
          body_html: updateData.body_html
        }),
        1,
        updateData.edit_comment
      );
      
      expect(mockContentRepo.updateTags).toHaveBeenCalledWith(1, [1, 3]);
      expect(mockContentRepo.updateTopics).toHaveBeenCalledWith(1, [2]);
      expect(mockContentRepo.getTags).toHaveBeenCalledWith(1);
      expect(mockContentRepo.getTopics).toHaveBeenCalledWith(1);
      
      expect(response.body).toEqual({
        success: true,
        data: expect.objectContaining({
          id: 1,
          title: 'Updated Post',
          tags: [{ id: 1, name: 'Tag1' }, { id: 3, name: 'Tag3' }],
          topics: [{ id: 2, name: 'Topic1' }]
        })
      });
    });
  });
  
  describe('POST /api/content/:id/autosave', () => {
    it('should autosave content without creating new version', async () => {
      const autosaveData = {
        title: 'Draft in progress',
        body: 'Content being edited...',
        body_html: '<p>Content being edited...</p>'
      };
      
      // Setup mocks
      mockContentRepo.findById.mockResolvedValue({
        id: 1,
        author_id: 1,
        status: ContentStatus.DRAFT
      });
      mockContentRepo.autosaveContent.mockResolvedValue(true);
      
      const response = await request(app)
        .post('/api/content/1/autosave')
        .send(autosaveData)
        .expect(200);
      
      expect(mockContentRepo.findById).toHaveBeenCalledWith(1);
      expect(mockContentRepo.autosaveContent).toHaveBeenCalledWith(
        1,
        autosaveData.title,
        autosaveData.body,
        autosaveData.body_html
      );
      
      expect(response.body).toEqual({
        success: true,
        message: 'Content autosaved successfully'
      });
    });
  });
  
  describe('GET /api/content/:id/versions', () => {
    it('should return content versions', async () => {
      const mockVersions = [
        {
          id: 3,
          content_id: 1,
          version: 3,
          title: 'Latest Version',
          created_at: new Date()
        },
        {
          id: 2,
          content_id: 1,
          version: 2,
          title: 'Second Version',
          created_at: new Date(Date.now() - 86400000)
        },
        {
          id: 1,
          content_id: 1,
          version: 1,
          title: 'Original Version',
          created_at: new Date(Date.now() - 172800000)
        }
      ];
      
      // Setup mocks
      mockContentRepo.findById.mockResolvedValue({
        id: 1,
        status: ContentStatus.PUBLISHED
      });
      mockContentRepo.getVersions.mockResolvedValue(mockVersions);
      
      const response = await request(app)
        .get('/api/content/1/versions')
        .expect(200);
      
      expect(mockContentRepo.findById).toHaveBeenCalledWith(1);
      expect(mockContentRepo.getVersions).toHaveBeenCalledWith(1);
      
      expect(response.body).toEqual({
        success: true,
        data: mockVersions
      });
    });
  });
  
  describe('POST /api/content/:id/versions/:versionId/revert', () => {
    it('should revert content to a specific version', async () => {
      const mockContent = {
        id: 1,
        author_id: 1,
        status: ContentStatus.PUBLISHED
      };
      
      const revertedContent = {
        ...mockContent,
        title: 'Old Version Title',
        body: 'Old version content',
        body_html: '<p>Old version content</p>'
      };
      
      // Setup mocks
      mockContentRepo.findById.mockResolvedValue(mockContent);
      mockContentRepo.revertToVersion.mockResolvedValue(revertedContent);
      mockContentRepo.getTags.mockResolvedValue([{ id: 1, name: 'Tag1' }]);
      mockContentRepo.getTopics.mockResolvedValue([{ id: 2, name: 'Topic1' }]);
      
      const response = await request(app)
        .post('/api/content/1/versions/2/revert')
        .expect(200);
      
      expect(mockContentRepo.findById).toHaveBeenCalledWith(1);
      expect(mockContentRepo.revertToVersion).toHaveBeenCalledWith(1, 2, 1);
      expect(mockContentRepo.getTags).toHaveBeenCalledWith(1);
      expect(mockContentRepo.getTopics).toHaveBeenCalledWith(1);
      
      expect(response.body).toEqual({
        success: true,
        data: expect.objectContaining({
          id: 1,
          title: 'Old Version Title',
          tags: [{ id: 1, name: 'Tag1' }],
          topics: [{ id: 2, name: 'Topic1' }]
        })
      });
    });
  });
});