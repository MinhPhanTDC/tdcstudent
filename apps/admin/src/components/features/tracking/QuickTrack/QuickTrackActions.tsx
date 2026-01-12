'use client';

import { Button } from '@tdc/ui';

export interface QuickTrackActionsProps {
  /** Number of selected students */
  selectedCount: number;
  /** Total number of available students */
  totalCount: number;
  /** Whether all items are selected */
  isAllSelected: boolean;
  /** Whether some (but not all) items are selected */
  isSomeSelected?: boolean;
  /** Callback when Select All is clicked */
  onSelectAll: () => void;
  /** Callback when Deselect All is clicked */
  onDeselectAll: () => void;
  /** Callback when Pass Selected is clicked */
  onPassSelected: () => void;
  /** Whether bulk pass is currently processing */
  isProcessing?: boolean;
}

/**
 * Quick Track action buttons component
 * Requirements: 4.3, 4.4
 * 
 * - Select All / Deselect All buttons
 * - Pass Selected button with count
 * - Disabled state when none selected
 */
export function QuickTrackActions({
  selectedCount,
  totalCount,
  isAllSelected,
  onSelectAll,
  onDeselectAll,
  onPassSelected,
  isProcessing = false,
}: QuickTrackActionsProps): JSX.Element {
  const hasSelection = selectedCount > 0;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-secondary-200 bg-white p-4">
      {/* Selection info */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-secondary-600">
          {hasSelection ? (
            <>
              Đã chọn <span className="font-medium text-secondary-900">{selectedCount}</span> / {totalCount} học viên
            </>
          ) : (
            <>
              <span className="font-medium text-secondary-900">{totalCount}</span> học viên chờ duyệt
            </>
          )}
        </span>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3">
        {/* Select All / Deselect All - Requirements: 4.3 */}
        {totalCount > 0 && (
          <>
            {isAllSelected ? (
              <Button
                variant="outline"
                size="sm"
                onClick={onDeselectAll}
                disabled={isProcessing}
              >
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Bỏ chọn tất cả
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={onSelectAll}
                disabled={isProcessing}
              >
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Chọn tất cả ({totalCount})
              </Button>
            )}
          </>
        )}

        {/* Pass Selected button - Requirements: 4.4 */}
        <Button
          variant="primary"
          size="sm"
          onClick={onPassSelected}
          disabled={!hasSelection || isProcessing}
          loading={isProcessing}
        >
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
              d="M5 13l4 4L19 7"
            />
          </svg>
          {isProcessing ? (
            'Đang xử lý...'
          ) : hasSelection ? (
            `Duyệt pass (${selectedCount})`
          ) : (
            'Duyệt pass'
          )}
        </Button>
      </div>
    </div>
  );
}
