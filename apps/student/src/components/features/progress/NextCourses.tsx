'use client';

import { Card, Badge } from '@tdc/ui';
import type { Course } from '@tdc/schemas';

export interface NextCoursesProps {
  /** List of upcoming courses */
  courses: Course[];
}

/**
 * NextCourses component - displays upcoming courses to be unlocked
 * Requirements: 5.5
 */
export function NextCourses({ courses }: NextCoursesProps): JSX.Element {
  if (courses.length === 0) {
    return (
      <Card>
        <div className="text-center py-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="mt-3 text-lg font-medium text-secondary-900">
            Hoàn thành tất cả!
          </h3>
          <p className="mt-1 text-sm text-secondary-500">
            Bạn đã hoàn thành tất cả các môn học.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-secondary-900">
            Môn học tiếp theo
          </h3>
          <Badge variant="default">{courses.length} môn</Badge>
        </div>

        <div className="space-y-3">
          {courses.map((course, index) => (
            <div
              key={course.id}
              className="flex items-center gap-3 rounded-lg border border-secondary-200 p-3"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary-100 text-sm font-medium text-secondary-600">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-secondary-900 truncate">
                  {course.title}
                </p>
                <div className="flex items-center gap-3 text-xs text-secondary-500">
                  <span className="flex items-center gap-1">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    {course.requiredSessions} buổi
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {course.requiredProjects} dự án
                  </span>
                </div>
              </div>
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-secondary-500 italic">
          Hoàn thành môn học hiện tại để mở khóa các môn tiếp theo.
        </p>
      </div>
    </Card>
  );
}
