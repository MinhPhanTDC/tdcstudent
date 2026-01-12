import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from '../ErrorBoundary';

// Component that throws an error
function ThrowError({ shouldThrow }: { shouldThrow: boolean }): JSX.Element {
  if (shouldThrow) {
    throw new Error('Test error message');
  }
  return <div>No error</div>;
}

// Suppress console.error for cleaner test output
const originalConsoleError = console.error;

describe('ErrorBoundary', () => {
  beforeEach(() => {
    console.error = vi.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  it('should render children when no error', () => {
    render(
      <ErrorBoundary>
        <div>Child content</div>
      </ErrorBoundary>
    );
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('should render fallback UI when error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Đã xảy ra lỗi')).toBeInTheDocument();
  });

  it('should display error message in fallback UI', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('should render custom fallback when provided', () => {
    render(
      <ErrorBoundary fallback={<div>Custom error UI</div>}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Custom error UI')).toBeInTheDocument();
    expect(screen.queryByText('Đã xảy ra lỗi')).not.toBeInTheDocument();
  });

  it('should call onError callback when error occurs', () => {
    const onError = vi.fn();
    
    render(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ componentStack: expect.any(String) })
    );
  });

  it('should log error to console', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(console.error).toHaveBeenCalled();
  });

  it('should render retry button in default fallback', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByRole('button', { name: 'Thử lại' })).toBeInTheDocument();
  });

  it('should reset error state when retry button clicked', () => {
    // Use a ref to control throwing behavior
    let throwError = true;
    
    function ConditionalThrow(): JSX.Element {
      if (throwError) {
        throw new Error('Test error');
      }
      return <div>No error</div>;
    }
    
    render(
      <ErrorBoundary>
        <ConditionalThrow />
      </ErrorBoundary>
    );
    
    // Error should be shown
    expect(screen.getByText('Đã xảy ra lỗi')).toBeInTheDocument();
    
    // Fix the error condition before clicking retry
    throwError = false;
    
    // Click retry - this resets the error boundary state
    fireEvent.click(screen.getByRole('button', { name: 'Thử lại' }));
    
    // After reset, the component should try to render children again
    // Since throwError is now false, it should succeed
    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('should have proper styling for error container', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    const container = document.querySelector('.border-red-200.bg-red-50');
    expect(container).toBeInTheDocument();
  });

  it('should display default message when error has no message', () => {
    function ThrowEmptyError(): JSX.Element {
      throw new Error();
    }
    
    render(
      <ErrorBoundary>
        <ThrowEmptyError />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Vui lòng thử lại sau')).toBeInTheDocument();
  });

  it('should render error icon', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    const icon = document.querySelector('svg.text-red-500');
    expect(icon).toBeInTheDocument();
  });
});
