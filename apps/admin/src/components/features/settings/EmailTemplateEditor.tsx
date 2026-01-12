'use client';

import { useState, useEffect, useRef } from 'react';
import { Button, Input, Select, FormError, FormSuccess, Spinner } from '@tdc/ui';
import {
  PLACEHOLDER_INFO,
  VALID_PLACEHOLDERS,
  type Placeholder,
} from '@tdc/schemas';
import {
  useEmailTemplates,
  useEmailTemplate,
  useUpdateEmailTemplate,
} from '@/hooks/useEmailTemplates';

interface EmailTemplateEditorProps {
  /** Initial collapsed state */
  defaultCollapsed?: boolean;
  /** Callback when preview is requested */
  onPreview?: (templateId: string) => void;
}

/**
 * EmailTemplateEditor component - collapsible card for editing email templates
 * Requirements: 3.2, 3.3, 3.4
 */
export function EmailTemplateEditor({
  defaultCollapsed = false,
  onPreview,
}: EmailTemplateEditorProps): JSX.Element {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const { data: templates, isLoading: isLoadingTemplates } = useEmailTemplates();
  const { data: selectedTemplate, isLoading: isLoadingTemplate } =
    useEmailTemplate(selectedTemplateId);
  const updateTemplate = useUpdateEmailTemplate();

  // Update form when template is loaded
  useEffect(() => {
    if (selectedTemplate) {
      setSubject(selectedTemplate.subject);
      setBody(selectedTemplate.body);
      setIsDirty(false);
    }
  }, [selectedTemplate]);

  // Auto-select first template when templates load
  useEffect(() => {
    if (templates && templates.length > 0 && !selectedTemplateId) {
      setSelectedTemplateId(templates[0].id);
    }
  }, [templates, selectedTemplateId]);

  const toggleCollapse = (): void => {
    setIsCollapsed((prev) => !prev);
  };

  const clearMessages = (): void => {
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  /**
   * Handle template selection change
   * Requirements: 3.2
   */
  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const newId = e.target.value;
    if (isDirty) {
      const confirmed = window.confirm(
        'Bạn có thay đổi chưa lưu. Bạn có chắc muốn chuyển template?'
      );
      if (!confirmed) return;
    }
    setSelectedTemplateId(newId);
    clearMessages();
  };

  /**
   * Handle subject change
   */
  const handleSubjectChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSubject(e.target.value);
    setIsDirty(true);
    clearMessages();
  };

  /**
   * Handle body change
   */
  const handleBodyChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setBody(e.target.value);
    setIsDirty(true);
    clearMessages();
  };

  /**
   * Insert placeholder at cursor position
   * Requirements: 3.4
   */
  const insertPlaceholder = (placeholder: Placeholder): void => {
    const textarea = bodyRef.current;
    if (!textarea) return;

    const placeholderText = `{${placeholder}}`;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const newBody = body.substring(0, start) + placeholderText + body.substring(end);
    setBody(newBody);
    setIsDirty(true);
    clearMessages();

    // Restore focus and set cursor position after placeholder
    setTimeout(() => {
      textarea.focus();
      const newPosition = start + placeholderText.length;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  /**
   * Handle save template
   * Requirements: 3.6
   */
  const handleSave = async (): Promise<void> => {
    if (!selectedTemplateId) return;

    clearMessages();

    const result = await updateTemplate.mutateAsync({
      id: selectedTemplateId,
      data: { subject, body },
    });

    if (result.success) {
      setSuccessMessage('Đã lưu template thành công');
      setIsDirty(false);
    } else {
      setErrorMessage(result.error.message || 'Lưu template thất bại');
    }
  };

  /**
   * Handle preview button click
   * Requirements: 3.5
   */
  const handlePreview = (): void => {
    if (selectedTemplateId && onPreview) {
      onPreview(selectedTemplateId);
    }
  };

  const templateOptions =
    templates?.map((t) => ({
      value: t.id,
      label: t.name,
    })) ?? [];

  const isSaving = updateTemplate.isPending;

  return (
    <div className="rounded-lg border border-secondary-200 bg-white shadow-sm">
      {/* Header - clickable to toggle */}
      <button
        type="button"
        onClick={toggleCollapse}
        className="flex w-full items-center justify-between px-6 py-4 text-left hover:bg-secondary-50 transition-colors"
        aria-expanded={!isCollapsed}
        aria-controls="email-template-editor-content"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl" aria-hidden="true">📝</span>
          <h3 className="text-lg font-semibold text-secondary-900">Email Templates</h3>
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
          id="email-template-editor-content"
          className="border-t border-secondary-200 px-6 py-6"
        >
          {isLoadingTemplates ? (
            <div className="flex items-center justify-center py-8">
              <Spinner size="md" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Template Selector */}
              <Select
                label="Chọn template"
                options={templateOptions}
                value={selectedTemplateId ?? ''}
                onChange={handleTemplateChange}
                placeholder="Chọn template..."
              />

              {isLoadingTemplate ? (
                <div className="flex items-center justify-center py-4">
                  <Spinner size="sm" />
                </div>
              ) : selectedTemplate ? (
                <>
                  {/* Subject Input */}
                  <Input
                    label="Tiêu đề email"
                    value={subject}
                    onChange={handleSubjectChange}
                    placeholder="Nhập tiêu đề email..."
                  />

                  {/* Placeholder Buttons */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-secondary-700">
                      Chèn placeholder
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {VALID_PLACEHOLDERS.map((placeholder) => (
                        <button
                          key={placeholder}
                          type="button"
                          onClick={() => insertPlaceholder(placeholder)}
                          className="inline-flex items-center rounded-md bg-secondary-100 px-2.5 py-1 text-xs font-medium text-secondary-700 hover:bg-secondary-200 transition-colors"
                          title={PLACEHOLDER_INFO[placeholder].description}
                        >
                          {`{${placeholder}}`}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-secondary-500">
                      Click vào placeholder để chèn vào vị trí con trỏ trong nội dung email
                    </p>
                  </div>

                  {/* Body Textarea */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="email-body"
                      className="block text-sm font-medium text-secondary-700"
                    >
                      Nội dung email
                    </label>
                    <textarea
                      ref={bodyRef}
                      id="email-body"
                      value={body}
                      onChange={handleBodyChange}
                      rows={12}
                      className="w-full rounded border border-secondary-300 bg-white px-3 py-2 text-sm font-mono transition-colors placeholder:text-secondary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                      placeholder="Nhập nội dung email..."
                    />
                  </div>

                  {/* Placeholder Reference */}
                  <PlaceholderReference />

                  {/* Messages */}
                  <FormError message={errorMessage} />
                  <FormSuccess message={successMessage} />

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant="outline"
                      onClick={handlePreview}
                      disabled={isSaving || !onPreview}
                    >
                      Preview
                    </Button>
                    <Button
                      onClick={handleSave}
                      loading={isSaving}
                      disabled={!isDirty || isSaving}
                    >
                      Lưu template
                    </Button>
                  </div>
                </>
              ) : (
                <p className="text-sm text-secondary-500">
                  Chọn một template để bắt đầu chỉnh sửa
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Placeholder reference table component
 * Requirements: 3.3, 4.4
 */
function PlaceholderReference(): JSX.Element {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="rounded-lg border border-secondary-200 bg-secondary-50">
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-secondary-700 hover:bg-secondary-100 transition-colors"
      >
        <span>📋 Danh sách placeholder</span>
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
        <div className="border-t border-secondary-200 px-4 py-3">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-secondary-600">
                <th className="pb-2 font-medium">Placeholder</th>
                <th className="pb-2 font-medium">Mô tả</th>
                <th className="pb-2 font-medium">Ví dụ</th>
              </tr>
            </thead>
            <tbody className="text-secondary-700">
              {VALID_PLACEHOLDERS.map((placeholder) => (
                <tr key={placeholder} className="border-t border-secondary-200">
                  <td className="py-2 font-mono text-xs">{`{${placeholder}}`}</td>
                  <td className="py-2">{PLACEHOLDER_INFO[placeholder].description}</td>
                  <td className="py-2 text-secondary-500">
                    {PLACEHOLDER_INFO[placeholder].example}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
