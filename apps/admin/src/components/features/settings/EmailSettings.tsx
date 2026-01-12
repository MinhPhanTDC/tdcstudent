'use client';

import { useState } from 'react';
import { Button, FormError, FormSuccess, Spinner } from '@tdc/ui';
import { useEmailSettings, useConnectGmail, useDisconnectGmail } from '@/hooks/useEmailSettings';

interface EmailSettingsProps {
  /** Initial collapsed state */
  defaultCollapsed?: boolean;
}

/**
 * Format date to Vietnamese locale string
 */
function formatDate(date: Date | null): string {
  if (!date) return '';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * EmailSettings component - collapsible card for Gmail OAuth configuration
 * Requirements: 2.1, 2.3, 2.4, 2.5
 */
export function EmailSettings({ defaultCollapsed = false }: EmailSettingsProps): JSX.Element {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: settings, isLoading, error: fetchError } = useEmailSettings();
  const connectGmail = useConnectGmail();
  const disconnectGmail = useDisconnectGmail();

  const toggleCollapse = (): void => {
    setIsCollapsed((prev) => !prev);
  };

  const clearMessages = (): void => {
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  /**
   * Handle connect Gmail button click
   * Requirements: 2.2, 2.3
   * Note: In production, this would initiate OAuth flow
   * For MVP, we simulate with a prompt
   */
  const handleConnect = async (): Promise<void> => {
    clearMessages();
    
    // In production, this would redirect to Google OAuth
    // For MVP, we'll show a placeholder message
    const email = window.prompt('Nhập email Gmail để kết nối (MVP demo):');
    
    if (!email) {
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('Email không hợp lệ');
      return;
    }

    const result = await connectGmail.mutateAsync(email);
    
    if (result.success) {
      setSuccessMessage('Kết nối Gmail thành công');
    } else {
      setErrorMessage(result.error.message || 'Kết nối Gmail thất bại');
    }
  };

  /**
   * Handle disconnect Gmail button click
   * Requirements: 2.4
   */
  const handleDisconnect = async (): Promise<void> => {
    clearMessages();

    const confirmed = window.confirm(
      'Bạn có chắc muốn ngắt kết nối Gmail? Bạn sẽ không thể gửi email cho đến khi kết nối lại.'
    );

    if (!confirmed) {
      return;
    }

    const result = await disconnectGmail.mutateAsync();

    if (result.success) {
      setSuccessMessage('Đã ngắt kết nối Gmail');
    } else {
      setErrorMessage(result.error.message || 'Ngắt kết nối thất bại');
    }
  };

  /**
   * Handle test email button click
   * Requirements: 2.5
   */
  const handleTestEmail = async (): Promise<void> => {
    clearMessages();
    
    // Placeholder for test email functionality
    // In production, this would call an email service
    setSuccessMessage('Tính năng gửi email test sẽ được triển khai sau');
  };

  const isProcessing = connectGmail.isPending || disconnectGmail.isPending;

  return (
    <div className="rounded-lg border border-secondary-200 bg-white shadow-sm">
      {/* Header - clickable to toggle */}
      <button
        type="button"
        onClick={toggleCollapse}
        className="flex w-full items-center justify-between px-6 py-4 text-left hover:bg-secondary-50 transition-colors"
        aria-expanded={!isCollapsed}
        aria-controls="email-settings-content"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl" aria-hidden="true">📧</span>
          <h3 className="text-lg font-semibold text-secondary-900">Cấu hình Email</h3>
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
          id="email-settings-content"
          className="border-t border-secondary-200 px-6 py-6"
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner size="md" />
            </div>
          ) : fetchError ? (
            <FormError message="Không thể tải cấu hình email" />
          ) : (
            <div className="space-y-6">
              {/* Connection Status */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-secondary-700">Trạng thái:</span>
                  {settings?.gmailConnected ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-0.5 text-sm font-medium text-green-800">
                      <span className="h-2 w-2 rounded-full bg-green-500" aria-hidden="true" />
                      Đã kết nối
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-100 px-2.5 py-0.5 text-sm font-medium text-secondary-700">
                      <span className="h-2 w-2 rounded-full bg-secondary-400" aria-hidden="true" />
                      Chưa kết nối
                    </span>
                  )}
                </div>

                {/* Connected Email Info */}
                {settings?.gmailConnected && settings.gmailEmail && (
                  <div className="rounded-lg bg-secondary-50 p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-secondary-600">Email:</span>
                      <span className="text-sm font-medium text-secondary-900">
                        {settings.gmailEmail}
                      </span>
                    </div>
                    {settings.connectedAt && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-secondary-600">Kết nối lúc:</span>
                        <span className="text-sm text-secondary-900">
                          {formatDate(settings.connectedAt)}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Not Connected Message */}
                {!settings?.gmailConnected && (
                  <p className="text-sm text-secondary-500">
                    Kết nối tài khoản Gmail để gửi email thông báo cho học viên.
                  </p>
                )}
              </div>

              {/* Messages */}
              <FormError message={errorMessage} />
              <FormSuccess message={successMessage} />

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {settings?.gmailConnected ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={handleDisconnect}
                      loading={disconnectGmail.isPending}
                      disabled={isProcessing}
                    >
                      Ngắt kết nối
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={handleTestEmail}
                      disabled={isProcessing}
                    >
                      Test gửi email
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={handleConnect}
                    loading={connectGmail.isPending}
                    disabled={isProcessing}
                  >
                    Kết nối với Google
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
