'use client';

import { useState } from 'react';
import { Table, Badge, Button, Avatar, Card, EmptyState, ConfirmModal, useToast, type Column } from '@tdc/ui';
import { useStudents, useDeactivateStudent, useActivateStudent, type StudentWithUser } from '@/hooks/useStudents';
import { StudentSearch } from './StudentSearch';
import { StudentFilters, type StudentFiltersValue } from './StudentFilters';
import Link from 'next/link';

interface StudentListProps {
  search: string;
  onSearchChange: (value: string) => void;
  filters: StudentFiltersValue;
  onFiltersChange: (value: StudentFiltersValue) => void;
  page: number;
  onPageChange: (page: number) => void;
}

const PAGE_SIZE = 10;

/**
 * Skeleton component for student list loading state
 * Requirements: 8.1
 */
function StudentListSkeleton(): JSX.Element {
  return (
    <Card>
      <div className="space-y-4">
        {/* Table header skeleton */}
        <div className="flex items-center border-b border-secondary-200 pb-3">
          <div className="flex-1">
            <div className="h-4 w-20 animate-pulse rounded bg-secondary-200" />
          </div>
          <div className="w-24">
            <div className="h-4 w-16 animate-pulse rounded bg-secondary-200" />
          </div>
          <div className="w-24">
            <div className="h-4 w-16 animate-pulse rounded bg-secondary-200" />
          </div>
          <div className="w-32" />
        </div>
        {/* Table rows skeleton */}
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center py-3">
            <div className="flex flex-1 items-center gap-3">
              <div className="h-10 w-10 animate-pulse rounded-full bg-secondary-200" />
              <div className="space-y-2">
                <div className="h-4 w-32 animate-pulse rounded bg-secondary-200" />
                <div className="h-3 w-48 animate-pulse rounded bg-secondary-100" />
              </div>
            </div>
            <div className="w-24">
              <div className="h-4 w-16 animate-pulse rounded bg-secondary-100" />
            </div>
            <div className="w-24">
              <div className="h-6 w-16 animate-pulse rounded-full bg-secondary-100" />
            </div>
            <div className="flex w-32 justify-end gap-2">
              <div className="h-8 w-16 animate-pulse rounded bg-secondary-100" />
              <div className="h-8 w-20 animate-pulse rounded bg-secondary-100" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

interface StudentActionState {
  studentId: string;
  studentName: string;
  action: 'deactivate' | 'activate';
}

/**
 * Student list component with search, filters, and pagination
 * Requirements: 3.1, 3.6, 3.7, 3.9, 8.6
 */
export function StudentList({
  search,
  onSearchChange,
  filters,
  onFiltersChange,
  page,
  onPageChange,
}: StudentListProps): JSX.Element {
  const { data: students = [], isLoading } = useStudents({
    search,
    isActive: filters.isActive,
    currentSemesterId: filters.currentSemesterId,
  });
  const deactivateStudent = useDeactivateStudent();
  const activateStudent = useActivateStudent();
  const toast = useToast();
  
  // State for confirmation modal
  const [actionState, setActionState] = useState<StudentActionState | null>(null);

  // Client-side pagination
  const totalPages = Math.ceil(students.length / PAGE_SIZE);
  const paginatedStudents = students.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDeactivateClick = (student: StudentWithUser): void => {
    setActionState({
      studentId: student.id,
      studentName: student.displayName,
      action: 'deactivate',
    });
  };

  const handleActivateClick = (student: StudentWithUser): void => {
    setActionState({
      studentId: student.id,
      studentName: student.displayName,
      action: 'activate',
    });
  };

  const handleConfirmAction = async (): Promise<void> => {
    if (!actionState) return;
    
    try {
      if (actionState.action === 'deactivate') {
        await deactivateStudent.mutateAsync(actionState.studentId);
        toast.success('Đã vô hiệu hóa học viên');
      } else {
        await activateStudent.mutateAsync(actionState.studentId);
        toast.success('Đã kích hoạt học viên');
      }
      setActionState(null);
    } catch {
      toast.error(actionState.action === 'deactivate' 
        ? 'Không thể vô hiệu hóa học viên' 
        : 'Không thể kích hoạt học viên');
    }
  };

  const handleCancelAction = (): void => {
    setActionState(null);
  };

  const columns: Column<StudentWithUser>[] = [
    {
      key: 'user',
      header: 'Học viên',
      render: (student) => (
        <div className="flex items-center gap-3">
          <Avatar name={student.displayName} size="sm" />
          <div>
            <p className="font-medium text-secondary-900">{student.displayName}</p>
            <p className="text-sm text-secondary-500">{student.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'enrolledCourses',
      header: 'Khóa học',
      render: (student) => (
        <span className="text-secondary-600">{student.enrolledCourses.length} khóa học</span>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (student) => (
        <Badge variant={student.isActive ? 'success' : 'danger'}>
          {student.isActive ? 'Hoạt động' : 'Vô hiệu'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (student) => (
        <div className="flex justify-end gap-2">
          <Link href={`/students/${student.id}`}>
            <Button variant="ghost" size="sm">
              Chi tiết
            </Button>
          </Link>
          {student.isActive ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeactivateClick(student)}
              disabled={deactivateStudent.isPending}
            >
              Vô hiệu hóa
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleActivateClick(student)}
              disabled={activateStudent.isPending}
            >
              Kích hoạt
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="w-full max-w-sm">
          <StudentSearch value={search} onChange={onSearchChange} />
        </div>
        <StudentFilters value={filters} onChange={onFiltersChange} />
      </div>

      {/* Loading state - Requirements: 8.1 */}
      {isLoading ? (
        <StudentListSkeleton />
      ) : students.length === 0 ? (
        /* Empty state - Requirements: 8.2 */
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
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            }
            title={search || filters.isActive !== undefined || filters.currentSemesterId 
              ? 'Không tìm thấy học viên nào' 
              : 'Chưa có học viên'}
            description={search || filters.isActive !== undefined || filters.currentSemesterId
              ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
              : 'Bắt đầu bằng cách thêm học viên đầu tiên'}
            action={
              !search && filters.isActive === undefined && !filters.currentSemesterId ? (
                <Link href="/students/new">
                  <Button>Thêm học viên</Button>
                </Link>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <>
          {/* Table */}
          <Table
            columns={columns}
            data={paginatedStudents}
            keyExtractor={(student) => student.id}
            emptyMessage="Không tìm thấy học viên nào"
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-secondary-200 pt-4">
              <p className="text-sm text-secondary-500">
                Hiển thị {(page - 1) * PAGE_SIZE + 1} -{' '}
                {Math.min(page * PAGE_SIZE, students.length)} trong tổng số {students.length} học
                viên
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(page - 1)}
                  disabled={page === 1}
                >
                  Trước
                </Button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => onPageChange(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(page + 1)}
                  disabled={page === totalPages}
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Confirmation Modal - Requirements: 8.6 */}
      <ConfirmModal
        isOpen={!!actionState}
        onClose={handleCancelAction}
        onConfirm={handleConfirmAction}
        title={actionState?.action === 'deactivate' ? 'Vô hiệu hóa học viên' : 'Kích hoạt học viên'}
        message={
          actionState?.action === 'deactivate'
            ? `Bạn có chắc muốn vô hiệu hóa học viên "${actionState?.studentName}"? Học viên sẽ không thể đăng nhập vào hệ thống.`
            : `Bạn có chắc muốn kích hoạt lại học viên "${actionState?.studentName}"?`
        }
        confirmText={actionState?.action === 'deactivate' ? 'Vô hiệu hóa' : 'Kích hoạt'}
        confirmVariant={actionState?.action === 'deactivate' ? 'danger' : 'primary'}
        isLoading={deactivateStudent.isPending || activateStudent.isPending}
      />
    </div>
  );
}
