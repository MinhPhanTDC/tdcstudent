'use client';

import { useState, useEffect } from 'react';
import { Flipbook, Skeleton } from '@tdc/ui';
import { handbookService } from '@tdc/firebase';
import type { HandbookSettings } from '@tdc/schemas';

/**
 * HandbookViewer component props
 * Requirements: 8.1, 8.3
 */
export interface HandbookViewerProps {
  /** Additional class names */
  className?: string;
  /** Width of the flipbook (default: 350) */
  width?: number;
  /** Height of the flipbook (default: 495) */
  height?: number;
  /** Show page numbers */
  showPageNumbers?: boolean;
}

/**
 * HandbookViewer component
 * Fetches handbook URL and renders Flipbook
 * Requirements: 8.1, 8.3
 */
export function HandbookViewer({
  className,
  width = 350,
  height = 495,
  showPageNumbers = true,
}: HandbookViewerProps): React.ReactElement {
  const [handbook, setHandbook] = useState<HandbookSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHandbook() {
      try {
        setIsLoading(true);
        setError(null);
        
        const result = await handbookService.getHandbook();
        
        if (result.success) {
          setHandbook(result.data);
        } else {
          // Check if it's a "not found" error (no handbook uploaded yet)
          if (result.error.details?.code === 'HANDBOOK_NOT_FOUND') {
            setHandbook(null);
          } else {
            setError(result.error.message || 'Không thể tải sổ tay');
          }
        }
      } catch (err) {
        setError('Không thể tải sổ tay');
      } finally {
        setIsLoading(false);
      }
    }

    fetchHandbook();
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className={className} style={{ width, height }}>
        <Skeleton width={width} height={height} rounded="lg" />
        <p className="mt-2 text-center text-sm text-secondary-500">
          Đang tải sổ tay...
        </p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-secondary-100 rounded-lg ${className || ''}`}
        style={{ width, height }}
      >
        <svg
          className="w-12 h-12 text-secondary-400 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <p className="text-sm text-secondary-600">{error}</p>
      </div>
    );
  }

  // No handbook uploaded yet
  if (!handbook) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-secondary-50 rounded-lg border-2 border-dashed border-secondary-200 ${className || ''}`}
        style={{ width, height }}
      >
        <svg
          className="w-16 h-16 text-secondary-300 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
        <p className="text-sm text-secondary-500 text-center px-4">
          Sổ tay học viên chưa được tải lên
        </p>
      </div>
    );
  }

  // Render Flipbook with handbook URL
  return (
    <Flipbook
      pdfUrl={handbook.pdfUrl}
      width={width}
      height={height}
      showPageNumbers={showPageNumbers}
      className={className}
    />
  );
}
