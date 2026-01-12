'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { NetworkErrorType } from '../components/NetworkError';

export interface NetworkErrorState {
  /** Whether there's an active error */
  hasError: boolean;
  /** The type of network error */
  errorType: NetworkErrorType | null;
  /** Custom error message */
  errorMessage: string | null;
  /** Number of retry attempts */
  retryCount: number;
  /** Whether a retry is in progress */
  isRetrying: boolean;
  /** Whether the user is offline */
  isOffline: boolean;
}

export interface UseNetworkErrorOptions {
  /** Maximum number of automatic retries */
  maxAutoRetries?: number;
  /** Delay between retries in ms */
  retryDelay?: number;
  /** Whether to auto-retry on transient errors */
  autoRetry?: boolean;
  /** Callback when error occurs */
  onError?: (error: unknown) => void;
  /** Callback when retry succeeds */
  onRetrySuccess?: () => void;
}

export interface UseNetworkErrorReturn extends NetworkErrorState {
  /** Set an error */
  setError: (error: unknown) => void;
  /** Clear the error */
  clearError: () => void;
  /** Manually trigger a retry */
  retry: () => Promise<void>;
  /** Execute a function with error handling */
  withErrorHandling: <T>(fn: () => Promise<T>) => Promise<T | null>;
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

    // Timeout errors
    if (message.includes('timeout') || name.includes('timeout')) {
      return 'timeout';
    }

    // Server errors (5xx)
    if (message.includes('500') || message.includes('502') || 
        message.includes('503') || message.includes('504') ||
        message.includes('internal server')) {
      return 'server';
    }

    // Connection errors
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
 * Hook for handling network errors with retry functionality
 */
export function useNetworkError(
  options: UseNetworkErrorOptions = {}
): UseNetworkErrorReturn {
  const {
    maxAutoRetries = 3,
    retryDelay = 1000,
    autoRetry = false,
    onError,
    onRetrySuccess,
  } = options;

  const [state, setState] = useState<NetworkErrorState>({
    hasError: false,
    errorType: null,
    errorMessage: null,
    retryCount: 0,
    isRetrying: false,
    isOffline: typeof navigator !== 'undefined' ? !navigator.onLine : false,
  });

  const lastErrorRef = useRef<unknown>(null);
  const retryFnRef = useRef<(() => Promise<unknown>) | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setState((prev) => ({ ...prev, isOffline: false }));
      // Auto-retry when coming back online
      if (state.hasError && state.errorType === 'offline' && retryFnRef.current) {
        retry();
      }
    };

    const handleOffline = () => {
      setState((prev) => ({ ...prev, isOffline: true }));
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, [state.hasError, state.errorType]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const setError = useCallback((error: unknown) => {
    const errorType = detectErrorType(error);
    const errorMessage = getErrorMessage(errorType, error);
    
    lastErrorRef.current = error;
    
    setState((prev) => ({
      ...prev,
      hasError: true,
      errorType,
      errorMessage,
    }));

    onError?.(error);
  }, [onError]);

  const clearError = useCallback(() => {
    lastErrorRef.current = null;
    retryFnRef.current = null;
    
    setState({
      hasError: false,
      errorType: null,
      errorMessage: null,
      retryCount: 0,
      isRetrying: false,
      isOffline: typeof navigator !== 'undefined' ? !navigator.onLine : false,
    });
  }, []);

  const retry = useCallback(async () => {
    if (!retryFnRef.current || state.isRetrying) {
      return;
    }

    // Don't retry if offline
    if (state.isOffline) {
      return;
    }

    setState((prev) => ({ ...prev, isRetrying: true }));

    try {
      await retryFnRef.current();
      clearError();
      onRetrySuccess?.();
    } catch (error) {
      const newRetryCount = state.retryCount + 1;
      const errorType = detectErrorType(error);
      const errorMessage = getErrorMessage(errorType, error);
      
      lastErrorRef.current = error;
      
      setState((prev) => ({
        ...prev,
        hasError: true,
        errorType,
        errorMessage,
        retryCount: newRetryCount,
        isRetrying: false,
      }));

      onError?.(error);
    }
  }, [state.isRetrying, state.isOffline, state.retryCount, clearError, onError, onRetrySuccess]);

  const withErrorHandling = useCallback(async <T>(
    fn: () => Promise<T>
  ): Promise<T | null> => {
    // Store the function for potential retries
    retryFnRef.current = fn;
    
    // Create abort controller for this operation
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    let attempts = 0;
    const maxAttempts = autoRetry ? maxAutoRetries + 1 : 1;

    while (attempts < maxAttempts) {
      try {
        const result = await fn();
        clearError();
        return result;
      } catch (error) {
        attempts++;
        const errorType = detectErrorType(error);
        
        // Don't auto-retry for offline or if we've exhausted attempts
        const shouldAutoRetry = autoRetry && 
          attempts < maxAttempts && 
          errorType !== 'offline' &&
          (errorType === 'timeout' || errorType === 'connection' || errorType === 'server');

        if (shouldAutoRetry) {
          // Wait before retrying with exponential backoff
          const delay = retryDelay * Math.pow(2, attempts - 1);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        // Set the error state
        setError(error);
        return null;
      }
    }

    return null;
  }, [autoRetry, maxAutoRetries, retryDelay, clearError, setError]);

  return {
    ...state,
    setError,
    clearError,
    retry,
    withErrorHandling,
  };
}
