'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Modal, useToast } from '@tdc/ui';
import { RejectProgressInputSchema, type RejectProgressInput } from '@tdc/schemas';

export interface RejectModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Student name for display */
  studentName: string;
  /** Course name for display */
  courseName: string;
  /** Callback when modal should close */
  onClose: () => void;
  /** Callback when rejection is submitted */
  onReject: (reason: string) => Promise<void>;
}

/**
 * RejectModal component for rejecting student progress with reason
 * Requirements: 3.4, 3.5
 */
export function RejectModal({
  isOpen,
  studentName,
  courseName,
  onClose,
  onReject,
}: RejectModalProps): JSX.Element {
  const [isProcessing, setIsProcessing] = useState(false);
  const { success, error } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RejectProgressInput>({
    resolver: zodResolver(RejectProgressInputSchema),
    defaultValues: {
      rejectionReason: '',
    },
  });

  const handleClose = (): void => {
    if (!isProcessing) {
      reset();
      onClose();
    }
  };

  const onSubmit = async (data: RejectProgressInput): Promise<void> => {
    setIsProcessing(true);
    try {
      await onReject(data.rejectionReason);
      success(`Đã từ chối ${studentName}`);
      reset();
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Có lỗi xảy ra khi từ chối';
      error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Từ chối học viên"
      size="md"
      closeOnBackdrop={!isProcessing}
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={isProcessing}>
            Hủy
          </Button>
          <Button
            variant="danger"
            onClick={handleSubmit(onSubmit)}
            loading={isProcessing}
            disabled={isProcessing}
          >
            Từ chối
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-secondary-700">
          Bạn đang từ chối học viên{' '}
          <span className="font-semibold text-secondary-900">{studentName}</span> môn{' '}
          <span className="font-semibold text-secondary-900">{courseName}</span>.
        </p>

        {/* Rejection reason textarea - Requirements: 3.4 */}
        <div>
          <label
            htmlFor="rejectionReason"
            className="mb-1 block text-sm font-medium text-secondary-700"
          >
            Lý do từ chối <span className="text-red-500">*</span>
          </label>
          <textarea
            id="rejectionReason"
            {...register('rejectionReason')}
            rows={4}
            className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
              errors.rejectionReason
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-secondary-300 focus:border-primary-500 focus:ring-primary-500'
            }`}
            placeholder="Nhập lý do từ chối..."
            disabled={isProcessing}
            aria-invalid={errors.rejectionReason ? 'true' : 'false'}
            aria-describedby={errors.rejectionReason ? 'rejectionReason-error' : undefined}
          />
          {/* Validation error - Requirements: 3.5 */}
          {errors.rejectionReason && (
            <p
              id="rejectionReason-error"
              className="mt-1 text-sm text-red-600"
              role="alert"
            >
              {errors.rejectionReason.message}
            </p>
          )}
        </div>

        <p className="text-sm text-secondary-500">
          Học viên sẽ nhận được thông báo về việc bị từ chối cùng với lý do.
        </p>
      </div>
    </Modal>
  );
}
