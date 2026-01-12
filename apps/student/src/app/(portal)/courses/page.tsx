'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, EmptyState, Badge, Spinner } from '@tdc/ui';
import { useMyCourses } from '@/hooks/useMyCourses';

export default function CoursesPage(): JSX.Element {
  const { data: courses = [], isLoading } = useMyCourses();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-secondary-900">Khóa học của tôi</h1>

      {courses.length === 0 ? (
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
            title="Chưa có khóa học"
            description="Bạn chưa được đăng ký khóa học nào"
          />
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Link key={course.id} href={`/courses/${course.id}`}>
              <Card className="h-full transition-shadow hover:shadow-md">
                {course.thumbnailUrl && (
                  <div className="relative -mx-6 -mt-6 mb-4 aspect-video w-[calc(100%+3rem)] overflow-hidden rounded-t-lg">
                    <Image
                      src={course.thumbnailUrl}
                      alt={course.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-secondary-900">{course.title}</h3>
                    <Badge variant={course.progress === 100 ? 'success' : 'primary'}>
                      {course.progress}%
                    </Badge>
                  </div>
                  <p className="line-clamp-2 text-sm text-secondary-500">
                    {course.description || 'Không có mô tả'}
                  </p>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary-200">
                    <div
                      className="h-full rounded-full bg-primary-600"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-secondary-500">
                    {course.lessons.length} bài học
                  </p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
