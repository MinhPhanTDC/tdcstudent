'use client';

import { useState } from 'react';
import { PasswordChangeForm } from './PasswordChangeForm';

interface AccountSettingsProps {
  /** Initial collapsed state */
  defaultCollapsed?: boolean;
}

/**
 * AccountSettings component - collapsible card with password change form
 * Requirements: 7.1, 7.4
 */
export function AccountSettings({ defaultCollapsed = false }: AccountSettingsProps): JSX.Element {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  const toggleCollapse = (): void => {
    setIsCollapsed((prev) => !prev);
  };

  return (
    <div className="rounded-lg border border-secondary-200 bg-white shadow-sm">
      {/* Header - clickable to toggle */}
      <button
        type="button"
        onClick={toggleCollapse}
        className="flex w-full items-center justify-between px-6 py-4 text-left hover:bg-secondary-50 transition-colors"
        aria-expanded={!isCollapsed}
        aria-controls="account-settings-content"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl" aria-hidden="true">👤</span>
          <h3 className="text-lg font-semibold text-secondary-900">Tài khoản</h3>
        </div>
        <svg
          className={`h-5 w-5 text-secondary-500 transition-transform duration-200 ${
            isCollapsed ? '' : 'rotate-180'
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Content - collapsible */}
      {!isCollapsed && (
        <div
          id="account-settings-content"
          className="border-t border-secondary-200 px-6 py-6"
        >
          <div className="mb-4">
            <h4 className="text-base font-medium text-secondary-800">Đổi mật khẩu</h4>
            <p className="mt-1 text-sm text-secondary-500">
              Cập nhật mật khẩu để bảo mật tài khoản của bạn
            </p>
          </div>
          <PasswordChangeForm />
        </div>
      )}
    </div>
  );
}
