'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Card, CardHeader, CardContent, Spinner, useToast } from '@tdc/ui';
import { CourseForm } from '@/components/features/course-management';
import { useCreateCourse } from '@/hooks/useCourses';
import type { CreateCourseInput } from '@tdc/schemas';

/**
 * New course form content with URL params handling
 */
function NewCourseContent(): JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const semesterId = searchParams.get('semesterId') || '';
  const createCourse = useCreateCourse();
  const toast = useToast();

  const handleSubmit = async (data: CreateCourseInput): Promise<{ success: boolean; error?: import('@tdc/types').AppError }> => {
    const result = await createCourse.mutateAsync(data);
    if (result.success) {
      toast.success('Đã tạo môn học thành công');
      // Navigate back to semester detail if came from there
      if (semesterId) {
        router.push(`/semesters/${semesterId}`);
      } else {
        router.push('/courses');
      }
    } else {
      toast.error('Không thể tạo môn học');
    }
    return result;
  };

  return (
    <CourseForm
      onSubmit={handleSubmit}
      isLoading={createCourse.isPending}
      defaultValues={{
        semesterId,
        requiredSessions: 10,
        requiredProjects: 1,
      }}
    />
  );
}

/**
 * New course page
 * Requirements: 2.2, 2.3, 2.4
 */
export default function NewCoursePage(): JSX.Element {
  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <h1 className="text-xl font-semibold text-secondary-900">Thêm môn học mới</h1>
          <p className="text-sm text-secondary-500">
            Điền thông tin để tạo môn học mới
          </p>
        </CardHeader>
        <CardContent>
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-12">
                <Spinner size="lg" />
              </div>
            }
          >
            <NewCourseContent />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
