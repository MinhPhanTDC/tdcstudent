'use client';

import { useMySemesters } from '@/hooks/useMySemesters';
import { useMyMajorProgress } from '@/hooks/useMyMajor';
import { LearningTree } from '@/components/features/learning-tree';
import { FormError, Skeleton } from '@tdc/ui';

/**
 * Learning Tree page - displays learning path visualization
 * Requirements: 6.1, 6.5, 5.5
 */
export default function LearningTreePage(): JSX.Element {
  const { data: semesters, isLoading: semestersLoading, error: semestersError } = useMySemesters();
  const { data: majorData, isLoading: majorLoading } = useMyMajorProgress();

  const isLoading = semestersLoading || majorLoading;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Lộ trình học tập</h1>
        <p className="mt-1 text-sm text-secondary-500">
          Xem tổng quan hành trình học tập của bạn qua các học kỳ
          {majorData && ' và chuyên ngành'}
        </p>
      </div>

      {semestersError && (
        <FormError message="Không thể tải lộ trình học tập. Vui lòng thử lại sau." />
      )}

      {isLoading ? (
        <LearningTreeSkeleton />
      ) : (
        <LearningTree 
          semesters={semesters ?? []} 
          majorData={majorData}
        />
      )}
    </div>
  );
}

/**
 * Skeleton loading state for Learning Tree
 */
function LearningTreeSkeleton(): JSX.Element {
  return (
    <div className="space-y-6">
      {/* Legend skeleton */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-24" />
      </div>

      {/* Tree skeleton */}
      <div className="rounded-lg border border-secondary-200 bg-white p-6 shadow-sm">
        <div className="space-y-4">
          {/* Start node */}
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>

          {/* Connector */}
          <Skeleton className="ml-5 h-4 w-px" />

          {/* Tree nodes */}
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <div className="flex items-center gap-3 rounded-lg border-2 border-secondary-200 px-4 py-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-40" />
              </div>
              {i < 3 && <Skeleton className="ml-5 mt-3 h-3 w-px" />}
            </div>
          ))}

          {/* Connector */}
          <Skeleton className="ml-5 h-4 w-px" />

          {/* End node */}
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
      </div>

      {/* Progress summary skeleton */}
      <Skeleton className="h-20 w-full rounded-lg" />
    </div>
  );
}
