'use client';

import { Card, EmptyState, Skeleton, SkeletonText } from '@tdc/ui';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useMyProgress } from '@/hooks/useMyProgress';
import { ProgressBar } from '@/components/features/progress/ProgressBar';
import { ProgressStats } from '@/components/features/progress/ProgressStats';
import { CurrentCourse } from '@/components/features/progress/CurrentCourse';
import { NextCourses } from '@/components/features/progress/NextCourses';

/**
 * Dashboard page - displays student progress overview
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 */
export default function DashboardPage(): JSX.Element {
  const { user } = useAuth();
  const { data: progress, isLoading, error } = useMyProgress();

  // Loading state
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-secondary-900">Dashboard</h1>
        <Card>
          <EmptyState
            icon={
              <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            }
            title="Không thể tải dữ liệu"
            description="Đã xảy ra lỗi khi tải tiến độ học tập. Vui lòng thử lại sau."
          />
        </Card>
      </div>
    );
  }

  // No progress data
  if (!progress || progress.totalCourses === 0) {
    return (
      <div className="space-y-6">
        <WelcomeHeader userName={user?.displayName} />
        <Card>
          <EmptyState
            icon={
              <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            }
            title="Chưa có khóa học"
            description="Bạn chưa được đăng ký khóa học nào. Vui lòng liên hệ admin."
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome message - Requirement 5.1 */}
      <WelcomeHeader userName={user?.displayName} />

      {/* Overall progress bar - Requirement 5.2 */}
      <Card>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-secondary-900">
              Tiến độ tổng thể
            </h2>
            <span className="text-2xl font-bold text-primary-600">
              {progress.completionPercentage}%
            </span>
          </div>
          <ProgressBar
            value={progress.completionPercentage}
            size="lg"
            variant="primary"
          />
          <p className="text-sm text-secondary-500">
            Đã hoàn thành {progress.completedCourses}/{progress.totalCourses} môn học
          </p>
        </div>
      </Card>

      {/* Statistics - Requirement 5.3 */}
      <ProgressStats
        totalCourses={progress.totalCourses}
        completedCourses={progress.completedCourses}
        totalProjects={progress.totalProjects}
        submittedProjects={progress.submittedProjects}
      />

      {/* Current course and next courses */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Current course - Requirement 5.4 */}
        {progress.currentCourse ? (
          <CurrentCourse currentCourse={progress.currentCourse} />
        ) : (
          <Card>
            <div className="text-center py-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="mt-3 text-lg font-medium text-secondary-900">
                Tuyệt vời!
              </h3>
              <p className="mt-1 text-sm text-secondary-500">
                Bạn đã hoàn thành tất cả các môn học.
              </p>
            </div>
          </Card>
        )}

        {/* Next courses - Requirement 5.5 */}
        <NextCourses courses={progress.nextCourses} />
      </div>

      {/* Quick links */}
      <Card>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/semesters"
            className="flex items-center gap-2 rounded-lg border border-secondary-200 px-4 py-2 text-sm font-medium text-secondary-700 transition-colors hover:bg-secondary-50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Xem học kỳ
          </Link>
          <Link
            href="/learning-tree"
            className="flex items-center gap-2 rounded-lg border border-secondary-200 px-4 py-2 text-sm font-medium text-secondary-700 transition-colors hover:bg-secondary-50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Learning Tree
          </Link>
        </div>
      </Card>
    </div>
  );
}

/**
 * Welcome header component
 */
function WelcomeHeader({ userName }: { userName?: string }): JSX.Element {
  const greeting = getGreeting();
  const displayName = userName || 'Học viên';

  return (
    <div>
      <h1 className="text-2xl font-bold text-secondary-900">
        {greeting}, {displayName}!
      </h1>
      <p className="mt-1 text-secondary-500">
        Chào mừng bạn quay trở lại. Hãy tiếp tục hành trình học tập của mình.
      </p>
    </div>
  );
}

/**
 * Get greeting based on time of day
 */
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Chào buổi sáng';
  if (hour < 18) return 'Chào buổi chiều';
  return 'Chào buổi tối';
}

/**
 * Dashboard skeleton loading state
 */
function DashboardSkeleton(): JSX.Element {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div>
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-2 h-5 w-96" />
      </div>

      {/* Progress card skeleton */}
      <Card>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-8 w-16" />
          </div>
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-4 w-48" />
        </div>
      </Card>

      {/* Stats skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-lg" />
              <div>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="mt-2 h-8 w-12" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Current course and next courses skeleton */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="mt-2 h-5 w-48" />
              </div>
              <Skeleton className="h-12 w-12 rounded-full" />
            </div>
            <SkeletonText lines={2} />
            <Skeleton className="h-2 w-full" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-28" />
            </div>
          </div>
        </Card>
        <Card>
          <div className="space-y-4">
            <Skeleton className="h-6 w-40" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border border-secondary-200 p-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="mt-1 h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
