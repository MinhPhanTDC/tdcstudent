'use client';

import React from 'react';
import { cn } from '../../utils/cn';
import { Spinner } from '../Spinner';

export interface LoadingSpinnerProps {
  /** Size of the spinner */
  size?: 'sm' | 'md' | 'lg';
  /** Whether to display as full page overlay */
  fullPage?: boolean;
  /** Loading text to display below spinner */
  text?: string;
  /** Additional class names */
  className?: string;
}

/**
 * LoadingSpinner component for displaying loading states
 * Requirements: 1.1 - Display consistent loading indicators
 */
export function LoadingSpinner({
  size = 'md',
  fullPage = false,
  text,
  className,
}: LoadingSpinnerProps): React.ReactElement {
  const content = (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <Spinner size={size} className="text-primary-600" />
      {text && (
        <p className="text-sm text-secondary-500">{text}</p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return (
    <div className="flex min-h-[200px] items-center justify-center">
      {content}
    </div>
  );
}
