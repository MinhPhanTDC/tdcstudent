import React, { useEffect, useState } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const toastVariants = cva(
  'pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-lg p-4 shadow-lg transition-all',
  {
    variants: {
      variant: {
        default: 'bg-white text-secondary-900 border border-secondary-200',
        success: 'bg-green-50 text-green-800 border border-green-200',
        error: 'bg-red-50 text-red-800 border border-red-200',
        warning: 'bg-yellow-50 text-yellow-800 border border-yellow-200',
        info: 'bg-blue-50 text-blue-800 border border-blue-200',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface ToastProps extends VariantProps<typeof toastVariants> {
  /** Toast message */
  message: string;
  /** Duration in ms before auto-dismiss (0 = no auto-dismiss) */
  duration?: number;
  /** Callback when toast is dismissed */
  onDismiss?: () => void;
  /** Additional class names */
  className?: string;
}

/**
 * Toast notification component
 */
export function Toast({
  message,
  variant,
  duration = 5000,
  onDismiss,
  className,
}: ToastProps): React.ReactElement | null {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onDismiss?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onDismiss]);

  const handleDismiss = (): void => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className={cn(toastVariants({ variant, className }))} role="alert" aria-live="polite">
      <p className="flex-1 text-sm">{message}</p>
      <button
        onClick={handleDismiss}
        className="rounded p-1 hover:bg-black/5"
        aria-label="Dismiss notification"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}
