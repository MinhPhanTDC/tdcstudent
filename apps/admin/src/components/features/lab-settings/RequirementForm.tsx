'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, TextArea, Checkbox, Spinner, FormError } from '@tdc/ui';
import { CreateLabRequirementInputSchema, type CreateLabRequirementInput, type LabRequirement } from '@tdc/schemas';

export interface RequirementFormProps {
  /** Existing requirement for edit mode */
  requirement?: LabRequirement;
  /** Default order for new requirements */
  defaultOrder?: number;
  /** Submit handler */
  onSubmit: (data: CreateLabRequirementInput) => Promise<void>;
  /** Cancel handler */
  onCancel: () => void;
  /** Loading state */
  isSubmitting: boolean;
  /** Error message from API */
  error?: string | null;
}

/**
 * RequirementForm component - form for creating/editing lab requirements
 * Requirements: 3.2, 3.3
 */
export function RequirementForm({
  requirement,
  defaultOrder = 0,
  onSubmit,
  onCancel,
  isSubmitting,
  error,
}: RequirementFormProps): JSX.Element {
  const isEditMode = !!requirement;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateLabRequirementInput>({
    resolver: zodResolver(CreateLabRequirementInputSchema),
    defaultValues: {
      title: requirement?.title ?? '',
      description: requirement?.description ?? '',
      helpUrl: requirement?.helpUrl ?? '',
      order: requirement?.order ?? defaultOrder,
      isActive: requirement?.isActive ?? true,
      requiresVerification: requirement?.requiresVerification ?? false,
    },
  });

  const onFormSubmit = async (data: CreateLabRequirementInput): Promise<void> => {
    // Clean up empty optional fields
    const cleanedData: CreateLabRequirementInput = {
      ...data,
      description: data.description || undefined,
      helpUrl: data.helpUrl || undefined,
    };
    await onSubmit(cleanedData);
  };


  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Title field */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-secondary-700">
          Tiêu đề <span className="text-red-500">*</span>
        </label>
        <Input
          id="title"
          {...register('title')}
          placeholder="VD: Hoàn thành khóa học an toàn lao động..."
          className="mt-1"
          error={errors.title?.message}
        />
        <p className="mt-1 text-xs text-secondary-500">
          Tối đa 200 ký tự
        </p>
      </div>

      {/* Description field */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-secondary-700">
          Mô tả
        </label>
        <TextArea
          id="description"
          {...register('description')}
          placeholder="Mô tả chi tiết về yêu cầu..."
          rows={3}
          className="mt-1"
          error={errors.description?.message}
        />
        <p className="mt-1 text-xs text-secondary-500">
          Tối đa 500 ký tự
        </p>
      </div>

      {/* Help URL field */}
      <div>
        <label htmlFor="helpUrl" className="block text-sm font-medium text-secondary-700">
          Link hướng dẫn
        </label>
        <Input
          id="helpUrl"
          type="url"
          {...register('helpUrl')}
          placeholder="https://example.com/huong-dan"
          className="mt-1"
          error={errors.helpUrl?.message}
        />
        <p className="mt-1 text-xs text-secondary-500">
          URL đến tài liệu hướng dẫn (tùy chọn)
        </p>
      </div>

      {/* Order field - hidden in create mode, shown in edit mode */}
      {isEditMode && (
        <div>
          <label htmlFor="order" className="block text-sm font-medium text-secondary-700">
            Thứ tự
          </label>
          <Input
            id="order"
            type="number"
            {...register('order', { valueAsNumber: true })}
            min={0}
            className="mt-1 w-32"
            error={errors.order?.message}
          />
        </div>
      )}


      {/* isActive checkbox */}
      <div className="flex items-start gap-3">
        <Checkbox
          id="isActive"
          {...register('isActive')}
          defaultChecked={requirement?.isActive ?? true}
        />
        <div>
          <label htmlFor="isActive" className="text-sm font-medium text-secondary-700">
            Kích hoạt yêu cầu
          </label>
          <p className="text-xs text-secondary-500">
            Yêu cầu đang hoạt động sẽ hiển thị cho học viên
          </p>
        </div>
      </div>

      {/* requiresVerification checkbox */}
      <div className="flex items-start gap-3">
        <Checkbox
          id="requiresVerification"
          {...register('requiresVerification')}
          defaultChecked={requirement?.requiresVerification ?? false}
        />
        <div>
          <label htmlFor="requiresVerification" className="text-sm font-medium text-secondary-700">
            Yêu cầu xác nhận từ Admin
          </label>
          <p className="text-xs text-secondary-500">
            Khi học viên đánh dấu hoàn thành, Admin cần xác nhận trước khi được tính
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
            'Tạo yêu cầu'
          )}
        </Button>
      </div>
    </form>
  );
}
