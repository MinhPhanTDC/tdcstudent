'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { Document, Page, pdfjs } from 'react-pdf';
import { cn } from '../../utils/cn';
import { Skeleton } from '../Skeleton';
import {
  calculateResponsiveDimensions,
  DEFAULT_FLIPBOOK_WIDTH,
  DEFAULT_FLIPBOOK_HEIGHT,
  type FlipbookDimensions,
} from './flipbook.utils';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

/**
 * Flipbook component props
 * Requirements: 8.1, 8.2, 8.4, 8.5
 */
export interface FlipbookProps {
  /** URL of the PDF to display */
  pdfUrl: string;
  /** Base width of the flipbook (default: 400) */
  width?: number;
  /** Base height of the flipbook (default: 566) */
  height?: number;
  /** Callback when page changes */
  onPageChange?: (page: number) => void;
  /** Additional class names */
  className?: string;
  /** Show page numbers */
  showPageNumbers?: boolean;
}

/**
 * Page component for react-pageflip
 */
const FlipbookPage = React.forwardRef<
  HTMLDivElement,
  { pageNumber: number; width: number; height: number }
>(({ pageNumber, width, height }, ref) => {
  return (
    <div ref={ref} className="flipbook-page bg-white shadow-md">
      <Page
        pageNumber={pageNumber}
        width={width}
        height={height}
        renderTextLayer={false}
        renderAnnotationLayer={false}
        loading={
          <div className="flex items-center justify-center h-full">
            <Skeleton width={width} height={height} />
          </div>
        }
      />
    </div>
  );
});

FlipbookPage.displayName = 'FlipbookPage';

/**
 * Flipbook component for displaying PDF with page-flip animation
 * Requirements: 8.1, 8.2, 8.4, 8.5
 */
export function Flipbook({
  pdfUrl,
  width = DEFAULT_FLIPBOOK_WIDTH,
  height = DEFAULT_FLIPBOOK_HEIGHT,
  onPageChange,
  className,
  showPageNumbers = true,
}: FlipbookProps): React.ReactElement {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState<FlipbookDimensions>({ width, height });
  const flipBookRef = useRef<typeof HTMLFlipBook>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle responsive dimensions
  useEffect(() => {
    const updateDimensions = () => {
      const viewportWidth = window.innerWidth;
      const newDimensions = calculateResponsiveDimensions(viewportWidth, width, height);
      setDimensions(newDimensions);
    };

    // Initial calculation
    updateDimensions();

    // Listen for resize events
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [width, height]);

  // Handle PDF document load success
  const onDocumentLoadSuccess = useCallback(({ numPages: pages }: { numPages: number }) => {
    setNumPages(pages);
    setIsLoading(false);
    setError(null);
  }, []);

  // Handle PDF document load error
  const onDocumentLoadError = useCallback((err: Error) => {
    setError(err.message || 'Failed to load PDF');
    setIsLoading(false);
  }, []);

  // Handle page flip
  const handlePageFlip = useCallback(
    (e: { data: number }) => {
      const newPage = e.data + 1; // react-pageflip uses 0-based index
      setCurrentPage(newPage);
      onPageChange?.(newPage);
    },
    [onPageChange]
  );

  // Navigate to previous page
  const goToPrevPage = useCallback(() => {
    if (flipBookRef.current && currentPage > 1) {
      // @ts-expect-error - react-pageflip types are incomplete
      flipBookRef.current.pageFlip().flipPrev();
    }
  }, [currentPage]);

  // Navigate to next page
  const goToNextPage = useCallback(() => {
    if (flipBookRef.current && currentPage < numPages) {
      // @ts-expect-error - react-pageflip types are incomplete
      flipBookRef.current.pageFlip().flipNext();
    }
  }, [currentPage, numPages]);

  // Loading skeleton
  if (isLoading) {
    return (
      <div
        className={cn('flex flex-col items-center justify-center', className)}
        style={{ width: dimensions.width, height: dimensions.height }}
      >
        <Skeleton width={dimensions.width} height={dimensions.height} rounded="md" />
        <p className="mt-4 text-sm text-secondary-500">Loading handbook...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center bg-secondary-100 rounded-lg',
          className
        )}
        style={{ width: dimensions.width, height: dimensions.height }}
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
        <p className="text-sm text-secondary-600">Failed to load handbook</p>
        <p className="text-xs text-secondary-400 mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col items-center', className)} ref={containerRef}>
      <Document
        file={pdfUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={onDocumentLoadError}
        loading={
          <div style={{ width: dimensions.width, height: dimensions.height }}>
            <Skeleton width={dimensions.width} height={dimensions.height} rounded="md" />
          </div>
        }
      >
        {numPages > 0 && (
          <>
            {/* @ts-expect-error - react-pageflip types are incomplete */}
            <HTMLFlipBook
              ref={flipBookRef}
              width={dimensions.width}
              height={dimensions.height}
              size="fixed"
              minWidth={200}
              maxWidth={dimensions.width}
              minHeight={300}
              maxHeight={dimensions.height}
              showCover={true}
              mobileScrollSupport={true}
              onFlip={handlePageFlip}
              className="flipbook-container shadow-xl"
              style={{}}
              startPage={0}
              drawShadow={true}
              flippingTime={600}
              usePortrait={true}
              startZIndex={0}
              autoSize={false}
              maxShadowOpacity={0.5}
              showPageCorners={true}
              disableFlipByClick={false}
            >
              {Array.from({ length: numPages }, (_, index) => (
                <FlipbookPage
                  key={index}
                  pageNumber={index + 1}
                  width={dimensions.width}
                  height={dimensions.height}
                />
              ))}
            </HTMLFlipBook>

            {/* Navigation controls */}
            <div className="flex items-center justify-center gap-4 mt-4">
              <button
                onClick={goToPrevPage}
                disabled={currentPage <= 1}
                className={cn(
                  'p-2 rounded-full transition-colors',
                  currentPage <= 1
                    ? 'text-secondary-300 cursor-not-allowed'
                    : 'text-secondary-600 hover:bg-secondary-100'
                )}
                aria-label="Previous page"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              {showPageNumbers && (
                <span className="text-sm text-secondary-600">
                  Page {currentPage} of {numPages}
                </span>
              )}

              <button
                onClick={goToNextPage}
                disabled={currentPage >= numPages}
                className={cn(
                  'p-2 rounded-full transition-colors',
                  currentPage >= numPages
                    ? 'text-secondary-300 cursor-not-allowed'
                    : 'text-secondary-600 hover:bg-secondary-100'
                )}
                aria-label="Next page"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </>
        )}
      </Document>
    </div>
  );
}
