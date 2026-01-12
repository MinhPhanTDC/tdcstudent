'use client';

import { Card } from '@tdc/ui';
import { ProgressBar } from './ProgressBar';

export interface ProgressOverviewProps {
  /** Overall completion percentage */
  completionPercentage: number;
  /** Total number of courses */
  totalCourses: number;
  /** Number of completed courses */
  completedCourses: number;
  /** Number of in-progress courses */
  inProgressCourses: number;
}

/**
 * ProgressOverview component - displays overall completion percentage with progress bar
 * and statistics: total, completed, in-progress courses
 * Requirements: 4.2, 4.3
 */
export function ProgressOverview({
  completionPercentage,
  totalCourses,
  completedCourses,
  inProgressCourses,
}: ProgressOverviewProps): JSX.Element {
  return (
    <Card>
      <div className="space-y-6">
        {/* Header with percentage */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-secondary-900">
              Tiến độ tổng quan
            </h2>
            <p className="text-sm text-secondary-500">
              Theo dõi tiến độ học tập của bạn
            </p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-bold text-primary-600">
              {completionPercentage}%
            </span>
            <p className="text-sm text-secondary-500">hoàn thành</p>
          </div>
        </div>

        {/* Progress bar */}
        <ProgressBar
          value={completionPercentage}
          size="lg"
          variant={completionPercentage === 100 ? 'success' : 'primary'}
        />

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4 pt-2">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <div className="h-3 w-3 rounded-full bg-secondary-300" />
              <span className="text-2xl font-bold text-secondary-900">
                {totalCourses}
              </span>
            </div>
            <p className="text-sm text-secondary-500">Tổng môn học</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <span className="text-2xl font-bold text-green-600">
                {completedCourses}
              </span>
            </div>
            <p className="text-sm text-secondary-500">Đã hoàn thành</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <div className="h-3 w-3 rounded-full bg-primary-500" />
              <span className="text-2xl font-bold text-primary-600">
                {inProgressCourses}
              </span>
            </div>
            <p className="text-sm text-secondary-500">Đang học</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
