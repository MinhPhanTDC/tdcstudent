import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Skeleton, SkeletonText, SkeletonAvatar, SkeletonButton } from '../Skeleton';

describe('Skeleton', () => {
  describe('base Skeleton component', () => {
    it('should render with default rectangular variant', () => {
      render(<Skeleton />);
      const skeleton = document.querySelector('[aria-hidden="true"]');
      expect(skeleton).toBeInTheDocument();
      expect(skeleton).toHaveClass('animate-pulse', 'bg-secondary-200');
    });

    it('should render text variant with correct defaults', () => {
      render(<Skeleton variant="text" />);
      const skeleton = document.querySelector('[aria-hidden="true"]');
      expect(skeleton).toHaveClass('rounded-sm');
    });

    it('should render circular variant with aspect-square', () => {
      render(<Skeleton variant="circular" />);
      const skeleton = document.querySelector('[aria-hidden="true"]');
      expect(skeleton).toHaveClass('rounded-full', 'aspect-square');
    });

    it('should render rectangular variant with rounded-md', () => {
      render(<Skeleton variant="rectangular" />);
      const skeleton = document.querySelector('[aria-hidden="true"]');
      expect(skeleton).toHaveClass('rounded-md');
    });

    it('should apply custom width as number', () => {
      render(<Skeleton width={200} />);
      const skeleton = document.querySelector('[aria-hidden="true"]');
      expect(skeleton).toHaveStyle({ width: '200px' });
    });

    it('should apply custom width as string', () => {
      render(<Skeleton width="50%" />);
      const skeleton = document.querySelector('[aria-hidden="true"]');
      expect(skeleton).toHaveStyle({ width: '50%' });
    });

    it('should apply custom height as number', () => {
      render(<Skeleton height={50} />);
      const skeleton = document.querySelector('[aria-hidden="true"]');
      expect(skeleton).toHaveStyle({ height: '50px' });
    });

    it('should apply custom height as string', () => {
      render(<Skeleton height="100px" />);
      const skeleton = document.querySelector('[aria-hidden="true"]');
      expect(skeleton).toHaveStyle({ height: '100px' });
    });

    it('should apply custom rounded class', () => {
      render(<Skeleton rounded="lg" />);
      const skeleton = document.querySelector('[aria-hidden="true"]');
      expect(skeleton).toHaveClass('rounded-lg');
    });

    it('should apply custom className', () => {
      render(<Skeleton className="custom-class" />);
      const skeleton = document.querySelector('[aria-hidden="true"]');
      expect(skeleton).toHaveClass('custom-class');
    });

    it('should have aria-hidden for accessibility', () => {
      render(<Skeleton />);
      const skeleton = document.querySelector('[aria-hidden="true"]');
      expect(skeleton).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('SkeletonText', () => {
    it('should render single line by default', () => {
      render(<SkeletonText />);
      const skeletons = document.querySelectorAll('[aria-hidden="true"]');
      expect(skeletons).toHaveLength(1);
    });

    it('should render multiple lines', () => {
      render(<SkeletonText lines={3} />);
      const skeletons = document.querySelectorAll('[aria-hidden="true"]');
      expect(skeletons).toHaveLength(3);
    });

    it('should render last line shorter when multiple lines', () => {
      render(<SkeletonText lines={3} />);
      const skeletons = document.querySelectorAll('[aria-hidden="true"]');
      const lastSkeleton = skeletons[2];
      expect(lastSkeleton).toHaveStyle({ width: '75%' });
    });

    it('should apply custom className', () => {
      render(<SkeletonText className="custom-text-class" />);
      const container = document.querySelector('.custom-text-class');
      expect(container).toBeInTheDocument();
    });
  });

  describe('SkeletonAvatar', () => {
    it('should render with medium size by default', () => {
      render(<SkeletonAvatar />);
      const skeleton = document.querySelector('[aria-hidden="true"]');
      expect(skeleton).toHaveClass('h-10', 'w-10');
    });

    it('should render small size', () => {
      render(<SkeletonAvatar size="sm" />);
      const skeleton = document.querySelector('[aria-hidden="true"]');
      expect(skeleton).toHaveClass('h-8', 'w-8');
    });

    it('should render large size', () => {
      render(<SkeletonAvatar size="lg" />);
      const skeleton = document.querySelector('[aria-hidden="true"]');
      expect(skeleton).toHaveClass('h-12', 'w-12');
    });

    it('should be circular', () => {
      render(<SkeletonAvatar />);
      const skeleton = document.querySelector('[aria-hidden="true"]');
      expect(skeleton).toHaveClass('rounded-full');
    });
  });

  describe('SkeletonButton', () => {
    it('should render with medium size by default', () => {
      render(<SkeletonButton />);
      const skeleton = document.querySelector('[aria-hidden="true"]');
      expect(skeleton).toHaveClass('h-10', 'w-24');
    });

    it('should render small size', () => {
      render(<SkeletonButton size="sm" />);
      const skeleton = document.querySelector('[aria-hidden="true"]');
      expect(skeleton).toHaveClass('h-8', 'w-16');
    });

    it('should render large size', () => {
      render(<SkeletonButton size="lg" />);
      const skeleton = document.querySelector('[aria-hidden="true"]');
      expect(skeleton).toHaveClass('h-12', 'w-32');
    });

    it('should have rounded corners', () => {
      render(<SkeletonButton />);
      const skeleton = document.querySelector('[aria-hidden="true"]');
      expect(skeleton).toHaveClass('rounded-md');
    });
  });
});
