'use client';

import { Modal, Button } from '@tdc/ui';
import type { MajorForSelection } from '@/hooks/useSelectMajor';

export interface MajorConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  major: MajorForSelection | null;
  isLoading?: boolean;
}

/**
 * MajorConfirmModal component - confirmation dialog with warning about permanent choice
 * Requirements: 4.4 - Display a confirmation dialog warning that the choice is permanent
 */
export function MajorConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  major,
  isLoading = false,
}: MajorConfirmModalProps): JSX.Element {
  if (!major) {
    return <></>;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Xác nhận chọn chuyên ngành"
      size="md"
      closeOnBackdrop={!isLoading}
      footer={
        <>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Đang xử lý...
              </>
            ) : (
              'Xác nhận chọn'
            )}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Warning banner */}
        <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <svg
            className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div>
            <h4 className="font-medium text-yellow-800">Lưu ý quan trọng</h4>
            <p className="mt-1 text-sm text-yellow-700">
              Sau khi chọn chuyên ngành, bạn <strong>không thể thay đổi</strong> quyết định này.
              Vui lòng cân nhắc kỹ trước khi xác nhận.
            </p>
          </div>
        </div>

        {/* Selected major info */}
        <div className="p-4 bg-secondary-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div
              className="h-12 w-12 rounded-lg flex-shrink-0"
              style={{ backgroundColor: major.color || '#6366f1' }}
            />
            <div>
              <h4 className="font-semibold text-secondary-900">{major.name}</h4>
              <p className="text-sm text-secondary-500">
                {major.courseCount} môn học
              </p>
            </div>
          </div>
          {major.description && (
            <p className="mt-3 text-sm text-secondary-600">{major.description}</p>
          )}
        </div>

        {/* Confirmation text */}
        <p className="text-secondary-600">
          Bạn có chắc chắn muốn chọn chuyên ngành <strong>{major.name}</strong>?
        </p>
      </div>
    </Modal>
  );
}

