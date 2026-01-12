import { type ImgHTMLAttributes, useState } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const avatarVariants = cva(
  'inline-flex items-center justify-center rounded-full bg-secondary-200 font-medium text-secondary-600 overflow-hidden',
  {
    variants: {
      size: {
        sm: 'h-8 w-8 text-xs',
        md: 'h-10 w-10 text-sm',
        lg: 'h-12 w-12 text-base',
        xl: 'h-16 w-16 text-lg',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export interface AvatarProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'size'>,
    VariantProps<typeof avatarVariants> {
  /** User's name for fallback initials */
  name?: string;
}

/**
 * Get initials from name
 */
function getInitials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Avatar component with image or initials fallback
 * Includes lazy loading and error handling for images
 */
export function Avatar({ className, size, src, name, alt, ...props }: AvatarProps): JSX.Element {
  const [hasError, setHasError] = useState(false);
  const initials = name ? getInitials(name) : '?';

  // Show initials fallback if no src or image failed to load
  if (!src || hasError) {
    return (
      <span className={cn(avatarVariants({ size, className }))} aria-label={name || 'Avatar'}>
        {initials}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={alt || name || 'Avatar'}
      loading="lazy"
      decoding="async"
      onError={() => setHasError(true)}
      className={cn(avatarVariants({ size, className }), 'object-cover')}
      {...props}
    />
  );
}
