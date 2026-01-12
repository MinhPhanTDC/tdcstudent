'use client';

import { FlipbookLazy, Skeleton } from '@tdc/ui';
import { useStudentHandbook } from '@/hooks/useStudentHandbook';

/**
 * StudentHandbook component
 * Displays the handbook in flipbook format for students
 * Requirements: 6.1, 6.2, 6.3, 6.4
 */
export function StudentHandbook(): JSX.Element {
  const { data: handbook, isLoading, error } = useStudentHandbook();

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Skeleton width={400} height={566} rounded="md" />
        <p className="mt-4 text-sm text-secondary-500">Đang tải handbook...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="rounded-lg bg-red-50 p-6 text-center">
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
          <h3 className="mt-4 text-lg font-medium text-red-800">
            Không thể tải handbook
          </h3>
          <p className="mt-2 text-sm text-red-600">
            Đã xảy ra lỗi khi tải handbook. Vui lòng thử lại sau.
          </p>
        </div>
      </div>
    );
  }

  // Empty state - no handbook available
  if (!handbook || !handbook.pdfUrl) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="rounded-lg bg-secondary-50 p-8 text-center">
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
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-secondary-900">
            Handbook chưa có sẵn
          </h3>
          <p className="mt-2 text-sm text-secondary-600">
            Handbook hiện chưa được tải lên. Vui lòng liên hệ admin để biết thêm thông tin.
          </p>
        </div>
      </div>
    );
  }

  // Display flipbook with handbook
  return (
    <div className="flex flex-col items-center">
      <FlipbookLazy
        pdfUrl={handbook.pdfUrl}
        width={450}
        height={636}
        showPageNumbers={true}
        className="mb-4"
      />
      
      {/* Handbook info */}
      <p className="mt-4 text-xs text-secondary-400">
        Cập nhật lần cuối: {new Date(handbook.uploadedAt).toLocaleDateString('vi-VN')}
      </p>
    </div>
  );
}
