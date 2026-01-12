'use client';

import { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Button, Input, useToast } from '@tdc/ui';
import { MajorList } from '@/components/features/major-management';
import {
  useMajors,
  useDeleteMajor,
  useRestoreMajor,
} from '@/hooks/useMajors';

/**
 * Majors list page
 * Displays all majors with search, create button, and actions
 * Requirements: 1.2
 */
export default function MajorsPage(): JSX.Element {
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const toast = useToast();

  // Fetch majors
  const { data: majors = [], isLoading } = useMajors({ search });

  // Mutations
  const deleteMajor = useDeleteMajor();
  const restoreMajor = useRestoreMajor();

  // Build course count map from majors
  const courseCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    // We'll need to fetch course counts separately or include them in the major data
    // For now, return empty map - the MajorCard will show 0
    return map;
  }, []);

  const handleDelete = useCallback(
    async (majorId: string) => {
      if (!confirm('Bạn có chắc muốn vô hiệu hóa chuyên ngành này?')) {
        return;
      }

      setDeletingId(majorId);
      try {
        const result = await deleteMajor.mutateAsync(majorId);
        if (result.success) {
          toast.success('Đã vô hiệu hóa chuyên ngành');
        } else {
          toast.error('Không thể vô hiệu hóa chuyên ngành');
        }
      } catch {
        toast.error('Đã xảy ra lỗi');
      } finally {
        setDeletingId(null);
      }
    },
    [deleteMajor, toast]
  );

  const handleRestore = useCallback(
    async (majorId: string) => {
      setRestoringId(majorId);
      try {
        const result = await restoreMajor.mutateAsync(majorId);
        if (result.success) {
          toast.success('Đã kích hoạt lại chuyên ngành');
        } else {
          toast.error('Không thể kích hoạt chuyên ngành');
        }
      } catch {
        toast.error('Đã xảy ra lỗi');
      } finally {
        setRestoringId(null);
      }
    },
    [restoreMajor, toast]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-secondary-900">Chuyên ngành</h1>
        <Link href="/majors/new">
          <Button>
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Tạo chuyên ngành
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <svg
              className="h-5 w-5 text-secondary-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <Input
            placeholder="Tìm kiếm chuyên ngành..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Major list */}
      <MajorList
        majors={majors}
        courseCountMap={courseCountMap}
        isLoading={isLoading}
        onDelete={handleDelete}
        onRestore={handleRestore}
        deletingId={deletingId}
        restoringId={restoringId}
      />
    </div>
  );
}
