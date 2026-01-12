'use client';

import Image from 'next/image';
import { cn } from '@tdc/ui';
import type { MediaFile } from '@tdc/schemas';

interface MediaItemProps {
  file: MediaFile;
  isSelected?: boolean;
  onSelect?: (file: MediaFile) => void;
  onDelete?: (file: MediaFile) => void;
  onToggleActive?: (file: MediaFile) => void;
  showActiveStatus?: boolean;
}

/**
 * Format file size to human readable string
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Get icon for file type
 */
function FileTypeIcon({ type }: { type: string }): JSX.Element {
  switch (type) {
    case 'image':
      return (
        <svg className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    case 'video':
      return (
        <svg className="h-8 w-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      );
    case 'document':
      return (
        <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    default:
      return (
        <svg className="h-8 w-8 text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
  }
}

/**
 * MediaItem component - displays a single media file in the grid
 */
export function MediaItem({
  file,
  isSelected,
  onSelect,
  onDelete,
  onToggleActive,
  showActiveStatus = false,
}: MediaItemProps): JSX.Element {
  const handleClick = (): void => {
    if (onToggleActive) {
      onToggleActive(file);
    } else {
      onSelect?.(file);
    }
  };

  const handleDelete = (e: React.MouseEvent): void => {
    e.stopPropagation();
    onDelete?.(file);
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        'group relative cursor-pointer overflow-hidden rounded-lg border-2 bg-white transition-all hover:shadow-md',
        isSelected ? 'border-primary-500 ring-2 ring-primary-200' : 'border-secondary-200',
        showActiveStatus && file.isActive && 'border-green-500 ring-2 ring-green-200'
      )}
    >
      {/* Preview */}
      <div className="aspect-square relative">
        {file.type === 'image' ? (
          <Image
            src={file.url}
            alt={file.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-secondary-50">
            <FileTypeIcon type={file.type} />
          </div>
        )}
      </div>

      {/* Overlay with actions */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
        {onDelete && (
          <button
            onClick={handleDelete}
            className="rounded-full bg-white p-2 text-red-600 shadow-lg transition-transform hover:scale-110"
            title="Xóa"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>

      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute right-2 top-2 rounded-full bg-primary-500 p-1 text-white">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}

      {/* Active status indicator */}
      {showActiveStatus && (
        <div
          className={cn(
            'absolute left-2 top-2 rounded-full px-2 py-0.5 text-xs font-medium',
            file.isActive ? 'bg-green-500 text-white' : 'bg-secondary-200 text-secondary-600'
          )}
        >
          {file.isActive ? 'Active' : 'Inactive'}
        </div>
      )}

      {/* File info */}
      <div className="border-t border-secondary-100 bg-white p-2">
        <p className="truncate text-sm font-medium text-secondary-900" title={file.name}>
          {file.name}
        </p>
        <p className="text-xs text-secondary-500">{formatFileSize(file.size)}</p>
      </div>
    </div>
  );
}
