'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Card, FormError } from '@tdc/ui';
import { useCreateStudentWithAuth } from '@/hooks/useStudents';
import { useFormError } from '@/hooks/useFormError';

const StudentFormSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  displayName: z.string().min(2, 'Tên phải có ít nhất 2 ký tự').max(100, 'Tên tối đa 100 ký tự'),
  phone: z.string().optional(),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự').optional().or(z.literal('')),
});

type StudentFormData = z.infer<typeof StudentFormSchema>;

interface StudentFormProps {
  onSuccess?: (generatedPassword?: string) => void;
  onCancel?: () => void;
}

/**
 * Form to create a new student with Firebase Auth
 * Requirements: 3.2, 3.3, 7.3
 */
export function StudentForm({ onSuccess, onCancel }: StudentFormProps): JSX.Element {
  const createStudent = useCreateStudentWithAuth();
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const { formError, handleApiError, clearFormError } = useFormError<StudentFormData>();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<StudentFormData>({
    resolver: zodResolver(StudentFormSchema),
    defaultValues: {
      email: '',
      displayName: '',
      phone: '',
      password: '',
    },
  });

  const onSubmit = async (data: StudentFormData): Promise<void> => {
    clearFormError();
    
    const result = await createStudent.mutateAsync({
      email: data.email,
      displayName: data.displayName,
      phone: data.phone || undefined,
      password: data.password || undefined,
    });

    if (result.success) {
      if (result.data.generatedPassword) {
        setGeneratedPassword(result.data.generatedPassword);
      }
      onSuccess?.(result.data.generatedPassword);
    } else {
      // Use the new error handling hook
      handleApiError(result.error, setError);
    }
  };

  // Show generated password after successful creation
  if (generatedPassword) {
    return (
      <Card title="Tạo học viên thành công">
        <div className="space-y-4">
          <div className="rounded-lg bg-green-50 p-4">
            <p className="text-sm text-green-800">
              Học viên đã được tạo thành công. Mật khẩu tự động được tạo:
            </p>
            <p className="mt-2 font-mono text-lg font-semibold text-green-900">
              {generatedPassword}
            </p>
            <p className="mt-2 text-xs text-green-700">
              Vui lòng lưu lại mật khẩu này và gửi cho học viên. Mật khẩu sẽ không được hiển thị lại.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(generatedPassword);
              }}
            >
              Sao chép mật khẩu
            </Button>
            <Button onClick={() => onSuccess?.()}>Hoàn tất</Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Thêm học viên mới">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input
          {...register('email')}
          type="email"
          label="Email"
          placeholder="email@example.com"
          error={errors.email?.message}
        />

        <Input
          {...register('displayName')}
          label="Họ và tên"
          placeholder="Nguyễn Văn A"
          error={errors.displayName?.message}
        />

        <Input
          {...register('phone')}
          type="tel"
          label="Số điện thoại"
          placeholder="0901234567"
          error={errors.phone?.message}
          helperText="Không bắt buộc"
        />

        <Input
          {...register('password')}
          type="password"
          label="Mật khẩu"
          placeholder="Để trống để tự động tạo"
          error={errors.password?.message}
          helperText="Để trống để hệ thống tự động tạo mật khẩu an toàn"
        />

        <FormError message={formError} />

        <div className="flex justify-end gap-3">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Hủy
            </Button>
          )}
          <Button type="submit" loading={isSubmitting || createStudent.isPending}>
            Tạo học viên
          </Button>
        </div>
      </form>
    </Card>
  );
}
