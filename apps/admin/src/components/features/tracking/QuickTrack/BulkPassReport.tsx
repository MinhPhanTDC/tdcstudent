'use client';

import { Modal, Button } from '@tdc/ui';
import type { BulkPassResult } from '@tdc/firebase';

export interface BulkPassReportProps {
  /** Whether the report modal is open */
  isOpen: boolean;
  /** Bulk pass result data */
  result: BulkPassResult | null;
  /** Callback when close is clicked */
  onClose: () => void;
}

/**
 * Success icon component
 */
function SuccessIcon(): JSX.Element {
  return (
    <svg
      className="h-5 w-5 text-green-600"
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
  );
}

/**
 * Error icon component
 */
function ErrorIcon(): JSX.Element {
  return (
    <svg
      className="h-5 w-5 text-red-600"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

/**
 * Summary statistics component
 * Requirements: 4.6
 */
function SummaryStats({
  total,
  successCount,
  failedCount,
}: {
  total: number;
  successCount: number;
  failedCount: number;
}): JSX.Element {
  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Total */}
      <div className="rounded-lg bg-secondary-50 p-4 text-center">
        <p className="text-2xl font-bold text-secondary-900">{total}</p>
        <p className="text-sm text-secondary-600">Tổng số</p>
      </div>

      {/* Success */}
      <div className="rounded-lg bg-green-50 p-4 text-center">
        <p className="text-2xl font-bold text-green-700">{successCount}</p>
        <p className="text-sm text-green-600">Thành công</p>
      </div>

      {/* Failed */}
      <div className="rounded-lg bg-red-50 p-4 text-center">
        <p className="text-2xl font-bold text-red-700">{failedCount}</p>
        <p className="text-sm text-red-600">Thất bại</p>
      </div>
    </div>
  );
}

/**
 * Failure list component
 * Requirements: 4.7, 9.2
 */
function FailureList({
  failures,
}: {
  failures: Array<{
    studentId: string;
    progressId: string;
    reason: string;
  }>;
}): JSX.Element {
  if (failures.length === 0) {
    return <></>;
  }

  return (
    <div className="space-y-2">
      <h4 className="font-medium text-secondary-900">
        Chi tiết lỗi ({failures.length})
      </h4>
      <div className="max-h-48 overflow-y-auto rounded-lg border border-red-200 bg-red-50">
        <ul className="divide-y divide-red-200">
          {failures.map((failure, index) => (
            <li
              key={failure.progressId || index}
              className="flex items-start gap-3 p-3"
            >
              <ErrorIcon />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-red-900">
                  {failure.studentId || `Progress: ${failure.progressId}`}
                </p>
                <p className="text-sm text-red-700">{failure.reason}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/**
 * Bulk pass report modal
 * Requirements: 4.6, 4.7, 9.2
 * 
 * - Summary of success/failure counts
 * - List of failed students with reasons
 * - Close button
 */
export function BulkPassReport({
  isOpen,
  result,
  onClose,
}: BulkPassReportProps): JSX.Element {
  // Don't render if no result
  if (!result) {
    return <></>;
  }

  const { total, success: successCount, failed: failedCount, failures } = result;
  const hasFailures = failedCount > 0;
  const allSuccess = failedCount === 0 && total > 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Kết quả duyệt pass"
      size="md"
      footer={
        <Button variant="primary" onClick={onClose}>
          Đóng
        </Button>
      }
    >
      <div className="space-y-4">
        {/* Status banner */}
        {allSuccess ? (
          <div className="flex items-center gap-3 rounded-lg bg-green-50 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
              <SuccessIcon />
            </div>
            <div>
              <p className="font-medium text-green-900">
                Duyệt pass thành công!
              </p>
              <p className="text-sm text-green-700">
                Tất cả {total} học viên đã được duyệt pass
              </p>
            </div>
          </div>
        ) : hasFailures ? (
          <div className="flex items-center gap-3 rounded-lg bg-yellow-50 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
              <svg
                className="h-5 w-5 text-yellow-600"
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
            </div>
            <div>
              <p className="font-medium text-yellow-900">
                Hoàn thành với một số lỗi
              </p>
              <p className="text-sm text-yellow-700">
                {successCount} thành công, {failedCount} thất bại
              </p>
            </div>
          </div>
        ) : null}

        {/* Summary statistics - Requirements: 4.6 */}
        <SummaryStats
          total={total}
          successCount={successCount}
          failedCount={failedCount}
        />

        {/* Failure list - Requirements: 4.7, 9.2 */}
        {hasFailures && <FailureList failures={failures} />}
      </div>
    </Modal>
  );
}
