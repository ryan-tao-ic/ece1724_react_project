import { Storage } from '@google-cloud/storage';
import { StorageError } from './errors';

/**
 * Service for managing file storage operations
 */
export class StorageService {
  private storage: Storage;
  private bucketName: string;

  constructor() {
    this.storage = new Storage({
      projectId: process.env.STORAGE_PROJECT_ID,
      credentials: {
        client_email: process.env.STORAGE_CLIENT_EMAIL,
        private_key: process.env.STORAGE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
    });
    this.bucketName = process.env.STORAGE_BUCKET_NAME || 'local-bucket';
  }

  /**
   * Sanitizes a filename to remove dangerous characters
   */
  private sanitizeFilename(filename: string): string {
    return filename
      .replace(/[\/\\]/g, '') // Remove slashes
      .replace(/[\x00-\x1f\x7f-\xff]/g, '') // Remove control chars
      .replace(/^\.+/, '') // Remove leading dots
      .trim();
  }

  /**
   * Uploads a file to Google Cloud Storage
   */
  async uploadFile(fileBuffer: Buffer, fileName: string, mimeType: string): Promise<{ filePath: string, signedUrl: string }> {
    try {
      // Sanitize the filename
      const sanitizedFilename = this.sanitizeFilename(fileName);
      
      // Create a unique file name to prevent collisions
      const uniqueFileName = `${Date.now()}-${sanitizedFilename}`;
      const filePath = `event-materials/${uniqueFileName}`;
      
      // Get a reference to the bucket
      const bucket = this.storage.bucket(this.bucketName);
      
      // Create a file object
      const file = bucket.file(filePath);
      
      // Upload the file
      await file.save(fileBuffer, {
        metadata: {
          contentType: mimeType,
        },
      });
      
      // Generate a signed URL
      const signedUrl = await this.getSignedUrl(filePath);
      
      return { filePath, signedUrl };
    } catch (error) {
      console.error('Error uploading file to Google Cloud Storage:', error);
      throw new StorageError('Failed to upload file to storage', error);
    }
  }

  /**
   * Generate a signed URL for a file
   */
  async getSignedUrl(filePath: string): Promise<string> {
    try {
      const file = this.storage.bucket(this.bucketName).file(filePath);
      
      const [signedUrl] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
      });
      
      return signedUrl;
    } catch (error) {
      console.error('Error generating signed URL:', error);
      throw new StorageError('Failed to generate signed URL', error);
    }
  }

  /**
   * Delete a file from storage
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      // Get a reference to the file
      const file = this.storage.bucket(this.bucketName).file(filePath);
      
      // Delete the file
      await file.delete();
    } catch (error) {
      console.error('Error deleting file from Google Cloud Storage:', error);
      throw new StorageError('Failed to delete file from storage', error);
    }
  }
}

// Create and export a singleton instance
export const storageService = new StorageService(); 