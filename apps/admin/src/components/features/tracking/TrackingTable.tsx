'use client';

import { Table, Badge, Card, EmptyState, Button, type Column } from '@tdc/ui';
import type { ProgressStatus } from '@tdc/schemas';
import type { TrackingData } from '@/hooks/useTracking';

export interface TrackingTableProps {
  /** Tracking data to display */
  data: TrackingData[];
  /** Loading state */
  isLoading: boolean;
  /** Current sort key */
  sortKey?: string;
  /** Current sort direction */
  sortDirection?: 'asc' | 'desc';
  /** Callback when sort changes */
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  /** Callback when row is clicked for inline edit */
  onRowClick?: (item: TrackingData) => void;
  /** Callback when approve is clicked */
  onApprove?: (item: TrackingData) => void;
  /** Callback when reject is clicked */
  onReject?: (item: TrackingData) => void;
  /** Callback when history button is clicked - Requirements: 3.1 */
  onViewHistory?: (item: TrackingData) => void;
}

/**
 * Get status badge variant based on progress status
 * Requirements: 10.5
 */
function getStatusVariant(status: ProgressStatus): 'success' | 'warning' | 'danger' | 'primary' | 'default' {
  switch (status) {
    case 'completed':
      return 'success';
    case 'pending_approval':
      return 'warning';
    case 'rejected':
      return 'danger';
    case 'in_progress':
      return 'primary';
    case 'locked':
    case 'not_started':
    default:
      return 'default';
  }
}

/**
 * Get status display text in Vietnamese
 */
function getStatusText(status: ProgressStatus): string {
  switch (status) {
    case 'completed':
      return 'Hoàn thành';
    case 'pending_approval':
      return 'Chờ duyệt';
    case 'rejected':
      return 'Từ chối';
    case 'in_progress':
      return 'Đang học';
    case 'locked':
      return 'Khóa';
    case 'not_started':
    default:
      return 'Chưa bắt đầu';
  }
}

/**
 * Skeleton loading component for tracking table
 * Requirements: 10.1
 */
function TrackingTableSkeleton(): JSX.Element {
  return (
    <Card>
      <div className="space-y-4">
        {/* Table header skeleton */}
        <div className="flex items-center border-b border-secondary-200 pb-3">
          <div className="flex-1">
            <div className="h-4 w-24 animate-pulse rounded bg-secondary-200" />
          </div>
          <div className="w-32">
            <div className="h-4 w-20 animate-pulse rounded bg-secondary-200" />
          </div>
          <div className="w-24">
            <div className="h-4 w-16 animate-pulse rounded bg-secondary-200" />
          </div>
          <div className="w-24">
            <div className="h-4 w-16 animate-pulse rounded bg-secondary-200" />
          </div>
          <div className="w-24">
            <div className="h-4 w-16 animate-pulse rounded bg-secondary-200" />
          </div>
          <div className="w-24">
            <div className="h-4 w-16 animate-pulse rounded bg-secondary-200" />
          </div>
        </div>
        {/* Table rows skeleton */}
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center py-3">
            <div className="flex-1">
              <div className="space-y-2">
                <div className="h-4 w-32 animate-pulse rounded bg-secondary-200" />
                <div className="h-3 w-48 animate-pulse rounded bg-secondary-100" />
              </div>
            </div>
            <div className="w-32">
              <div className="h-4 w-24 animate-pulse rounded bg-secondary-100" />
            </div>
            <div className="w-24">
              <div className="h-4 w-12 animate-pulse rounded bg-secondary-100" />
            </div>
            <div className="w-24">
              <div className="h-4 w-12 animate-pulse rounded bg-secondary-100" />
            </div>
            <div className="w-24">
              <div className="h-4 w-8 animate-pulse rounded bg-secondary-100" />
            </div>
            <div className="w-24">
              <div className="h-6 w-20 animate-pulse rounded-full bg-secondary-100" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/**
 * Tracking table component displaying student progress data
 * Requirements: 1.1, 1.2, 1.7, 3.1, 10.1, 10.2
 */
export function TrackingTable({
  data,
  isLoading,
  sortKey,
  sortDirection,
  onSort,
  onRowClick,
  onViewHistory,
}: TrackingTableProps): JSX.Element {
  // Loading state - Requirements: 10.1
  if (isLoading) {
    return <TrackingTableSkeleton />;
  }

  // Empty state - Requirements: 10.2
  if (data.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={
            <svg
              className="h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
          }
          title="Không có dữ liệu tracking"
          description="Thử thay đổi bộ lọc hoặc chọn môn học khác"
        />
      </Card>
    );
  }

  // Define columns - Requirements: 1.2
  const columns: Column<TrackingData>[] = [
    {
      key: 'studentName',
      header: 'Học viên',
      sortable: true,
      render: (item) => (
        <div
          className={onRowClick ? 'cursor-pointer' : ''}
          onClick={() => onRowClick?.(item)}
        >
          <p className="font-medium text-secondary-900">{item.studentName}</p>
          <p className="text-sm text-secondary-500">{item.studentEmail}</p>
        </div>
      ),
    },
    {
      key: 'courseName',
      header: 'Môn học',
      sortable: true,
      render: (item) => (
        <span className="text-secondary-700">{item.courseName}</span>
      ),
    },
    {
      key: 'completedSessions',
      header: 'Buổi học',
      sortable: true,
      render: (item) => (
        <span className="text-secondary-600">
          {item.completedSessions}/{item.requiredSessions}
        </span>
      ),
    },
    {
      key: 'projectsSubmitted',
      header: 'Dự án',
      sortable: true,
      render: (item) => (
        <span className="text-secondary-600">
          {item.projectsSubmitted}/{item.requiredProjects}
        </span>
      ),
    },
    {
      key: 'projectLinks',
      header: 'Links',
      render: (item) => (
        <span className="text-secondary-600">
          {item.projectLinks.length > 0 ? (
            <span className="text-primary-600">{item.projectLinks.length} link(s)</span>
          ) : (
            <span className="text-secondary-400">Chưa có</span>
          )}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-2">
          <Badge variant={getStatusVariant(item.status)}>
            {getStatusText(item.status)}
          </Badge>
          {item.missingConditions.length > 0 && item.status !== 'completed' && (
            <span
              className="cursor-help text-secondary-400"
              title={item.missingConditions.join('\n')}
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </span>
          )}
        </div>
      ),
    },
    // Actions column with history button - Requirements: 3.1
    {
      key: 'actions',
      header: 'Thao tác',
      render: (item) => (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewHistory?.(item)}
            title="Xem lịch sử thay đổi"
          >
            <svg
              className="mr-1 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Lịch sử
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      data={data}
      keyExtractor={(item) => item.progressId}
      onSort={onSort}
      sortKey={sortKey}
      sortDirection={sortDirection}
      emptyMessage="Không có dữ liệu tracking"
    />
  );
}
