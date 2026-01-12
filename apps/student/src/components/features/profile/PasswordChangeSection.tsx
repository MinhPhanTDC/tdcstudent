'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, FormError, FormSuccess } from '@tdc/ui';
import { PasswordChangeInputSchema, type PasswordChangeInput } from '@tdc/schemas';
import { passwordService } from '@tdc/firebase';
import { useFormError } from '@/hooks/useFormError';

interface PasswordChangeSectionProps {
  /** Callback when password is changed successfully */
  onSuccess?: () => void;
  /** Initial collapsed state */
  defaultCollapsed?: boolean;
}

/**
 * PasswordChangeSection component - collapsible section with password change form
 * Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6
 */
export function PasswordChangeSection({
  onSuccess,
  defaultCollapsed = true,
}: PasswordChangeSectionProps): JSX.Element {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { formError, handleApiError, clearFormError } = useFormError<PasswordChangeInput>();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
  } = useForm<PasswordChangeInput>({
    resolver: zodResolver(PasswordChangeInputSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const toggleCollapse = (): void => {
    setIsCollapsed((prev) => !prev);
  };

  const onSubmit = async (data: PasswordChangeInput): Promise<void> => {
    clearFormError();
    setSuccessMessage(null);

    const result = await passwordService.changePassword(
      data.currentPassword,
      data.newPassword
    );

    if (result.success) {
      setSuccessMessage('Đổi mật khẩu thành công');
      reset();
      onSuccess?.();
    } else {
      handleApiError(result.error, setError);
    }
  };

  return (
    <div className="rounded-lg border border-secondary-200 bg-white shadow-sm">
      {/* Header - clickable to toggle */}
      <button
        type="button"
        onClick={toggleCollapse}
        className="flex w-full items-center justify-between px-6 py-4 text-left hover:bg-secondary-50 transition-colors"
        aria-expanded={!isCollapsed}
        aria-controls="password-change-content"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl" aria-hidden="true">🔒</span>
          <h3 className="text-lg font-semibold text-secondary-900">Đổi mật khẩu</h3>
        </div>
        <svg
          className={`h-5 w-5 text-secondary-500 transition-transform duration-200 ${
            isCollapsed ? '' : 'rotate-180'
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Content - collapsible */}
      {!isCollapsed && (
        <div
          id="password-change-content"
          className="border-t border-secondary-200 px-6 py-6"
        >
          <p className="mb-4 text-sm text-secondary-500">
            Cập nhật mật khẩu để bảo mật tài khoản của bạn. Mật khẩu mới phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              {...register('currentPassword')}
              type="password"
              label="Mật khẩu hiện tại"
              placeholder="Nhập mật khẩu hiện tại"
              error={errors.currentPassword?.message}
              autoComplete="current-password"
            />

            <Input
              {...register('newPassword')}
              type="password"
              label="Mật khẩu mới"
              placeholder="Nhập mật khẩu mới"
              error={errors.newPassword?.message}
              helperText="Tối thiểu 8 ký tự, bao gồm chữ hoa, chữ thường và số"
              autoComplete="new-password"
            />

            <Input
              {...register('confirmPassword')}
              type="password"
              label="Xác nhận mật khẩu mới"
              placeholder="Nhập lại mật khẩu mới"
              error={errors.confirmPassword?.message}
              autoComplete="new-password"
            />

            <FormError message={formError} />
            <FormSuccess message={successMessage} />

            <div className="flex justify-end pt-2">
              <Button type="submit" loading={isSubmitting}>
                Đổi mật khẩu
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
