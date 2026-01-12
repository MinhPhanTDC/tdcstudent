'use client';

import { Card } from '@tdc/ui';

export interface ProgressStatsProps {
  /** Total number of courses */
  totalCourses: number;
  /** Number of completed courses */
  completedCourses: number;
  /** Total number of projects */
  totalProjects: number;
  /** Number of submitted projects */
  submittedProjects: number;
}

/**
 * ProgressStats component - displays overall progress statistics
 * Requirements: 5.3
 */
export function ProgressStats({
  totalCourses,
  completedCourses,
  totalProjects,
  submittedProjects,
}: ProgressStatsProps): JSX.Element {
  const stats = [
    {
      label: 'Tổng môn học',
      value: totalCourses,
      icon: (
        <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      bgColor: 'bg-primary-100',
    },
    {
      label: 'Đã hoàn thành',
      value: completedCourses,
      icon: (
        <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgColor: 'bg-green-100',
    },
    {
      label: 'Dự án đã nộp',
      value: `${submittedProjects}/${totalProjects}`,
      icon: (
        <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      bgColor: 'bg-yellow-100',
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <div className="flex items-center gap-4">
            <div className={`rounded-lg p-3 ${stat.bgColor}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm text-secondary-500">{stat.label}</p>
              <p className="text-2xl font-bold text-secondary-900">{stat.value}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
