'use client';

import { DashboardStats } from '@/components/features/dashboard/DashboardStats';
import { RecentStudents } from '@/components/features/dashboard/RecentStudents';
import { QuickActions } from '@/components/features/dashboard/QuickActions';
import { OnlineCounter } from '@/components/features/dashboard/OnlineCounter';
import { ActivityFeed } from '@/components/features/dashboard/ActivityFeed';

/**
 * Admin Dashboard Page
 * Requirements: 5.1, 5.2, 5.3, 5.4, 6.1
 */
export default function DashboardPage(): JSX.Element {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-secondary-900">Dashboard</h1>
      </div>

      {/* Realtime Section - Requirements: 5.1, 6.1 */}
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Online Counter - Requirements: 5.1 */}
        <div className="lg:col-span-1">
          <OnlineCounter />
        </div>

        {/* Statistics Cards Section - Requirements: 5.1, 5.2 */}
        <div className="lg:col-span-3">
          <DashboardStats />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Students Section - Requirements: 5.3 */}
        <div className="lg:col-span-2">
          <RecentStudents />
        </div>

        {/* Quick Actions Section - Requirements: 5.4 */}
        <div>
          <QuickActions />
        </div>
      </div>

      {/* Activity Feed Section - Requirements: 6.1 */}
      <div className="grid gap-6 lg:grid-cols-1">
        <ActivityFeed maxItems={20} />
      </div>
    </div>
  );
}
