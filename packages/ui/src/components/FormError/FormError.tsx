import { type ReactNode } from 'react';
import { cn } from '../../utils/cn';

export interface FormErrorProps {
  /** Error message to display */
  message?: string | null;
  /** Additional CSS classes */
  className?: string;
  /** Children to render instead of message */
  children?: ReactNode;
  /** Variant: 'default' for form-level errors, 'inline' for field-level errors */
  variant?: 'default' | 'inline';
  /** Field name for accessibility (used with inline variant) */
  fieldName?: string;
}

/**
 * FormError component - displays form validation error messages
 * 
 * Variants:
 * - 'default': Form-level errors with icon and background (API errors, general validation)
 * - 'inline': Compact field-level errors without background (input validation)
 * 
 * Requirements: 1.5, 3.3
 */
export function FormError({ 
  message, 
  className, 
  children,
  variant = 'default',
  fieldName,
}: FormErrorProps): JSX.Element | null {
  if (!message && !children) {
    return null;
  }

  const content = children || message;

  // Inline variant - compact field-level error
  if (variant === 'inline') {
    return (
      <p
        className={cn('mt-1.5 text-sm text-red-600', className)}
        role="alert"
        aria-live="polite"
        id={fieldName ? `${fieldName}-error` : undefined}
      >
        {content}
      </p>
    );
  }

  // Default variant - form-level error with icon and background
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
        <div>{content}</div>
      </div>
    </div>
  );
}
