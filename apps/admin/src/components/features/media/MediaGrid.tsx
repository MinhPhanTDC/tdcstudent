'use client';

import { EmptyState, Card } from '@tdc/ui';
import { MediaItem } from './MediaItem';
import type { MediaFile } from '@tdc/schemas';

interface MediaGridProps {
  files: MediaFile[];
  selectedIds?: string[];
  onSelect?: (file: MediaFile) => void;
  onDelete?: (file: MediaFile) => void;
  onToggleActive?: (file: MediaFile) => void;
  isLoading?: boolean;
  showActiveStatus?: boolean;
  viewMode?: 'grid' | 'list';
}

/**
 * Skeleton for loading state
 * Requirements: 1.1 - Display consistent loading indicators with skeleton screens
 */
function MediaGridSkeleton({ viewMode = 'grid' }: { viewMode?: 'grid' | 'list' }): JSX.Element {
  if (viewMode === 'list') {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="flex items-center gap-4 rounded-lg border border-secondary-200 bg-white p-4">
            <div className="h-16 w-16 animate-pulse rounded bg-secondary-100" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 animate-pulse rounded bg-secondary-100" />
              <div className="h-3 w-1/4 animate-pulse rounded bg-secondary-100" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
        <div key={i} className="overflow-hidden rounded-lg border border-secondary-200 bg-white">
          <div className="aspect-square animate-pulse bg-secondary-100" />
          <div className="space-y-2 p-2">
            <div className="h-4 w-3/4 animate-pulse rounded bg-secondary-100" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-secondary-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * MediaGrid component - displays media files in a responsive grid or list
 * Requirements: 1.1, 1.2
 */
export function MediaGrid({
  files,
  selectedIds = [],
  onSelect,
  onDelete,
  onToggleActive,
  isLoading,
  showActiveStatus = false,
  viewMode = 'grid',
}: MediaGridProps): JSX.Element {
  if (isLoading) {
    return <MediaGridSkeleton viewMode={viewMode} />;
  }

  // Empty state - Requirements: 1.2
  if (files.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={
            <svg
              className="h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          }
          title="Chưa có file nào"
          description="Upload file đầu tiên để bắt đầu quản lý media"
        />
      </Card>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="space-y-2">
        {files.map((file) => (
          <div
            key={file.id}
            className="flex items-center gap-4 rounded-lg border border-secondary-200 bg-white p-4 hover:border-primary-300 transition-colors"
          >
            {/* Thumbnail */}
            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded bg-secondary-100">
              {file.type === 'image' ? (
                <img
                  src={file.url}
                  alt={file.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-secondary-400">
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-secondary-900 truncate">{file.name}</h4>
              <div className="mt-1 flex items-center gap-3 text-xs text-secondary-500">
                <span>{file.type}</span>
                <span>•</span>
                <span>{(file.size / 1024).toFixed(1)} KB</span>
                <span>•</span>
                <span>{file.category}</span>
                {showActiveStatus && (
                  <>
                    <span>•</span>
                    <span className={file.isActive ? 'text-green-600 font-medium' : 'text-secondary-400'}>
                      {file.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {onToggleActive && (
                <button
                  onClick={() => onToggleActive(file)}
                  className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
                    file.isActive
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
                  }`}
                >
                  {file.isActive ? 'Active' : 'Inactive'}
                </button>
              )}
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded p-2 text-secondary-600 hover:bg-secondary-100"
                title="Xem file"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </a>
              {onDelete && (
                <button
                  onClick={() => onDelete(file)}
                  className="rounded p-2 text-red-600 hover:bg-red-50"
                  title="Xóa file"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {files.map((file) => (
        <MediaItem
          key={file.id}
          file={file}
          isSelected={selectedIds.includes(file.id)}
          onSelect={onSelect}
          onDelete={onDelete}
          onToggleActive={onToggleActive}
          showActiveStatus={showActiveStatus}
        />
      ))}
    </div>
  );
}
