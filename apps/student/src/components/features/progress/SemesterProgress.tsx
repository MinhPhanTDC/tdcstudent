'use client';

import { useState } from 'react';
import { Card, Badge, cn } from '@tdc/ui';
import type { Course, StudentProgress } from '@tdc/schemas';
import { CourseProgressItem } from './CourseProgressItem';

export interface SemesterCourse {
  course: Course;
  progress: StudentProgress | null;
  status: 'completed' | 'in_progress' | 'locked';
}

export interface SemesterProgressProps {
  /** Semester ID */
  semesterId: string;
  /** Semester name */
  semesterName: string;
  /** Semester status */
  status: 'completed' | 'in_progress' | 'locked';
  /** Courses in this semester with progress */
  courses: SemesterCourse[];
  /** Whether the section is initially expanded */
  defaultExpanded?: boolean;
}

/**
 * SemesterProgress component - displays semester with expandable section
 * Shows courses when expanded
 * Requirements: 4.4, 4.5
 */
export function SemesterProgress({
  semesterId,
  semesterName,
  status,
  courses,
  defaultExpanded = false,
}: SemesterProgressProps): JSX.Element {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const completedCount = courses.filter((c) => c.status === 'completed').length;
  const totalCount = courses.length;
  const progressPercentage = totalCount > 0 
    ? Math.round((completedCount / totalCount) * 100) 
    : 0;

  const statusConfig = {
    completed: {
      badge: 'success' as const,
      label: 'Hoàn thành',
      icon: (
        <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    in_progress: {
      badge: 'primary' as const,
      label: 'Đang học',
      icon: (
        <svg className="h-5 w-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    locked: {
      badge: 'default' as const,
      label: 'Chưa mở',
      icon: (
        <svg className="h-5 w-5 text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
    },
  };

  const config = statusConfig[status];

  return (
    <Card className={cn(status === 'locked' && 'opacity-60')}>
      <button
        type="button"
        className="w-full text-left"
        onClick={() => setIsExpanded(!isExpanded)}
        disabled={status === 'locked'}
        aria-expanded={isExpanded}
        aria-controls={`semester-${semesterId}-courses`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {config.icon}
            <div>
              <h3 className="font-semibold text-secondary-900">{semesterName}</h3>
              <p className="text-sm text-secondary-500">
                {completedCount}/{totalCount} môn học • {progressPercentage}% hoàn thành
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={config.badge}>{config.label}</Badge>
            {status !== 'locked' && (
              <svg
                className={cn(
                  'h-5 w-5 text-secondary-400 transition-transform',
                  isExpanded && 'rotate-180'
                )}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </div>
        </div>
      </button>

      {isExpanded && status !== 'locked' && (
        <div
          id={`semester-${semesterId}-courses`}
          className="mt-4 space-y-3 border-t border-secondary-100 pt-4"
        >
          {courses.length === 0 ? (
            <p className="text-sm text-secondary-500 text-center py-2">
              Chưa có môn học nào trong học kỳ này
            </p>
          ) : (
            courses.map((courseData) => (
              <CourseProgressItem
                key={courseData.course.id}
                course={courseData.course}
                progress={courseData.progress}
                status={courseData.status}
              />
            ))
          )}
        </div>
      )}
    </Card>
  );
}
