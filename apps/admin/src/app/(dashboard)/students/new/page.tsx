'use client';

import { useRouter } from 'next/navigation';
import { StudentForm } from '@/components/features/student-management';

export default function NewStudentPage(): JSX.Element {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-secondary-900">Thêm học viên mới</h1>

      <StudentForm
        onSuccess={() => router.push('/students')}
        onCancel={() => router.back()}
      />
    </div>
  );
}
