'use client';

import { useState } from 'react';
import { Button, Modal, useToast } from '@tdc/ui';
import type { ProgressStatus } from '@tdc/schemas';

export interface ApproveButtonProps {
  /** Current progress status */
  status: ProgressStatus;
  /** Student name for confirmation dialog */
  studentName: string;
  /** Course name for confirmation dialog */
  courseName: string;
  /** Whether the approve action is loading */
  isLoading?: boolean;
  /** Callback when approve is confirmed */
  onApprove: () => Promise<void>;
}

/**
 * ApproveButton component for approving student progress
 * Only visible for pending_approval status
 * Requirements: 3.2, 3.3
 */
export function ApproveButton({
  status,
  studentName,
  courseName,
  isLoading = false,
  onApprove,
}: ApproveButtonProps): JSX.Element | null {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { success, error } = useToast();

  // Only show for pending_approval status - Requirements: 3.2
  if (status !== 'pending_approval') {
    return null;
  }

  const handleOpenConfirm = (): void => {
    setIsConfirmOpen(true);
  };

  const handleCloseConfirm = (): void => {
    if (!isProcessing) {
      setIsConfirmOpen(false);
    }
  };

  const handleConfirmApprove = async (): Promise<void> => {
    setIsProcessing(true);
    try {
      await onApprove();
      success(`Đã duyệt pass cho ${studentName}`);
      setIsConfirmOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Có lỗi xảy ra khi duyệt';
      error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Button
        variant="primary"
        size="sm"
        onClick={handleOpenConfirm}
        disabled={isLoading}
        loading={isLoading}
        aria-label={`Duyệt pass cho ${studentName}`}
      >
        Duyệt
      </Button>

      {/* Confirmation Modal - Requirements: 3.3 */}
      <Modal
        isOpen={isConfirmOpen}
        onClose={handleCloseConfirm}
        title="Xác nhận duyệt pass"
        size="sm"
        closeOnBackdrop={!isProcessing}
        footer={
          <>
            <Button
              variant="outline"
              onClick={handleCloseConfirm}
              disabled={isProcessing}
            >
              Hủy
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmApprove}
              loading={isProcessing}
              disabled={isProcessing}
            >
              Xác nhận duyệt
            </Button>
          </>
        }
      >
        <p className="text-secondary-700">
          Bạn có chắc chắn muốn duyệt pass cho học viên{' '}
          <span className="font-semibold text-secondary-900">{studentName}</span> môn{' '}
          <span className="font-semibold text-secondary-900">{courseName}</span>?
        </p>
        <p className="mt-2 text-sm text-secondary-500">
          Sau khi duyệt, học viên sẽ được mở khóa môn học tiếp theo (nếu có).
        </p>
      </Modal>
    </>
  );
}
