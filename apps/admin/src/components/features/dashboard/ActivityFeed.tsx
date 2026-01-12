'use client';

import { Card } from '@tdc/ui';
import { useActivityFeed } from '@/hooks/useActivityFeed';
import type { Activity, ActivityType } from '@tdc/schemas';

/**
 * Activity feed skeleton for loading state
 */
function ActivityFeedSkeleton(): JSX.Element {
  return (
    <Card>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-5 w-32 bg-secondary-200 rounded animate-pulse" />
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-start gap-3 animate-pulse">
            <div className="h-8 w-8 rounded-full bg-secondary-200" />
            <div className="flex-1">
              <div className="h-4 w-48 bg-secondary-200 rounded mb-1" />
              <div className="h-3 w-24 bg-secondary-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/**
 * Get icon and color for activity type
 */
function getActivityTypeConfig(type: ActivityType): {
  icon: JSX.Element;
  bgColor: string;
  textColor: string;
} {
  switch (type) {
    case 'course_completed':
      return {
        icon: (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ),
        bgColor: 'bg-green-100',
        textColor: 'text-green-600',
      };
    case 'project_submitted':
      return {
        icon: (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        ),
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-600',
      };
    case 'login':
      return {
        icon: (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
            />
          </svg>
        ),
        bgColor: 'bg-purple-100',
        textColor: 'text-purple-600',
      };
    case 'lab_requirement_completed':
      return {
        icon: (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
            />
          </svg>
        ),
        bgColor: 'bg-orange-100',
        textColor: 'text-orange-600',
      };
    default:
      return {
        icon: (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ),
        bgColor: 'bg-secondary-100',
        textColor: 'text-secondary-600',
      };
  }
}

/**
 * Get activity description text
 */
function getActivityDescription(activity: Activity): string {
  switch (activity.type) {
    case 'course_completed':
      return `đã hoàn thành khóa học "${activity.details?.courseTitle || 'Unknown'}"`;
    case 'project_submitted':
      return `đã nộp bài "${activity.details?.projectTitle || 'Unknown'}"`;
    case 'login':
      return 'đã đăng nhập';
    case 'lab_requirement_completed':
      return `đã hoàn thành yêu cầu Lab "${activity.details?.requirementTitle || 'Unknown'}"`;
    default:
      return 'đã thực hiện một hoạt động';
  }
}

/**
 * Format timestamp to relative time
 */
function formatRelativeTime(timestamp: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - timestamp.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) {
    return 'Vừa xong';
  } else if (diffMin < 60) {
    return `${diffMin} phút trước`;
  } else if (diffHour < 24) {
    return `${diffHour} giờ trước`;
  } else if (diffDay < 7) {
    return `${diffDay} ngày trước`;
  } else {
    return timestamp.toLocaleDateString('vi-VN');
  }
}

/**
 * Single activity item component
 */
interface ActivityItemProps {
  activity: Activity;
}

function ActivityItem({ activity }: ActivityItemProps): JSX.Element {
  const config = getActivityTypeConfig(activity.type);
  const description = getActivityDescription(activity);
  const timeAgo = formatRelativeTime(activity.timestamp);

  return (
    <div className="flex items-start gap-3 py-2">
      <div className={`rounded-full p-2 ${config.bgColor} ${config.textColor}`}>
        {config.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-secondary-900">
          <span className="font-medium">{activity.userName}</span>{' '}
          <span className="text-secondary-600">{description}</span>
        </p>
        <p className="text-xs text-secondary-400 mt-0.5">{timeAgo}</p>
      </div>
    </div>
  );
}

/**
 * Props for ActivityFeed component
 */
export interface ActivityFeedProps {
  maxItems?: number;
}

/**
 * Activity feed component for displaying recent activities
 * Requirements: 6.1, 6.2, 6.3, 6.4
 */
export function ActivityFeed({ maxItems = 20 }: ActivityFeedProps): JSX.Element {
  const { activities, isLoading, error } = useActivityFeed(maxItems);

  // Error state
  if (error) {
    return (
      <Card>
        <div className="flex items-center gap-4">
          <div className="rounded-lg bg-red-100 p-3">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm text-secondary-500">Hoạt động gần đây</p>
            <p className="text-sm text-red-600">Không thể tải dữ liệu</p>
          </div>
        </div>
      </Card>
    );
  }

  // Loading state
  if (isLoading) {
    return <ActivityFeedSkeleton />;
  }

  // Empty state
  if (activities.length === 0) {
    return (
      <Card>
        <div className="text-center py-8">
          <svg
            className="mx-auto h-12 w-12 text-secondary-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <p className="mt-2 text-sm text-secondary-500">Chưa có hoạt động nào</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="space-y-1">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-secondary-900">
            Hoạt động gần đây
          </h3>
          <span className="text-xs text-secondary-400">
            Cập nhật realtime
          </span>
        </div>
        <div className="divide-y divide-secondary-100">
          {activities.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))}
        </div>
      </div>
    </Card>
  );
}
