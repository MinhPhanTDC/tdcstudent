'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PasswordResetRequestSchema, type PasswordResetRequest } from '@tdc/schemas';
import { Button, Input, Card } from '@tdc/ui';
import { useForgotPassword } from '@/hooks/useForgotPassword';
import { getErrorMessage } from '@/lib/errorMessages';

/**
 * Forgot password form component
 */
export function ForgotPasswordForm(): JSX.Element {
  const { sendResetEmail, isLoading, error, isSuccess } = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordResetRequest>({
    resolver: zodResolver(PasswordResetRequestSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: PasswordResetRequest): Promise<void> => {
    await sendResetEmail(data.email);
  };

  if (isSuccess) {
    return (
      <Card className="w-full max-w-md">
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-secondary-900">Kiểm tra email</h1>
          <p className="text-sm text-secondary-600">
            Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến email của bạn.
          </p>
          <a
            href="/"
            className="inline-block text-sm text-primary-600 hover:text-primary-700"
          >
            Quay lại đăng nhập
          </a>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-secondary-900">Quên mật khẩu</h1>
          <p className="mt-2 text-sm text-secondary-600">
            Nhập email của bạn để nhận hướng dẫn đặt lại mật khẩu
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

        <Input
          {...register('email')}
          type="email"
          label="Email"
          placeholder="email@example.com"
          error={errors.email?.message}
          autoComplete="email"
        />

        <Button type="submit" className="w-full" loading={isLoading}>
          Gửi hướng dẫn
        </Button>

        <div className="text-center">
          <a href="/" className="text-sm text-primary-600 hover:text-primary-700">
            Quay lại đăng nhập
          </a>
        </div>
      </form>
    </Card>
  );
}
