'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, FormError, FormSuccess } from '@tdc/ui';
import { PasswordChangeInputSchema, type PasswordChangeInput } from '@tdc/schemas';
import { passwordService } from '@tdc/firebase';
import { useFormError } from '@/hooks/useFormError';

interface PasswordChangeFormProps {
  onSuccess?: () => void;
}

/**
 * PasswordChangeForm component - form for changing user password
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5
 */
export function PasswordChangeForm({ onSuccess }: PasswordChangeFormProps): JSX.Element {
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
  );
}
