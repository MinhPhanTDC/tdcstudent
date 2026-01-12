'use client';

import { Button } from '@tdc/ui';

interface ImportProgressProps {
  /** Current number of processed items */
  current: number;
  /** Total number of items to process */
  total: number;
  /** Progress percentage (0-100) */
  percent: number;
  /** Callback to cancel import */
  onCancel: () => void;
}

/**
 * Import progress component
 * Shows progress bar with current/total count and cancel button
 * Requirements: 4.7
 */
export function ImportProgress({
  current,
  total,
  percent,
  onCancel,
}: ImportProgressProps): JSX.Element {
  return (
    <div className="space-y-6 py-8">
      {/* Progress icon */}
      <div className="flex justify-center">
        <div className="relative">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="h-8 w-8 text-primary-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="text-center">
        <h3 className="text-lg font-medium text-secondary-900">Đang import học viên</h3>
        <p className="mt-1 text-sm text-secondary-500">
          Vui lòng không đóng cửa sổ này cho đến khi hoàn tất
        </p>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-secondary-600">Tiến độ</span>
          <span className="font-medium text-secondary-900">
            {current} / {total}
          </span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-secondary-200">
          <div
            className="h-full rounded-full bg-primary-600 transition-all duration-300 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="text-center text-sm text-secondary-500">{percent}% hoàn thành</div>
      </div>

      {/* Estimated time */}
      {current > 0 && current < total && (
        <div className="text-center text-sm text-secondary-500">
          Còn khoảng {Math.ceil((total - current) / 10)} giây
        </div>
      )}

      {/* Cancel button */}
      <div className="flex justify-center">
        <Button variant="outline" onClick={onCancel}>
          Hủy import
        </Button>
      </div>

      {/* Warning */}
      <div className="rounded-md bg-yellow-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-yellow-400"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              Nếu hủy, các học viên đã được tạo sẽ không bị xóa.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
