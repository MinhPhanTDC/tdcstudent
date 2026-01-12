'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Card, Button, EmptyState, ConfirmModal, useToast } from '@tdc/ui';
import { useCourses, useDeleteCourse, useToggleCourseActive } from '@/hooks/useCourses';
import { useSemesters } from '@/hooks/useSemesters';
import { CourseSemesterFilter, CourseCard } from '@/components/features/course-management';
import type { Course, Semester } from '@tdc/schemas';

/**
 * Skeleton component for loading state
 * Requirements: 8.1
 */
function CourseListSkeleton(): JSX.Element {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <div className="animate-pulse p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-16 w-24 rounded bg-secondary-100" />
                <div className="space-y-2">
                  <div className="h-5 w-48 rounded bg-secondary-200" />
                  <div className="h-4 w-64 rounded bg-secondary-100" />
                  <div className="h-3 w-32 rounded bg-secondary-100" />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="h-8 w-16 rounded bg-secondary-100" />
                <div className="h-8 w-20 rounded bg-secondary-100" />
                <div className="h-8 w-16 rounded bg-secondary-100" />
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

/**
 * Course list content component
 */
function CourseListContent(): JSX.Element {
  const searchParams = useSearchParams();
  const semesterId = searchParams.get('semesterId') || undefined;
  const toast = useToast();

  const { data: courses = [], isLoading: coursesLoading } = useCourses({ semesterId });
  const { data: semesters = [] } = useSemesters();
  const deleteCourse = useDeleteCourse();
  const toggleActive = useToggleCourseActive();
  
  // State for delete confirmation modal
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

  // Create semester lookup map
  const semesterMap = new Map<string, Semester>(
    semesters.map((s) => [s.id, s])
  );

  // Group courses by semester for display
  const groupedCourses = courses.reduce<Record<string, Course[]>>((acc, course) => {
    const key = course.semesterId || 'unassigned';
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(course);
    return acc;
  }, {});

  // Sort groups by semester order
  const sortedGroups = Object.entries(groupedCourses).sort(([a], [b]) => {
    const semA = semesterMap.get(a);
    const semB = semesterMap.get(b);
    if (!semA) return 1;
    if (!semB) return -1;
    return semA.order - semB.order;
  });

  const handleDeleteClick = (course: Course): void => {
    setCourseToDelete(course);
  };

  const handleDeleteConfirm = async (): Promise<void> => {
    if (!courseToDelete) return;
    try {
      await deleteCourse.mutateAsync(courseToDelete.id);
      toast.success('Đã xóa môn học thành công');
      setCourseToDelete(null);
    } catch {
      toast.error('Không thể xóa môn học');
    }
  };

  const handleDeleteCancel = (): void => {
    setCourseToDelete(null);
  };

  const handleToggleActive = async (courseId: string): Promise<void> => {
    try {
      await toggleActive.mutateAsync(courseId);
      toast.success('Đã cập nhật trạng thái môn học');
    } catch {
      toast.error('Không thể cập nhật trạng thái môn học');
    }
  };

  if (coursesLoading) {
    return <CourseListSkeleton />;
  }

  // Empty state - Requirements: 8.2
  if (courses.length === 0) {
    return (
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
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          }
          title={semesterId ? 'Chưa có môn học trong học kỳ này' : 'Chưa có môn học'}
          description="Bắt đầu bằng cách tạo môn học đầu tiên"
          action={
            <Link href="/courses/new">
              <Button>Thêm môn học</Button>
            </Link>
          }
        />
      </Card>
    );
  }

  // If filtering by semester, show flat list
  if (semesterId) {
    return (
      <>
        <div className="space-y-4">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              semester={semesterMap.get(course.semesterId)}
              onDelete={() => handleDeleteClick(course)}
              onToggleActive={() => handleToggleActive(course.id)}
              isDeleting={deleteCourse.isPending}
              isToggling={toggleActive.isPending}
            />
          ))}
        </div>
        
        {/* Delete Confirmation Modal - Requirements: 8.6 */}
        <ConfirmModal
          isOpen={!!courseToDelete}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          title="Xóa môn học"
          message={`Bạn có chắc muốn xóa môn học "${courseToDelete?.title}"? Hành động này không thể hoàn tác.`}
          confirmText="Xóa"
          confirmVariant="danger"
          isLoading={deleteCourse.isPending}
        />
      </>
    );
  }

  // Show grouped by semester
  return (
    <>
      <div className="space-y-8">
        {sortedGroups.map(([semId, semesterCourses]) => {
          const semester = semesterMap.get(semId);
          return (
            <div key={semId}>
              <h2 className="mb-4 text-lg font-semibold text-secondary-900">
                {semester?.name || 'Chưa phân loại'}
                <span className="ml-2 text-sm font-normal text-secondary-500">
                  ({semesterCourses.length} môn học)
                </span>
              </h2>
              <div className="space-y-4">
                {semesterCourses
                  .sort((a, b) => a.order - b.order)
                  .map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      semester={semester}
                      onDelete={() => handleDeleteClick(course)}
                      onToggleActive={() => handleToggleActive(course.id)}
                      isDeleting={deleteCourse.isPending}
                      isToggling={toggleActive.isPending}
                    />
                  ))}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Delete Confirmation Modal - Requirements: 8.6 */}
      <ConfirmModal
        isOpen={!!courseToDelete}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Xóa môn học"
        message={`Bạn có chắc muốn xóa môn học "${courseToDelete?.title}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        confirmVariant="danger"
        isLoading={deleteCourse.isPending}
      />
    </>
  );
}

/**
 * Courses page - displays courses with semester filter
 * Requirements: 2.1, 8.5
 */
export default function CoursesPage(): JSX.Element {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-secondary-900">Môn học</h1>
        <Link href="/courses/new">
          <Button>Thêm môn học</Button>
        </Link>
      </div>

      <div className="flex items-end gap-4">
        <Suspense fallback={<div className="h-16 w-64 animate-pulse rounded bg-secondary-100" />}>
          <CourseSemesterFilter />
        </Suspense>
      </div>

      <Suspense fallback={<CourseListSkeleton />}>
        <CourseListContent />
      </Suspense>
    </div>
  );
}
