'use client';

import Link from 'next/link';
import { cn } from '@tdc/ui';
import type { Course, StudentProgress } from '@tdc/schemas';
import { ProgressBar } from './ProgressBar';

export interface CourseProgressItemProps {
  /** Course data */
  course: Course;
  /** Student progress for this course */
  progress: StudentProgress | null;
  /** Course status */
  status: 'completed' | 'in_progress' | 'locked';
}

/**
 * CourseProgressItem component - displays course with status-based styling
 * Green/checkmark for completed, blue for in-progress, gray/lock for locked
 * Requirements: 4.6, 4.7, 4.8
 */
export function CourseProgressItem({
  course,
  progress,
  status,
}: CourseProgressItemProps): JSX.Element {
  // Calculate progress percentage
  const progressPercentage = progress && course.requiredSessions > 0
    ? Math.min(
        Math.round((progress.completedSessions / course.requiredSessions) * 100),
        100
      )
    : 0;

  const statusConfig = {
    completed: {
      containerClass: 'border-green-200 bg-green-50',
      iconBgClass: 'bg-green-100',
      iconClass: 'text-green-600',
      titleClass: 'text-green-900',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
    in_progress: {
      containerClass: 'border-primary-200 bg-primary-50',
      iconBgClass: 'bg-primary-100',
      iconClass: 'text-primary-600',
      titleClass: 'text-primary-900',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    locked: {
      containerClass: 'border-secondary-200 bg-secondary-50',
      iconBgClass: 'bg-secondary-100',
      iconClass: 'text-secondary-400',
      titleClass: 'text-secondary-500',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
    },
  };

  const config = statusConfig[status];

  const content = (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg border p-3 transition-colors',
        config.containerClass,
        status !== 'locked' && 'hover:shadow-sm cursor-pointer'
      )}
    >
      {/* Icon */}
      <div className={cn('flex h-10 w-10 items-center justify-center rounded-full flex-shrink-0', config.iconBgClass)}>
        <span className={config.iconClass}>{config.icon}</span>
      </div>

      {/* Course info */}
      <div className="flex-1 min-w-0">
        <h4 className={cn('font-medium truncate', config.titleClass)}>
          {course.title}
        </h4>
        <div className="flex items-center gap-3 text-xs text-secondary-500 mt-0.5">
          <span className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {progress?.completedSessions || 0}/{course.requiredSessions} buổi
          </span>
          <span className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {progress?.projectsSubmitted || 0}/{course.requiredProjects} dự án
          </span>
        </div>
        
        {/* Progress bar for in-progress courses */}
        {status === 'in_progress' && (
          <div className="mt-2">
            <ProgressBar value={progressPercentage} size="sm" variant="primary" />
          </div>
        )}
      </div>

      {/* Status indicator */}
      <div className="flex-shrink-0">
        {status === 'completed' && (
          <span className="text-xs font-medium text-green-600">100%</span>
        )}
        {status === 'in_progress' && (
          <span className="text-xs font-medium text-primary-600">{progressPercentage}%</span>
        )}
        {status === 'locked' && (
          <svg className="h-5 w-5 text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        )}
      </div>
    </div>
  );

  // Wrap in Link if not locked
  if (status !== 'locked') {
    return (
      <Link href={`/courses/${course.id}`}>
        {content}
      </Link>
    );
  }

  return content;
}
