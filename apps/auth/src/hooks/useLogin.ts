'use client';

import { useState, useCallback } from 'react';
import { signIn } from '@tdc/firebase';
import { type LoginCredentials, type User } from '@tdc/schemas';
import { type Result, type AppError } from '@tdc/types';

interface UseLoginReturn {
  login: (credentials: LoginCredentials) => Promise<Result<User>>;
  isLoading: boolean;
  error: AppError | null;
  clearError: () => void;
}

/**
 * Hook for handling login logic
 */
export function useLogin(): UseLoginReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  const login = useCallback(async (credentials: LoginCredentials): Promise<Result<User>> => {
    setIsLoading(true);
    setError(null);

    const result = await signIn(credentials);

    if (!result.success) {
      setError(result.error);
    }

    setIsLoading(false);
    return result;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { login, isLoading, error, clearError };
}
