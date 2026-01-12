'use client';

import Link from 'next/link';
import { Button } from '@tdc/ui';
import type { Course } from '@tdc/schemas';

export interface CourseNavigationProps {
  /** Previous course in the semester (undefined if first course) */
  previousCourse?: Course;
  /** Next course in the semester (undefined if last course) */
  nextCourse?: Course;
  /** Whether the next course is locked */
  isNextLocked?: boolean;
}

/**
 * CourseNavigation component - displays previous/next course navigation buttons
 * Handles edge cases for first and last courses in a semester
 * Requirements: 3.5
 */
export function CourseNavigation({
  previousCourse,
  nextCourse,
  isNextLocked = false,
}: CourseNavigationProps): JSX.Element {
  const hasPrevious = !!previousCourse;
  const hasNext = !!nextCourse;

  // Don't render if there's no navigation available
  if (!hasPrevious && !hasNext) {
    return <></>;
  }

  return (
    <div className="flex items-center justify-between border-t border-secondary-200 pt-4">
      {/* Previous course button */}
      <div className="flex-1">
        {hasPrevious ? (
          <Link href={`/courses/${previousCourse.id}`}>
            <Button variant="outline" className="flex items-center gap-2">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span className="hidden sm:inline">Môn trước</span>
              <span className="hidden md:inline text-secondary-500">
                : {previousCourse.title}
              </span>
            </Button>
          </Link>
        ) : (
          <div /> // Placeholder to maintain layout
        )}
      </div>

      {/* Next course button */}
      <div className="flex-1 flex justify-end">
        {hasNext ? (
          isNextLocked ? (
            <Button
              variant="outline"
              disabled
              className="flex items-center gap-2 opacity-50"
              title="Hoàn thành môn hiện tại để mở khóa"
            >
              <span className="hidden sm:inline">Môn tiếp theo</span>
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </Button>
          ) : (
            <Link href={`/courses/${nextCourse.id}`}>
              <Button variant="outline" className="flex items-center gap-2">
                <span className="hidden md:inline text-secondary-500">
                  {nextCourse.title} :
                </span>
                <span className="hidden sm:inline">Môn tiếp theo</span>
                <svg
                  className="h-4 w-4"
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
              </Button>
            </Link>
          )
        ) : (
          <div /> // Placeholder to maintain layout
        )}
      </div>
    </div>
  );
}
