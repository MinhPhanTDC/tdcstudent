'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, TextArea, Checkbox, Spinner, FormError } from '@tdc/ui';
import { CreateSemesterInputSchema, type CreateSemesterInput, type Semester } from '@tdc/schemas';

export interface SemesterFormProps {
  semester?: Semester;
  defaultOrder?: number;
  onSubmit: (data: CreateSemesterInput) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  /** Error message from API */
  error?: string | null;
}

/**
 * SemesterForm component - form for creating/editing semesters
 * Requirements: 1.2, 1.8, 1.9, 7.3
 */
export function SemesterForm({
  semester,
  defaultOrder = 0,
  onSubmit,
  onCancel,
  isSubmitting,
  error,
}: SemesterFormProps): JSX.Element {
  const isEditMode = !!semester;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateSemesterInput>({
    resolver: zodResolver(CreateSemesterInputSchema),
    defaultValues: {
      name: semester?.name ?? '',
      description: semester?.description ?? '',
      order: semester?.order ?? defaultOrder,
      isActive: semester?.isActive ?? true,
      requiresMajorSelection: semester?.requiresMajorSelection ?? false,
    },
  });

  const onFormSubmit = async (data: CreateSemesterInput): Promise<void> => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Name field */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-secondary-700">
          Tên học kỳ <span className="text-red-500">*</span>
        </label>
        <Input
          id="name"
          {...register('name')}
          placeholder="VD: Học kỳ 1, Học kỳ Dự bị..."
          className="mt-1"
          error={errors.name?.message}
        />
      </div>

      {/* Description field */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-secondary-700">
          Mô tả
        </label>
        <TextArea
          id="description"
          {...register('description')}
          placeholder="Mô tả ngắn về học kỳ..."
          rows={3}
          className="mt-1"
          error={errors.description?.message}
        />
      </div>

      {/* Order field */}
      <div>
        <label htmlFor="order" className="block text-sm font-medium text-secondary-700">
          Thứ tự <span className="text-red-500">*</span>
        </label>
        <Input
          id="order"
          type="number"
          {...register('order', { valueAsNumber: true })}
          min={0}
          className="mt-1 w-32"
          error={errors.order?.message}
        />
        <p className="mt-1 text-xs text-secondary-500">
          Số thứ tự hiển thị của học kỳ (0 = đầu tiên)
        </p>
      </div>

      {/* isActive checkbox */}
      <div className="flex items-start gap-3">
        <Checkbox
          id="isActive"
          {...register('isActive')}
          defaultChecked={semester?.isActive ?? true}
        />
        <div>
          <label htmlFor="isActive" className="text-sm font-medium text-secondary-700">
            Kích hoạt học kỳ
          </label>
          <p className="text-xs text-secondary-500">
            Học kỳ đang hoạt động sẽ hiển thị cho học viên
          </p>
        </div>
      </div>

      {/* requiresMajorSelection checkbox */}
      <div className="flex items-start gap-3">
        <Checkbox
          id="requiresMajorSelection"
          {...register('requiresMajorSelection')}
          defaultChecked={semester?.requiresMajorSelection ?? false}
        />
        <div>
          <label htmlFor="requiresMajorSelection" className="text-sm font-medium text-secondary-700">
            Yêu cầu chọn chuyên ngành
          </label>
          <p className="text-xs text-secondary-500">
            Học viên phải chọn chuyên ngành khi đăng ký học kỳ này (thường từ HK3 trở đi)
          </p>
        </div>
      </div>

      {/* Form-level error */}
      <FormError message={error} />

      {/* Form actions */}
      <div className="flex justify-end gap-3 border-t border-secondary-200 pt-6">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Hủy
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Spinner size="sm" className="mr-2" />
              Đang lưu...
            </>
          ) : isEditMode ? (
            'Cập nhật'
          ) : (
            'Tạo học kỳ'
          )}
        </Button>
      </div>
    </form>
  );
}
