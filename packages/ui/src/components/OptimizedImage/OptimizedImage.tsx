'use client';

import React, { useState, type ImgHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export interface OptimizedImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  /** Image source URL */
  src: string;
  /** Alt text for accessibility */
  alt: string;
  /** Width of the image */
  width?: number | string;
  /** Height of the image */
  height?: number | string;
  /** Whether to lazy load the image (default: true) */
  lazy?: boolean;
  /** Fallback element to show while loading or on error */
  fallback?: React.ReactNode;
  /** Additional class names */
  className?: string;
  /** Object fit style */
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
}

/**
 * OptimizedImage component with lazy loading and error handling
 * This is a framework-agnostic image component that provides:
 * - Native lazy loading
 * - Loading state handling
 * - Error state handling with fallback
 * - Proper accessibility attributes
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  lazy = true,
  fallback,
  className,
  objectFit = 'cover',
  ...props
}: OptimizedImageProps): React.ReactElement {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = (): void => {
    setIsLoading(false);
  };

  const handleError = (): void => {
    setIsLoading(false);
    setHasError(true);
  };

  // Show fallback on error
  if (hasError && fallback) {
    return <>{fallback}</>;
  }

  // Default error fallback
  if (hasError) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-secondary-100 text-secondary-400',
          className
        )}
        style={{ width, height }}
        role="img"
        aria-label={alt}
      >
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className={cn('relative', className)} style={{ width, height }}>
      {/* Loading placeholder */}
      {isLoading && (
        <div
          className="absolute inset-0 bg-secondary-100 animate-pulse"
          style={{ width, height }}
        />
      )}
      
      {/* Actual image */}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={lazy ? 'lazy' : 'eager'}
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          objectFit === 'cover' && 'object-cover',
          objectFit === 'contain' && 'object-contain',
          objectFit === 'fill' && 'object-fill',
          objectFit === 'none' && 'object-none',
          objectFit === 'scale-down' && 'object-scale-down'
        )}
        style={{ width: '100%', height: '100%' }}
        {...props}
      />
    </div>
  );
}
