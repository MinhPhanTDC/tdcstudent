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
      setError(result.error.message);
    }

    setIsLoading(false);
  }, [filter]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const deleteFile = async (id: string): Promise<void> => {
    const result = await mediaRepository.delete(id);
    if (result.success) {
      setFiles((prev) => prev.filter((f) => f.id !== id));
    } else {
      setError(result.error.message);
    }
  };

  const toggleActive = async (id: string): Promise<void> => {
    const result = await mediaRepository.toggleActive(id);
    if (result.success) {
      setFiles((prev) =>
        prev.map((f) => (f.id === id ? { ...f, isActive: result.data.isActive } : f))
      );
    } else {
      setError(result.error.message);
    }
  };

  const uploadFile = async (file: File, category: MediaCategory): Promise<void> => {
    setIsUploading(true);
    setError(null);

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

    console.log('Starting upload:', { name: file.name, type, category, size: file.size });

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
      console.error('Upload failed:', result.error);
      setError(result.error.message);
    }

    setIsUploading(false);
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
  };
}
