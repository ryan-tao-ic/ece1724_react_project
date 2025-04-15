'use client';

import { useRef, useState } from 'react';
import { FileIcon, UploadIcon, AlertCircleIcon, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PDFViewer } from '@/components/ui/pdf-viewer';
import { useFileUpload } from '@/hooks/useFileUpload';
import { detachEventMaterialAction } from '@/app/actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface Material {
  id: number;
  fileName: string;
  fileType: string;
  filePath?: string;
  signedUrl?: string | null;
}

interface EventMaterialsUploadProps {
  eventId: string;
  existingMaterials?: Material[];
  isLoggedIn: boolean;
}

/**
 * Component for uploading and displaying event materials
 */
export function EventMaterialsUpload({
  eventId,
  existingMaterials = [],
  isLoggedIn
}: EventMaterialsUploadProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  
  const {
    uploadFile,
    generatePreview,
    isUploading,
    uploadError,
    setUploadError,
    refreshSignedUrl
  } = useFileUpload(eventId);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await handleFileSelection(files[0]);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await handleFileSelection(files[0]);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileSelection = async (file: File) => {
    try {
      setUploadError(null);
      
      // Validate file type for preview
      if (file.type === 'application/pdf') {
        // Generate preview before uploading
        const preview = await generatePreview(file);
        setPreviewUrl(preview);
        setSelectedFile(file);
      } else {
        setUploadError('Only PDF files are supported');
      }
    } catch (error) {
      console.error('Error generating preview:', error);
      setUploadError('Error generating preview');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    const result = await uploadFile(selectedFile);
    
    if (result.success) {
      // Clear preview and selected file on success
      setPreviewUrl(null);
      setSelectedFile(null);
    }
  };

  const handleDelete = async (materialId: number) => {
    setDeletingId(materialId);
    
    try {
      const formData = new FormData();
      formData.append('materialId', materialId.toString());
      formData.append('eventId', eventId);
      
      const result = await detachEventMaterialAction(formData);
      
      if (result.success) {
        toast.success('Document removed successfully');
        // The page will be automatically refreshed by the server action
      } else {
        toast.error(result.error || 'Failed to remove document');
      }
    } catch (error) {
      console.error('Error deleting material:', error);
      toast.error('An error occurred while removing the document');
    } finally {
      setDeletingId(null);
    }
  };

  // Component for unauthenticated users
  if (!isLoggedIn) {
    return (
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Event Materials</h2>
        <div className="border border-gray-200 rounded-md p-6 bg-gray-50 flex flex-col items-center justify-center text-center">
          <AlertCircleIcon className="h-8 w-8 text-gray-400 mb-2" />
          <p className="text-sm text-gray-600 mb-2">Please log in to access or upload event materials</p>
          <Button asChild size="sm">
            <a href="/login">Login</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-2">Event Materials</h2>
      
      {existingMaterials.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-3">Uploaded Documents</h3>
          <ul className="space-y-6">
            {existingMaterials.map((material) => (
              <li key={material.id} className="border rounded-md p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm">
                    <FileIcon className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">{material.fileName}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(material.id)}
                    disabled={deletingId === material.id}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    {deletingId === material.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {material.signedUrl && material.filePath && (
                  <PDFViewer 
                    url={material.signedUrl} 
                    fileName={material.fileName}
                    onRefresh={() => refreshSignedUrl(material.filePath || '')}
                  />
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* File preview section */}
      {previewUrl && selectedFile && !isUploading && (
        <div className="mb-6 border rounded-md p-4">
          <h3 className="text-sm font-medium mb-2">Preview</h3>
          <div className="flex items-center space-x-2 text-sm mb-2">
            <FileIcon className="h-4 w-4 text-blue-500" />
            <span className="font-medium">{selectedFile.name}</span>
          </div>
          <iframe 
            src={previewUrl} 
            className="w-full h-[300px] border rounded mb-4" 
            title="PDF Preview"
          />
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setPreviewUrl(null);
                setSelectedFile(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              size="sm"
              onClick={handleUpload}
            >
              Upload File
            </Button>
          </div>
        </div>
      )}
      
      {/* Upload drop zone */}
      <div 
        className={`border-2 border-dashed rounded-md p-8 text-center transition-colors ${
          isDragging 
            ? 'border-blue-400 bg-blue-50' 
            : isUploading
              ? 'border-gray-300 bg-gray-50'
              : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isUploading ? (
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-3" />
            <p className="text-sm font-medium">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <UploadIcon className="h-10 w-10 text-gray-400 mb-3" />
            <p className="text-sm font-medium mb-1">Upload Supporting Documents</p>
            <p className="text-xs text-gray-500 mb-4">Drag and drop your PDF file here, or click to browse</p>
            
            <Button size="sm">
              <label className="cursor-pointer">
                Browse Files
                <input 
                  type="file" 
                  className="hidden" 
                  accept=".pdf" 
                  ref={fileInputRef}
                  onChange={handleFileInputChange}
                />
              </label>
            </Button>
            
            {uploadError && (
              <p className="text-xs text-red-500 mt-2">{uploadError}</p>
            )}
            
            <p className="text-xs text-gray-500 mt-4">
              Max file size: 10MB. Supported format: PDF
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 