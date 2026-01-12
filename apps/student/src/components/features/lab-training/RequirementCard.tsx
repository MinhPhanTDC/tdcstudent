'use client';

import { Card, Badge, Button } from '@tdc/ui';
import type { LabRequirement, LabProgressStatus } from '@tdc/schemas';

export interface RequirementCardProps {
  /** The lab requirement to display */
  requirement: LabRequirement;
  /** Current status of the requirement for this student */
  status: LabProgressStatus;
  /** Callback when mark complete button is clicked */
  onMarkComplete: () => void;
  /** Whether the mark complete action is in progress */
  isLoading?: boolean;
}

const statusConfig: Record<
  LabProgressStatus,
  { label: string; variant: 'default' | 'primary' | 'success' | 'danger' }
> = {
  not_started: { label: 'Chưa bắt đầu', variant: 'default' },
  pending: { label: 'Chờ xác nhận', variant: 'primary' },
  completed: { label: 'Hoàn thành', variant: 'success' },
  rejected: { label: 'Bị từ chối', variant: 'danger' },
};

/**
 * RequirementCard component - displays a single lab requirement
 * Requirements: 1.1, 1.2, 1.4, 2.1, 2.2
 */
export function RequirementCard({
  requirement,
  status,
  onMarkComplete,
  isLoading = false,
}: RequirementCardProps): JSX.Element {
  const config = statusConfig[status];
  const canMarkComplete = status === 'not_started' || status === 'rejected';

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          {/* Title and status badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-medium text-secondary-900">{requirement.title}</h3>
            <Badge variant={config.variant}>{config.label}</Badge>
            {requirement.requiresVerification && status !== 'completed' && (
              <Badge variant="default" className="text-xs">
                Cần xác nhận
              </Badge>
            )}
          </div>

          {/* Description */}
          {requirement.description && (
            <p className="text-sm text-secondary-500">{requirement.description}</p>
          )}

          {/* Help URL link - Requirement 1.4 */}
          {requirement.helpUrl && (
            <a
              href={requirement.helpUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 hover:underline"
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
              Xem hướng dẫn
            </a>
          )}
        </div>

        {/* Action button */}
        <div className="flex-shrink-0">
          {status === 'completed' ? (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
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
            </div>
          ) : status === 'pending' ? (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
              <svg
                className="h-5 w-5 text-primary-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          ) : (
            <Button
              size="sm"
              variant={status === 'rejected' ? 'outline' : 'primary'}
              onClick={onMarkComplete}
              disabled={!canMarkComplete || isLoading}
            >
              {isLoading ? 'Đang xử lý...' : status === 'rejected' ? 'Gửi lại' : 'Hoàn thành'}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
