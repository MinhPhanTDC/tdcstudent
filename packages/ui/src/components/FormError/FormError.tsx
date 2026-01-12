import { type ReactNode } from 'react';
import { cn } from '../../utils/cn';

export interface FormErrorProps {
  /** Error message to display */
  message?: string | null;
  /** Additional CSS classes */
  className?: string;
  /** Children to render instead of message */
  children?: ReactNode;
}

/**
 * FormError component - displays form-level error messages
 * Used for API errors or general form validation errors
 */
export function FormError({ message, className, children }: FormErrorProps): JSX.Element | null {
  if (!message && !children) {
    return null;
  }

  return (
    <div
      className={cn(
        'rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700',
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <svg
          className="h-5 w-5 flex-shrink-0 text-red-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div>{children || message}</div>
      </div>
    </div>
  );
}
