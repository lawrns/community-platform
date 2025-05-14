/**
 * Content Upload Routes
 * Handles file uploads for content
 */

import { Router } from 'express';
import multer from 'multer';
import asyncHandler from '../../../utils/asyncHandler';
import { authenticate, requireVerified } from '../../../middlewares/auth/authMiddleware';
import { uploadFile, validateFile } from '../../../services/uploads/uploadService';
import { BadRequestError } from '../../../utils/errorHandler';

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    try {
      validateFile(file.mimetype, 0); // Size check will happen after upload
      cb(null, true);
    } catch (error) {
      cb(error as Error);
    }
  }
});

/**
 * Upload image for content
 * POST /api/content/upload/image
 */
router.post('/image',
  authenticate,
  requireVerified,
  upload.single('image'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new BadRequestError('No image file provided');
    }
    
    try {
      // Upload file
      const result = await uploadFile(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );
      
      res.status(201).json({
        success: true,
        data: {
          url: result.path,
          filename: result.filename,
          mimeType: result.mimeType,
          size: result.size
        }
      });
    } catch (error) {
      throw new BadRequestError((error as Error).message);
    }
  })
);

export default router;