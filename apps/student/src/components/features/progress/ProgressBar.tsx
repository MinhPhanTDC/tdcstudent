'use client';

import { cn } from '@tdc/ui';

export interface ProgressBarProps {
  /** Current progress value */
  value: number;
  /** Maximum value (default: 100) */
  max?: number;
  /** Whether to show percentage label */
  showLabel?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Color variant */
  variant?: 'primary' | 'success' | 'warning' | 'danger';
  /** Additional class names */
  className?: string;
}

const sizeClasses = {
  sm: 'h-1.5',
  md: 'h-2',
  lg: 'h-3',
};

const variantClasses = {
  primary: 'bg-primary-500',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  danger: 'bg-red-500',
};

/**
 * ProgressBar component - displays progress as visual bar
 * Requirements: 2.4
 */
export function ProgressBar({
  value,
  max = 100,
  showLabel = false,
  size = 'md',
  variant = 'primary',
  className,
}: ProgressBarProps): JSX.Element {
  // Calculate percentage, capped at 100%
  const percentage = Math.min(Math.round((value / max) * 100), 100);

  // Use success variant when completed
  const effectiveVariant = percentage === 100 ? 'success' : variant;

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="text-secondary-500">Tiến độ</span>
          <span className="font-medium text-secondary-700">{percentage}%</span>
        </div>
      )}
      <div
        className={cn(
          'w-full rounded-full bg-secondary-100',
          sizeClasses[size]
        )}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={`Tiến độ: ${percentage}%`}
      >
        <div
          className={cn(
            'rounded-full transition-all duration-300',
            sizeClasses[size],
            variantClasses[effectiveVariant]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
