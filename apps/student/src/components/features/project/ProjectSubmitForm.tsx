'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Modal } from '@tdc/ui';
import type { ProjectSubmission } from '@tdc/schemas';

/**
 * Form validation schema
 * Requirements: 4.2, 10.4
 */
const ProjectSubmitFormSchema = z.object({
  title: z.string().max(200, 'Tiêu đề tối đa 200 ký tự').optional(),
  submissionUrl: z
    .string()
    .min(1, 'Vui lòng nhập URL')
    .url('URL không hợp lệ. Vui lòng sử dụng link Google Drive hoặc Behance'),
  notes: z.string().max(500, 'Ghi chú tối đa 500 ký tự').optional(),
});

type ProjectSubmitFormData = z.infer<typeof ProjectSubmitFormSchema>;

export interface ProjectSubmitFormProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** Project number being submitted */
  projectNumber: number;
  /** Existing submission for edit mode */
  existingSubmission?: ProjectSubmission;
  /** Callback when form is submitted */
  onSubmit: (data: ProjectSubmitFormData) => Promise<void>;
  /** Whether submission is in progress */
  isSubmitting?: boolean;
}

/**
 * ProjectSubmitForm component - form for submitting/editing projects
 * Requirements: 4.2, 4.4, 10.4
 */
export function ProjectSubmitForm({
  isOpen,
  onClose,
  projectNumber,
  existingSubmission,
  onSubmit,
  isSubmitting = false,
}: ProjectSubmitFormProps): JSX.Element {
  const isEditMode = !!existingSubmission;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectSubmitFormData>({
    resolver: zodResolver(ProjectSubmitFormSchema),
    defaultValues: {
      title: existingSubmission?.title || '',
      submissionUrl: existingSubmission?.submissionUrl || '',
      notes: existingSubmission?.notes || '',
    },
  });

  // Reset form when modal opens/closes or submission changes
  useEffect(() => {
    if (isOpen) {
      reset({
        title: existingSubmission?.title || '',
        submissionUrl: existingSubmission?.submissionUrl || '',
        notes: existingSubmission?.notes || '',
      });
    }
  }, [isOpen, existingSubmission, reset]);

  const handleFormSubmit = async (data: ProjectSubmitFormData) => {
    await onSubmit(data);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? `Chỉnh sửa dự án ${projectNumber}` : `Nộp dự án ${projectNumber}`}
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* Title field (optional) */}
        <Input
          label="Tiêu đề (tùy chọn)"
          placeholder="Nhập tiêu đề dự án"
          error={errors.title?.message}
          {...register('title')}
        />

        {/* URL field (required) */}
        <Input
          label="URL bài nộp"
          placeholder="https://drive.google.com/... hoặc https://behance.net/..."
          error={errors.submissionUrl?.message}
          helperText="Hỗ trợ Google Drive, Behance hoặc các link khác"
          {...register('submissionUrl')}
        />

        {/* Notes field (optional) */}
        <div className="w-full">
          <label className="mb-1.5 block text-sm font-medium text-secondary-700">
            Ghi chú (tùy chọn)
          </label>
          <textarea
            className="flex w-full rounded border border-secondary-300 bg-white px-3 py-2 text-sm transition-colors placeholder:text-secondary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px] resize-none"
            placeholder="Thêm ghi chú về bài nộp..."
            {...register('notes')}
          />
          {errors.notes && (
            <p className="mt-1.5 text-sm text-red-600" role="alert">
              {errors.notes.message}
            </p>
          )}
        </div>

        {/* URL format hint */}
        <div className="rounded-lg bg-secondary-50 p-3">
          <p className="text-xs text-secondary-600">
            <strong>Định dạng URL hỗ trợ:</strong>
          </p>
          <ul className="mt-1 text-xs text-secondary-500 list-disc list-inside space-y-0.5">
            <li>Google Drive: https://drive.google.com/...</li>
            <li>Behance: https://behance.net/...</li>
            <li>Các link khác cũng được chấp nhận</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {isEditMode ? 'Cập nhật' : 'Nộp bài'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
