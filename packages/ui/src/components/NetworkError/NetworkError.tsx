import React from 'react';
import { Button } from '../Button';

export type NetworkErrorType = 'timeout' | 'connection' | 'offline' | 'server' | 'unknown';

export interface NetworkErrorProps {
  /** Type of network error */
  type?: NetworkErrorType;
  /** Custom error message */
  message?: string;
  /** Whether to show retry button */
  showRetry?: boolean;
  /** Callback when retry button is clicked */
  onRetry?: () => void;
  /** Whether retry is in progress */
  isRetrying?: boolean;
  /** Number of retry attempts made */
  retryCount?: number;
  /** Custom className */
  className?: string;
}

/**
 * Get icon for network error type
 */
function getErrorIcon(type: NetworkErrorType): React.ReactNode {
  switch (type) {
    case 'offline':
      return (
        <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a5 5 0 01-7.072-7.072m7.072 7.072L3 21m4.243-4.243L3 21" />
        </svg>
      );
    case 'timeout':
      return (
        <svg className="h-12 w-12 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'server':
      return (
        <svg className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
        </svg>
      );
    case 'connection':
    default:
      return (
        <svg className="h-12 w-12 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      );
  }
}

/**
 * Get default message for network error type
 */
function getDefaultMessage(type: NetworkErrorType): string {
  switch (type) {
    case 'offline':
      return 'Bạn đang offline. Vui lòng kiểm tra kết nối internet.';
    case 'timeout':
      return 'Yêu cầu đã hết thời gian chờ. Vui lòng thử lại.';
    case 'connection':
      return 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.';
    case 'server':
      return 'Máy chủ đang gặp sự cố. Vui lòng thử lại sau.';
    default:
      return 'Đã xảy ra lỗi mạng. Vui lòng thử lại.';
  }
}

/**
 * Get title for network error type
 */
function getErrorTitle(type: NetworkErrorType): string {
  switch (type) {
    case 'offline':
      return 'Không có kết nối mạng';
    case 'timeout':
      return 'Hết thời gian chờ';
    case 'connection':
      return 'Lỗi kết nối';
    case 'server':
      return 'Lỗi máy chủ';
    default:
      return 'Lỗi mạng';
  }
}

/**
 * NetworkError component displays network-related errors with retry functionality
 */
export function NetworkError({
  type = 'unknown',
  message,
  showRetry = true,
  onRetry,
  isRetrying = false,
  retryCount,
  className = '',
}: NetworkErrorProps): React.ReactElement {
  const displayMessage = message || getDefaultMessage(type);
  const title = getErrorTitle(type);
  const icon = getErrorIcon(type);

  return (
    <div className={`flex flex-col items-center justify-center p-6 text-center ${className}`}>
      <div className="mb-4">{icon}</div>
      <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mb-4 max-w-sm text-sm text-gray-600">{displayMessage}</p>
      
      {retryCount !== undefined && retryCount > 0 && (
        <p className="mb-3 text-xs text-gray-500">
          Đã thử lại {retryCount} lần
        </p>
      )}
      
      {showRetry && onRetry && (
        <Button
          onClick={onRetry}
          disabled={isRetrying || type === 'offline'}
          variant="primary"
          size="sm"
        >
          {isRetrying ? (
            <>
              <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Đang thử lại...
            </>
          ) : (
            <>
              <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Thử lại
            </>
          )}
        </Button>
      )}
      
      {type === 'offline' && (
        <p className="mt-3 text-xs text-gray-500">
          Tự động kết nối lại khi có mạng
        </p>
      )}
    </div>
  );
}
