'use client';

import { useCallback, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardContent, Spinner, Button, EmptyState, ConfirmModal, useToast } from '@tdc/ui';
import { SemesterForm } from '@/components/features/semester-management/SemesterForm';
import { CourseCard } from '@/components/features/course-management';
import { useSemester, useUpdateSemester } from '@/hooks/useSemesters';
import { useCoursesBySemester, useReorderCourses, useDeleteCourse, useToggleCourseActive } from '@/hooks/useCourses';
import type { CreateSemesterInput, Course } from '@tdc/schemas';

/**
 * Course list skeleton for loading state
 */
function CourseListSkeleton(): JSX.Element {
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
                <div className="h-8 w-16 rounded bg-secondary-100" />
                <div className="h-8 w-20 rounded bg-secondary-100" />
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

/**
 * Edit semester page with course management
 * Requirements: 1.4, 2.7, 2.8
 */
export default function EditSemesterPage(): JSX.Element {
  const router = useRouter();
  const params = useParams();
  const semesterId = params.id as string;
  const toast = useToast();
  
  // State for delete confirmation modal
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

  const { data: semester, isLoading: semesterLoading, error: semesterError } = useSemester(semesterId);
  const { data: courses = [], isLoading: coursesLoading } = useCoursesBySemester(semesterId);
  const updateSemester = useUpdateSemester();
  const reorderCourses = useReorderCourses();
  const deleteCourse = useDeleteCourse();
  const toggleCourseActive = useToggleCourseActive();

  const handleSubmit = async (data: CreateSemesterInput): Promise<void> => {
    const result = await updateSemester.mutateAsync({
      semesterId,
      data: {
        ...data,
        id: semesterId,
      },
    });
    if (result.success) {
      toast.success('Đã cập nhật học kỳ thành công');
      router.push('/semesters');
    } else {
      toast.error('Không thể cập nhật học kỳ');
    }
  };

  const handleCancel = (): void => {
    router.push('/semesters');
  };

  // Handle course reorder - move up
  const handleMoveUp = useCallback(
    (index: number) => {
      if (index === 0) return;
      const newOrder = [...courses];
      [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
      reorderCourses.mutate(
        {
          semesterId,
          courseIds: newOrder.map((c) => c.id),
        },
        {
          onSuccess: () => {
            toast.success('Đã cập nhật thứ tự môn học');
          },
          onError: () => {
            toast.error('Không thể cập nhật thứ tự môn học');
          },
        }
      );
    },
    [courses, reorderCourses, semesterId, toast]
  );

  // Handle course reorder - move down
  const handleMoveDown = useCallback(
    (index: number) => {
      if (index === courses.length - 1) return;
      const newOrder = [...courses];
      [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
      reorderCourses.mutate(
        {
          semesterId,
          courseIds: newOrder.map((c) => c.id),
        },
        {
          onSuccess: () => {
            toast.success('Đã cập nhật thứ tự môn học');
          },
          onError: () => {
            toast.error('Không thể cập nhật thứ tự môn học');
          },
        }
      );
    },
    [courses, reorderCourses, semesterId, toast]
  );

  const handleDeleteCourseClick = (course: Course): void => {
    setCourseToDelete(course);
  };

  const handleDeleteCourseConfirm = async (): Promise<void> => {
    if (!courseToDelete) return;
    try {
      await deleteCourse.mutateAsync(courseToDelete.id);
      toast.success('Đã xóa môn học thành công');
      setCourseToDelete(null);
    } catch {
      toast.error('Không thể xóa môn học');
    }
  };

  const handleDeleteCourseCancel = (): void => {
    setCourseToDelete(null);
  };

  const handleToggleCourseActive = async (courseId: string): Promise<void> => {
    try {
      await toggleCourseActive.mutateAsync(courseId);
      toast.success('Đã cập nhật trạng thái môn học');
    } catch {
      toast.error('Không thể cập nhật trạng thái môn học');
    }
  };

  if (semesterLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (semesterError || !semester) {
    return (
      <div className="mx-auto max-w-4xl">
        <Card>
          <CardContent>
            <div className="py-8 text-center">
              <p className="text-secondary-600">Không tìm thấy học kỳ</p>
              <button
                onClick={() => router.push('/semesters')}
                className="mt-4 text-primary-600 hover:text-primary-700"
              >
                Quay lại danh sách
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Semester Edit Form */}
      <Card>
        <CardHeader>
          <h1 className="text-xl font-semibold text-secondary-900">Chỉnh sửa học kỳ</h1>
          <p className="text-sm text-secondary-500">
            Cập nhật thông tin học kỳ: {semester.name}
          </p>
        </CardHeader>
        <CardContent>
          <SemesterForm
            semester={semester}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={updateSemester.isPending}
          />
        </CardContent>
      </Card>

      {/* Courses in this Semester */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-secondary-900">
                Môn học trong học kỳ
              </h2>
              <p className="text-sm text-secondary-500">
                Kéo thả để sắp xếp thứ tự môn học
              </p>
            </div>
            <Link href={`/courses/new?semesterId=${semesterId}`}>
              <Button size="sm">Thêm môn học</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {coursesLoading ? (
            <CourseListSkeleton />
          ) : courses.length === 0 ? (
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
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              }
              title="Chưa có môn học"
              description="Thêm môn học vào học kỳ này"
              action={
                <Link href={`/courses/new?semesterId=${semesterId}`}>
                  <Button>Thêm môn học</Button>
                </Link>
              }
            />
          ) : (
            <div className="space-y-4">
              {reorderCourses.isPending && (
                <div className="flex items-center gap-2 text-sm text-secondary-500">
                  <Spinner size="sm" />
                  <span>Đang cập nhật thứ tự...</span>
                </div>
              )}
              {courses.map((course, index) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  isFirst={index === 0}
                  isLast={index === courses.length - 1}
                  onMoveUp={() => handleMoveUp(index)}
                  onMoveDown={() => handleMoveDown(index)}
                  onDelete={() => handleDeleteCourseClick(course)}
                  onToggleActive={() => handleToggleCourseActive(course.id)}
                  isReordering={reorderCourses.isPending}
                  isDeleting={deleteCourse.isPending}
                  isToggling={toggleCourseActive.isPending}
                  showReorderControls
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Course Confirmation Modal - Requirements: 8.6 */}
      <ConfirmModal
        isOpen={!!courseToDelete}
        onClose={handleDeleteCourseCancel}
        onConfirm={handleDeleteCourseConfirm}
        title="Xóa môn học"
        message={`Bạn có chắc muốn xóa môn học "${courseToDelete?.title}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        confirmVariant="danger"
        isLoading={deleteCourse.isPending}
      />
    </div>
  );
}
