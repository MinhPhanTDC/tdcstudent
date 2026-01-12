'use client';

import { useCallback, useState } from 'react';
import type { NetworkErrorType } from '../components/NetworkError';

export interface QueryErrorState {
  /** Whether there's an error */
  hasError: boolean;
  /** The type of network error */
  errorType: NetworkErrorType | null;
  /** Error message */
  errorMessage: string | null;
  /** Number of retry attempts */
  retryCount: number;
  /** Whether retry is in progress */
  isRetrying: boolean;
}

export interface UseQueryErrorHandlerOptions {
  /** Callback when error occurs */
  onError?: (error: unknown) => void;
}

export interface UseQueryErrorHandlerReturn {
  /** Current error state */
  errorState: QueryErrorState;
  /** Handle an error from a query */
  handleError: (error: unknown) => void;
  /** Clear the error state */
  clearError: () => void;
  /** Increment retry count and return new count */
  incrementRetry: () => number;
  /** Reset retry count */
  resetRetryCount: () => void;
  /** Set retrying state */
  setIsRetrying: (isRetrying: boolean) => void;
}

/**
 * Detect network error type from an error object
 */
function detectErrorType(error: unknown): NetworkErrorType {
  // Check if offline
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return 'offline';
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    const name = error.name.toLowerCase();

    if (message.includes('timeout') || name.includes('timeout')) {
      return 'timeout';
    }

    if (message.includes('500') || message.includes('502') || 
        message.includes('503') || message.includes('504') ||
        message.includes('internal server')) {
      return 'server';
    }

    if (message.includes('network') || message.includes('connection') ||
        message.includes('fetch') || message.includes('failed to fetch') ||
        name.includes('network')) {
      return 'connection';
    }
  }

  // Check for Firebase-specific errors
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as { code: string }).code;
    if (code === 'unavailable' || code === 'auth/network-request-failed') {
      return 'connection';
    }
    if (code === 'deadline-exceeded') {
      return 'timeout';
    }
    if (code === 'internal' || code === 'resource-exhausted') {
      return 'server';
    }
  }

  return 'unknown';
}

/**
 * Get user-friendly error message
 */
function getErrorMessage(type: NetworkErrorType, error?: unknown): string {
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
      if (error instanceof Error && error.message) {
        return error.message;
      }
      return 'Đã xảy ra lỗi mạng. Vui lòng thử lại.';
  }
}

/**
 * Hook for handling query errors with retry state management
 * Use this alongside TanStack Query for enhanced error handling
 */
export function useQueryErrorHandler(
  options: UseQueryErrorHandlerOptions = {}
): UseQueryErrorHandlerReturn {
  const { onError } = options;

  const [errorState, setErrorState] = useState<QueryErrorState>({
    hasError: false,
    errorType: null,
    errorMessage: null,
    retryCount: 0,
    isRetrying: false,
  });

  const handleError = useCallback((error: unknown) => {
    const errorType = detectErrorType(error);
    const errorMessage = getErrorMessage(errorType, error);

    setErrorState((prev) => ({
      ...prev,
      hasError: true,
      errorType,
      errorMessage,
    }));

    onError?.(error);
  }, [onError]);

  const clearError = useCallback(() => {
    setErrorState({
      hasError: false,
      errorType: null,
      errorMessage: null,
      retryCount: 0,
      isRetrying: false,
    });
  }, []);

  const incrementRetry = useCallback(() => {
    let newCount = 0;
    setErrorState((prev) => {
      newCount = prev.retryCount + 1;
      return { ...prev, retryCount: newCount };
    });
    return newCount;
  }, []);

  const resetRetryCount = useCallback(() => {
    setErrorState((prev) => ({ ...prev, retryCount: 0 }));
  }, []);

  const setIsRetrying = useCallback((isRetrying: boolean) => {
    setErrorState((prev) => ({ ...prev, isRetrying }));
  }, []);

  return {
    errorState,
    handleError,
    clearError,
    incrementRetry,
    resetRetryCount,
    setIsRetrying,
  };
}
