import React, { type ReactNode } from 'react';
import { Button } from '../Button';

export interface ErrorPageProps {
  title?: string;
  message?: string;
  showRetry?: boolean;
  onRetry?: () => void;
  showHome?: boolean;
  homeHref?: string;
  icon?: ReactNode;
}

/**
 * Full-page error display component with retry and home navigation options
 */
export function ErrorPage({
  title = 'Đã xảy ra lỗi',
  message = 'Rất tiếc, đã có lỗi xảy ra. Vui lòng thử lại sau.',
  showRetry = true,
  onRetry,
  showHome = true,
  homeHref = '/',
  icon,
}: ErrorPageProps): React.ReactElement {
  const defaultIcon = (
    <svg
      className="h-16 w-16 text-red-500"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  );

  const handleHomeClick = (): void => {
    window.location.href = homeHref;
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">{icon || defaultIcon}</div>
        <h1 className="mb-3 text-2xl font-bold text-gray-900">{title}</h1>
        <p className="mb-8 text-gray-600">{message}</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          {showRetry && onRetry && (
            <Button onClick={onRetry} variant="primary">
              Thử lại
            </Button>
          )}
          {showHome && (
            <Button onClick={handleHomeClick} variant="outline">
              Về trang chủ
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
