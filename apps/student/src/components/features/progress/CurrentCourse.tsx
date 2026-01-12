'use client';

import Link from 'next/link';
import { Card, Button, Badge } from '@tdc/ui';
import type { CourseWithProgress } from '@tdc/schemas';
import { ProgressBar } from './ProgressBar';

export interface CurrentCourseProps {
  /** Current course with progress */
  currentCourse: CourseWithProgress;
}

/**
 * CurrentCourse component - displays current course with continue button
 * Requirements: 5.4
 */
export function CurrentCourse({ currentCourse }: CurrentCourseProps): JSX.Element {
  const { course, progress } = currentCourse;

  // Calculate progress percentage
  const progressPercentage = progress
    ? Math.min(
        Math.round((progress.completedSessions / course.requiredSessions) * 100),
        100
      )
    : 0;

  return (
    <Card>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-secondary-900">
                Môn học hiện tại
              </h3>
              <Badge variant="primary">Đang học</Badge>
            </div>
            <p className="mt-1 text-secondary-500">{course.title}</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
            <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        </div>

        {course.description && (
          <p className="text-sm text-secondary-600 line-clamp-2">
            {course.description}
          </p>
        )}

        <ProgressBar value={progressPercentage} showLabel size="md" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-secondary-500">
            <span className="flex items-center gap-1">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              {progress?.completedSessions || 0}/{course.requiredSessions} buổi
            </span>
            <span className="flex items-center gap-1">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {progress?.projectsSubmitted || 0}/{course.requiredProjects} dự án
            </span>
          </div>
          <Link href={`/courses/${course.id}`}>
            <Button>
              Tiếp tục học
              <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
