'use client';

import { Badge, Button } from '@tdc/ui';
import type { ProgressStatus } from '@tdc/schemas';
import type { TrackingData } from '@/hooks/useTracking';

export interface TrackingRowProps {
  /** Tracking data for this row */
  data: TrackingData;
  /** Callback when sessions count is clicked for inline edit */
  onEditSessions?: (data: TrackingData) => void;
  /** Callback when projects count is clicked for inline edit */
  onEditProjects?: (data: TrackingData) => void;
  /** Callback when project links is clicked for inline edit */
  onEditLinks?: (data: TrackingData) => void;
  /** Callback when approve button is clicked */
  onApprove?: (data: TrackingData) => void;
  /** Callback when reject button is clicked */
  onReject?: (data: TrackingData) => void;
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
 * Get status icon based on progress status
 * Requirements: 10.5
 */
function StatusIcon({ status }: { status: ProgressStatus }): JSX.Element {
  switch (status) {
    case 'completed':
      return (
        <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      );
    case 'pending_approval':
      return (
        <svg className="h-4 w-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'rejected':
      return (
        <svg className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      );
    case 'in_progress':
      return (
        <svg className="h-4 w-4 animate-spin text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      );
    case 'locked':
      return (
        <svg className="h-4 w-4 text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      );
    default:
      return (
        <svg className="h-4 w-4 text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
  }
}

/**
 * Tracking row component displaying a single student's progress
 * Requirements: 1.2, 2.1, 2.2
 */
export function TrackingRow({
  data,
  onEditSessions,
  onEditProjects,
  onEditLinks,
  onApprove,
  onReject,
}: TrackingRowProps): JSX.Element {
  const canEdit = data.status !== 'completed' && data.status !== 'locked';
  const showApproveButton = data.status === 'pending_approval';
  const showRejectButton = data.status === 'pending_approval';

  return (
    <tr className="hover:bg-secondary-50">
      {/* Student info */}
      <td className="px-4 py-3">
        <div>
          <p className="font-medium text-secondary-900">{data.studentName}</p>
          <p className="text-sm text-secondary-500">{data.studentEmail}</p>
        </div>
      </td>

      {/* Course name */}
      <td className="px-4 py-3">
        <span className="text-secondary-700">{data.courseName}</span>
      </td>

      {/* Sessions count - inline edit trigger - Requirements: 2.1 */}
      <td className="px-4 py-3">
        <button
          type="button"
          onClick={() => canEdit && onEditSessions?.(data)}
          disabled={!canEdit}
          className={`rounded px-2 py-1 text-secondary-600 ${
            canEdit
              ? 'cursor-pointer hover:bg-secondary-100 hover:text-secondary-900'
              : 'cursor-not-allowed opacity-50'
          }`}
          title={canEdit ? 'Nhấn để chỉnh sửa' : 'Không thể chỉnh sửa'}
        >
          {data.completedSessions}/{data.requiredSessions}
        </button>
      </td>

      {/* Projects count - inline edit trigger - Requirements: 2.2 */}
      <td className="px-4 py-3">
        <button
          type="button"
          onClick={() => canEdit && onEditProjects?.(data)}
          disabled={!canEdit}
          className={`rounded px-2 py-1 text-secondary-600 ${
            canEdit
              ? 'cursor-pointer hover:bg-secondary-100 hover:text-secondary-900'
              : 'cursor-not-allowed opacity-50'
          }`}
          title={canEdit ? 'Nhấn để chỉnh sửa' : 'Không thể chỉnh sửa'}
        >
          {data.projectsSubmitted}/{data.requiredProjects}
        </button>
      </td>

      {/* Project links */}
      <td className="px-4 py-3">
        <button
          type="button"
          onClick={() => canEdit && onEditLinks?.(data)}
          disabled={!canEdit}
          className={`rounded px-2 py-1 ${
            canEdit
              ? 'cursor-pointer hover:bg-secondary-100'
              : 'cursor-not-allowed opacity-50'
          }`}
          title={canEdit ? 'Nhấn để chỉnh sửa' : 'Không thể chỉnh sửa'}
        >
          {data.projectLinks.length > 0 ? (
            <span className="text-primary-600">{data.projectLinks.length} link(s)</span>
          ) : (
            <span className="text-secondary-400">Chưa có</span>
          )}
        </button>
      </td>

      {/* Status badge */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <StatusIcon status={data.status} />
          <Badge variant={getStatusVariant(data.status)}>
            {getStatusText(data.status)}
          </Badge>
          {data.missingConditions.length > 0 && data.status !== 'completed' && (
            <span
              className="cursor-help text-secondary-400"
              title={data.missingConditions.join('\n')}
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
      </td>

      {/* Action buttons */}
      <td className="px-4 py-3">
        <div className="flex justify-end gap-2">
          {showApproveButton && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onApprove?.(data)}
            >
              Duyệt
            </Button>
          )}
          {showRejectButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReject?.(data)}
            >
              Từ chối
            </Button>
          )}
          {data.status === 'rejected' && data.rejectionReason && (
            <span
              className="cursor-help text-sm text-red-600"
              title={`Lý do: ${data.rejectionReason}`}
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
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </span>
          )}
        </div>
      </td>
    </tr>
  );
}
