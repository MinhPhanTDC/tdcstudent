'use client';

import { Badge, Button } from '@tdc/ui';
import type { PendingVerification } from '@/hooks/useLabVerification';

export interface VerificationItemProps {
  /** The pending verification item */
  item: PendingVerification;
  /** Handler for approving */
  onApprove: () => void;
  /** Handler for rejecting */
  onReject: () => void;
  /** Whether approve action is loading */
  isApproving?: boolean;
}

/**
 * Format date to Vietnamese locale
 */
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * VerificationItem component - displays a single pending verification
 * Requirements: 4.2, 4.5
 */
export function VerificationItem({
  item,
  onApprove,
  onReject,
  isApproving,
}: VerificationItemProps): JSX.Element {
  return (
    <div className="flex items-start gap-4 rounded-lg border border-secondary-200 bg-white p-4">
      {/* Student info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-medium text-secondary-900 truncate">
            {item.studentName}
          </h4>
          <Badge variant="warning">Chờ xác nhận</Badge>
        </div>
        <p className="text-sm text-secondary-600 truncate">
          {item.studentEmail}
        </p>
        <div className="mt-2 flex items-center gap-2 text-sm">
          <span className="text-secondary-500">Yêu cầu:</span>
          <span className="font-medium text-secondary-700 truncate">
            {item.requirementTitle}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-2 text-sm">
          <span className="text-secondary-500">Ngày gửi:</span>
          <span className="text-secondary-600">
            {formatDate(item.submissionDate)}
          </span>
        </div>
        {item.progress.notes && (
          <div className="mt-2 rounded bg-secondary-50 p-2 text-sm text-secondary-600">
            <span className="font-medium">Ghi chú:</span> {item.progress.notes}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 shrink-0">
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={onApprove}
          loading={isApproving}
          disabled={isApproving}
          className="min-w-[100px]"
        >
          <CheckIcon className="mr-1.5" />
          Phê duyệt
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onReject}
          disabled={isApproving}
          className="min-w-[100px] text-red-600 border-red-300 hover:bg-red-50"
        >
          <XIcon className="mr-1.5" />
          Từ chối
        </Button>
      </div>
    </div>
  );
}

// Icon components
function CheckIcon({ className }: { className?: string }): JSX.Element {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }): JSX.Element {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
