'use client';

import { useRef, useState, useCallback } from 'react';
import { Button, Spinner, FormError, Card } from '@tdc/ui';
import { MAX_PDF_SIZE } from '@tdc/firebase';
import type { HandbookSettings } from '@tdc/schemas';

export interface HandbookUploadProps {
  /** Current handbook settings */
  currentHandbook?: HandbookSettings | null;
  /** Upload handler */
  onUpload: (file: File) => Promise<void>;
  /** Loading state */
  isUploading: boolean;
  /** Error message from API */
  error?: string | null;
}

/**
 * Format file size to human readable string
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Format date to Vietnamese locale string
 */
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * HandbookUpload component - file input with PDF validation and current handbook info
 * Requirements: 7.1, 7.4
 */
export function HandbookUpload({
  currentHandbook,
  onUpload,
  isUploading,
  error,
}: HandbookUploadProps): JSX.Element {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  /**
   * Validate file before selection
   */
  const validateFile = useCallback((file: File): string | null => {
    // Check file type
    if (file.type !== 'application/pdf') {
      return 'Chỉ chấp nhận file PDF';
    }

    // Check file extension
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return 'File phải có đuôi .pdf';
    }

    // Check file size
    if (file.size > MAX_PDF_SIZE) {
      return `File không được vượt quá ${formatFileSize(MAX_PDF_SIZE)}`;
    }

    if (file.size === 0) {
      return 'File không được rỗng';
    }

    return null;
  }, []);

  /**
   * Handle file selection
   */
  const handleFileSelect = useCallback(
    (file: File) => {
      const error = validateFile(file);
      if (error) {
        setValidationError(error);
        setSelectedFile(null);
        return;
      }

      setValidationError(null);
      setSelectedFile(file);
    },
    [validateFile]
  );

  /**
   * Handle input change
   */
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  /**
   * Handle drag events
   */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  /**
   * Handle upload button click
   */
  const handleUpload = useCallback(async () => {
    if (!selectedFile) return;

    await onUpload(selectedFile);
    setSelectedFile(null);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [selectedFile, onUpload]);

  /**
   * Handle browse button click
   */
  const handleBrowseClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  /**
   * Clear selected file
   */
  const handleClearFile = useCallback(() => {
    setSelectedFile(null);
    setValidationError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Current handbook info */}
      {currentHandbook && (
        <Card className="bg-secondary-50">
          <div className="p-4">
            <h4 className="text-sm font-medium text-secondary-900 mb-2">
              Sổ tay hiện tại
            </h4>
            <div className="space-y-1 text-sm text-secondary-600">
              <p>
                <span className="font-medium">Tên file:</span>{' '}
                {currentHandbook.filename}
              </p>
              <p>
                <span className="font-medium">Kích thước:</span>{' '}
                {formatFileSize(currentHandbook.fileSize)}
              </p>
              <p>
                <span className="font-medium">Cập nhật lần cuối:</span>{' '}
                {formatDate(currentHandbook.uploadedAt)}
              </p>
            </div>
            <a
              href={currentHandbook.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-3 text-sm text-primary-600 hover:text-primary-700"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              Xem sổ tay
            </a>
          </div>
        </Card>
      )}

      {/* Upload area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragging ? 'border-primary-500 bg-primary-50' : 'border-secondary-300 hover:border-secondary-400'}
          ${isUploading ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleInputChange}
          className="hidden"
          disabled={isUploading}
        />

        {/* Upload icon */}
        <div className="mx-auto w-12 h-12 text-secondary-400 mb-4">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </div>

        {selectedFile ? (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 text-secondary-700">
              <svg
                className="w-5 h-5 text-red-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-medium">{selectedFile.name}</span>
              <span className="text-secondary-500">
                ({formatFileSize(selectedFile.size)})
              </span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClearFile}
                disabled={isUploading}
              >
                Hủy
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleUpload}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Đang tải lên...
                  </>
                ) : (
                  'Tải lên'
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-secondary-600">
              Kéo thả file PDF vào đây hoặc{' '}
              <button
                type="button"
                onClick={handleBrowseClick}
                className="text-primary-600 hover:text-primary-700 font-medium"
                disabled={isUploading}
              >
                chọn file
              </button>
            </p>
            <p className="text-xs text-secondary-500">
              Chỉ chấp nhận file PDF, tối đa {formatFileSize(MAX_PDF_SIZE)}
            </p>
          </div>
        )}
      </div>

      {/* Validation error */}
      {validationError && <FormError message={validationError} />}

      {/* API error */}
      {error && <FormError message={error} />}
    </div>
  );
}
