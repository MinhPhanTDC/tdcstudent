'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginCredentialsSchema, type LoginCredentials } from '@tdc/schemas';
import { Button, Input } from '@tdc/ui';
import { useLogin } from '@/hooks/useLogin';
import { redirectByRole } from '@/lib/redirect';
import { getErrorMessage } from '@/lib/errorMessages';
import { 
  parseAuthErrorFromUrl, 
  getErrorCodeFromAuthError, 
  clearAuthParamsFromUrl,
  type AuthErrorType 
} from '@/lib/authRedirect';

/**
 * Login form component - redesigned to match new UI
 * Handles auth errors from URL parameters (Requirements: 3.4)
 */
export function LoginForm(): JSX.Element {
  const { login, isLoading, error } = useLogin();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [urlError, setUrlError] = useState<AuthErrorType | null>(null);

  // Check for auth error in URL on mount
  useEffect(() => {
    const authError = parseAuthErrorFromUrl();
    if (authError) {
      setUrlError(authError);
      // Clear the error from URL after reading it
      clearAuthParamsFromUrl();
    }
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginCredentials>({
    resolver: zodResolver(LoginCredentialsSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginCredentials): Promise<void> => {
    if (isRedirecting) return;

    // Clear URL error when user attempts to login
    setUrlError(null);

    const result = await login(data);

    if (result.success) {
      setIsRedirecting(true);
      setTimeout(async () => {
        await redirectByRole(result.data.role);
      }, 100);
    }
  };

  // Get the error message to display (prioritize login error over URL error)
  const displayError = error 
    ? getErrorMessage(error.code) 
    : urlError 
      ? getErrorMessage(getErrorCodeFromAuthError(urlError))
      : null;

  // Show redirecting state
  if (isRedirecting) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
        <p className="mt-4 text-sm text-secondary-600">Đang chuyển hướng...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {displayError && (
        <div
          className="rounded-lg bg-red-50 p-4 text-sm text-red-700"
          role="alert"
          aria-live="polite"
        >
          {displayError}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-secondary-700">
            ID đăng nhập
          </label>
          <Input
            {...register('email')}
            type="email"
            placeholder="Nhập mail của bạn"
            error={errors.email?.message}
            autoComplete="email"
            className="h-11"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-secondary-700">
            Mật khẩu
          </label>
          <Input
            {...register('password')}
            type="password"
            placeholder="Mặc định: student@1234"
            error={errors.password?.message}
            autoComplete="current-password"
            className="h-11"
          />
        </div>
      </div>

      <div className="flex items-center justify-end">
        <a
          href="/forgot-password"
          className="text-sm font-medium text-[#e85d04] hover:text-[#d45404]"
        >
          Quên mật khẩu?
        </a>
      </div>

      <Button
        type="submit"
        className="h-11 w-full bg-[#f4a261] text-white hover:bg-[#e89b57]"
        loading={isLoading}
      >
        Đăng nhập
      </Button>
    </form>
  );
}
