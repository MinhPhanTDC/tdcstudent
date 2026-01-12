'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button, cn } from '@tdc/ui';

export interface ProjectLinksEditorProps {
  /** Current list of project links */
  value: string[];
  /** Callback when links change - triggers auto-save */
  onChange: (links: string[]) => void;
  /** Callback when editor should close */
  onClose: () => void;
  /** Whether the editor is currently saving */
  isSaving?: boolean;
  /** Error message to display */
  error?: string | null;
  /** Additional class name */
  className?: string;
}

/**
 * Validate URL format
 * Requirements: 2.6
 */
function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Inline editor for project links
 * Requirements: 2.6
 * 
 * Features:
 * - List existing links
 * - Add new link input with URL validation
 * - Remove link button
 */
export function ProjectLinksEditor({
  value,
  onChange,
  onClose,
  isSaving = false,
  error = null,
  className,
}: ProjectLinksEditorProps): JSX.Element {
  const editorRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [newLink, setNewLink] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);

  /**
   * Handle click outside to close editor
   */
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (editorRef.current && !editorRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  /**
   * Handle escape key to close editor
   */
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  /**
   * Focus input on mount
   */
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  /**
   * Handle adding a new link
   * Requirements: 2.6 - URL validation
   */
  const handleAddLink = useCallback(() => {
    const trimmedLink = newLink.trim();
    
    if (!trimmedLink) {
      setInputError('Vui lòng nhập link');
      return;
    }

    if (!isValidUrl(trimmedLink)) {
      setInputError('Link không hợp lệ. Vui lòng nhập URL đầy đủ (http:// hoặc https://)');
      return;
    }

    if (value.includes(trimmedLink)) {
      setInputError('Link này đã tồn tại');
      return;
    }

    setInputError(null);
    setNewLink('');
    onChange([...value, trimmedLink]);
  }, [newLink, value, onChange]);

  /**
   * Handle removing a link
   */
  const handleRemoveLink = useCallback(
    (linkToRemove: string) => {
      onChange(value.filter((link) => link !== linkToRemove));
    },
    [value, onChange]
  );

  /**
   * Handle input change
   */
  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setNewLink(event.target.value);
      if (inputError) {
        setInputError(null);
      }
    },
    [inputError]
  );

  /**
   * Handle Enter key to add link
   */
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        handleAddLink();
      }
    },
    [handleAddLink]
  );

  /**
   * Truncate URL for display
   */
  const truncateUrl = (url: string, maxLength: number = 40): string => {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength - 3) + '...';
  };

  return (
    <div
      ref={editorRef}
      className={cn(
        'absolute z-10 w-80 rounded-md border border-secondary-200 bg-white p-3 shadow-lg',
        className
      )}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-secondary-700">
            Link dự án
          </label>
          <span className="text-xs text-secondary-400">
            {value.length} link(s)
          </span>
        </div>

        {/* Existing links list */}
        {value.length > 0 && (
          <ul className="max-h-32 space-y-1 overflow-y-auto">
            {value.map((link, index) => (
              <li
                key={`${link}-${index}`}
                className="flex items-center justify-between gap-2 rounded bg-secondary-50 px-2 py-1"
              >
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate text-xs text-primary-600 hover:underline"
                  title={link}
                >
                  {truncateUrl(link)}
                </a>
                <button
                  type="button"
                  onClick={() => handleRemoveLink(link)}
                  disabled={isSaving}
                  className={cn(
                    'flex-shrink-0 rounded p-0.5 text-secondary-400 hover:bg-secondary-200 hover:text-red-600',
                    isSaving && 'cursor-not-allowed opacity-50'
                  )}
                  aria-label={`Xóa link ${link}`}
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Empty state */}
        {value.length === 0 && (
          <p className="text-center text-xs text-secondary-400">
            Chưa có link nào
          </p>
        )}

        {/* Add new link input */}
        <div className="flex flex-col gap-1">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="url"
              value={newLink}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={isSaving}
              placeholder="https://example.com/project"
              className={cn(
                'flex-1 rounded border px-2 py-1.5 text-sm',
                'focus:outline-none focus:ring-2 focus:ring-primary-500',
                inputError
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-secondary-300',
                isSaving && 'cursor-wait opacity-50'
              )}
              aria-label="Nhập link dự án mới"
              aria-invalid={!!inputError}
            />
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleAddLink}
              disabled={isSaving || !newLink.trim()}
              loading={isSaving}
            >
              Thêm
            </Button>
          </div>

          {/* Input validation error */}
          {inputError && (
            <p className="text-xs text-red-600" role="alert">
              {inputError}
            </p>
          )}
        </div>

        {/* Global error message */}
        {error && (
          <p className="text-xs text-red-600" role="alert">
            {error}
          </p>
        )}

        {/* Saving indicator */}
        {isSaving && (
          <p className="text-xs text-secondary-500">
            Đang lưu...
          </p>
        )}

        {/* Close button */}
        <div className="flex justify-end border-t border-secondary-100 pt-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isSaving}
          >
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
}
