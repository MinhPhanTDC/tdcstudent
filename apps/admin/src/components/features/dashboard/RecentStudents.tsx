'use client';

import Link from 'next/link';
import { Card, Avatar, EmptyState } from '@tdc/ui';
import { useRecentStudents } from '@/hooks/useDashboardStats';

/**
 * Format date to Vietnamese locale
 */
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

/**
 * Skeleton loader for recent students list
 */
function RecentStudentsSkeleton(): JSX.Element {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-3 p-2 animate-pulse">
          <div className="h-10 w-10 rounded-full bg-secondary-200" />
          <div className="flex-1">
            <div className="h-4 w-32 bg-secondary-200 rounded mb-2" />
            <div className="h-3 w-48 bg-secondary-200 rounded" />
          </div>
          <div className="h-3 w-20 bg-secondary-200 rounded" />
        </div>
      ))}
    </div>
  );
}

/**
 * Recent students component for dashboard
 * Displays 5 most recently created students with name, email, and enrollment date
 * Requirements: 5.3
 */
export function RecentStudents(): JSX.Element {
  const { data: recentStudents = [], isLoading, isError, error } = useRecentStudents(5);

  // Loading state
  if (isLoading) {
    return (
      <Card title="Học viên mới">
        <RecentStudentsSkeleton />
      </Card>
    );
  }

  // Error state
  if (isError) {
    return (
      <Card title="Học viên mới">
        <div className="text-center py-4">
          <p className="text-red-600 mb-2">Không thể tải danh sách học viên</p>
          <p className="text-sm text-secondary-500">{error?.message || 'Đã xảy ra lỗi'}</p>
        </div>
      </Card>
    );
  }

  // Empty state
  if (recentStudents.length === 0) {
    return (
      <Card title="Học viên mới">
        <EmptyState
          title="Chưa có học viên"
          description="Thêm học viên đầu tiên để bắt đầu"
        />
      </Card>
    );
  }

  return (
    <Card title="Học viên mới">
      <div className="space-y-4">
        {recentStudents.map((student) => (
          <Link
            key={student.id}
            href={`/students/${student.id}`}
            className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-secondary-50"
          >
            {/* Avatar with student name */}
            <Avatar name={student.displayName} size="sm" />
            
            {/* Student info: name and email */}
            <div className="flex-1 min-w-0">
              <p className="truncate font-medium text-secondary-900">
                {student.displayName}
              </p>
              <p className="truncate text-sm text-secondary-500">
                {student.email}
              </p>
            </div>
            
            {/* Enrollment date */}
            <div className="text-sm text-secondary-400">
              {formatDate(student.enrolledAt)}
            </div>
          </Link>
        ))}
      </div>
      
      {/* Link to view all students */}
      <Link
        href="/students"
        className="mt-4 block text-center text-sm text-primary-600 hover:text-primary-700"
      >
        Xem tất cả học viên →
      </Link>
    </Card>
  );
}
