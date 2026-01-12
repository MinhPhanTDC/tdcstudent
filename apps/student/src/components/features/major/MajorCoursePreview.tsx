'use client';

import { Badge, Skeleton, SkeletonText } from '@tdc/ui';
import type { MajorCourse, Course } from '@tdc/schemas';

export interface CoursePreviewItem {
  majorCourse: MajorCourse;
  course: Course | null;
}

export interface MajorCoursePreviewProps {
  courses: CoursePreviewItem[];
  isLoading?: boolean;
  majorName?: string;
}

/**
 * MajorCoursePreview component - displays list of courses in a major for preview
 * Requirements: 4.3 - Display the list of courses in that major
 */
export function MajorCoursePreview({
  courses,
  isLoading = false,
  majorName,
}: MajorCoursePreviewProps): JSX.Element {
  if (isLoading) {
    return <MajorCoursePreviewSkeleton />;
  }

  if (courses.length === 0) {
    return (
      <div className="text-center py-8 text-secondary-500">
        <svg
          className="mx-auto h-12 w-12 text-secondary-400"
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
        <p className="mt-2">Chưa có môn học nào trong chuyên ngành này</p>
      </div>
    );
  }

  const requiredCourses = courses.filter((c) => c.majorCourse.isRequired);
  const electiveCourses = courses.filter((c) => !c.majorCourse.isRequired);

  return (
    <div className="space-y-6">
      {/* Header */}
      {majorName && (
        <div className="border-b border-secondary-200 pb-4">
          <h3 className="text-lg font-semibold text-secondary-900">
            Danh sách môn học - {majorName}
          </h3>
          <p className="mt-1 text-sm text-secondary-500">
            {courses.length} môn học ({requiredCourses.length} bắt buộc,{' '}
            {electiveCourses.length} tự chọn)
          </p>
        </div>
      )}

      {/* Required courses */}
      {requiredCourses.length > 0 && (
        <CourseSection
          title="Môn học bắt buộc"
          courses={requiredCourses}
          variant="required"
        />
      )}

      {/* Elective courses */}
      {electiveCourses.length > 0 && (
        <CourseSection
          title="Môn học tự chọn"
          courses={electiveCourses}
          variant="elective"
        />
      )}
    </div>
  );
}

interface CourseSectionProps {
  title: string;
  courses: CoursePreviewItem[];
  variant: 'required' | 'elective';
}

function CourseSection({ title, courses, variant }: CourseSectionProps): JSX.Element {
  return (
    <div>
      <h4 className="text-sm font-medium text-secondary-700 mb-3 flex items-center gap-2">
        {title}
        <Badge variant={variant === 'required' ? 'primary' : 'default'}>
          {courses.length}
        </Badge>
      </h4>
      <div className="space-y-2">
        {courses.map((item, index) => (
          <CoursePreviewCard
            key={item.majorCourse.id}
            item={item}
            order={index + 1}
            variant={variant}
          />
        ))}
      </div>
    </div>
  );
}

interface CoursePreviewCardProps {
  item: CoursePreviewItem;
  order: number;
  variant: 'required' | 'elective';
}

function CoursePreviewCard({ item, order, variant }: CoursePreviewCardProps): JSX.Element {
  const { course } = item;

  return (
    <div className="flex items-start gap-3 p-3 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors">
      {/* Order number */}
      <div
        className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium ${
          variant === 'required'
            ? 'bg-primary-100 text-primary-700'
            : 'bg-secondary-200 text-secondary-600'
        }`}
      >
        {order}
      </div>

      {/* Course info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h5 className="font-medium text-secondary-900 truncate">
            {course?.title || 'Môn học không tồn tại'}
          </h5>
          {variant === 'required' && (
            <Badge variant="primary" className="flex-shrink-0">
              Bắt buộc
            </Badge>
          )}
        </div>
        {course?.description && (
          <p className="mt-1 text-sm text-secondary-500 line-clamp-2">
            {course.description}
          </p>
        )}
        {course && (
          <div className="mt-2 flex items-center gap-4 text-xs text-secondary-400">
            <span className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {course.requiredSessions} buổi
            </span>
            <span className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              {course.requiredProjects} dự án
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Skeleton loading state for MajorCoursePreview
 */
function MajorCoursePreviewSkeleton(): JSX.Element {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="border-b border-secondary-200 pb-4">
        <Skeleton height={24} width="60%" className="mb-2" />
        <Skeleton height={16} width="40%" />
      </div>

      {/* Course items skeleton */}
      <div className="space-y-4">
        <Skeleton height={16} width={120} className="mb-3" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-start gap-3 p-3 bg-secondary-50 rounded-lg">
            <Skeleton width={28} height={28} rounded="full" />
            <div className="flex-1">
              <Skeleton height={20} width="70%" className="mb-2" />
              <SkeletonText lines={2} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

