'use client';

import { useState, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent, Button, Spinner, useToast } from '@tdc/ui';
import {
  MajorForm,
  MajorCoursesManager,
  AddCourseModal,
} from '@/components/features/major-management';
import { useMajor, useUpdateMajor } from '@/hooks/useMajors';
import {
  useMajorCourses,
  useAddCourseToMajor,
  useRemoveCourseFromMajor,
  useToggleMajorCourseRequired,
  useReorderMajorCourses,
} from '@/hooks/useMajorCourses';
import { useCourses } from '@/hooks/useCourses';
import type { CreateMajorInput } from '@tdc/schemas';

/**
 * Major detail page client component
 * Displays MajorForm for editing and MajorCoursesManager
 * Requirements: 1.3, 2.2
 */
export default function MajorDetailClient(): JSX.Element {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const majorId = params.id as string;

  const [isAddCourseModalOpen, setIsAddCourseModalOpen] = useState(false);
  const [removingCourseId, setRemovingCourseId] = useState<string | null>(null);
  const [togglingCourseId, setTogglingCourseId] = useState<string | null>(null);

  // Fetch major data
  const { data: major, isLoading: isMajorLoading, error: majorError } = useMajor(majorId);

  // Fetch major courses
  const { data: majorCourses = [], isLoading: isCoursesLoading } = useMajorCourses(majorId);

  // Fetch all courses for the add modal
  const { data: allCourses = [], isLoading: isAllCoursesLoading } = useCourses();

  // Mutations
  const updateMajor = useUpdateMajor();
  const addCourse = useAddCourseToMajor();
  const removeCourse = useRemoveCourseFromMajor();
  const toggleRequired = useToggleMajorCourseRequired();
  const reorderCourses = useReorderMajorCourses();


  // Build courses map for MajorCoursesManager
  const coursesMap = useMemo(() => {
    const map: Record<string, typeof allCourses[0]> = {};
    allCourses.forEach((course) => {
      map[course.id] = course;
    });
    return map;
  }, [allCourses]);

  // Handle major form submit
  const handleSubmit = useCallback(
    async (data: CreateMajorInput): Promise<void> => {
      const result = await updateMajor.mutateAsync({ id: majorId, ...data });
      if (result.success) {
        toast.success('Đã cập nhật chuyên ngành');
      } else {
        toast.error('Không thể cập nhật chuyên ngành');
      }
    },
    [majorId, updateMajor, toast]
  );

  const handleCancel = useCallback((): void => {
    router.push('/majors');
  }, [router]);

  // Handle add course
  const handleAddCourse = useCallback(
    async (courseId: string, isRequired: boolean): Promise<void> => {
      const result = await addCourse.mutateAsync({
        majorId,
        courseId,
        isRequired,
        order: majorCourses.length,
      });
      if (result.success) {
        toast.success('Đã thêm môn học vào chuyên ngành');
      } else {
        toast.error('Không thể thêm môn học');
      }
    },
    [majorId, majorCourses.length, addCourse, toast]
  );

  // Handle remove course
  const handleRemoveCourse = useCallback(
    async (majorCourseId: string): Promise<void> => {
      if (!confirm('Bạn có chắc muốn xóa môn học này khỏi chuyên ngành?')) {
        return;
      }

      setRemovingCourseId(majorCourseId);
      try {
        const result = await removeCourse.mutateAsync({
          majorCourseId,
          majorId,
        });
        if (result.success) {
          toast.success('Đã xóa môn học khỏi chuyên ngành');
        } else {
          toast.error('Không thể xóa môn học');
        }
      } catch {
        toast.error('Đã xảy ra lỗi');
      } finally {
        setRemovingCourseId(null);
      }
    },
    [majorId, removeCourse, toast]
  );

  // Handle toggle required
  const handleToggleRequired = useCallback(
    async (majorCourseId: string): Promise<void> => {
      setTogglingCourseId(majorCourseId);
      try {
        const result = await toggleRequired.mutateAsync({
          majorCourseId,
          majorId,
        });
        if (result.success) {
          toast.success('Đã cập nhật trạng thái môn học');
        } else {
          toast.error('Không thể cập nhật trạng thái');
        }
      } catch {
        toast.error('Đã xảy ra lỗi');
      } finally {
        setTogglingCourseId(null);
      }
    },
    [majorId, toggleRequired, toast]
  );

  // Handle reorder
  const handleReorder = useCallback(
    async (majorCourseIds: string[]): Promise<void> => {
      const result = await reorderCourses.mutateAsync({
        majorId,
        majorCourseIds,
      });
      if (!result.success) {
        toast.error('Không thể sắp xếp lại môn học');
      }
    },
    [majorId, reorderCourses, toast]
  );

  // Loading state
  if (isMajorLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  // Error state
  if (majorError || !major) {
    return (
      <div className="py-12 text-center">
        <p className="text-red-600">Không tìm thấy chuyên ngành</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/majors')}>
          Quay lại danh sách
        </Button>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">{major.name}</h1>
          <p className="text-sm text-secondary-500">Chỉnh sửa thông tin chuyên ngành</p>
        </div>
        <Button variant="outline" onClick={() => router.push('/majors')}>
          Quay lại
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Major Form */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-secondary-900">Thông tin chuyên ngành</h2>
          </CardHeader>
          <CardContent>
            <MajorForm
              major={major}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isSubmitting={updateMajor.isPending}
              error={updateMajor.error?.message}
            />
          </CardContent>
        </Card>

        {/* Major Courses Manager */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-secondary-900">Môn học</h2>
          </CardHeader>
          <CardContent>
            <MajorCoursesManager
              majorCourses={majorCourses}
              coursesMap={coursesMap}
              isLoading={isCoursesLoading}
              onAddCourse={() => setIsAddCourseModalOpen(true)}
              onRemoveCourse={handleRemoveCourse}
              onToggleRequired={handleToggleRequired}
              onReorder={handleReorder}
              removingId={removingCourseId}
              togglingId={togglingCourseId}
              isReordering={reorderCourses.isPending}
            />
          </CardContent>
        </Card>
      </div>

      {/* Add Course Modal */}
      <AddCourseModal
        isOpen={isAddCourseModalOpen}
        onClose={() => setIsAddCourseModalOpen(false)}
        courses={allCourses}
        existingMajorCourses={majorCourses}
        onAddCourse={handleAddCourse}
        isLoading={isAllCoursesLoading}
        isAdding={addCourse.isPending}
      />
    </div>
  );
}
