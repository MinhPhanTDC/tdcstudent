'use client';

import Link from 'next/link';
import { Skeleton } from '@tdc/ui';
import { useMyStudent } from '@/hooks/useMyCourses';
import { useMyMajorProgress } from '@/hooks/useMyMajor';
import { MyMajorProgress, MajorCourseList } from '@/components/features/major';

/**
 * My Major page - displays student's selected major and progress
 * Requirements: 5.1, 5.2, 5.3, 5.4
 */
export default function MyMajorPage(): JSX.Element {
  const { data: student, isLoading: isLoadingStudent } = useMyStudent();
  const { data: majorData, isLoading: isLoadingMajor, error } = useMyMajorProgress();

  // Loading state
  if (isLoadingStudent || isLoadingMajor) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <svg
          className="mx-auto h-12 w-12 text-red-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-red-800">Đã xảy ra lỗi</h3>
        <p className="mt-2 text-sm text-red-600">
          Không thể tải thông tin chuyên ngành. Vui lòng thử lại sau.
        </p>
      </div>
    );
  }

  // No major selected state (Requirements: 5.4)
  if (!student?.selectedMajorId || !majorData) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-secondary-900">Chuyên ngành của tôi</h1>
        
        <div className="rounded-lg border border-secondary-200 bg-white p-8 text-center">
          <svg
            className="mx-auto h-16 w-16 text-secondary-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          <h2 className="mt-4 text-xl font-semibold text-secondary-900">
            Bạn chưa chọn chuyên ngành
          </h2>
          <p className="mt-2 text-secondary-600">
            Khi đến học kỳ phân ngành, bạn sẽ được chọn chuyên ngành phù hợp với mình.
          </p>
          <Link
            href="/select-major"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
            Xem danh sách chuyên ngành
          </Link>
        </div>
      </div>
    );
  }

  // Has major - display progress and courses
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-secondary-900">Chuyên ngành của tôi</h1>
      </div>

      {/* Major progress card (Requirements: 5.1, 5.3) */}
      <MyMajorProgress
        major={majorData.major}
        totalCourses={majorData.totalCourses}
        completedCourses={majorData.completedCourses}
        inProgressCourses={majorData.inProgressCourses}
        progressPercentage={majorData.progressPercentage}
      />

      {/* Course list (Requirements: 5.2) */}
      <MajorCourseList courses={majorData.courses} />
    </div>
  );
}
