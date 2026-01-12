'use client';

import Link from 'next/link';
import { Card, Badge } from '@tdc/ui';
import type { CourseWithProgress } from '@tdc/schemas';

export interface CourseCardProps {
  courseWithProgress: CourseWithProgress;
}

/**
 * CourseCard component - displays course info with progress for students
 * Requirements: 2.2, 2.3, 2.4, 2.5
 */
export function CourseCard({ courseWithProgress }: CourseCardProps): JSX.Element {
  const { course, progress, isLocked } = courseWithProgress;
  const isClickable = !isLocked;

  // Calculate progress percentage
  const progressPercentage = progress
    ? Math.min(
        Math.round((progress.completedSessions / course.requiredSessions) * 100),
        100
      )
    : 0;

  // Determine status
  const status = isLocked
    ? 'locked'
    : progress?.status === 'completed'
    ? 'completed'
    : progress?.status === 'in_progress'
    ? 'in_progress'
    : 'not_started';

  const statusConfig = {
    completed: {
      icon: (
        <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      label: 'Hoàn thành',
      badgeVariant: 'success' as const,
    },
    in_progress: {
      icon: (
        <svg className="h-5 w-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      label: 'Đang học',
      badgeVariant: 'primary' as const,
    },
    not_started: {
      icon: (
        <svg className="h-5 w-5 text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      label: 'Chưa bắt đầu',
      badgeVariant: 'default' as const,
    },
    locked: {
      icon: (
        <svg className="h-5 w-5 text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      label: 'Chưa mở khóa',
      badgeVariant: 'default' as const,
    },
  };

  const config = statusConfig[status];

  const cardContent = (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {/* Status icon */}
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary-100">
            {config.icon}
          </div>

          {/* Course info */}
          <div className="flex-1">
            <h3 className="font-medium text-secondary-900">{course.title}</h3>
            {course.description && (
              <p className="mt-0.5 text-sm text-secondary-500 line-clamp-1">
                {course.description}
              </p>
            )}
          </div>
        </div>

        {/* Arrow indicator for clickable cards */}
        {isClickable && (
          <svg className="h-5 w-5 text-secondary-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        )}
      </div>

      {/* Progress bar for non-locked courses */}
      {!isLocked && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-secondary-500">Tiến độ</span>
            <span className="font-medium text-secondary-700">{progressPercentage}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-secondary-100">
            <div
              className={`h-2 rounded-full transition-all ${
                status === 'completed' ? 'bg-green-500' : 'bg-primary-500'
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Stats and badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-secondary-500">
          <span className="flex items-center gap-1">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            {course.requiredSessions} buổi
          </span>
          <span className="flex items-center gap-1">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {course.requiredProjects} dự án
          </span>
        </div>
        <Badge variant={config.badgeVariant}>{config.label}</Badge>
      </div>

      {/* Locked message - Requirement 10.3 */}
      {isLocked && courseWithProgress.previousCourse && (
        <p className="text-xs text-secondary-500 italic">
          Hoàn thành môn &quot;{courseWithProgress.previousCourse.title}&quot; để mở khóa
        </p>
      )}
      {isLocked && !courseWithProgress.previousCourse && (
        <p className="text-xs text-secondary-500 italic">
          Hoàn thành môn trước để mở khóa
        </p>
      )}
    </div>
  );

  if (isClickable) {
    return (
      <Link href={`/courses/${course.id}`}>
        <Card className="cursor-pointer transition-shadow hover:shadow-md">
          {cardContent}
        </Card>
      </Link>
    );
  }

  return (
    <Card className="opacity-60">
      {cardContent}
    </Card>
  );
}
