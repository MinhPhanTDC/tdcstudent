'use client';

import { useState, useCallback } from 'react';
import { resetPassword } from '@tdc/firebase';
import { type Result, type AppError } from '@tdc/types';

interface UseForgotPasswordReturn {
  sendResetEmail: (email: string) => Promise<Result<void>>;
  isLoading: boolean;
  error: AppError | null;
  isSuccess: boolean;
  clearError: () => void;
}

/**
 * Hook for handling forgot password logic
 */
export function useForgotPassword(): UseForgotPasswordReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const sendResetEmail = useCallback(async (email: string): Promise<Result<void>> => {
    setIsLoading(true);
    setError(null);
    setIsSuccess(false);

    const result = await resetPassword(email);

    if (result.success) {
      setIsSuccess(true);
    } else {
      setError(result.error);
    }

    setIsLoading(false);
    return result;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { sendResetEmail, isLoading, error, isSuccess, clearError };
}
