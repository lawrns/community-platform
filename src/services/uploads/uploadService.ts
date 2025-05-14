/**
 * Upload Service
 * Handles file uploads, storage, and management for the application
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { promisify } from 'util';
import { supabase } from '../../config/supabase';
import env, { config } from '../../config/environment';

// Promisify fs functions
const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
const access = promisify(fs.access);

// Determine if we should use Supabase
const useSupabase = !!config.SUPABASE_URL && !!config.SUPABASE_ANON_KEY;

// Constants
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Ensure the uploads directory exists
 */
const ensureUploadsDir = async () => {
  try {
    await access(UPLOADS_DIR);
  } catch (error) {
    await mkdir(UPLOADS_DIR, { recursive: true });
  }
};

/**
 * Generate a unique filename
 */
const generateUniqueFilename = (originalName: string) => {
  const extension = path.extname(originalName);
  const randomString = crypto.randomBytes(16).toString('hex');
  const timestamp = Date.now();
  
  return `${timestamp}-${randomString}${extension}`;
};

/**
 * Validate file type and size
 */
export const validateFile = (mimeType: string, size: number) => {
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    throw new Error(`Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`);
  }
  
  if (size > MAX_FILE_SIZE) {
    throw new Error(`File too large. Maximum size: ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
  }
  
  return true;
};

/**
 * Upload file to local storage
 */
export const uploadToLocal = async (file: Buffer, filename: string, mimeType: string) => {
  await ensureUploadsDir();
  const uniqueFilename = generateUniqueFilename(filename);
  const filePath = path.join(UPLOADS_DIR, uniqueFilename);
  
  await writeFile(filePath, file);
  
  return {
    filename: uniqueFilename,
    path: `/uploads/${uniqueFilename}`,
    mimeType,
    size: file.length
  };
};

/**
 * Upload file to Supabase storage
 */
export const uploadToSupabase = async (file: Buffer, filename: string, mimeType: string) => {
  const uniqueFilename = generateUniqueFilename(filename);
  
  const { data, error } = await supabase.storage
    .from('uploads')
    .upload(`content/${uniqueFilename}`, file, {
      contentType: mimeType,
      cacheControl: '3600'
    });
  
  if (error) {
    throw new Error(`Supabase upload error: ${error.message}`);
  }
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('uploads')
    .getPublicUrl(`content/${uniqueFilename}`);
  
  return {
    filename: uniqueFilename,
    path: publicUrl,
    mimeType,
    size: file.length
  };
};

/**
 * Upload file (wrapper that uses appropriate storage based on config)
 */
export const uploadFile = async (file: Buffer, originalName: string, mimeType: string) => {
  // Validate file
  validateFile(mimeType, file.length);
  
  // Upload based on configuration
  if (useSupabase) {
    return uploadToSupabase(file, originalName, mimeType);
  } else {
    return uploadToLocal(file, originalName, mimeType);
  }
};