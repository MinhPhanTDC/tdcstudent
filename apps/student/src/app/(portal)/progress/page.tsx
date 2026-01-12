'use client';

import { EmptyState, Skeleton } from '@tdc/ui';
import { useMyProgress } from '@/hooks/useMyProgress';
import { useProgressBySemester } from '@/hooks/useProgressBySemester';
import {
  ProgressOverview,
  SemesterProgress,
} from '@/components/features/progress';

/**
 * Progress page - displays detailed learning progress
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10
 */
export default function ProgressPage(): JSX.Element {
  const { data: overallProgress, isLoading: isLoadingOverall } = useMyProgress();
  const { data: semestersWithCourses, isLoading: isLoadingSemesters } = useProgressBySemester();

  const isLoading = isLoadingOverall || isLoadingSemesters;

  // Loading state - Requirements: 4.9
  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-secondary-900">Tiến độ học tập</h1>
        
        {/* Overview skeleton */}
        <div className="rounded-lg border border-secondary-200 bg-white p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-56" />
              </div>
              <div className="text-right space-y-1">
                <Skeleton className="h-8 w-16 ml-auto" />
                <Skeleton className="h-4 w-20 ml-auto" />
              </div>
            </div>
            <Skeleton className="h-3 w-full" />
            <div className="grid grid-cols-3 gap-4 pt-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="text-center space-y-2">
                  <Skeleton className="h-8 w-12 mx-auto" />
                  <Skeleton className="h-4 w-24 mx-auto" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Semesters skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-48" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg border border-secondary-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state - Requirements: 4.10
  if (!overallProgress || overallProgress.totalCourses === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-secondary-900">Tiến độ học tập</h1>
        <div className="rounded-lg border border-secondary-200 bg-white p-6">
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
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            }
            title="Chưa có dữ liệu"
            description="Bắt đầu học để theo dõi tiến độ của bạn"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-secondary-900">Tiến độ học tập</h1>

      {/* Overall Progress Overview - Requirements: 4.2, 4.3 */}
      <ProgressOverview
        completionPercentage={overallProgress.completionPercentage}
        totalCourses={overallProgress.totalCourses}
        completedCourses={overallProgress.completedCourses}
        inProgressCourses={overallProgress.inProgressCourses}
      />

      {/* Semesters with courses - Requirements: 4.4, 4.5, 4.6, 4.7, 4.8 */}
      {semestersWithCourses && semestersWithCourses.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-secondary-900">
            Tiến độ theo học kỳ
          </h2>
          {semestersWithCourses.map((semesterData, index) => (
            <SemesterProgress
              key={semesterData.semester.id}
              semesterId={semesterData.semester.id}
              semesterName={semesterData.semester.name}
              status={semesterData.status}
              courses={semesterData.courses}
              defaultExpanded={semesterData.status === 'in_progress' || index === 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}
