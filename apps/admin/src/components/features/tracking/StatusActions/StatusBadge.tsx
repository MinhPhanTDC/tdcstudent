'use client';

import { Badge } from '@tdc/ui';
import type { ProgressStatus } from '@tdc/schemas';

export interface StatusBadgeProps {
  /** Current progress status */
  status: ProgressStatus;
  /** Missing conditions for pass (shown in tooltip) */
  missingConditions?: string[];
  /** Rejection reason (shown for rejected status) */
  rejectionReason?: string;
  /** Whether to show the icon */
  showIcon?: boolean;
}

/**
 * Get status badge variant based on progress status
 * Requirements: 10.5
 */
function getStatusVariant(
  status: ProgressStatus
): 'success' | 'warning' | 'danger' | 'primary' | 'default' {
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
 * Status icon component based on progress status
 * Requirements: 10.5 - consistent icons and colors
 */
function StatusIcon({ status }: { status: ProgressStatus }): JSX.Element {
  switch (status) {
    case 'completed':
      return (
        <svg
          className="h-4 w-4 text-green-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      );
    case 'pending_approval':
      return (
        <svg
          className="h-4 w-4 text-yellow-600"
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
      );
    case 'rejected':
      return (
        <svg
          className="h-4 w-4 text-red-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      );
    case 'in_progress':
      return (
        <svg
          className="h-4 w-4 animate-spin text-primary-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      );
    case 'locked':
      return (
        <svg
          className="h-4 w-4 text-secondary-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      );
    default:
      return (
        <svg
          className="h-4 w-4 text-secondary-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
  }
}

/**
 * Info icon for missing conditions tooltip
 */
function InfoIcon(): JSX.Element {
  return (
    <svg
      className="h-4 w-4 text-secondary-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

/**
 * Warning icon for rejection reason
 */
function WarningIcon(): JSX.Element {
  return (
    <svg
      className="h-4 w-4 text-red-500"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  );
}

/**
 * StatusBadge component displaying progress status with icon and tooltip
 * Requirements: 3.6, 10.5
 */
export function StatusBadge({
  status,
  missingConditions = [],
  rejectionReason,
  showIcon = true,
}: StatusBadgeProps): JSX.Element {
  const showMissingConditions =
    missingConditions.length > 0 && status !== 'completed' && status !== 'pending_approval';
  const showRejectionReason = status === 'rejected' && rejectionReason;

  // Build tooltip content
  const tooltipContent = showMissingConditions
    ? `Điều kiện còn thiếu:\n${missingConditions.join('\n')}`
    : showRejectionReason
      ? `Lý do từ chối: ${rejectionReason}`
      : undefined;

  return (
    <div className="flex items-center gap-2">
      {showIcon && <StatusIcon status={status} />}
      <Badge variant={getStatusVariant(status)}>{getStatusText(status)}</Badge>
      {showMissingConditions && (
        <span
          className="cursor-help"
          title={tooltipContent}
          aria-label={`Điều kiện còn thiếu: ${missingConditions.join(', ')}`}
        >
          <InfoIcon />
        </span>
      )}
      {showRejectionReason && (
        <span
          className="cursor-help"
          title={tooltipContent}
          aria-label={`Lý do từ chối: ${rejectionReason}`}
        >
          <WarningIcon />
        </span>
      )}
    </div>
  );
}
