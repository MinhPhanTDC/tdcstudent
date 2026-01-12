'use client';

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
}

/**
 * Skeleton for loading state
 */
function MediaGridSkeleton(): JSX.Element {
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
 * MediaGrid component - displays media files in a responsive grid
 */
export function MediaGrid({
  files,
  selectedIds = [],
  onSelect,
  onDelete,
  onToggleActive,
  isLoading,
  showActiveStatus = false,
}: MediaGridProps): JSX.Element {
  if (isLoading) {
    return <MediaGridSkeleton />;
  }

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-secondary-300 py-12">
        <svg className="h-12 w-12 text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="mt-2 text-sm text-secondary-600">Chưa có file nào</p>
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
