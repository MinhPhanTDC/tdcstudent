'use client';

import { Skeleton } from '@tdc/ui';
import { MajorSelectionCard } from './MajorSelectionCard';
import type { MajorForSelection } from '@/hooks/useSelectMajor';

export interface MajorSelectionListProps {
  majors: MajorForSelection[];
  isLoading?: boolean;
  onViewDetails: (majorId: string) => void;
  onSelect: (majorId: string) => void;
  selectedMajorId?: string | null;
}

/**
 * MajorSelectionList component - displays list of MajorSelectionCards
 * Requirements: 4.2 - Display all active majors with name, description, and course count
 */
export function MajorSelectionList({
  majors,
  isLoading = false,
  onViewDetails,
  onSelect,
  selectedMajorId,
}: MajorSelectionListProps): JSX.Element {
  if (isLoading) {
    return <MajorSelectionListSkeleton />;
  }

  if (majors.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-16 w-16 text-secondary-400"
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
        <h3 className="mt-4 text-lg font-medium text-secondary-900">
          Chưa có chuyên ngành nào
        </h3>
        <p className="mt-2 text-secondary-500">
          Hiện tại chưa có chuyên ngành nào được mở. Vui lòng liên hệ admin để biết thêm thông tin.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header info */}
      <div className="text-center">
        <p className="text-secondary-600">
          Có <span className="font-semibold text-primary-600">{majors.length}</span> chuyên ngành
          để bạn lựa chọn
        </p>
      </div>

      {/* Major cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {majors.map((major) => (
          <MajorSelectionCard
            key={major.id}
            major={major}
            onViewDetails={onViewDetails}
            onSelect={onSelect}
            isSelected={selectedMajorId === major.id}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton loading state for MajorSelectionList
 */
function MajorSelectionListSkeleton(): JSX.Element {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="text-center">
        <Skeleton height={20} width={200} className="mx-auto" />
      </div>

      {/* Cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <MajorCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

function MajorCardSkeleton(): JSX.Element {
  return (
    <div className="bg-white rounded-lg border border-secondary-200 p-6 space-y-4">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Skeleton width={48} height={48} rounded="lg" />
        <div className="flex-1">
          <Skeleton height={24} width="80%" className="mb-2" />
          <Skeleton height={16} width="100%" />
          <Skeleton height={16} width="60%" className="mt-1" />
        </div>
      </div>

      {/* Stats */}
      <Skeleton height={24} width={100} rounded="full" />

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Skeleton height={36} className="flex-1" />
        <Skeleton height={36} className="flex-1" />
      </div>
    </div>
  );
}

