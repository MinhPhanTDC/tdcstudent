'use client';

import { cn } from '@tdc/ui';

export interface LabProgressBarProps {
  /** Number of completed requirements */
  completed: number;
  /** Total number of requirements */
  total: number;
  /** Additional class names */
  className?: string;
}

/**
 * Calculate progress percentage
 * Property 1: Progress percentage calculation
 * For any set of Lab requirements and student progress records,
 * the progress percentage SHALL equal (completed count / total active requirements) * 100,
 * rounded to the nearest integer.
 * 
 * Requirements: 1.3, 2.3
 * 
 * @param completed - Number of completed requirements
 * @param total - Total number of requirements
 * @returns Progress percentage (0-100)
 */
export function calculateProgressPercentage(completed: number, total: number): number {
  if (total <= 0) return 0;
  if (completed < 0) return 0;
  if (completed >= total) return 100;
  return Math.round((completed / total) * 100);
}

/**
 * LabProgressBar component - displays Lab Training progress
 * Requirements: 1.3, 2.3
 */
export function LabProgressBar({
  completed,
  total,
  className,
}: LabProgressBarProps): JSX.Element {
  const percentage = calculateProgressPercentage(completed, total);
  const isComplete = percentage === 100;

  return (
    <div className={cn('w-full', className)}>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-secondary-700">
            Tiến độ Lab Training
          </span>
          {isComplete && (
            <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
              Hoàn thành
            </span>
          )}
        </div>
        <span className="text-sm text-secondary-500">
          {completed}/{total} yêu cầu ({percentage}%)
        </span>
      </div>
      <div
        className="h-3 w-full rounded-full bg-secondary-100"
        role="progressbar"
        aria-valuenow={completed}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={`Tiến độ Lab Training: ${percentage}%`}
      >
        <div
          className={cn(
            'h-3 rounded-full transition-all duration-300',
            isComplete ? 'bg-green-500' : 'bg-primary-500'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
