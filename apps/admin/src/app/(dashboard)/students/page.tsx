'use client';

import { useCallback, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Button, Modal } from '@tdc/ui';
import Link from 'next/link';
import { StudentList, StudentImport } from '@/components/features/student-management';
import type { StudentFiltersValue } from '@/components/features/student-management/StudentFilters';

/**
 * Student list page with URL state management
 * Requirements: 3.1, 3.9, 4.1, 8.5
 */
export default function StudentsPage(): JSX.Element {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Read state from URL
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const isActiveParam = searchParams.get('isActive');
  const currentSemesterId = searchParams.get('semesterId') || undefined;

  const filters: StudentFiltersValue = {
    isActive: isActiveParam === null ? undefined : isActiveParam === 'true',
    currentSemesterId,
  };

  // Update URL with new params
  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === '') {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      updateParams({ search: value, page: '1' });
    },
    [updateParams]
  );

  const handleFiltersChange = useCallback(
    (newFilters: StudentFiltersValue) => {
      updateParams({
        isActive: newFilters.isActive === undefined ? undefined : String(newFilters.isActive),
        semesterId: newFilters.currentSemesterId,
        page: '1',
      });
    },
    [updateParams]
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      updateParams({ page: String(newPage) });
    },
    [updateParams]
  );

  const handleOpenImportModal = useCallback(() => {
    setIsImportModalOpen(true);
  }, []);

  const handleCloseImportModal = useCallback(() => {
    setIsImportModalOpen(false);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-secondary-900">Học viên</h1>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleOpenImportModal}>
            <svg
              className="mr-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
            Import từ Excel
          </Button>
          <Link href="/students/new">
            <Button>Thêm học viên</Button>
          </Link>
        </div>
      </div>

      <StudentList
        search={search}
        onSearchChange={handleSearchChange}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        page={page}
        onPageChange={handlePageChange}
      />

      {/* Import Modal */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={handleCloseImportModal}
        title="Import học viên từ Excel"
        size="xl"
      >
        <StudentImport onClose={handleCloseImportModal} />
      </Modal>
    </div>
  );
}
