'use client';

import { Card } from '@tdc/ui';

export interface GeniallyEmbedProps {
  /** The Genially URL to embed */
  url: string;
  /** Title for the embed (used for accessibility) */
  title: string;
}

/**
 * Transforms a Genially URL to an embeddable format
 * Handles various Genially URL formats and converts them to embed URLs
 * Requirements: 3.2
 */
export function transformGeniallyUrl(url: string): string {
  if (!url) return '';

  // Already an embed URL
  if (url.includes('/embed/')) {
    return url;
  }

  // Handle view.genial.ly URLs - convert to embed format
  // Example: https://view.genial.ly/abc123 -> https://view.genial.ly/abc123
  if (url.includes('view.genial.ly') || url.includes('view.genially.com')) {
    return url;
  }

  // Handle genially.com URLs - convert to view format
  // Example: https://genially.com/view/abc123 -> https://view.genial.ly/abc123
  const geniallyIdMatch = url.match(/genially\.com\/view\/([a-zA-Z0-9]+)/);
  if (geniallyIdMatch) {
    return `https://view.genial.ly/${geniallyIdMatch[1]}`;
  }

  // Handle genial.ly URLs
  const genialIdMatch = url.match(/genial\.ly\/([a-zA-Z0-9]+)/);
  if (genialIdMatch) {
    return `https://view.genial.ly/${genialIdMatch[1]}`;
  }

  // Return original URL if no transformation needed
  return url;
}

/**
 * GeniallyEmbed component - embeds Genially content in a responsive iframe
 * Requirements: 3.2, 3.3, 3.4
 */
export function GeniallyEmbed({ url, title }: GeniallyEmbedProps): JSX.Element {
  // Handle missing URL - show fallback
  if (!url || url.trim() === '') {
    return <GeniallyEmbedFallback />;
  }

  const embedUrl = transformGeniallyUrl(url);

  return (
    <div className="relative w-full overflow-hidden rounded-lg bg-secondary-100">
      {/* Responsive container with 16:9 aspect ratio */}
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        <iframe
          src={embedUrl}
          title={title}
          className="absolute inset-0 h-full w-full border-0"
          allowFullScreen
          loading="lazy"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-presentation"
        />
      </div>
    </div>
  );
}

/**
 * Fallback component when no Genially URL is provided
 * Requirements: 3.3
 */
export function GeniallyEmbedFallback(): JSX.Element {
  return (
    <Card className="text-center">
      <div className="py-12">
        <svg
          className="mx-auto h-16 w-16 text-secondary-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-secondary-700">
          Nội dung chưa có sẵn
        </h3>
        <p className="mt-2 text-sm text-secondary-500">
          Nội dung học tập cho môn học này đang được cập nhật.
          <br />
          Vui lòng quay lại sau.
        </p>
      </div>
    </Card>
  );
}
