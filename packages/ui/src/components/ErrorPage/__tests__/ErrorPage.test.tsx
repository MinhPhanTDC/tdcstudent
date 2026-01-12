import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorPage } from '../ErrorPage';

describe('ErrorPage', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    // Mock window.location
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: '' } as Location,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: originalLocation,
    });
  });

  it('should render default title', () => {
    render(<ErrorPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Đã xảy ra lỗi');
  });

  it('should render custom title', () => {
    render(<ErrorPage title="Custom Error Title" />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Custom Error Title');
  });

  it('should render default message', () => {
    render(<ErrorPage />);
    expect(screen.getByText(/Rất tiếc, đã có lỗi xảy ra/)).toBeInTheDocument();
  });

  it('should render custom message', () => {
    render(<ErrorPage message="Custom error message" />);
    expect(screen.getByText('Custom error message')).toBeInTheDocument();
  });

  it('should render retry button by default', () => {
    const onRetry = vi.fn();
    render(<ErrorPage onRetry={onRetry} />);
    expect(screen.getByRole('button', { name: 'Thử lại' })).toBeInTheDocument();
  });

  it('should call onRetry when retry button clicked', () => {
    const onRetry = vi.fn();
    render(<ErrorPage onRetry={onRetry} />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Thử lại' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('should not render retry button when showRetry is false', () => {
    render(<ErrorPage showRetry={false} />);
    expect(screen.queryByRole('button', { name: 'Thử lại' })).not.toBeInTheDocument();
  });

  it('should not render retry button when onRetry is not provided', () => {
    render(<ErrorPage showRetry={true} />);
    expect(screen.queryByRole('button', { name: 'Thử lại' })).not.toBeInTheDocument();
  });

  it('should render home button by default', () => {
    render(<ErrorPage />);
    expect(screen.getByRole('button', { name: 'Về trang chủ' })).toBeInTheDocument();
  });

  it('should navigate to home when home button clicked', () => {
    render(<ErrorPage />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Về trang chủ' }));
    expect(window.location.href).toBe('/');
  });

  it('should navigate to custom homeHref', () => {
    render(<ErrorPage homeHref="/dashboard" />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Về trang chủ' }));
    expect(window.location.href).toBe('/dashboard');
  });

  it('should not render home button when showHome is false', () => {
    render(<ErrorPage showHome={false} />);
    expect(screen.queryByRole('button', { name: 'Về trang chủ' })).not.toBeInTheDocument();
  });

  it('should render default error icon', () => {
    render(<ErrorPage />);
    const icon = document.querySelector('svg.text-red-500');
    expect(icon).toBeInTheDocument();
  });

  it('should render custom icon when provided', () => {
    const CustomIcon = () => <svg data-testid="custom-icon" />;
    render(<ErrorPage icon={<CustomIcon />} />);
    
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('should have full screen layout', () => {
    render(<ErrorPage />);
    const container = document.querySelector('.min-h-screen');
    expect(container).toBeInTheDocument();
  });

  it('should center content', () => {
    render(<ErrorPage />);
    const container = document.querySelector('.flex.flex-col.items-center.justify-center');
    expect(container).toBeInTheDocument();
  });

  it('should render both buttons when both are enabled', () => {
    const onRetry = vi.fn();
    render(<ErrorPage onRetry={onRetry} showRetry={true} showHome={true} />);
    
    expect(screen.getByRole('button', { name: 'Thử lại' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Về trang chủ' })).toBeInTheDocument();
  });
});
