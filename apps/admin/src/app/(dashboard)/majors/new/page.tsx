'use client';

import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent, useToast } from '@tdc/ui';
import { MajorForm } from '@/components/features/major-management';
import { useCreateMajor } from '@/hooks/useMajors';
import type { CreateMajorInput } from '@tdc/schemas';

/**
 * New major page
 * Displays MajorForm for creating a new major
 * Requirements: 1.1
 */
export default function NewMajorPage(): JSX.Element {
  const router = useRouter();
  const toast = useToast();
  const createMajor = useCreateMajor();

  const handleSubmit = async (data: CreateMajorInput): Promise<void> => {
    const result = await createMajor.mutateAsync(data);
    if (result.success) {
      toast.success('Đã tạo chuyên ngành thành công');
      router.push(`/majors/${result.data.id}`);
    } else {
      toast.error('Không thể tạo chuyên ngành');
    }
  };

  const handleCancel = (): void => {
    router.push('/majors');
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <h1 className="text-xl font-semibold text-secondary-900">
            Tạo chuyên ngành mới
          </h1>
          <p className="text-sm text-secondary-500">
            Điền thông tin để tạo chuyên ngành mới cho chương trình đào tạo
          </p>
        </CardHeader>
        <CardContent>
          <MajorForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={createMajor.isPending}
            error={createMajor.error?.message}
          />
        </CardContent>
      </Card>
    </div>
  );
}
