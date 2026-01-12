'use client';

import { useState } from 'react';
import { Skeleton, EmptyState } from '@tdc/ui';
import {
  useLabVerification,
  useApproveVerification,
  useRejectVerification,
  type PendingVerification,
} from '@/hooks/useLabVerification';
import { VerificationItem } from './VerificationItem';
import { RejectModal } from './RejectModal';

/**
 * VerificationQueue component - displays pending lab verifications
 * Requirements: 1.2, 4.1, 4.2, 4.3, 4.4, 4.5
 */
export function VerificationQueue(): JSX.Element {
  const { data: pendingItems, isLoading, error } = useLabVerification();
  const approveMutation = useApproveVerification();
  const rejectMutation = useRejectVerification();

  const [rejectingItem, setRejectingItem] = useState<PendingVerification | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const handleApprove = async (item: PendingVerification): Promise<void> => {
    setApprovingId(item.progress.id);
    try {
      await approveMutation.mutateAsync(item.progress.id);
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = (item: PendingVerification): void => {
    setRejectingItem(item);
  };

  const handleConfirmReject = async (reason: string): Promise<void> => {
    if (!rejectingItem) return;

    try {
      await rejectMutation.mutateAsync({
        progressId: rejectingItem.progress.id,
        rejectionReason: reason,
      });
      setRejectingItem(null);
    } catch {
      // Error is handled by the mutation
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <VerificationQueueHeader count={0} isLoading />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <VerificationItemSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-4">
        <VerificationQueueHeader count={0} />
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
          <p className="text-sm text-red-600">
            Không thể tải danh sách xác nhận. Vui lòng thử lại.
          </p>
        </div>
      </div>
    );
  }

  const items = pendingItems || [];

  return (
    <div className="space-y-4">
      <VerificationQueueHeader count={items.length} />

      {/* Empty state - Requirements: 1.2 */}
      {items.length === 0 ? (
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
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
          title="Không có yêu cầu nào đang chờ xác nhận"
          description="Các yêu cầu mới sẽ xuất hiện ở đây khi học viên gửi"
        />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <VerificationItem
              key={item.progress.id}
              item={item}
              onApprove={() => handleApprove(item)}
              onReject={() => handleReject(item)}
              isApproving={approvingId === item.progress.id}
            />
          ))}
        </div>
      )}

      <RejectModal
        isOpen={!!rejectingItem}
        onClose={() => setRejectingItem(null)}
        item={rejectingItem}
        onConfirm={handleConfirmReject}
        isLoading={rejectMutation.isPending}
      />
    </div>
  );
}

/**
 * Header component for the verification queue
 */
function VerificationQueueHeader({
  count,
  isLoading,
}: {
  count: number;
  isLoading?: boolean;
}): JSX.Element {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold text-secondary-900">
          Chờ xác nhận
        </h3>
        {isLoading ? (
          <Skeleton width={24} height={24} rounded="full" />
        ) : count > 0 ? (
          <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-warning-100 px-2 text-xs font-medium text-warning-700">
            {count}
          </span>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Skeleton for loading state
 */
function VerificationItemSkeleton(): JSX.Element {
  return (
    <div className="flex items-start gap-4 rounded-lg border border-secondary-200 bg-white p-4">
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton width={150} height={20} rounded="sm" />
          <Skeleton width={80} height={20} rounded="full" />
        </div>
        <Skeleton width={200} height={16} rounded="sm" />
        <Skeleton width={250} height={16} rounded="sm" />
        <Skeleton width={180} height={16} rounded="sm" />
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton width={100} height={32} rounded="md" />
        <Skeleton width={100} height={32} rounded="md" />
      </div>
    </div>
  );
}
