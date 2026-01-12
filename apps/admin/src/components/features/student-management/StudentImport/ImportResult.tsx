'use client';

import { useCallback } from 'react';
import { Button, Table, type Column } from '@tdc/ui';
import type { ImportResult as ImportResultType, ImportFailure } from '@tdc/schemas';
import { generateFailureCSV } from '@/lib/import/importer';

interface ImportResultProps {
  /** Import result data */
  result: ImportResultType;
  /** Callback when user closes the result view */
  onClose: () => void;
  /** Callback to start a new import */
  onReset: () => void;
}

/**
 * Success icon component
 */
function SuccessIcon(): JSX.Element {
  return (
    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
      <svg
        className="h-10 w-10 text-green-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    </div>
  );
}

/**
 * Partial success icon component
 */
function PartialSuccessIcon(): JSX.Element {
  return (
    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
      <svg
        className="h-10 w-10 text-yellow-600"
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
  );
}

/**
 * Import result component
 * Shows summary with success/failure counts and failure details
 * Requirements: 4.8, 4.10
 */
export function ImportResult({ result, onClose, onReset }: ImportResultProps): JSX.Element {
  const hasFailures = result.failureCount > 0;
  const allFailed = result.successCount === 0 && result.failureCount > 0;

  /**
   * Download failure report as CSV
   */
  const handleDownloadReport = useCallback(() => {
    const csv = generateFailureCSV(result);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `import-failures-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [result]);

  // Failure table columns
  const failureColumns: Column<ImportFailure>[] = [
    {
      key: 'row',
      header: 'Dòng',
      className: 'w-16',
      render: (failure) => <span className="text-secondary-500">{failure.row}</span>,
    },
    {
      key: 'email',
      header: 'Email',
      render: (failure) => <span className="text-secondary-900">{failure.email}</span>,
    },
    {
      key: 'reason',
      header: 'Lý do',
      render: (failure) => <span className="text-red-600">{failure.reason}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Result icon */}
      {allFailed ? null : hasFailures ? <PartialSuccessIcon /> : <SuccessIcon />}

      {/* Title */}
      <div className="text-center">
        <h3 className="text-lg font-medium text-secondary-900">
          {allFailed
            ? 'Import thất bại'
            : hasFailures
              ? 'Import hoàn tất với một số lỗi'
              : 'Import thành công!'}
        </h3>
        <p className="mt-1 text-sm text-secondary-500">
          {result.successCount > 0
            ? `Đã tạo ${result.successCount} tài khoản học viên mới`
            : 'Không có tài khoản nào được tạo'}
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg bg-secondary-50 p-4 text-center">
          <p className="text-sm font-medium text-secondary-500">Tổng dòng</p>
          <p className="mt-1 text-xl font-semibold text-secondary-900">{result.totalRows}</p>
        </div>
        <div className="rounded-lg bg-blue-50 p-4 text-center">
          <p className="text-sm font-medium text-blue-600">Hợp lệ</p>
          <p className="mt-1 text-xl font-semibold text-blue-700">{result.validRows}</p>
        </div>
        <div className="rounded-lg bg-green-50 p-4 text-center">
          <p className="text-sm font-medium text-green-600">Thành công</p>
          <p className="mt-1 text-xl font-semibold text-green-700">{result.successCount}</p>
        </div>
        <div className="rounded-lg bg-red-50 p-4 text-center">
          <p className="text-sm font-medium text-red-600">Thất bại</p>
          <p className="mt-1 text-xl font-semibold text-red-700">
            {result.invalidRows + result.failureCount}
          </p>
        </div>
      </div>

      {/* Failure details */}
      {result.failures.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-secondary-900">Chi tiết lỗi</h4>
            <Button variant="outline" size="sm" onClick={handleDownloadReport}>
              <svg
                className="mr-2 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Tải báo cáo lỗi
            </Button>
          </div>
          <div className="max-h-64 overflow-auto rounded-lg border border-secondary-200">
            <Table
              columns={failureColumns}
              data={result.failures}
              keyExtractor={(failure) => `${failure.row}-${failure.email}`}
              emptyMessage="Không có lỗi"
            />
          </div>
        </div>
      )}

      {/* Invalid rows note */}
      {result.invalidRows > 0 && (
        <div className="rounded-md bg-secondary-50 p-4">
          <p className="text-sm text-secondary-600">
            <strong>{result.invalidRows}</strong> dòng không hợp lệ đã bị bỏ qua trong quá trình
            import (do thiếu thông tin hoặc email không đúng định dạng).
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 border-t border-secondary-200 pt-4">
        <Button variant="outline" onClick={onReset}>
          Import thêm
        </Button>
        <Button onClick={onClose}>Hoàn tất</Button>
      </div>
    </div>
  );
}
