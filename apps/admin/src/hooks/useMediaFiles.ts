import { useState, useEffect, useCallback } from 'react';
import { mediaRepository } from '@tdc/firebase';
import type { MediaFile, MediaFilter, MediaCategory } from '@tdc/schemas';

interface UseMediaFilesReturn {
  files: MediaFile[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  deleteFile: (id: string) => Promise<void>;
  toggleActive: (id: string) => Promise<void>;
  uploadFile: (file: File, category: MediaCategory) => Promise<void>;
  isUploading: boolean;
  clearError: () => void;
}

/**
 * Hook for managing media files
 */
export function useMediaFiles(filter?: MediaFilter): UseMediaFilesReturn {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFiles = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    const result = await mediaRepository.findAll(filter);
    if (result.success) {
      setFiles(result.data);
    } else {
      const errorMsg = result.error.message || 'Không thể tải danh sách file';
      console.error('Failed to fetch files:', result.error);
      setError(errorMsg);
    }

    setIsLoading(false);
  }, [filter]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const deleteFile = async (id: string): Promise<void> => {
    setError(null);
    const result = await mediaRepository.delete(id);
    if (result.success) {
      setFiles((prev) => prev.filter((f) => f.id !== id));
    } else {
      const errorMsg = result.error.message || 'Không thể xóa file';
      console.error('Failed to delete file:', result.error);
      setError(errorMsg);
    }
  };

  const toggleActive = async (id: string): Promise<void> => {
    setError(null);
    const result = await mediaRepository.toggleActive(id);
    if (result.success) {
      setFiles((prev) =>
        prev.map((f) => (f.id === id ? { ...f, isActive: result.data.isActive } : f))
      );
    } else {
      const errorMsg = result.error.message || 'Không thể cập nhật trạng thái';
      console.error('Failed to toggle active:', result.error);
      setError(errorMsg);
    }
  };

  const uploadFile = async (file: File, category: MediaCategory): Promise<void> => {
    setIsUploading(true);
    setError(null);

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError(`File "${file.name}" quá lớn. Kích thước tối đa: 10MB`);
      setIsUploading(false);
      return;
    }

    // Determine file type
    let type: 'image' | 'video' | 'document' | 'other' = 'other';
    if (file.type.startsWith('image/')) {
      type = 'image';
    } else if (file.type.startsWith('video/')) {
      type = 'video';
    } else if (
      file.type.includes('pdf') ||
      file.type.includes('document') ||
      file.type.includes('text')
    ) {
      type = 'document';
    }

    console.log('Starting upload:', { 
      name: file.name, 
      type, 
      category, 
      size: file.size,
      mimeType: file.type 
    });

    const result = await mediaRepository.create(file, {
      name: file.name,
      type,
      category,
      mimeType: file.type,
      isActive: category === 'login-background', // Auto-active for login backgrounds
    });

    if (result.success) {
      console.log('Upload successful:', result.data);
      setFiles((prev) => [result.data, ...prev]);
    } else {
      const errorMsg = result.error.message || 'Không thể upload file';
      console.error('Upload failed:', result.error);
      
      // Provide more helpful error messages
      if (errorMsg.includes('permission') || errorMsg.includes('403')) {
        setError('Bạn không có quyền upload file. Vui lòng đăng nhập lại hoặc liên hệ admin.');
      } else if (errorMsg.includes('network') || errorMsg.includes('Failed to fetch')) {
        setError('Lỗi kết nối mạng. Vui lòng kiểm tra internet và thử lại.');
      } else {
        setError(`Upload thất bại: ${errorMsg}`);
      }
    }

    setIsUploading(false);
  };

  const clearError = (): void => {
    setError(null);
  };

  return {
    files,
    isLoading,
    error,
    refetch: fetchFiles,
    deleteFile,
    toggleActive,
    uploadFile,
    isUploading,
    clearError,
  };
}
