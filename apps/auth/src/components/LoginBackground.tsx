'use client';

import Image from 'next/image';
import { useLoginBackground } from '@/hooks/useLoginBackground';

/**
 * Login background component - displays random image from media library
 */
export function LoginBackground(): JSX.Element {
  const { backgroundImage, isLoading } = useLoginBackground();

  // Default fallback image (can be a local image or gradient)
  const defaultBg = 'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%)';

  if (isLoading) {
    return (
      <div
        className="h-full w-full animate-pulse"
        style={{ background: defaultBg }}
      />
    );
  }

  if (!backgroundImage) {
    return (
      <div
        className="h-full w-full"
        style={{ background: defaultBg }}
      />
    );
  }

  return (
    <div className="relative h-full w-full">
      <Image
        src={backgroundImage.url}
        alt="Login background"
        fill
        className="object-cover"
        priority
      />
    </div>
  );
}
