'use client';

import Link from 'next/link';
import { cn } from '@tdc/ui';
import type { MajorCourseWithStatus, MajorCourseStatus } from '@/hooks/useMyMajor';

export interface MajorCourseListProps {
  /** List of major courses with status */
  courses: MajorCourseWithStatus[];
  /** Additional class names */
  className?: string;
}

/**
 * Status badge configuration
 */
const statusConfig: Record<MajorCourseStatus, { label: string; className: string; icon: JSX.Element }> = {
  completed: {
    label: 'Hoàn thành',
    className: 'bg-green-100 text-green-700',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  in_progress: {
    label: 'Đang học',
    className: 'bg-primary-100 text-primary-700',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  locked: {
    label: 'Chưa mở',
    className: 'bg-secondary-100 text-secondary-500',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
        />
      </svg>
    ),
  },
};

/**
 * MajorCourseList component - displays courses with status
 * Requirements: 5.2
 */
export function MajorCourseList({ courses, className }: MajorCourseListProps): JSX.Element {
  if (courses.length === 0) {
    return (
      <div className={cn('rounded-lg border border-secondary-200 bg-white p-8 text-center', className)}>
        <svg
          className="mx-auto h-12 w-12 text-secondary-400"
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
        <p className="mt-4 text-secondary-600">Chưa có môn học nào trong chuyên ngành này</p>
      </div>
    );
  }

  return (
    <div className={cn('rounded-lg border border-secondary-200 bg-white', className)}>
      <div className="border-b border-secondary-200 px-6 py-4">
        <h3 className="text-lg font-semibold text-secondary-900">Danh sách môn học</h3>
        <p className="mt-1 text-sm text-secondary-500">
          {courses.length} môn học trong chuyên ngành
        </p>
      </div>

      <ul className="divide-y divide-secondary-100">
        {courses.map((item, index) => {
          const { majorCourse, course, status } = item;
          const config = statusConfig[status];
          const isClickable = status !== 'locked' && course;

          const content = (
            <div
              className={cn(
                'flex items-center gap-4 px-6 py-4 transition-colors',
                isClickable && 'hover:bg-secondary-50',
                status === 'locked' && 'opacity-60'
              )}
            >
              {/* Order number */}
              <div
                className={cn(
                  'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-medium',
                  status === 'completed' && 'bg-green-100 text-green-700',
                  status === 'in_progress' && 'bg-primary-100 text-primary-700',
                  status === 'locked' && 'bg-secondary-100 text-secondary-500'
                )}
              >
                {index + 1}
              </div>

              {/* Course info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4
                    className={cn(
                      'font-medium truncate',
                      status === 'locked' ? 'text-secondary-500' : 'text-secondary-900'
                    )}
                  >
                    {course?.title || 'Môn học không tìm thấy'}
                  </h4>
                  {majorCourse.isRequired && (
                    <span className="flex-shrink-0 rounded bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-700">
                      Bắt buộc
                    </span>
                  )}
                </div>
                {course?.description && (
                  <p className="mt-0.5 text-sm text-secondary-500 truncate">
                    {course.description}
                  </p>
                )}
              </div>

              {/* Status badge */}
              <div
                className={cn(
                  'flex flex-shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium',
                  config.className
                )}
              >
                {config.icon}
                <span>{config.label}</span>
              </div>

              {/* Arrow for clickable items */}
              {isClickable && (
                <svg
                  className="h-5 w-5 flex-shrink-0 text-secondary-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              )}
            </div>
          );

          // Wrap in Link if clickable
          if (isClickable && course) {
            return (
              <li key={majorCourse.id}>
                <Link href={`/courses/${course.id}`}>{content}</Link>
              </li>
            );
          }

          return <li key={majorCourse.id}>{content}</li>;
        })}
      </ul>
    </div>
  );
}
