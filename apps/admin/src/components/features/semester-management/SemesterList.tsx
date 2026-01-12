'use client';

import { useCallback } from 'react';
import { Card, EmptyState, Button, Spinner } from '@tdc/ui';
import Link from 'next/link';
import { useSemesters, useReorderSemesters } from '@/hooks/useSemesters';
import { SemesterCard } from './SemesterCard';
import type { Semester } from '@tdc/schemas';

/**
 * Skeleton component for loading state
 * Requirements: 8.1
 */
function SemesterListSkeleton(): JSX.Element {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <div className="animate-pulse p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex flex-col gap-1">
                  <div className="h-6 w-6 rounded bg-secondary-100" />
                  <div className="h-6 w-6 rounded bg-secondary-100" />
                </div>
                <div className="space-y-2">
                  <div className="h-5 w-48 rounded bg-secondary-200" />
                  <div className="h-4 w-32 rounded bg-secondary-100" />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="h-8 w-20 rounded bg-secondary-100" />
                <div className="h-8 w-20 rounded bg-secondary-100" />
                <div className="h-8 w-16 rounded bg-secondary-100" />
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export interface SemesterListProps {
  onEdit?: (semester: Semester) => void;
  onDelete?: (semester: Semester) => void;
  onToggleActive?: (semester: Semester) => void;
}

/**
 * SemesterList component - displays semester cards with reorder support
 * Requirements: 1.1, 1.7
 */
export function SemesterList({
  onEdit,
  onDelete,
  onToggleActive,
}: SemesterListProps): JSX.Element {
  const { data: semesters = [], isLoading } = useSemesters();
  const reorderSemesters = useReorderSemesters();

  // Handle reorder - move semester up
  const handleMoveUp = useCallback(
    (index: number) => {
      if (index === 0) return;
      const newOrder = [...semesters];
      [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
      reorderSemesters.mutate(newOrder.map((s) => s.id));
    },
    [semesters, reorderSemesters]
  );

  // Handle reorder - move semester down
  const handleMoveDown = useCallback(
    (index: number) => {
      if (index === semesters.length - 1) return;
      const newOrder = [...semesters];
      [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
      reorderSemesters.mutate(newOrder.map((s) => s.id));
    },
    [semesters, reorderSemesters]
  );

  if (isLoading) {
    return <SemesterListSkeleton />;
  }

  // Empty state - Requirements: 8.2
  if (semesters.length === 0) {
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
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          }
          title="Chưa có học kỳ"
          description="Bắt đầu bằng cách tạo học kỳ đầu tiên"
          action={
            <Link href="/semesters/new">
              <Button>Thêm học kỳ</Button>
            </Link>
          }
        />
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {reorderSemesters.isPending && (
        <div className="flex items-center gap-2 text-sm text-secondary-500">
          <Spinner size="sm" />
          <span>Đang cập nhật thứ tự...</span>
        </div>
      )}
      {semesters.map((semester, index) => (
        <SemesterCard
          key={semester.id}
          semester={semester}
          isFirst={index === 0}
          isLast={index === semesters.length - 1}
          onMoveUp={() => handleMoveUp(index)}
          onMoveDown={() => handleMoveDown(index)}
          onEdit={onEdit ? () => onEdit(semester) : undefined}
          onDelete={onDelete ? () => onDelete(semester) : undefined}
          onToggleActive={onToggleActive ? () => onToggleActive(semester) : undefined}
          isReordering={reorderSemesters.isPending}
        />
      ))}
    </div>
  );
}
