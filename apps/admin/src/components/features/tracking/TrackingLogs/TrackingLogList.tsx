'use client';

import { Skeleton, SkeletonText } from '@tdc/ui';
import type { TrackingLog } from '@tdc/schemas';
import { formatTrackingAction, formatTrackingValue } from '@/hooks/useTrackingLogs';

export interface TrackingLogListProps {
  /** List of tracking logs to display */
  logs: TrackingLog[];
  /** Whether the data is loading */
  isLoading?: boolean;
  /** Admin names map for displaying who performed the action */
  adminNames?: Record<string, string>;
  /** Maximum number of logs to display */
  maxItems?: number;
  /** Empty state message */
  emptyMessage?: string;
}

/**
 * Format timestamp for display
 */
function formatTimestamp(date: Date): string {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Get action icon based on tracking action type
 */
function ActionIcon({ action }: { action: TrackingLog['action'] }): JSX.Element {
  switch (action) {
    case 'update_sessions':
      return (
        <svg
          className="h-4 w-4 text-blue-500"
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
    case 'update_projects':
      return (
        <svg
          className="h-4 w-4 text-purple-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      );
    case 'add_project_link':
      return (
        <svg
          className="h-4 w-4 text-green-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
          />
        </svg>
      );
    case 'remove_project_link':
      return (
        <svg
          className="h-4 w-4 text-red-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
          />
        </svg>
      );
    case 'approve':
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
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
    case 'reject':
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
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
    case 'unlock_course':
      return (
        <svg
          className="h-4 w-4 text-yellow-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
          />
        </svg>
      );
    case 'unlock_semester':
      return (
        <svg
          className="h-4 w-4 text-orange-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
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
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
  }
}

/**
 * Skeleton loading state for tracking log list
 */
function TrackingLogListSkeleton({ count = 3 }: { count?: number }): JSX.Element {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 rounded-lg border border-secondary-200 p-3">
          <Skeleton width={16} height={16} rounded="full" />
          <div className="flex-1 space-y-2">
            <SkeletonText lines={1} />
            <div className="flex gap-4">
              <Skeleton width={80} height={14} rounded="sm" />
              <Skeleton width={100} height={14} rounded="sm" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Empty state for tracking log list
 */
function TrackingLogListEmpty({ message }: { message: string }): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-secondary-300 py-8 text-center">
      <svg
        className="mb-2 h-8 w-8 text-secondary-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      <p className="text-sm text-secondary-500">{message}</p>
    </div>
  );
}

/**
 * Single tracking log entry component
 */
function TrackingLogEntry({
  log,
  adminName,
}: {
  log: TrackingLog;
  adminName?: string;
}): JSX.Element {
  const showValueChange =
    log.previousValue !== undefined || log.newValue !== undefined;

  return (
    <div className="flex items-start gap-3 rounded-lg border border-secondary-200 bg-white p-3 transition-colors hover:bg-secondary-50">
      <div className="mt-0.5 flex-shrink-0">
        <ActionIcon action={log.action} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-secondary-900">
          {formatTrackingAction(log.action)}
        </p>
        {showValueChange && (
          <p className="mt-1 text-sm text-secondary-600">
            {log.previousValue !== undefined && (
              <span className="text-red-600 line-through">
                {formatTrackingValue(log.previousValue)}
              </span>
            )}
            {log.previousValue !== undefined && log.newValue !== undefined && (
              <span className="mx-1">→</span>
            )}
            {log.newValue !== undefined && (
              <span className="text-green-600">
                {formatTrackingValue(log.newValue)}
              </span>
            )}
          </p>
        )}
        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-secondary-500">
          <span className="flex items-center gap-1">
            <svg
              className="h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            {adminName || log.performedBy}
          </span>
          <span className="flex items-center gap-1">
            <svg
              className="h-3 w-3"
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
            {formatTimestamp(log.performedAt)}
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * TrackingLogList component displaying recent log entries
 * Requirements: 7.4
 * 
 * Displays tracking log entries showing:
 * - Action type with icon
 * - Previous and new values (for updates)
 * - Admin who performed the action
 * - Timestamp
 */
export function TrackingLogList({
  logs,
  isLoading = false,
  adminNames = {},
  maxItems,
  emptyMessage = 'Chưa có lịch sử thay đổi',
}: TrackingLogListProps): JSX.Element {
  if (isLoading) {
    return <TrackingLogListSkeleton count={maxItems || 3} />;
  }

  if (logs.length === 0) {
    return <TrackingLogListEmpty message={emptyMessage} />;
  }

  const displayLogs = maxItems ? logs.slice(0, maxItems) : logs;

  return (
    <div className="space-y-3">
      {displayLogs.map((log) => (
        <TrackingLogEntry
          key={log.id}
          log={log}
          adminName={adminNames[log.performedBy]}
        />
      ))}
      {maxItems && logs.length > maxItems && (
        <p className="text-center text-sm text-secondary-500">
          Và {logs.length - maxItems} thay đổi khác...
        </p>
      )}
    </div>
  );
}
