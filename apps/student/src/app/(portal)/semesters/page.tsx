'use client';

import { useMySemesters } from '@/hooks/useMySemesters';
import { SemesterList } from '@/components/features/semester';
import { FormError } from '@tdc/ui';

/**
 * Semesters page - displays list of semesters for students
 * Requirements: 1.1, 1.6
 */
export default function SemestersPage(): JSX.Element {
  const { data: semesters, isLoading, error } = useMySemesters();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Học kỳ</h1>
        <p className="mt-1 text-sm text-secondary-500">
          Xem danh sách các học kỳ và tiến độ học tập của bạn
        </p>
      </div>

      {error && (
        <FormError message="Không thể tải danh sách học kỳ. Vui lòng thử lại sau." />
      )}

      <SemesterList semesters={semesters ?? []} isLoading={isLoading} />
    </div>
  );
}
