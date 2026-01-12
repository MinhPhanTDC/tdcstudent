'use client';

import { Card } from '@tdc/ui';
import { usePresence } from '@/hooks/usePresence';

/**
 * Online counter skeleton for loading state
 */
function OnlineCounterSkeleton(): JSX.Element {
  return (
    <Card>
      <div className="flex items-center gap-4 animate-pulse">
        <div className="rounded-lg bg-secondary-200 p-3 h-12 w-12" />
        <div className="flex-1">
          <div className="h-4 w-32 bg-secondary-200 rounded mb-2" />
          <div className="h-6 w-20 bg-secondary-200 rounded" />
        </div>
      </div>
    </Card>
  );
}

/**
 * Props for OnlineCounter component
 */
export interface OnlineCounterProps {
  adminCount: number;
  studentCount: number;
}

/**
 * Individual count display component
 */
interface CountDisplayProps {
  label: string;
  count: number;
  dotColor: string;
}

function CountDisplay({ label, count, dotColor }: CountDisplayProps): JSX.Element {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-2 w-2 rounded-full ${dotColor} animate-pulse`} />
      <span className="text-sm text-secondary-600">{label}:</span>
      <span className="font-semibold text-secondary-900">{count}</span>
    </div>
  );
}

/**
 * Online counter component for displaying realtime online user counts
 * Requirements: 5.1, 5.4
 */
export function OnlineCounter(): JSX.Element {
  const { onlineCount, isConnected, error } = usePresence();

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
            <p className="text-sm text-secondary-500">Trạng thái kết nối</p>
            <p className="text-sm text-red-600">Không thể kết nối</p>
          </div>
        </div>
      </Card>
    );
  }

  // Loading state
  if (!isConnected) {
    return <OnlineCounterSkeleton />;
  }

  const totalOnline = onlineCount.admin + onlineCount.student;

  return (
    <Card>
      <div className="flex items-center gap-4">
        <div className="rounded-lg bg-green-100 p-3">
          <svg
            className="h-6 w-6 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm text-secondary-500">Đang online</p>
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          </div>
          <p className="text-2xl font-bold text-secondary-900 mb-2">{totalOnline}</p>
          <div className="flex flex-wrap gap-4">
            <CountDisplay
              label="Admin"
              count={onlineCount.admin}
              dotColor="bg-purple-500"
            />
            <CountDisplay
              label="Học viên"
              count={onlineCount.student}
              dotColor="bg-blue-500"
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
