'use client';

import { useState } from 'react';
import { Button, Badge, Table, type Column } from '@tdc/ui';
import type { ValidatedImportRow } from '@tdc/schemas';

/**
 * Tab type for preview
 */
type PreviewTab = 'all' | 'valid' | 'invalid';

interface ImportPreviewProps {
  /** Name of the uploaded file */
  fileName: string;
  /** Valid rows from validation */
  validRows: ValidatedImportRow[];
  /** Invalid rows from validation */
  invalidRows: ValidatedImportRow[];
  /** Count of valid rows */
  validCount: number;
  /** Count of invalid rows */
  invalidCount: number;
  /** Whether import can proceed */
  canImport: boolean;
  /** Callback to start import */
  onImport: () => void;
  /** Callback to cancel/go back */
  onCancel: () => void;
}

/**
 * Import preview component
 * Displays preview table with validation status
 * Requirements: 4.4, 4.5
 */
export function ImportPreview({
  fileName,
  validRows,
  invalidRows,
  validCount,
  invalidCount,
  canImport,
  onImport,
  onCancel,
}: ImportPreviewProps): JSX.Element {
  const [activeTab, setActiveTab] = useState<PreviewTab>('all');

  // Get rows based on active tab
  const allRows = [...validRows, ...invalidRows].sort((a, b) => a.row - b.row);
  const displayRows =
    activeTab === 'all' ? allRows : activeTab === 'valid' ? validRows : invalidRows;

  // Table columns
  const columns: Column<ValidatedImportRow>[] = [
    {
      key: 'row',
      header: 'Dòng',
      className: 'w-16',
      render: (row) => <span className="text-secondary-500">{row.row}</span>,
    },
    {
      key: 'name',
      header: 'Tên',
      render: (row) => <span className="font-medium text-secondary-900">{row.name || '-'}</span>,
    },
    {
      key: 'email',
      header: 'Email',
      render: (row) => <span className="text-secondary-600">{row.email || '-'}</span>,
    },
    {
      key: 'status',
      header: 'Trạng thái',
      className: 'w-32',
      render: (row) => (
        <Badge variant={row.isValid ? 'success' : 'danger'}>
          {row.isValid ? 'Hợp lệ' : 'Lỗi'}
        </Badge>
      ),
    },
    {
      key: 'errors',
      header: 'Chi tiết lỗi',
      render: (row) =>
        row.errors.length > 0 ? (
          <ul className="list-inside list-disc text-sm text-red-600">
            {row.errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        ) : (
          <span className="text-secondary-400">-</span>
        ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header with file info */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-secondary-900">Xem trước dữ liệu</h3>
          <p className="mt-1 text-sm text-secondary-500">File: {fileName}</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg bg-secondary-50 p-4">
          <p className="text-sm font-medium text-secondary-500">Tổng số dòng</p>
          <p className="mt-1 text-2xl font-semibold text-secondary-900">
            {validCount + invalidCount}
          </p>
        </div>
        <div className="rounded-lg bg-green-50 p-4">
          <p className="text-sm font-medium text-green-600">Hợp lệ</p>
          <p className="mt-1 text-2xl font-semibold text-green-700">{validCount}</p>
        </div>
        <div className="rounded-lg bg-red-50 p-4">
          <p className="text-sm font-medium text-red-600">Không hợp lệ</p>
          <p className="mt-1 text-2xl font-semibold text-red-700">{invalidCount}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-secondary-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('all')}
            className={`border-b-2 px-1 py-4 text-sm font-medium ${
              activeTab === 'all'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-secondary-500 hover:border-secondary-300 hover:text-secondary-700'
            }`}
          >
            Tất cả ({validCount + invalidCount})
          </button>
          <button
            onClick={() => setActiveTab('valid')}
            className={`border-b-2 px-1 py-4 text-sm font-medium ${
              activeTab === 'valid'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-secondary-500 hover:border-secondary-300 hover:text-secondary-700'
            }`}
          >
            Hợp lệ ({validCount})
          </button>
          <button
            onClick={() => setActiveTab('invalid')}
            className={`border-b-2 px-1 py-4 text-sm font-medium ${
              activeTab === 'invalid'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-secondary-500 hover:border-secondary-300 hover:text-secondary-700'
            }`}
          >
            Không hợp lệ ({invalidCount})
          </button>
        </nav>
      </div>

      {/* Preview table */}
      <div className="max-h-96 overflow-auto rounded-lg border border-secondary-200">
        <Table
          columns={columns}
          data={displayRows}
          keyExtractor={(row) => `${row.row}-${row.email}`}
          emptyMessage={
            activeTab === 'invalid' ? 'Không có dòng lỗi' : 'Không có dữ liệu để hiển thị'
          }
        />
      </div>

      {/* Warning for invalid rows */}
      {invalidCount > 0 && (
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
                Có <strong>{invalidCount}</strong> dòng không hợp lệ sẽ bị bỏ qua khi import.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* No valid rows warning */}
      {!canImport && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                Không có dòng hợp lệ để import. Vui lòng kiểm tra lại file.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 border-t border-secondary-200 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Chọn file khác
        </Button>
        <Button onClick={onImport} disabled={!canImport}>
          Import {validCount} học viên
        </Button>
      </div>
    </div>
  );
}
