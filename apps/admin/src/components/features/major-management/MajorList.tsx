'use client';

import { Skeleton, EmptyState } from '@tdc/ui';
import type { Major } from '@tdc/schemas';
import { MajorCard } from './MajorCard';

export interface MajorListProps {
  majors: Major[];
  courseCountMap?: Record<string, number>;
  isLoading?: boolean;
  onDelete?: (majorId: string) => void;
  onRestore?: (majorId: string) => void;
  deletingId?: string | null;
  restoringId?: string | null;
}

/**
 * MajorList component - displays grid of MajorCards with loading/empty states
 * Requirements: 1.2, 1.6
 */
export function MajorList({
  majors,
  courseCountMap = {},
  isLoading = false,
  onDelete,
  onRestore,
  deletingId,
  restoringId,
}: MajorListProps): JSX.Element {
  // Loading state
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <MajorCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  // Empty state
  if (majors.length === 0) {
    return (
      <EmptyState
        title="Chưa có chuyên ngành"
        description="Tạo chuyên ngành đầu tiên để bắt đầu xây dựng chương trình đào tạo."
        icon={
          <svg
            className="h-12 w-12 text-secondary-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        }
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {majors.map((major) => (
        <MajorCard
          key={major.id}
          major={major}
          courseCount={courseCountMap[major.id] || 0}
          onDelete={onDelete ? () => onDelete(major.id) : undefined}
          onRestore={onRestore ? () => onRestore(major.id) : undefined}
          isDeleting={deletingId === major.id}
          isRestoring={restoringId === major.id}
        />
      ))}
    </div>
  );
}

/**
 * Skeleton component for loading state
 */
function MajorCardSkeleton(): JSX.Element {
  return (
    <div className="rounded-lg border border-secondary-200 bg-white p-4">
      <div className="mb-3 flex items-start gap-3">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="flex-1">
          <Skeleton className="mb-2 h-5 w-3/4" />
          <Skeleton className="h-5 w-16" />
        </div>
      </div>
      <Skeleton className="mb-2 h-4 w-full" />
      <Skeleton className="mb-4 h-4 w-2/3" />
      <div className="border-t border-secondary-100 pt-3">
        <Skeleton className="h-8 w-24" />
      </div>
    </div>
  );
}
