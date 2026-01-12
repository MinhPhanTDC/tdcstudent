'use client';

import { Suspense } from 'react';
import { MediaLibrary } from '@/components/features/media';

/**
 * Skeleton component for loading state
 */
function MediaLibrarySkeleton(): JSX.Element {
  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="h-10 w-48 animate-pulse rounded bg-secondary-100" />
        <div className="h-10 w-32 animate-pulse rounded bg-secondary-100" />
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
          <div key={i} className="aspect-square animate-pulse rounded-lg bg-secondary-100" />
        ))}
      </div>
    </div>
  );
}

/**
 * Media page - displays media library for managing images and files
 */
export default function MediaPage(): JSX.Element {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-secondary-900">Thư viện Media</h1>
      </div>

      <Suspense fallback={<MediaLibrarySkeleton />}>
        <MediaLibrary />
      </Suspense>
    </div>
  );
}
