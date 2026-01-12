'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, TextArea, Checkbox, Spinner, FormError } from '@tdc/ui';
import { CreateMajorInputSchema, type CreateMajorInput, type Major } from '@tdc/schemas';

export interface MajorFormProps {
  major?: Major;
  onSubmit: (data: CreateMajorInput) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  /** Error message from API */
  error?: string | null;
}

// Predefined color options for majors
const COLOR_OPTIONS = [
  { value: '#EF4444', label: 'Đỏ' },
  { value: '#F97316', label: 'Cam' },
  { value: '#EAB308', label: 'Vàng' },
  { value: '#22C55E', label: 'Xanh lá' },
  { value: '#14B8A6', label: 'Xanh ngọc' },
  { value: '#3B82F6', label: 'Xanh dương' },
  { value: '#8B5CF6', label: 'Tím' },
  { value: '#EC4899', label: 'Hồng' },
  { value: '#6B7280', label: 'Xám' },
];

/**
 * MajorForm component - form for creating/editing majors
 * Requirements: 1.1, 1.3, 1.5
 */
export function MajorForm({
  major,
  onSubmit,
  onCancel,
  isSubmitting,
  error,
}: MajorFormProps): JSX.Element {
  const isEditMode = !!major;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateMajorInput>({
    resolver: zodResolver(CreateMajorInputSchema),
    defaultValues: {
      name: major?.name ?? '',
      description: major?.description ?? '',
      thumbnailUrl: major?.thumbnailUrl ?? '',
      color: major?.color ?? '#3B82F6',
      isActive: major?.isActive ?? true,
    },
  });

  const selectedColor = watch('color');

  const onFormSubmit = async (data: CreateMajorInput): Promise<void> => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Name field */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-secondary-700">
          Tên chuyên ngành <span className="text-red-500">*</span>
        </label>
        <Input
          id="name"
          {...register('name')}
          placeholder="VD: Graphic Design, UI/UX Design..."
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
          placeholder="Mô tả ngắn về chuyên ngành..."
          rows={3}
          className="mt-1"
          error={errors.description?.message}
        />
      </div>

      {/* Thumbnail URL field */}
      <div>
        <label htmlFor="thumbnailUrl" className="block text-sm font-medium text-secondary-700">
          URL hình ảnh
        </label>
        <Input
          id="thumbnailUrl"
          {...register('thumbnailUrl')}
          placeholder="https://example.com/image.jpg"
          className="mt-1"
          error={errors.thumbnailUrl?.message}
        />
        <p className="mt-1 text-xs text-secondary-500">
          Hình ảnh đại diện cho chuyên ngành (tùy chọn)
        </p>
      </div>

      {/* Color picker */}
      <div>
        <label className="block text-sm font-medium text-secondary-700">
          Màu đại diện
        </label>
        <div className="mt-2 flex flex-wrap gap-2">
          {COLOR_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setValue('color', option.value)}
              className={`h-8 w-8 rounded-full border-2 transition-all ${
                selectedColor === option.value
                  ? 'border-secondary-900 ring-2 ring-secondary-300'
                  : 'border-transparent hover:border-secondary-300'
              }`}
              style={{ backgroundColor: option.value }}
              title={option.label}
              aria-label={`Chọn màu ${option.label}`}
            />
          ))}
        </div>
        {/* Custom color input */}
        <div className="mt-2 flex items-center gap-2">
          <Input
            {...register('color')}
            placeholder="#3B82F6"
            className="w-32"
            error={errors.color?.message}
          />
          <div
            className="h-8 w-8 rounded border border-secondary-200"
            style={{ backgroundColor: selectedColor || '#6B7280' }}
            aria-hidden="true"
          />
        </div>
      </div>

      {/* isActive checkbox */}
      <div className="flex items-start gap-3">
        <Checkbox
          id="isActive"
          {...register('isActive')}
          defaultChecked={major?.isActive ?? true}
        />
        <div>
          <label htmlFor="isActive" className="text-sm font-medium text-secondary-700">
            Kích hoạt chuyên ngành
          </label>
          <p className="text-xs text-secondary-500">
            Chuyên ngành đang hoạt động sẽ hiển thị cho học viên khi chọn ngành
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
            'Tạo chuyên ngành'
          )}
        </Button>
      </div>
    </form>
  );
}
