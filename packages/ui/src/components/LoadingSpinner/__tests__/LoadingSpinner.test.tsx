import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  it('should render spinner with default medium size', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('h-6', 'w-6');
  });

  it('should render small spinner', () => {
    render(<LoadingSpinner size="sm" />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('h-4', 'w-4');
  });

  it('should render large spinner', () => {
    render(<LoadingSpinner size="lg" />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('h-8', 'w-8');
  });

  it('should display loading text when provided', () => {
    render(<LoadingSpinner text="Loading data..." />);
    expect(screen.getByText('Loading data...')).toBeInTheDocument();
  });

  it('should not display text when not provided', () => {
    render(<LoadingSpinner />);
    const textElement = document.querySelector('p');
    expect(textElement).not.toBeInTheDocument();
  });

  it('should render full page overlay when fullPage is true', () => {
    render(<LoadingSpinner fullPage />);
    const overlay = document.querySelector('.fixed.inset-0');
    expect(overlay).toBeInTheDocument();
    expect(overlay).toHaveClass('z-50', 'bg-white/80', 'backdrop-blur-sm');
  });

  it('should render inline when fullPage is false', () => {
    render(<LoadingSpinner fullPage={false} />);
    const container = document.querySelector('.min-h-\\[200px\\]');
    expect(container).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(<LoadingSpinner className="custom-spinner-class" />);
    const container = document.querySelector('.custom-spinner-class');
    expect(container).toBeInTheDocument();
  });

  it('should have accessible loading indicator', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveAttribute('aria-label', 'Loading');
  });

  it('should render spinner with primary color', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('text-primary-600');
  });
});
