'use client';

import { Modal, Button } from '@tdc/ui';

export interface BulkPassModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Number of selected students */
  selectedCount: number;
  /** Callback when confirm is clicked */
  onConfirm: () => void;
  /** Callback when cancel is clicked */
  onCancel: () => void;
  /** Whether bulk pass is currently processing */
  isProcessing: boolean;
  /** Current progress (number of processed students) */
  progress: number;
  /** Total number of students to process */
  total: number;
}

/**
 * Progress bar component for bulk pass processing
 */
function ProgressBar({
  progress,
  total,
}: {
  progress: number;
  total: number;
}): JSX.Element {
  const percentage = total > 0 ? Math.round((progress / total) * 100) : 0;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-secondary-600">Đang xử lý...</span>
        <span className="font-medium text-secondary-900">
          {progress}/{total} ({percentage}%)
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary-200">
        <div
          className="h-full rounded-full bg-primary-600 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

/**
 * Bulk pass confirmation modal
 * Requirements: 4.4, 4.5
 * 
 * - Confirmation dialog with selected count
 * - Processing progress indicator
 * - Cancel button during processing
 */
export function BulkPassModal({
  isOpen,
  selectedCount,
  onConfirm,
  onCancel,
  isProcessing,
  progress,
  total,
}: BulkPassModalProps): JSX.Element {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title="Xác nhận duyệt pass"
      size="md"
      closeOnBackdrop={!isProcessing}
      footer={
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isProcessing}
          >
            {isProcessing ? 'Đang xử lý...' : 'Hủy'}
          </Button>
          <Button
            variant="primary"
            onClick={onConfirm}
            disabled={isProcessing}
            loading={isProcessing}
          >
            {isProcessing ? 'Đang xử lý...' : 'Xác nhận duyệt'}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {isProcessing ? (
          <>
            {/* Processing state - Requirements: 4.5 */}
            <div className="flex items-center gap-3 rounded-lg bg-primary-50 p-4">
              <svg
                className="h-6 w-6 animate-spin text-primary-600"
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
              <div>
                <p className="font-medium text-primary-900">
                  Đang duyệt pass cho học viên
                </p>
                <p className="text-sm text-primary-700">
                  Vui lòng không đóng cửa sổ này
                </p>
              </div>
            </div>

            {/* Progress indicator */}
            <ProgressBar progress={progress} total={total} />
          </>
        ) : (
          <>
            {/* Confirmation state - Requirements: 4.4 */}
            <div className="flex items-center gap-3 rounded-lg bg-yellow-50 p-4">
              <svg
                className="h-6 w-6 text-yellow-600"
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
                <p className="font-medium text-yellow-900">
                  Xác nhận duyệt pass
                </p>
                <p className="text-sm text-yellow-700">
                  Hành động này không thể hoàn tác
                </p>
              </div>
            </div>

            <p className="text-secondary-700">
              Bạn có chắc chắn muốn duyệt pass cho{' '}
              <span className="font-semibold text-secondary-900">
                {selectedCount} học viên
              </span>{' '}
              đã chọn?
            </p>

            <div className="rounded-lg bg-secondary-50 p-4">
              <p className="text-sm text-secondary-600">
                Sau khi duyệt:
              </p>
              <ul className="mt-2 space-y-1 text-sm text-secondary-700">
                <li className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Trạng thái sẽ chuyển thành &quot;Hoàn thành&quot;
                </li>
                <li className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Môn học tiếp theo sẽ được mở khóa tự động
                </li>
                <li className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Học viên sẽ nhận được thông báo
                </li>
              </ul>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
