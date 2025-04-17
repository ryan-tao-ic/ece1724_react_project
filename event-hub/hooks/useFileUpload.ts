'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { uploadEventMaterial, refreshSignedUrl as refreshSignedUrlAction } from '@/app/actions';
import { UploadResult } from '@/lib/types';

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export function useFileUpload(eventId: string) {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  /**
   * Validates a file for upload
   */
  const validateFile = (file: File): FileValidationResult => {
    // Check file type
    if (file.type !== 'application/pdf') {
      return { valid: false, error: 'Only PDF files are supported' };
    }
    
    // Check file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return { valid: false, error: 'File size exceeds the 10MB limit' };
    }
    
    return { valid: true };
  };

  /**
   * Uploads a file to the server
   */
  const uploadFile = async (file: File): Promise<UploadResult> => {
    setIsUploading(true);
    setUploadError(null);
    
    try {
      // Validate the file
      const validation = validateFile(file);
      if (!validation.valid) {
        setUploadError(validation.error || null);
        return { success: false, error: validation.error };
      }
      
      // Create form data
      const formData = new FormData();
      formData.append('eventId', eventId);
      formData.append('file', file);
      
      // Upload the file
      const result = await uploadEventMaterial(formData);
      
      if (result.success) {
        toast.success('File uploaded successfully');
        router.refresh();
      } else {
        setUploadError(result.error || 'Failed to upload file');
      }
      
      return result;
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadError('An error occurred while uploading the file');
      return { success: false, error: 'An error occurred while uploading the file' };
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Creates a data URL preview for a file
   */
  const generatePreview = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    });
  };

  /**
   * Refreshes the signed URL for a file
   */
  const refreshSignedUrl = async (filePath: string): Promise<string> => {
    return await refreshSignedUrlAction(filePath);
  };

  return {
    uploadFile,
    generatePreview,
    refreshSignedUrl,
    isUploading,
    uploadError,
    setUploadError
  };
} 