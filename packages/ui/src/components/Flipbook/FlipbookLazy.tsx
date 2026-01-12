'use client';

import React, { Suspense, lazy } from 'react';
import { Skeleton } from '../Skeleton';
import type { FlipbookProps } from './Flipbook';
import { DEFAULT_FLIPBOOK_WIDTH, DEFAULT_FLIPBOOK_HEIGHT } from './flipbook.utils';

// Lazy load the heavy Flipbook component
const FlipbookComponent = lazy(() =>
  import('./Flipbook').then((mod) => ({ default: mod.Flipbook }))
);

/**
 * Loading fallback for the Flipbook component
 */
function FlipbookLoadingFallback({
  width = DEFAULT_FLIPBOOK_WIDTH,
  height = DEFAULT_FLIPBOOK_HEIGHT,
}: {
  width?: number;
  height?: number;
}): React.ReactElement {
  return (
    <div className="flex flex-col items-center justify-center">
      <Skeleton width={width} height={height} rounded="md" />
      <p className="mt-4 text-sm text-secondary-500">Loading handbook...</p>
    </div>
  );
}

/**
 * Lazy-loaded Flipbook component
 * Uses React.lazy and Suspense for code splitting
 * This reduces the initial bundle size by loading react-pdf only when needed
 */
export function FlipbookLazy(props: FlipbookProps): React.ReactElement {
  return (
    <Suspense
      fallback={<FlipbookLoadingFallback width={props.width} height={props.height} />}
    >
      <FlipbookComponent {...props} />
    </Suspense>
  );
}
