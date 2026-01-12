'use client';

import { Avatar, Button } from '@tdc/ui';
import { useAuth } from '@/contexts/AuthContext';

export function StudentHeader(): JSX.Element {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-secondary-200 bg-white px-6">
      <div>{/* Breadcrumb or page title can go here */}</div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <Avatar name={user?.displayName} size="sm" />
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-secondary-900">{user?.displayName}</p>
            <p className="text-xs text-secondary-500">{user?.email}</p>
          </div>
        </div>

        <Button variant="ghost" size="sm" onClick={logout}>
          Đăng xuất
        </Button>
      </div>
    </header>
  );
}
