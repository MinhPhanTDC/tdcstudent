'use client';

import { useState } from 'react';
import { Modal, Button } from '@tdc/ui';
import type { PendingVerification } from '@/hooks/useLabVerification';

export interface RejectModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** The verification item being rejected */
  item: PendingVerification | null;
  /** Handler for confirming rejection */
  onConfirm: (reason: string) => void;
  /** Whether rejection is in progress */
  isLoading?: boolean;
}

/**
 * RejectModal component - modal for entering rejection reason
 * Requirements: 4.4
 */
export function RejectModal({
  isOpen,
  onClose,
  item,
  onConfirm,
  isLoading,
}: RejectModalProps): JSX.Element {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (): void => {
    const trimmedReason = reason.trim();
    
    if (!trimmedReason) {
      setError('Vui lòng nhập lý do từ chối');
      return;
    }

    if (trimmedReason.length > 500) {
      setError('Lý do từ chối tối đa 500 ký tự');
      return;
    }

    setError('');
    onConfirm(trimmedReason);
  };

  const handleClose = (): void => {
    setReason('');
    setError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Từ chối xác nhận"
      size="md"
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Hủy
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={handleSubmit}
            loading={isLoading}
            disabled={isLoading || !reason.trim()}
          >
            Xác nhận từ chối
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {item && (
          <div className="rounded-lg bg-secondary-50 p-3">
            <p className="text-sm text-secondary-600">
              <span className="font-medium">Học viên:</span> {item.studentName}
            </p>
            <p className="text-sm text-secondary-600 mt-1">
              <span className="font-medium">Yêu cầu:</span> {item.requirementTitle}
            </p>
          </div>
        )}

        <div>
          <label
            htmlFor="rejection-reason"
            className="mb-1.5 block text-sm font-medium text-secondary-700"
          >
            Lý do từ chối <span className="text-red-500">*</span>
          </label>
          <textarea
            id="rejection-reason"
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (error) setError('');
            }}
            placeholder="Nhập lý do từ chối để học viên biết cần làm gì..."
            rows={4}
            maxLength={500}
            className="flex w-full rounded border border-secondary-300 bg-white px-3 py-2 text-sm transition-colors placeholder:text-secondary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isLoading}
          />
          <div className="mt-1 flex justify-between">
            {error ? (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            ) : (
              <span />
            )}
            <span className="text-xs text-secondary-400">
              {reason.length}/500
            </span>
          </div>
        </div>

        <p className="text-sm text-secondary-500">
          Học viên sẽ nhận được thông báo về việc từ chối và có thể gửi lại yêu cầu.
        </p>
      </div>
    </Modal>
  );
}
