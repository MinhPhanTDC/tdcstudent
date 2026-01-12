'use client';

import { useCallback, useRef } from 'react';
import { Button, Card, CardContent } from '@tdc/ui';
import { useStudentImport } from '@/hooks/useStudentImport';
import { ImportPreview } from './ImportPreview';
import { ImportProgress } from './ImportProgress';
import { ImportResult } from './ImportResult';

/**
 * File upload dropzone icon
 */
function UploadIcon(): JSX.Element {
  return (
    <svg
      className="mx-auto h-12 w-12 text-secondary-400"
      stroke="currentColor"
      fill="none"
      viewBox="0 0 48 48"
      aria-hidden="true"
    >
      <path
        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Supported file extensions
 */
const ACCEPTED_FILE_TYPES = '.csv,.xlsx,.xls';
const ACCEPTED_MIME_TYPES = [
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

interface StudentImportProps {
  /** Callback when import is complete */
  onComplete?: () => void;
  /** Callback when modal should close */
  onClose?: () => void;
}

/**
 * Student import component with file upload dropzone
 * Supports CSV and Excel files
 * Requirements: 4.1, 4.2
 */
export function StudentImport({ onComplete, onClose }: StudentImportProps): JSX.Element {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    status,
    file,
    validationResult,
    progress,
    result,
    error,
    canImport,
    progressPercent,
    setFile,
    executeImport,
    cancelImport,
    reset,
    getValidRows,
    getInvalidRows,
  } = useStudentImport();

  /**
   * Handle file selection from input
   */
  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = event.target.files?.[0];
      if (selectedFile) {
        setFile(selectedFile);
      }
      // Reset input value to allow selecting same file again
      event.target.value = '';
    },
    [setFile]
  );

  /**
   * Handle drag over event
   */
  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  /**
   * Handle file drop
   */
  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();

      const droppedFile = event.dataTransfer.files[0];
      if (droppedFile) {
        // Validate file type
        const isValidType =
          ACCEPTED_MIME_TYPES.includes(droppedFile.type) ||
          droppedFile.name.match(/\.(csv|xlsx|xls)$/i);

        if (isValidType) {
          setFile(droppedFile);
        }
      }
    },
    [setFile]
  );

  /**
   * Open file picker
   */
  const handleBrowseClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  /**
   * Handle import completion
   */
  const handleComplete = useCallback(() => {
    onComplete?.();
    reset();
    onClose?.();
  }, [onComplete, reset, onClose]);

  /**
   * Handle reset/start over
   */
  const handleReset = useCallback(() => {
    reset();
  }, [reset]);

  // Render based on current status
  if (status === 'importing') {
    return (
      <ImportProgress
        current={progress.current}
        total={progress.total}
        percent={progressPercent}
        onCancel={cancelImport}
      />
    );
  }

  if (status === 'complete' && result) {
    return <ImportResult result={result} onClose={handleComplete} onReset={handleReset} />;
  }

  if (status === 'previewing' && validationResult) {
    return (
      <ImportPreview
        fileName={file?.name || ''}
        validRows={getValidRows()}
        invalidRows={getInvalidRows()}
        validCount={validationResult.validCount}
        invalidCount={validationResult.invalidCount}
        canImport={canImport}
        onImport={executeImport}
        onCancel={handleReset}
      />
    );
  }

  // Default: File upload dropzone
  return (
    <div className="space-y-4">
      {/* Error message */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Dropzone */}
      <Card>
        <CardContent className="p-0">
          <div
            className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-secondary-300 p-12 transition-colors hover:border-primary-400 hover:bg-secondary-50"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={handleBrowseClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleBrowseClick();
              }
            }}
          >
            <UploadIcon />
            <div className="mt-4 flex text-sm leading-6 text-secondary-600">
              <span className="font-semibold text-primary-600 hover:text-primary-500">
                Chọn file
              </span>
              <span className="pl-1">hoặc kéo thả vào đây</span>
            </div>
            <p className="mt-1 text-xs text-secondary-500">CSV, Excel (.xlsx, .xls)</p>
          </div>
        </CardContent>
      </Card>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_FILE_TYPES}
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Chọn file để import"
      />

      {/* Loading state */}
      {(status === 'parsing' || status === 'validating') && (
        <div className="flex items-center justify-center py-4">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
          <span className="ml-2 text-sm text-secondary-600">
            {status === 'parsing' ? 'Đang đọc file...' : 'Đang kiểm tra dữ liệu...'}
          </span>
        </div>
      )}

      {/* Instructions */}
      <div className="rounded-md bg-secondary-50 p-4">
        <h4 className="text-sm font-medium text-secondary-900">Hướng dẫn</h4>
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-secondary-600">
          <li>File phải có cột &quot;Tên&quot; (hoặc &quot;Name&quot;, &quot;Họ tên&quot;)</li>
          <li>File phải có cột &quot;Email&quot;</li>
          <li>Dòng đầu tiên là tiêu đề cột</li>
          <li>Mỗi học viên sẽ được tạo tài khoản với mật khẩu ngẫu nhiên</li>
        </ul>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
        )}
      </div>
    </div>
  );
}
