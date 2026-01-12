'use client';

import { Card, Input, Avatar } from '@tdc/ui';
import { useAuth } from '@/contexts/AuthContext';
import { PasswordChangeSection } from '@/components/features/profile';

/**
 * Profile page - displays user profile information and password change section
 * Requirements: 10.1
 */
export default function ProfilePage(): JSX.Element {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-secondary-900">Hồ sơ cá nhân</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <Avatar name={user?.displayName} size="xl" />
            <h2 className="mt-4 text-lg font-semibold text-secondary-900">
              {user?.displayName}
            </h2>
            <p className="text-sm text-secondary-500">{user?.email}</p>
          </div>
        </Card>

        <Card title="Thông tin cá nhân" className="lg:col-span-2">
          <form className="space-y-4">
            <Input
              label="Họ và tên"
              defaultValue={user?.displayName}
              disabled
            />
            <Input
              label="Email"
              type="email"
              defaultValue={user?.email}
              disabled
            />
            <p className="text-sm text-secondary-500">
              Liên hệ admin để cập nhật thông tin cá nhân
            </p>
          </form>
        </Card>
      </div>

      {/* Password Change Section - Requirements: 10.1, 10.2 */}
      <PasswordChangeSection />
    </div>
  );
}
