/**
 * TUS Server Configuration for Chunked Uploads
 * Handles resumable file uploads with automatic retry
 */

import { Server as TusServer, EVENTS } from '@tus/server';
import { FileStore } from '@tus/file-store';
import path from 'path';
import fs from 'fs/promises';
import { storagePut } from './storage';
import { nanoid } from 'nanoid';

// Temporary directory for chunks
const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'temp');

// Ensure upload directory exists
async function ensureUploadDir() {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  } catch (error) {
    console.error('[TUS] Error creating upload directory:', error);
  }
}

ensureUploadDir();

// Create TUS server instance
export const tusServer = new TusServer({
  path: '/api/upload/chunked',
  datastore: new FileStore({ directory: UPLOAD_DIR }),
  
  // Event handlers
  onUploadCreate: async (req: any, upload: any) => {
    console.log('[TUS] Upload created:', {
      id: upload.id,
      size: upload.size,
      metadata: upload.metadata,
    });
    
    // Validate metadata
    if (!upload.metadata) {
      throw new Error('Missing upload metadata');
    }
    
    const { userId, filename, filetype } = upload.metadata;
    
    if (!userId || !filename || !filetype) {
      throw new Error('Missing required metadata: userId, filename, filetype');
    }
    
    // Validate file size (100MB max)
    const maxSize = 100 * 1024 * 1024;
    if (upload.size && upload.size > maxSize) {
      throw new Error(`File too large. Maximum size: ${maxSize / 1024 / 1024}MB`);
    }
    
    // Validate file type
    const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/wave', 'audio/x-wav'];
    if (!allowedTypes.includes(filetype.toLowerCase())) {
      throw new Error('Invalid file type. Only MP3 and WAV are allowed.');
    }
    
    return {};
  },
  
  onUploadFinish: async (req: any, upload: any) => {
    console.log('[TUS] Upload finished:', {
      id: upload.id,
      size: upload.size,
      metadata: upload.metadata,
    });
    
    try {
      // Read the uploaded file from temp storage
      const uploadPath = path.join(UPLOAD_DIR, upload.id);
      const fileBuffer = await fs.readFile(uploadPath);
      
      // Extract metadata
      const { userId, filename, filetype } = upload.metadata!;
      
      // Generate unique file key
      const ext = filename.split('.').pop()?.toLowerCase() || 'mp3';
      const randomSuffix = nanoid(10);
      const timestamp = Date.now();
      const fileKey = `tracks/${userId}/${timestamp}-${randomSuffix}.${ext}`;
      
      // Upload to S3
      console.log('[TUS] Uploading to S3:', fileKey);
      const result = await storagePut(fileKey, fileBuffer, filetype);
      
      // Clean up temporary file
      await fs.unlink(uploadPath).catch(err => {
        console.error('[TUS] Error deleting temp file:', err);
      });
      
      console.log('[TUS] Upload complete:', {
        fileKey,
        fileUrl: result.url,
        size: fileBuffer.length,
      });
      
      // Store result in upload metadata for retrieval
      upload.metadata = {
        ...upload.metadata,
        fileKey,
        fileUrl: result.url,
        fileSize: fileBuffer.length.toString(),
      };
      
      // Return empty object as per tus protocol
      return {};
    } catch (error) {
      console.error('[TUS] Error in onUploadFinish:', error);
      throw error;
    }
  },
});

// Event listeners for monitoring
tusServer.on(EVENTS.POST_CREATE, (req: any, res: any, upload: any) => {
  console.log('[TUS] POST_CREATE:', upload.id);
});

tusServer.on(EVENTS.POST_RECEIVE, (req: any, res: any, upload: any) => {
  const progress = upload.offset && upload.size 
    ? ((upload.offset / upload.size) * 100).toFixed(2)
    : '0';
  console.log(`[TUS] POST_RECEIVE: ${upload.id} - ${progress}% complete`);
});

tusServer.on(EVENTS.POST_FINISH, (req: any, res: any, upload: any) => {
  console.log('[TUS] POST_FINISH:', upload.id);
});

tusServer.on(EVENTS.POST_TERMINATE, (req: any, res: any, id: string) => {
  console.log('[TUS] POST_TERMINATE:', id);
});

// Cleanup old temp files (older than 24 hours)
async function cleanupOldUploads() {
  try {
    const files = await fs.readdir(UPLOAD_DIR);
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    for (const file of files) {
      const filePath = path.join(UPLOAD_DIR, file);
      const stats = await fs.stat(filePath);
      
      if (now - stats.mtimeMs > maxAge) {
        await fs.unlink(filePath);
        console.log('[TUS] Cleaned up old temp file:', file);
      }
    }
  } catch (error) {
    console.error('[TUS] Error cleaning up old uploads:', error);
  }
}

// Run cleanup every hour
setInterval(cleanupOldUploads, 60 * 60 * 1000);
