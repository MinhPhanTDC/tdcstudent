'use client';

import { useState } from 'react';
import {
  AccountSettings,
  EmailSettings,
  EmailTemplateEditor,
  EmailTemplatePreview,
} from '@/components/features/settings';

/**
 * Admin Settings page
 * Layout with 3 collapsible sections: Account, Email Config, Email Templates
 * Requirements: 7.1, 7.2
 */
export default function SettingsPage(): JSX.Element {
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  /**
   * Handle preview request from EmailTemplateEditor
   * Requirements: 3.5
   */
  const handlePreview = (templateId: string): void => {
    setPreviewTemplateId(templateId);
    setIsPreviewOpen(true);
  };

  /**
   * Handle preview modal close
   */
  const handleClosePreview = (): void => {
    setIsPreviewOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Cài đặt</h1>
        <p className="mt-1 text-sm text-secondary-500">
          Quản lý tài khoản, cấu hình email và các thiết lập hệ thống
        </p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-4">
        {/* Account Settings - Password Change */}
        <AccountSettings />

        {/* Email Configuration - Gmail OAuth */}
        <EmailSettings />

        {/* Email Templates - Template Editor */}
        <EmailTemplateEditor onPreview={handlePreview} />
      </div>

      {/* Email Template Preview Modal */}
      <EmailTemplatePreview
        isOpen={isPreviewOpen}
        onClose={handleClosePreview}
        templateId={previewTemplateId}
      />
    </div>
  );
}
