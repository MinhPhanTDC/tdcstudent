'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginCredentialsSchema, type LoginCredentials } from '@tdc/schemas';
import { Button, Input, Card } from '@tdc/ui';
import { useLogin } from '@/hooks/useLogin';
import { redirectByRole } from '@/lib/redirect';
import { getErrorMessage } from '@/lib/errorMessages';

/**
 * Login form component
 */
export function LoginForm(): JSX.Element {
  const { login, isLoading, error } = useLogin();
  const [isRedirecting, setIsRedirecting] = useState(false);

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
    
    const result = await login(data);

    if (result.success) {
      setIsRedirecting(true);
      // Small delay to ensure state is updated before redirect
      setTimeout(async () => {
        await redirectByRole(result.data.role);
      }, 100);
    }
  };

  // Show redirecting state
  if (isRedirecting) {
    return (
      <Card className="w-full max-w-md">
        <div className="flex flex-col items-center justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
          <p className="mt-4 text-sm text-secondary-600">Đang chuyển hướng...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-secondary-900">Đăng nhập</h1>
          <p className="mt-2 text-sm text-secondary-600">
            Chào mừng bạn đến với The Design Council
          </p>
        </div>

        {error && (
          <div
            className="rounded-lg bg-red-50 p-4 text-sm text-red-700"
            role="alert"
            aria-live="polite"
          >
            {getErrorMessage(error.code)}
          </div>
        )}

        <div className="space-y-4">
          <Input
            {...register('email')}
            type="email"
            label="Email"
            placeholder="email@example.com"
            error={errors.email?.message}
            autoComplete="email"
          />

          <Input
            {...register('password')}
            type="password"
            label="Mật khẩu"
            placeholder="••••••••"
            error={errors.password?.message}
            autoComplete="current-password"
          />
        </div>

        <div className="flex items-center justify-end">
          <a
            href="/forgot-password"
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            Quên mật khẩu?
          </a>
        </div>

        <Button type="submit" className="w-full" loading={isLoading}>
          Đăng nhập
        </Button>
      </form>
    </Card>
  );
}
