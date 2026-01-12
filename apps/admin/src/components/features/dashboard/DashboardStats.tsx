'use client';

import { Card } from '@tdc/ui';
import { useDashboardStats } from '@/hooks/useDashboardStats';

/**
 * Stat card skeleton for loading state
 */
function StatCardSkeleton(): JSX.Element {
  return (
    <Card>
      <div className="flex items-center gap-4 animate-pulse">
        <div className="rounded-lg bg-secondary-200 p-3 h-12 w-12" />
        <div className="flex-1">
          <div className="h-4 w-24 bg-secondary-200 rounded mb-2" />
          <div className="h-8 w-16 bg-secondary-200 rounded" />
        </div>
      </div>
    </Card>
  );
}

/**
 * Individual stat card component
 */
interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  iconBgColor: string;
}

function StatCard({ title, value, icon, iconBgColor }: StatCardProps): JSX.Element {
  return (
    <Card>
      <div className="flex items-center gap-4">
        <div className={`rounded-lg p-3 ${iconBgColor}`}>{icon}</div>
        <div>
          <p className="text-sm text-secondary-500">{title}</p>
          <p className="text-2xl font-bold text-secondary-900">{value.toLocaleString()}</p>
        </div>
      </div>
    </Card>
  );
}

/**
 * Dashboard statistics component
 * Displays total counts for semesters, courses, students, and new students this month
 * Requirements: 5.1, 5.2, 5.5
 */
export function DashboardStats(): JSX.Element {
  const { data: stats, isLoading, isError, error } = useDashboardStats();

  // Loading state with skeleton loaders - Requirements: 5.5
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
    );
  }

  // Error state - Requirements: 5.6
  if (isError) {
    return (
      <Card>
        <div className="text-center py-4">
          <p className="text-red-600 mb-2">Không thể tải dữ liệu thống kê</p>
          <p className="text-sm text-secondary-500">{error?.message || 'Đã xảy ra lỗi'}</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Semesters - Requirements: 5.1 */}
      <StatCard
        title="Tổng học kỳ"
        value={stats?.totalSemesters ?? 0}
        iconBgColor="bg-purple-100"
        icon={
          <svg
            className="h-6 w-6 text-purple-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        }
      />

      {/* Total Courses - Requirements: 5.1 */}
      <StatCard
        title="Tổng môn học"
        value={stats?.totalCourses ?? 0}
        iconBgColor="bg-blue-100"
        icon={
          <svg
            className="h-6 w-6 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        }
      />

      {/* Total Students - Requirements: 5.1 */}
      <StatCard
        title="Tổng học viên"
        value={stats?.totalStudents ?? 0}
        iconBgColor="bg-primary-100"
        icon={
          <svg
            className="h-6 w-6 text-primary-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        }
      />

      {/* New Students This Month - Requirements: 5.2 */}
      <StatCard
        title="Học viên mới tháng này"
        value={stats?.newStudentsThisMonth ?? 0}
        iconBgColor="bg-green-100"
        icon={
          <svg
            className="h-6 w-6 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
            />
          </svg>
        }
      />
    </div>
  );
}
