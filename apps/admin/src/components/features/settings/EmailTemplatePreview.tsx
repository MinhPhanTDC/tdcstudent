'use client';

import { useState, useEffect } from 'react';
import { Button, Modal, Spinner, FormError } from '@tdc/ui';
import { PLACEHOLDER_INFO, type Placeholder, VALID_PLACEHOLDERS } from '@tdc/schemas';
import { usePreviewEmailTemplate, useEmailTemplate } from '@/hooks/useEmailTemplates';

/**
 * Default sample data for email preview
 * Requirements: 3.5
 */
const DEFAULT_SAMPLE_DATA: Record<Placeholder, string> = {
  name: 'Nguyễn Văn A',
  email: 'nguyenvana@example.com',
  password: 'TDC2026@abc',
  login_url: 'https://auth.thedesigncouncil.com',
  timestamp: new Date().toLocaleString('vi-VN'),
  semester: 'Học kỳ 1 - 2026',
  course_name: 'Design Fundamentals',
  admin_name: 'Admin TDC',
};

interface EmailTemplatePreviewProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Template ID to preview */
  templateId: string | null;
}

/**
 * EmailTemplatePreview component - Modal showing rendered email with sample data
 * Requirements: 3.5
 */
export function EmailTemplatePreview({
  isOpen,
  onClose,
  templateId,
}: EmailTemplatePreviewProps): JSX.Element {
  const [sampleData, setSampleData] = useState<Record<string, string>>(DEFAULT_SAMPLE_DATA);
  const [previewSubject, setPreviewSubject] = useState<string>('');
  const [previewBody, setPreviewBody] = useState<string>('');
  const [missingPlaceholders, setMissingPlaceholders] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: template, isLoading: isLoadingTemplate } = useEmailTemplate(templateId);
  const previewMutation = usePreviewEmailTemplate();

  // Generate preview when modal opens or sample data changes
  useEffect(() => {
    const generatePreview = async (): Promise<void> => {
      if (!templateId) return;

      setErrorMessage(null);
      const result = await previewMutation.mutateAsync({
        id: templateId,
        sampleData,
      });

      if (result.success) {
        setPreviewSubject(result.data.subject);
        setPreviewBody(result.data.body);
        setMissingPlaceholders(result.data.missingPlaceholders);
      } else {
        setErrorMessage(result.error.message || 'Không thể tạo preview');
      }
    };

    if (isOpen && templateId) {
      generatePreview();
    }
  }, [isOpen, templateId, sampleData, previewMutation]);

  /**
   * Handle sample data change
   */
  const handleSampleDataChange = (key: string, value: string): void => {
    setSampleData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  /**
   * Reset sample data to defaults
   */
  const handleResetSampleData = (): void => {
    setSampleData(DEFAULT_SAMPLE_DATA);
  };

  const isLoading = isLoadingTemplate || previewMutation.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Preview: ${template?.name ?? 'Email Template'}`}
      size="xl"
      footer={
        <Button variant="outline" onClick={onClose}>
          Đóng
        </Button>
      }
    >
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner size="md" />
          </div>
        ) : (
          <>
            {/* Sample Data Editor */}
            <SampleDataEditor
              sampleData={sampleData}
              templatePlaceholders={template?.placeholders ?? []}
              onChange={handleSampleDataChange}
              onReset={handleResetSampleData}
            />

            {/* Error Message */}
            <FormError message={errorMessage} />

            {/* Missing Placeholders Warning */}
            {missingPlaceholders.length > 0 && (
              <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-3">
                <p className="text-sm text-yellow-800">
                  <span className="font-medium">Cảnh báo:</span> Các placeholder sau không có
                  giá trị: {missingPlaceholders.map((p) => `{${p}}`).join(', ')}
                </p>
              </div>
            )}

            {/* Preview Content */}
            <div className="space-y-4">
              {/* Subject Preview */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-secondary-700">
                  Tiêu đề email
                </label>
                <div className="rounded-lg border border-secondary-200 bg-secondary-50 px-4 py-3">
                  <p className="text-sm font-medium text-secondary-900">{previewSubject}</p>
                </div>
              </div>

              {/* Body Preview */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-secondary-700">
                  Nội dung email
                </label>
                <div className="rounded-lg border border-secondary-200 bg-white p-4 max-h-80 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm text-secondary-800 font-sans">
                    {previewBody}
                  </pre>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

interface SampleDataEditorProps {
  sampleData: Record<string, string>;
  templatePlaceholders: string[];
  onChange: (key: string, value: string) => void;
  onReset: () => void;
}

/**
 * Sample data editor component for customizing preview values
 */
function SampleDataEditor({
  sampleData,
  templatePlaceholders,
  onChange,
  onReset,
}: SampleDataEditorProps): JSX.Element {
  const [isExpanded, setIsExpanded] = useState(false);

  // Only show placeholders used in the template
  const relevantPlaceholders = templatePlaceholders.length > 0
    ? templatePlaceholders
    : VALID_PLACEHOLDERS;

  return (
    <div className="rounded-lg border border-secondary-200 bg-secondary-50">
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-secondary-700 hover:bg-secondary-100 transition-colors"
      >
        <span>⚙️ Tùy chỉnh dữ liệu mẫu</span>
        <svg
          className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isExpanded && (
        <div className="border-t border-secondary-200 px-4 py-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {relevantPlaceholders.map((placeholder) => {
              const info = PLACEHOLDER_INFO[placeholder as Placeholder];
              return (
                <div key={placeholder} className="space-y-1">
                  <label
                    htmlFor={`sample-${placeholder}`}
                    className="block text-xs font-medium text-secondary-600"
                  >
                    {`{${placeholder}}`} - {info?.description ?? placeholder}
                  </label>
                  <input
                    id={`sample-${placeholder}`}
                    type="text"
                    value={sampleData[placeholder] ?? ''}
                    onChange={(e) => onChange(placeholder, e.target.value)}
                    className="w-full rounded border border-secondary-300 bg-white px-2.5 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                    placeholder={info?.example ?? ''}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex justify-end">
            <Button variant="ghost" size="sm" onClick={onReset}>
              Đặt lại mặc định
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
