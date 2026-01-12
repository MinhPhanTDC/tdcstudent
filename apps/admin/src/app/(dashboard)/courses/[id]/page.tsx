'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardHeader, CardContent, Badge, Button, Spinner, ConfirmModal, useToast } from '@tdc/ui';
import { useCourse, useTogglePublish, useDeleteCourse, useAddLesson } from '@/hooks/useCourses';
import { useSemester } from '@/hooks/useSemesters';
import { LessonEditor } from '@/components/features/course-management';
import type { Lesson } from '@tdc/schemas';

/**
 * Course detail/edit page
 * Requirements: 2.1, 2.5, 2.6, 8.6
 */
export default function CourseDetailPage(): JSX.Element {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const toast = useToast();
  
  // State for delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data: course, isLoading, error } = useCourse(courseId);
  const { data: semester } = useSemester(course?.semesterId || '');
  const togglePublish = useTogglePublish();
  const deleteCourse = useDeleteCourse();
  const addLesson = useAddLesson();

  const handleTogglePublish = async (): Promise<void> => {
    if (!course) return;
    try {
      await togglePublish.mutateAsync({
        courseId: course.id,
        isPublished: !course.isActive,
      });
      toast.success(course.isActive ? 'Đã hủy xuất bản môn học' : 'Đã xuất bản môn học');
    } catch {
      toast.error('Không thể cập nhật trạng thái môn học');
    }
  };

  const handleDeleteClick = (): void => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async (): Promise<void> => {
    if (!course) return;
    try {
      const result = await deleteCourse.mutateAsync(course.id);
      if (result.success) {
        toast.success('Đã xóa môn học thành công');
        router.push('/courses');
      } else {
        toast.error('Không thể xóa môn học');
      }
    } catch {
      toast.error('Không thể xóa môn học');
    }
    setShowDeleteModal(false);
  };

  const handleDeleteCancel = (): void => {
    setShowDeleteModal(false);
  };

  const handleAddLesson = async (lesson: Lesson): Promise<void> => {
    if (!course) return;
    try {
      await addLesson.mutateAsync({
        courseId: course.id,
        lesson,
      });
      toast.success('Đã thêm bài học thành công');
    } catch {
      toast.error('Không thể thêm bài học');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardContent>
            <div className="py-8 text-center">
              <p className="text-secondary-600">Không tìm thấy môn học</p>
              <button
                onClick={() => router.push('/courses')}
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-secondary-900">{course.title}</h1>
          <Badge variant={course.isActive ? 'success' : 'warning'}>
            {course.isActive ? 'Đã xuất bản' : 'Bản nháp'}
          </Badge>
          {semester && <Badge variant="primary">{semester.name}</Badge>}
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.back()}>
            Quay lại
          </Button>
          <Button
            variant="outline"
            onClick={handleTogglePublish}
            loading={togglePublish.isPending}
          >
            {course.isActive ? 'Hủy xuất bản' : 'Xuất bản'}
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteClick}
            loading={deleteCourse.isPending}
          >
            Xóa
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Course Info */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <h2 className="text-lg font-semibold text-secondary-900">Thông tin môn học</h2>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-secondary-500">Mô tả</dt>
                <dd className="mt-1 text-secondary-900">
                  {course.description || 'Chưa có mô tả'}
                </dd>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-secondary-500">Học kỳ</dt>
                  <dd className="mt-1 text-secondary-900">
                    {semester ? (
                      <Link
                        href={`/semesters/${semester.id}`}
                        className="text-primary-600 hover:text-primary-700"
                      >
                        {semester.name}
                      </Link>
                    ) : (
                      'Chưa phân loại'
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-secondary-500">Thứ tự</dt>
                  <dd className="mt-1 text-secondary-900">{course.order}</dd>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-secondary-500">Số buổi yêu cầu</dt>
                  <dd className="mt-1 text-secondary-900">{course.requiredSessions} buổi</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-secondary-500">Số dự án yêu cầu</dt>
                  <dd className="mt-1 text-secondary-900">{course.requiredProjects} dự án</dd>
                </div>
              </div>
              {course.geniallyUrl && (
                <div>
                  <dt className="text-sm font-medium text-secondary-500">Genially</dt>
                  <dd className="mt-1">
                    <a
                      href={course.geniallyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-primary-600 hover:text-primary-700"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                      Mở Genially
                    </a>
                  </dd>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-secondary-500">Ngày tạo</dt>
                  <dd className="mt-1 text-secondary-900">
                    {new Date(course.createdAt).toLocaleDateString('vi-VN')}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-secondary-500">Cập nhật lần cuối</dt>
                  <dd className="mt-1 text-secondary-900">
                    {new Date(course.updatedAt).toLocaleDateString('vi-VN')}
                  </dd>
                </div>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Thumbnail */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <h2 className="text-lg font-semibold text-secondary-900">Hình ảnh</h2>
          </CardHeader>
          <CardContent>
            {course.thumbnailUrl ? (
              <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                <Image
                  src={course.thumbnailUrl}
                  alt={course.title}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex aspect-video items-center justify-center rounded-lg bg-secondary-100">
                <p className="text-sm text-secondary-500">Chưa có hình ảnh</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lessons */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <h2 className="text-lg font-semibold text-secondary-900">Danh sách bài học</h2>
          </CardHeader>
          <CardContent>
            <LessonEditor
              lessons={course.lessons}
              onAddLesson={handleAddLesson}
              isLoading={addLesson.isPending}
            />
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Modal - Requirements: 8.6 */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Xóa môn học"
        message={`Bạn có chắc muốn xóa môn học "${course.title}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        confirmVariant="danger"
        isLoading={deleteCourse.isPending}
      />
    </div>
  );
}
