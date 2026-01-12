'use client';

import { useParams, useRouter } from 'next/navigation';
import { Card, Button, Badge, Skeleton, useToast } from '@tdc/ui';
import { useCourseDetail } from '@/hooks/useCourseDetail';
import { useMyProjects } from '@/hooks/useMyProjects';
import { useSubmitProject, useUpdateProject, useDeleteProject } from '@/hooks/useSubmitProject';
import { GeniallyEmbed, CourseNavigation } from '@/components/features/course';
import { ProgressBar } from '@/components/features/progress';
import { ProjectList } from '@/components/features/project';

/**
 * Course Detail Page Client Component
 * Requirements: 3.1, 3.2, 3.5, 4.1, 4.5, 4.6, 9.3, 9.4
 */
export default function CourseDetailClient(): JSX.Element {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const { success, error: toastError } = useToast();

  const { data: courseData, isLoading, error } = useCourseDetail(courseId);
  const { data: submissions = [], isLoading: isLoadingProjects } = useMyProjects(courseId);
  
  const submitProject = useSubmitProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  const isMutating = submitProject.isPending || updateProject.isPending || deleteProject.isPending;

  // Handle project submission
  const handleSubmitProject = async (
    projectNumber: number,
    data: { title?: string; submissionUrl: string; notes?: string }
  ) => {
    const result = await submitProject.mutateAsync({
      courseId,
      projectNumber,
      title: data.title,
      submissionUrl: data.submissionUrl,
      notes: data.notes,
    });

    if (result.success) {
      success('Nộp bài thành công!');
    } else {
      toastError('Nộp bài thất bại. Vui lòng thử lại.');
    }
  };


  // Handle project update
  const handleUpdateProject = async (
    submissionId: string,
    data: { title?: string; submissionUrl: string; notes?: string }
  ) => {
    const result = await updateProject.mutateAsync({
      submissionId,
      courseId,
      input: {
        title: data.title,
        submissionUrl: data.submissionUrl,
        notes: data.notes,
      },
    });

    if (result.success) {
      success('Cập nhật bài nộp thành công!');
    } else {
      toastError('Cập nhật thất bại. Vui lòng thử lại.');
    }
  };

  // Handle project deletion
  const handleDeleteProject = async (submissionId: string) => {
    const result = await deleteProject.mutateAsync({
      submissionId,
      courseId,
    });

    if (result.success) {
      success('Xóa bài nộp thành công!');
    } else {
      toastError('Xóa bài nộp thất bại. Vui lòng thử lại.');
    }
  };

  if (isLoading) {
    return <CourseDetailSkeleton />;
  }

  if (error || !courseData) {
    return (
      <div className="py-12 text-center">
        <svg
          className="mx-auto h-12 w-12 text-red-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <h2 className="mt-4 text-lg font-medium text-secondary-900">
          Không tìm thấy môn học
        </h2>
        <p className="mt-2 text-sm text-secondary-500">
          Môn học không tồn tại hoặc bạn chưa được đăng ký.
        </p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          Quay lại
        </Button>
      </div>
    );
  }

  const { course, progress, isLocked, previousCourse, nextCourse } = courseData;

  // If course is locked, show locked message
  if (isLocked) {
    return (
      <div className="py-12 text-center">
        <svg
          className="mx-auto h-16 w-16 text-secondary-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
        <h2 className="mt-4 text-lg font-medium text-secondary-900">
          Môn học chưa được mở khóa
        </h2>
        <p className="mt-2 text-sm text-secondary-500">
          {previousCourse
            ? `Vui lòng hoàn thành môn "${previousCourse.title}" trước để mở khóa môn này.`
            : 'Vui lòng hoàn thành các môn học trước để mở khóa.'}
        </p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          Quay lại
        </Button>
      </div>
    );
  }


  // Calculate progress percentage
  const progressPercentage = progress
    ? Math.min(
        Math.round((progress.completedSessions / course.requiredSessions) * 100),
        100
      )
    : 0;

  // Determine if next course should be locked (current not completed)
  const isNextLocked = progress?.status !== 'completed';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="mb-2 -ml-2"
          >
            <svg
              className="mr-1 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Quay lại
          </Button>
          <h1 className="text-2xl font-bold text-secondary-900">{course.title}</h1>
          {course.description && (
            <p className="mt-1 text-secondary-600">{course.description}</p>
          )}
        </div>
        <Badge
          variant={progressPercentage === 100 ? 'success' : 'primary'}
          className="self-start"
        >
          {progressPercentage === 100 ? 'Hoàn thành' : `${progressPercentage}% hoàn thành`}
        </Badge>
      </div>

      {/* Progress bar */}
      <ProgressBar
        value={progressPercentage}
        max={100}
        showLabel={false}
        variant={progressPercentage === 100 ? 'success' : 'primary'}
      />

      {/* Course stats */}
      <div className="flex flex-wrap gap-4 text-sm text-secondary-600">
        <span className="flex items-center gap-1">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          {progress?.completedSessions || 0}/{course.requiredSessions} buổi học
        </span>
        <span className="flex items-center gap-1">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          {progress?.projectsSubmitted || 0}/{course.requiredProjects} dự án
        </span>
      </div>

      {/* Genially embed */}
      <Card title="Nội dung học tập">
        <GeniallyEmbed url={course.geniallyUrl || ''} title={course.title} />
      </Card>

      {/* Project submissions */}
      {course.requiredProjects > 0 && (
        <Card>
          <ProjectList
            requiredProjects={course.requiredProjects}
            submissions={submissions}
            isLoading={isLoadingProjects}
            onSubmit={handleSubmitProject}
            onUpdate={handleUpdateProject}
            onDelete={handleDeleteProject}
            isMutating={isMutating}
          />
        </Card>
      )}

      {/* Course navigation */}
      <CourseNavigation
        previousCourse={previousCourse}
        nextCourse={nextCourse}
        isNextLocked={isNextLocked}
      />
    </div>
  );
}

/**
 * Skeleton loading state for course detail page
 * Requirements: 9.1
 */
function CourseDetailSkeleton(): JSX.Element {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1 space-y-2">
          <Skeleton height={24} width={80} rounded="sm" />
          <Skeleton height={32} width={300} rounded="sm" />
          <Skeleton height={20} width={400} rounded="sm" />
        </div>
        <Skeleton height={24} width={100} rounded="full" />
      </div>

      {/* Progress bar skeleton */}
      <Skeleton height={8} width="100%" rounded="full" />

      {/* Stats skeleton */}
      <div className="flex gap-4">
        <Skeleton height={20} width={100} rounded="sm" />
        <Skeleton height={20} width={100} rounded="sm" />
      </div>

      {/* Genially embed skeleton */}
      <Card title="Nội dung học tập">
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <Skeleton height="100%" width="100%" className="absolute inset-0" rounded="lg" />
        </div>
      </Card>

      {/* Navigation skeleton */}
      <div className="flex items-center justify-between border-t border-secondary-200 pt-4">
        <Skeleton height={40} width={120} rounded="md" />
        <Skeleton height={40} width={120} rounded="md" />
      </div>
    </div>
  );
}
