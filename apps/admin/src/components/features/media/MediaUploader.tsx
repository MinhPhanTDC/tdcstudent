'use client';

import { useState, useCallback } from 'react';
import { Button } from '@tdc/ui';

interface MediaUploaderProps {
  onUpload: (files: File[]) => Promise<void>;
  isUploading?: boolean;
  accept?: string;
  maxSize?: number; // in bytes
}

const DEFAULT_MAX_SIZE = 10 * 1024 * 1024; // 10MB
const DEFAULT_ACCEPT = 'image/*';

/**
 * MediaUploader component - drag and drop file upload
 */
export function MediaUploader({
  onUpload,
  isUploading = false,
  accept = DEFAULT_ACCEPT,
  maxSize = DEFAULT_MAX_SIZE,
}: MediaUploaderProps): JSX.Element {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  const validateFiles = useCallback(
    (files: File[]): File[] => {
      const validFiles: File[] = [];
      const errors: string[] = [];

      for (const file of files) {
        if (file.size > maxSize) {
          errors.push(`${file.name}: File quá lớn (max ${maxSize / 1024 / 1024}MB)`);
          continue;
        }
        validFiles.push(file);
      }

      if (errors.length > 0) {
        setError(errors.join('\n'));
      } else {
        setError(null);
      }

      return validFiles;
    },
    [maxSize]
  );

  const handleDragOver = (e: React.DragEvent): void => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent): void => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent): void => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const validFiles = validateFiles(files);
    setSelectedFiles((prev) => [...prev, ...validFiles]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const validFiles = validateFiles(files);
      setSelectedFiles((prev) => [...prev, ...validFiles]);
    }
  };

  const handleRemoveFile = (index: number): void => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async (): Promise<void> => {
    if (selectedFiles.length === 0) return;
    await onUpload(selectedFiles);
    setSelectedFiles([]);
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
          isDragging
            ? 'border-primary-500 bg-primary-50'
            : 'border-secondary-300 hover:border-secondary-400'
        }`}
      >
        <svg
          className="mb-4 h-12 w-12 text-secondary-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        <p className="mb-2 text-sm text-secondary-600">
          Kéo thả file vào đây hoặc
        </p>
        <label className="cursor-pointer">
          <span className="text-sm font-medium text-primary-600 hover:text-primary-700">
            chọn file từ máy tính
          </span>
          <input
            type="file"
            className="hidden"
            accept={accept}
            multiple
            onChange={handleFileSelect}
          />
        </label>
        <p className="mt-2 text-xs text-secondary-500">
          Tối đa {maxSize / 1024 / 1024}MB mỗi file
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          <pre className="whitespace-pre-wrap">{error}</pre>
        </div>
      )}

      {/* Selected files */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-secondary-700">
            Đã chọn {selectedFiles.length} file
          </p>
          <div className="max-h-40 space-y-1 overflow-y-auto">
            {selectedFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between rounded bg-secondary-50 px-3 py-2"
              >
                <span className="truncate text-sm text-secondary-700">{file.name}</span>
                <button
                  onClick={() => handleRemoveFile(index)}
                  className="ml-2 text-secondary-400 hover:text-red-500"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload button */}
      <Button
        onClick={handleUpload}
        disabled={selectedFiles.length === 0 || isUploading}
        loading={isUploading}
        className="w-full"
      >
        {isUploading ? 'Đang upload...' : `Upload ${selectedFiles.length} file`}
      </Button>
    </div>
  );
}
