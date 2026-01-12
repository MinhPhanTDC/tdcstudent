import { type ReactNode } from 'react';
import { cn } from '../../utils/cn';

export interface FormSuccessProps {
  /** Success message to display */
  message?: string | null;
  /** Additional CSS classes */
  className?: string;
  /** Children to render instead of message */
  children?: ReactNode;
}

/**
 * FormSuccess component - displays form-level success messages
 */
export function FormSuccess({ message, className, children }: FormSuccessProps): JSX.Element | null {
  if (!message && !children) {
    return null;
  }

  return (
    <div
      className={cn(
        'rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700',
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <svg
          className="h-5 w-5 flex-shrink-0 text-green-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div>{children || message}</div>
      </div>
    </div>
  );
}
