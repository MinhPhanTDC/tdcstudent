'use client';

import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent, useToast } from '@tdc/ui';
import { SemesterForm } from '@/components/features/semester-management';
import { useCreateSemester, useNextSemesterOrder } from '@/hooks/useSemesters';
import type { CreateSemesterInput } from '@tdc/schemas';

/**
 * Create new semester page
 * Requirements: 1.2
 */
export default function NewSemesterPage(): JSX.Element {
  const router = useRouter();
  const createSemester = useCreateSemester();
  const { data: nextOrder = 0 } = useNextSemesterOrder();
  const toast = useToast();

  const handleSubmit = async (data: CreateSemesterInput): Promise<{ success: boolean; error?: import('@tdc/types').AppError }> => {
    const result = await createSemester.mutateAsync(data);
    if (result.success) {
      toast.success('Đã tạo học kỳ thành công');
      router.push('/semesters');
    } else {
      toast.error('Không thể tạo học kỳ');
    }
    return result;
  };

  const handleCancel = (): void => {
    router.push('/semesters');
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <h1 className="text-xl font-semibold text-secondary-900">Tạo học kỳ mới</h1>
          <p className="text-sm text-secondary-500">
            Điền thông tin để tạo học kỳ mới trong hệ thống
          </p>
        </CardHeader>
        <CardContent>
          <SemesterForm
            defaultOrder={nextOrder}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={createSemester.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}
