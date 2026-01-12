'use client';

import { cn } from '@tdc/ui';
import type { Major } from '@tdc/schemas';

export interface MyMajorProgressProps {
  /** Major data */
  major: Major;
  /** Total number of courses in major */
  totalCourses: number;
  /** Number of completed courses */
  completedCourses: number;
  /** Number of in-progress courses */
  inProgressCourses: number;
  /** Progress percentage (0-100) */
  progressPercentage: number;
  /** Additional class names */
  className?: string;
}

/**
 * MyMajorProgress component - displays major info and progress
 * Requirements: 5.1, 5.3
 */
export function MyMajorProgress({
  major,
  totalCourses,
  completedCourses,
  inProgressCourses,
  progressPercentage,
  className,
}: MyMajorProgressProps): JSX.Element {
  // Determine progress bar color based on percentage
  const getProgressColor = () => {
    if (progressPercentage === 100) return 'bg-green-500';
    if (progressPercentage >= 50) return 'bg-primary-500';
    return 'bg-yellow-500';
  };

  return (
    <div className={cn('rounded-lg border border-secondary-200 bg-white p-6', className)}>
      {/* Major Header */}
      <div className="mb-4 flex items-start gap-4">
        {/* Color indicator */}
        {major.color && (
          <div
            className="h-12 w-12 flex-shrink-0 rounded-lg"
            style={{ backgroundColor: major.color }}
          />
        )}
        
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-secondary-900">{major.name}</h2>
          {major.description && (
            <p className="mt-1 text-sm text-secondary-600 line-clamp-2">
              {major.description}
            </p>
          )}
        </div>
      </div>

      {/* Progress Section */}
      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-secondary-700">Tiến độ chuyên ngành</span>
          <span className="text-sm font-semibold text-secondary-900">{progressPercentage}%</span>
        </div>
        
        {/* Progress Bar */}
        <div
          className="h-3 w-full rounded-full bg-secondary-100"
          role="progressbar"
          aria-valuenow={progressPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Tiến độ chuyên ngành: ${progressPercentage}%`}
        >
          <div
            className={cn('h-3 rounded-full transition-all duration-300', getProgressColor())}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-secondary-900">{totalCourses}</div>
          <div className="text-xs text-secondary-500">Tổng môn học</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{completedCourses}</div>
          <div className="text-xs text-secondary-500">Hoàn thành</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-primary-600">{inProgressCourses}</div>
          <div className="text-xs text-secondary-500">Đang học</div>
        </div>
      </div>
    </div>
  );
}
