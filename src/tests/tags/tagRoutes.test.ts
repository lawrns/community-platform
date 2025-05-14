/**
 * Tag Routes Tests
 * Tests for tag API endpoints
 */

import request from 'supertest';
import express from 'express';
import tagRoutes from '../../routes/api/tags';
import { tagRepository } from '../../models/repositories';
import { authenticate, requireVerified, requireReputation } from '../../middlewares/auth/authMiddleware';

// Mock dependencies
jest.mock('../../models/repositories', () => ({
  tagRepository: {
    findAll: jest.fn(),
    findById: jest.fn(),
    findBySlug: jest.fn(),
    findPopular: jest.fn(),
    findByNamePrefix: jest.fn(),
    findSimilar: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    getRelatedTags: jest.fn(),
    query: jest.fn(),
    transaction: jest.fn(),
  },
}));

// Mock authentication middleware
jest.mock('../../middlewares/auth/authMiddleware', () => ({
  authenticate: jest.fn((req, res, next) => next()),
  requireVerified: jest.fn((req, res, next) => next()),
  requireReputation: jest.fn(() => (req, res, next) => next()),
}));

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/api/tags', tagRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    success: false,
    message: err.message,
    errors: err.errors,
  });
});

describe('Tag Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/tags', () => {
    it('should return all tags with pagination', async () => {
      const mockTags = [
        { id: 1, name: 'javascript' },
        { id: 2, name: 'python' },
      ];
      
      (tagRepository.findAll as jest.Mock).mockResolvedValue(mockTags);
      (tagRepository.count as jest.Mock).mockResolvedValue(2);
      
      const response = await request(app)
        .get('/api/tags')
        .expect(200);
      
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('tags', mockTags);
      expect(response.body).toHaveProperty('pagination', {
        total: 2,
        offset: 0,
        limit: 50,
      });
      
      expect(tagRepository.findAll).toHaveBeenCalledWith(50, 0);
    });

    it('should honor limit and offset parameters', async () => {
      (tagRepository.findAll as jest.Mock).mockResolvedValue([]);
      (tagRepository.count as jest.Mock).mockResolvedValue(100);
      
      await request(app)
        .get('/api/tags?limit=10&offset=20')
        .expect(200);
      
      expect(tagRepository.findAll).toHaveBeenCalledWith(10, 20);
    });
  });

  describe('GET /api/tags/popular', () => {
    it('should return popular tags', async () => {
      const mockTags = [
        { id: 1, name: 'javascript', usage_count: 100 },
        { id: 2, name: 'python', usage_count: 80 },
      ];
      
      (tagRepository.findPopular as jest.Mock).mockResolvedValue(mockTags);
      
      const response = await request(app)
        .get('/api/tags/popular')
        .expect(200);
      
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('tags', mockTags);
      expect(tagRepository.findPopular).toHaveBeenCalledWith(20);
    });

    it('should honor limit parameter', async () => {
      (tagRepository.findPopular as jest.Mock).mockResolvedValue([]);
      
      await request(app)
        .get('/api/tags/popular?limit=5')
        .expect(200);
      
      expect(tagRepository.findPopular).toHaveBeenCalledWith(5);
    });
  });

  describe('GET /api/tags/suggest', () => {
    it('should return tag suggestions based on prefix', async () => {
      const mockTags = [
        { id: 1, name: 'javascript' },
        { id: 2, name: 'java' },
      ];
      
      (tagRepository.findByNamePrefix as jest.Mock).mockResolvedValue(mockTags);
      
      const response = await request(app)
        .get('/api/tags/suggest?prefix=ja')
        .expect(200);
      
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('tags', mockTags);
      expect(tagRepository.findByNamePrefix).toHaveBeenCalledWith('ja', 10);
    });

    it('should return validation error if prefix is missing', async () => {
      const response = await request(app)
        .get('/api/tags/suggest')
        .expect(400);
      
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('Validation error');
      expect(tagRepository.findByNamePrefix).not.toHaveBeenCalled();
    });
  });

  describe('GET /api/tags/similar', () => {
    it('should return similar tags for possible typos', async () => {
      const mockTags = [
        { id: 1, name: 'javascript', sim: 0.8 },
        { id: 2, name: 'typescript', sim: 0.6 },
      ];
      
      (tagRepository.findSimilar as jest.Mock).mockResolvedValue(mockTags);
      
      const response = await request(app)
        .get('/api/tags/similar?name=javascrpt')
        .expect(200);
      
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('tags', mockTags);
      expect(tagRepository.findSimilar).toHaveBeenCalledWith('javascrpt', 5);
    });

    it('should return validation error if name is missing', async () => {
      const response = await request(app)
        .get('/api/tags/similar')
        .expect(400);
      
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('Validation error');
      expect(tagRepository.findSimilar).not.toHaveBeenCalled();
    });
  });

  describe('GET /api/tags/:slug', () => {
    it('should return a tag by slug with related tags', async () => {
      const mockTag = {
        id: 1,
        name: 'javascript',
        slug: 'javascript',
      };
      
      const mockRelatedTags = [
        { id: 2, name: 'typescript', related_count: 50 },
        { id: 3, name: 'nodejs', related_count: 40 },
      ];
      
      (tagRepository.findBySlug as jest.Mock).mockResolvedValue(mockTag);
      (tagRepository.getRelatedTags as jest.Mock).mockResolvedValue(mockRelatedTags);
      
      const response = await request(app)
        .get('/api/tags/javascript')
        .expect(200);
      
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('tag', mockTag);
      expect(response.body).toHaveProperty('relatedTags', mockRelatedTags);
      expect(tagRepository.findBySlug).toHaveBeenCalledWith('javascript');
      expect(tagRepository.getRelatedTags).toHaveBeenCalledWith(1);
    });

    it('should return 404 if tag not found', async () => {
      (tagRepository.findBySlug as jest.Mock).mockResolvedValue(null);
      
      const response = await request(app)
        .get('/api/tags/nonexistent')
        .expect(404);
      
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('Tag not found');
      expect(tagRepository.getRelatedTags).not.toHaveBeenCalled();
    });
  });

  describe('POST /api/tags', () => {
    it('should create a new tag', async () => {
      const mockTagData = {
        name: 'New Tag',
        description: 'A new tag for testing',
      };
      
      const mockCreatedTag = {
        id: 10,
        name: 'New Tag',
        slug: 'new-tag',
        description: 'A new tag for testing',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      (tagRepository.findBySlug as jest.Mock).mockResolvedValue(null);
      (tagRepository.create as jest.Mock).mockResolvedValue(mockCreatedTag);
      
      const response = await request(app)
        .post('/api/tags')
        .send(mockTagData)
        .expect(201);
      
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Tag created successfully');
      expect(response.body).toHaveProperty('tag', mockCreatedTag);
      
      expect(tagRepository.findBySlug).toHaveBeenCalledWith('new-tag');
      expect(tagRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        name: 'New Tag',
        slug: 'new-tag',
        description: 'A new tag for testing',
      }));
      
      expect(authenticate).toHaveBeenCalled();
      expect(requireVerified).toHaveBeenCalled();
      expect(requireReputation).toHaveBeenCalledWith(100);
    });

    it('should return validation error for invalid tag name', async () => {
      const response = await request(app)
        .post('/api/tags')
        .send({
          name: 'a', // Too short
          description: 'Invalid tag',
        })
        .expect(400);
      
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('Validation error');
      expect(tagRepository.create).not.toHaveBeenCalled();
    });

    it('should return error if tag already exists', async () => {
      (tagRepository.findBySlug as jest.Mock).mockResolvedValue({
        id: 1,
        name: 'Existing',
        slug: 'existing',
      });
      
      const response = await request(app)
        .post('/api/tags')
        .send({
          name: 'Existing',
          description: 'This tag already exists',
        })
        .expect(400);
      
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('already exists');
      expect(tagRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('PUT /api/tags/:id', () => {
    it('should update an existing tag', async () => {
      const mockUpdatedTag = {
        id: 1,
        name: 'Updated Name',
        slug: 'updated-name',
        description: 'Updated description',
      };
      
      (tagRepository.findBySlug as jest.Mock).mockResolvedValue(null);
      (tagRepository.update as jest.Mock).mockResolvedValue(mockUpdatedTag);
      
      const response = await request(app)
        .put('/api/tags/1')
        .send({
          name: 'Updated Name',
          description: 'Updated description',
        })
        .expect(200);
      
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Tag updated successfully');
      expect(response.body).toHaveProperty('tag', mockUpdatedTag);
      
      expect(tagRepository.update).toHaveBeenCalledWith(1, expect.objectContaining({
        name: 'Updated Name',
        slug: 'updated-name',
        description: 'Updated description',
      }));
      
      expect(authenticate).toHaveBeenCalled();
      expect(requireVerified).toHaveBeenCalled();
      expect(requireReputation).toHaveBeenCalledWith(1000);
    });

    it('should return 404 if tag not found', async () => {
      (tagRepository.findBySlug as jest.Mock).mockResolvedValue(null);
      (tagRepository.update as jest.Mock).mockResolvedValue(null);
      
      const response = await request(app)
        .put('/api/tags/999')
        .send({
          name: 'Updated Name',
        })
        .expect(404);
      
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('Tag not found');
    });
  });

  describe('GET /api/tags/:id/stats', () => {
    it('should return tag usage statistics', async () => {
      const mockTag = {
        id: 1,
        name: 'javascript',
        slug: 'javascript',
      };
      
      const mockStats = {
        total_content: '100',
        questions: '50',
        answers: '30',
        posts: '15',
        tutorials: '5',
      };
      
      (tagRepository.findById as jest.Mock).mockResolvedValue(mockTag);
      (tagRepository.query as jest.Mock).mockResolvedValue({
        rows: [mockStats],
      });
      
      const response = await request(app)
        .get('/api/tags/1/stats')
        .expect(200);
      
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('tag', mockTag);
      expect(response.body).toHaveProperty('stats', mockStats);
    });

    it('should return 404 if tag not found', async () => {
      (tagRepository.findById as jest.Mock).mockResolvedValue(null);
      
      const response = await request(app)
        .get('/api/tags/999/stats')
        .expect(404);
      
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('Tag not found');
    });
  });
});