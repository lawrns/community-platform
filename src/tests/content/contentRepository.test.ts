/**
 * Content Repository Tests
 */

import { ContentRepository } from '../../models/repositories';
import { ContentType, ContentStatus } from '../../models';
import db from '../../config/database';

// Mock database
jest.mock('../../config/database', () => ({
  query: jest.fn(),
  transaction: jest.fn((callback) => callback({ query: jest.fn() }))
}));

describe('ContentRepository', () => {
  let contentRepo: ContentRepository;
  let mockContent: any;
  
  beforeEach(() => {
    contentRepo = new ContentRepository();
    
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock content object
    mockContent = {
      id: 1,
      type: ContentType.POST,
      title: 'Test Post',
      body: '# Test Content\n\nThis is a test post.',
      body_html: '<h1>Test Content</h1><p>This is a test post.</p>',
      author_id: 1,
      status: ContentStatus.PUBLISHED,
      upvotes: 0,
      downvotes: 0,
      views: 0,
      is_accepted: false,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    // Setup default mocks
    (db.query as jest.Mock).mockResolvedValue({ rows: [mockContent], rowCount: 1 });
  });
  
  describe('findById', () => {
    it('should return content when it exists', async () => {
      const result = await contentRepo.findById(1);
      
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM content WHERE id = $1'),
        [1]
      );
      expect(result).toEqual(mockContent);
    });
    
    it('should return null when content does not exist', async () => {
      (db.query as jest.Mock).mockResolvedValue({ rows: [], rowCount: 0 });
      
      const result = await contentRepo.findById(999);
      
      expect(result).toBeNull();
    });
  });
  
  describe('createDraft', () => {
    it('should create a draft content and add initial version', async () => {
      const draftData = {
        type: ContentType.POST,
        title: 'Draft Post',
        body: 'Draft content',
        body_html: '<p>Draft content</p>',
        author_id: 1
      };
      
      // Mock create and addVersion methods
      jest.spyOn(contentRepo, 'create').mockResolvedValue({
        ...draftData,
        id: 1,
        status: ContentStatus.DRAFT,
        upvotes: 0,
        downvotes: 0,
        views: 0,
        is_accepted: false,
        created_at: new Date(),
        updated_at: new Date()
      } as any);
      
      jest.spyOn(contentRepo, 'addVersion').mockResolvedValue({ id: 1, version: 1 } as any);
      
      const result = await contentRepo.createDraft(draftData);
      
      expect(contentRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ...draftData,
          status: ContentStatus.DRAFT,
          upvotes: 0,
          downvotes: 0,
          views: 0,
          is_accepted: false
        })
      );
      
      expect(contentRepo.addVersion).toHaveBeenCalledWith(
        1, // content ID
        1, // version number
        'Draft Post', // title
        'Draft content', // body
        '<p>Draft content</p>', // bodyHtml
        1 // author ID
      );
      
      expect(result).toEqual(expect.objectContaining(draftData));
    });
  });
  
  describe('updateContent', () => {
    it('should update content and create a new version', async () => {
      const updateData = {
        title: 'Updated Post',
        body: 'Updated content',
        body_html: '<p>Updated content</p>'
      };
      
      // Mock findById, getVersions, update, and addVersion methods
      jest.spyOn(contentRepo, 'findById').mockResolvedValue(mockContent);
      jest.spyOn(contentRepo, 'getVersions').mockResolvedValue([{ version: 1 }]);
      jest.spyOn(contentRepo, 'update').mockResolvedValue({
        ...mockContent,
        ...updateData,
        updated_at: new Date()
      } as any);
      jest.spyOn(contentRepo, 'addVersion').mockResolvedValue({ id: 2, version: 2 } as any);
      
      const result = await contentRepo.updateContent(1, updateData, 1, 'Test edit');
      
      expect(contentRepo.findById).toHaveBeenCalledWith(1);
      expect(contentRepo.getVersions).toHaveBeenCalledWith(1);
      expect(contentRepo.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          ...updateData,
          updated_at: expect.any(Date)
        })
      );
      expect(contentRepo.addVersion).toHaveBeenCalledWith(
        1, // content ID
        2, // version number (next version)
        'Updated Post', // title
        'Updated content', // body
        '<p>Updated content</p>', // bodyHtml
        1, // editor ID
        'Test edit' // edit comment
      );
      
      expect(result).toEqual(expect.objectContaining(updateData));
    });
    
    it('should throw error if content does not exist', async () => {
      // Mock findById to return null
      jest.spyOn(contentRepo, 'findById').mockResolvedValue(null);
      
      await expect(contentRepo.updateContent(999, { title: 'Test' }, 1))
        .rejects.toThrow('Content not found');
    });
  });
  
  describe('revertToVersion', () => {
    it('should revert content to a specific version', async () => {
      const versionData = {
        id: 2,
        content_id: 1,
        version: 2,
        title: 'Old Version',
        body: 'Old content',
        body_html: '<p>Old content</p>',
        editor_id: 1,
        created_at: new Date()
      };
      
      // Mock query to return version data
      (db.query as jest.Mock).mockImplementation((sql, params) => {
        if (sql.includes('SELECT * FROM content_versions')) {
          return { rows: [versionData] };
        }
        return { rows: [mockContent] };
      });
      
      // Mock getVersions and update methods
      jest.spyOn(contentRepo, 'getVersions').mockResolvedValue([
        { version: 1 }, { version: 2 }, { version: 3 }
      ]);
      jest.spyOn(contentRepo, 'update').mockResolvedValue({
        ...mockContent,
        title: 'Old Version',
        body: 'Old content',
        body_html: '<p>Old content</p>',
        updated_at: new Date()
      } as any);
      jest.spyOn(contentRepo, 'addVersion').mockResolvedValue({ id: 4, version: 4 } as any);
      
      const result = await contentRepo.revertToVersion(1, 2, 1);
      
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM content_versions WHERE content_id = $1 AND id = $2'),
        [1, 2]
      );
      expect(contentRepo.getVersions).toHaveBeenCalledWith(1);
      expect(contentRepo.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          title: 'Old Version',
          body: 'Old content',
          body_html: '<p>Old content</p>',
          updated_at: expect.any(Date)
        })
      );
      expect(contentRepo.addVersion).toHaveBeenCalledWith(
        1, // content ID
        4, // version number (next version)
        'Old Version', // title
        'Old content', // body
        '<p>Old content</p>', // bodyHtml
        1, // editor ID
        'Reverted to version 2' // edit comment
      );
      
      expect(result).toEqual(expect.objectContaining({
        title: 'Old Version',
        body: 'Old content',
        body_html: '<p>Old content</p>'
      }));
    });
    
    it('should throw error if version does not exist', async () => {
      // Mock query to return empty result
      (db.query as jest.Mock).mockImplementation((sql) => {
        if (sql.includes('SELECT * FROM content_versions')) {
          return { rows: [] };
        }
        return { rows: [mockContent] };
      });
      
      await expect(contentRepo.revertToVersion(1, 999, 1))
        .rejects.toThrow('Version not found');
    });
  });
});