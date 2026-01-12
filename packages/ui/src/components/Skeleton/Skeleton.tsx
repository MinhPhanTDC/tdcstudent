'use client';

import React from 'react';
import { cn } from '../../utils/cn';

export type SkeletonVariant = 'text' | 'circular' | 'rectangular';

export interface SkeletonProps {
  /** Variant of the skeleton shape */
  variant?: SkeletonVariant;
  /** Width of the skeleton */
  width?: string | number;
  /** Height of the skeleton */
  height?: string | number;
  /** Whether to use rounded corners (only applies to rectangular variant) */
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  /** Additional class names */
  className?: string;
}

const roundedClasses = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full',
};

const variantDefaults: Record<SkeletonVariant, { height: number; rounded: keyof typeof roundedClasses }> = {
  text: { height: 16, rounded: 'sm' },
  circular: { height: 40, rounded: 'full' },
  rectangular: { height: 100, rounded: 'md' },
};

/**
 * Skeleton loading placeholder component
 * Requirements: 1.1 - Display consistent loading indicators with skeleton screens
 */
export function Skeleton({
  variant = 'rectangular',
  width,
  height,
  rounded,
  className,
}: SkeletonProps): React.ReactElement {
  const defaults = variantDefaults[variant];
  const effectiveRounded = rounded ?? defaults.rounded;
  
  const style: React.CSSProperties = {};
  
  if (width) {
    style.width = typeof width === 'number' ? `${width}px` : width;
  } else if (variant === 'circular') {
    style.width = typeof height === 'number' ? `${height}px` : (height ?? `${defaults.height}px`);
  }
  
  if (height) {
    style.height = typeof height === 'number' ? `${height}px` : height;
  } else {
    style.height = `${defaults.height}px`;
  }

  return (
    <div
      className={cn(
        'animate-pulse bg-secondary-200',
        roundedClasses[effectiveRounded],
        variant === 'circular' && 'aspect-square',
        className
      )}
      style={style}
      aria-hidden="true"
    />
  );
}

/**
 * Skeleton text line
 */
export function SkeletonText({
  lines = 1,
  className,
}: {
  lines?: number;
  className?: string;
}): React.ReactElement {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height={16}
          width={i === lines - 1 && lines > 1 ? '75%' : '100%'}
          rounded="sm"
        />
      ))}
    </div>
  );
}

/**
 * Skeleton avatar
 */
export function SkeletonAvatar({
  size = 'md',
  className,
}: {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}): React.ReactElement {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  return (
    <Skeleton
      rounded="full"
      className={cn(sizeClasses[size], className)}
    />
  );
}

/**
 * Skeleton button
 */
export function SkeletonButton({
  size = 'md',
  className,
}: {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}): React.ReactElement {
  const sizeClasses = {
    sm: 'h-8 w-16',
    md: 'h-10 w-24',
    lg: 'h-12 w-32',
  };

  return (
    <Skeleton
      rounded="md"
      className={cn(sizeClasses[size], className)}
    />
  );
}
