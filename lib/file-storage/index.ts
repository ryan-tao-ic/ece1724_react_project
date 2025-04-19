'use server';

import { storageService } from './service';
// Don't re-export StorageError from here as 'use server' only allows async function exports

/**
 * Upload a file to Google Cloud Storage
 * @param fileBuffer The file buffer to upload
 * @param fileName The name of the file
 * @param mimeType The MIME type of the file
 * @returns The signed URL of the uploaded file
 */
export async function uploadFileToStorage(
  fileBuffer: Buffer, 
  fileName: string, 
  mimeType: string
): Promise<string> {
  const { filePath, signedUrl } = await storageService.uploadFile(fileBuffer, fileName, mimeType);
  return signedUrl;
}

/**
 * Generate a signed URL for a file
 * @param filePath The path of the file
 * @returns The signed URL
 */
export async function getSignedUrl(filePath: string): Promise<string> {
  return await storageService.getSignedUrl(filePath);
}

/**
 * Delete a file from storage
 * @param filePath The path of the file to delete
 */
export async function deleteFileFromStorage(filePath: string): Promise<void> {
  await storageService.deleteFile(filePath);
} 