'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Card, Button, EmptyState, Spinner, useToast } from '@tdc/ui';
import {
  useSemesters,
  useDeleteSemester,
  useReorderSemesters,
  useToggleSemesterActive,
} from '@/hooks/useSemesters';
import { SemesterCard, SemesterDeleteModal } from '@/components/features/semester-management';
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

/**
 * Semesters page - displays and manages semesters
 * Requirements: 1.1, 1.7, 8.1, 8.2
 */
export default function SemestersPage(): JSX.Element {
  const { data: semesters = [], isLoading } = useSemesters();
  const deleteSemester = useDeleteSemester();
  const reorderSemesters = useReorderSemesters();
  const toggleActive = useToggleSemesterActive();
  const toast = useToast();

  const [semesterToDelete, setSemesterToDelete] = useState<Semester | null>(null);

  // Handle reorder - move semester up
  const handleMoveUp = useCallback(
    (index: number) => {
      if (index === 0) return;
      const newOrder = [...semesters];
      [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
      reorderSemesters.mutate(newOrder.map((s) => s.id), {
        onSuccess: () => {
          toast.success('Đã cập nhật thứ tự học kỳ');
        },
        onError: () => {
          toast.error('Không thể cập nhật thứ tự học kỳ');
        },
      });
    },
    [semesters, reorderSemesters, toast]
  );

  // Handle reorder - move semester down
  const handleMoveDown = useCallback(
    (index: number) => {
      if (index === semesters.length - 1) return;
      const newOrder = [...semesters];
      [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
      reorderSemesters.mutate(newOrder.map((s) => s.id), {
        onSuccess: () => {
          toast.success('Đã cập nhật thứ tự học kỳ');
        },
        onError: () => {
          toast.error('Không thể cập nhật thứ tự học kỳ');
        },
      });
    },
    [semesters, reorderSemesters, toast]
  );

  // Handle delete
  const handleDeleteClick = (semester: Semester): void => {
    setSemesterToDelete(semester);
  };

  const handleDeleteConfirm = async (): Promise<void> => {
    if (!semesterToDelete) return;
    try {
      await deleteSemester.mutateAsync(semesterToDelete.id);
      toast.success('Đã xóa học kỳ thành công');
      setSemesterToDelete(null);
    } catch {
      toast.error('Không thể xóa học kỳ');
    }
  };

  const handleDeleteCancel = (): void => {
    setSemesterToDelete(null);
  };

  // Handle toggle active
  const handleToggleActive = (semesterId: string): void => {
    toggleActive.mutate(semesterId, {
      onSuccess: () => {
        toast.success('Đã cập nhật trạng thái học kỳ');
      },
      onError: () => {
        toast.error('Không thể cập nhật trạng thái học kỳ');
      },
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-secondary-900">Học kỳ</h1>
          <div className="h-10 w-32 animate-pulse rounded bg-secondary-200" />
        </div>
        <SemesterListSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-secondary-900">Học kỳ</h1>
        <Link href="/semesters/new">
          <Button>Thêm học kỳ</Button>
        </Link>
      </div>

      {/* Empty state - Requirements: 8.2 */}
      {semesters.length === 0 ? (
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
      ) : (
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
              onToggleActive={() => handleToggleActive(semester.id)}
              onDelete={() => handleDeleteClick(semester)}
              isReordering={reorderSemesters.isPending}
              isToggling={toggleActive.isPending}
              isDeleting={deleteSemester.isPending}
            />
          ))}
        </div>
      )}

      {/* Delete confirmation modal - Requirements: 1.5, 1.6, 8.6 */}
      <SemesterDeleteModal
        semester={semesterToDelete}
        isOpen={!!semesterToDelete}
        isDeleting={deleteSemester.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
}
