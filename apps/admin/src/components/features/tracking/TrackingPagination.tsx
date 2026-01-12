'use client';

import { Button, Select } from '@tdc/ui';

export interface TrackingPaginationProps {
  /** Current page number (1-indexed) */
  page: number;
  /** Number of items per page */
  limit: number;
  /** Total number of items */
  total: number;
  /** Total number of pages */
  totalPages: number;
  /** Callback when page changes */
  onPageChange: (page: number) => void;
  /** Callback when page size changes */
  onLimitChange: (limit: number) => void;
}

/**
 * Page size options
 */
const PAGE_SIZE_OPTIONS = [
  { value: '10', label: '10 / trang' },
  { value: '20', label: '20 / trang' },
  { value: '50', label: '50 / trang' },
  { value: '100', label: '100 / trang' },
];

/**
 * Tracking pagination component with page navigation and size selector
 * Requirements: 1.6
 */
export function TrackingPagination({
  page,
  limit,
  total,
  totalPages,
  onPageChange,
  onLimitChange,
}: TrackingPaginationProps): JSX.Element | null {
  // Don't render if no pagination needed
  if (total <= 0) {
    return null;
  }

  // Calculate display range
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  // Generate page numbers to display
  const getPageNumbers = (): number[] => {
    const pages: number[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show pages around current page
      let start = Math.max(1, page - 2);
      let end = Math.min(totalPages, page + 2);

      // Adjust if at the beginning
      if (page <= 3) {
        start = 1;
        end = maxVisiblePages;
      }

      // Adjust if at the end
      if (page >= totalPages - 2) {
        start = totalPages - maxVisiblePages + 1;
        end = totalPages;
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const newLimit = parseInt(e.target.value, 10);
    onLimitChange(newLimit);
  };

  return (
    <div className="flex flex-col items-center justify-between gap-4 border-t border-secondary-200 pt-4 sm:flex-row">
      {/* Total count display */}
      <div className="flex items-center gap-4">
        <p className="text-sm text-secondary-500">
          Hiển thị {startItem} - {endItem} trong tổng số {total} kết quả
        </p>

        {/* Page size selector */}
        <div className="w-32">
          <Select
            options={PAGE_SIZE_OPTIONS}
            value={limit.toString()}
            onChange={handleLimitChange}
          />
        </div>
      </div>

      {/* Page navigation controls */}
      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          {/* First page button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={page === 1}
            title="Trang đầu"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </Button>

          {/* Previous page button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            title="Trang trước"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Button>

          {/* Page number buttons */}
          {pageNumbers.map((pageNum) => (
            <Button
              key={pageNum}
              variant={page === pageNum ? 'primary' : 'outline'}
              size="sm"
              onClick={() => onPageChange(pageNum)}
            >
              {pageNum}
            </Button>
          ))}

          {/* Next page button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
            title="Trang sau"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>

          {/* Last page button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            disabled={page === totalPages}
            title="Trang cuối"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </Button>
        </div>
      )}
    </div>
  );
}
