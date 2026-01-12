import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Toast } from '../Toast';

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render toast message', () => {
    render(<Toast message="Test notification" />);
    expect(screen.getByText('Test notification')).toBeInTheDocument();
  });

  it('should have alert role for accessibility', () => {
    render(<Toast message="Test notification" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('should have aria-live polite for screen readers', () => {
    render(<Toast message="Test notification" />);
    expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'polite');
  });

  it('should render dismiss button', () => {
    render(<Toast message="Test notification" />);
    const dismissButton = screen.getByRole('button', { name: /dismiss/i });
    expect(dismissButton).toBeInTheDocument();
  });

  it('should call onDismiss when dismiss button clicked', () => {
    const onDismiss = vi.fn();
    render(<Toast message="Test notification" onDismiss={onDismiss} />);
    
    fireEvent.click(screen.getByRole('button', { name: /dismiss/i }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('should auto-dismiss after duration', () => {
    const onDismiss = vi.fn();
    render(<Toast message="Test notification" duration={3000} onDismiss={onDismiss} />);
    
    expect(onDismiss).not.toHaveBeenCalled();
    
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('should not auto-dismiss when duration is 0', () => {
    const onDismiss = vi.fn();
    render(<Toast message="Test notification" duration={0} onDismiss={onDismiss} />);
    
    act(() => {
      vi.advanceTimersByTime(10000);
    });
    
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('should use default duration of 5000ms', () => {
    const onDismiss = vi.fn();
    render(<Toast message="Test notification" onDismiss={onDismiss} />);
    
    act(() => {
      vi.advanceTimersByTime(4999);
    });
    expect(onDismiss).not.toHaveBeenCalled();
    
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  describe('variants', () => {
    it('should render default variant', () => {
      render(<Toast message="Test" variant="default" />);
      const toast = screen.getByRole('alert');
      expect(toast).toHaveClass('bg-white', 'text-secondary-900');
    });

    it('should render success variant', () => {
      render(<Toast message="Test" variant="success" />);
      const toast = screen.getByRole('alert');
      expect(toast).toHaveClass('bg-green-50', 'text-green-800');
    });

    it('should render error variant', () => {
      render(<Toast message="Test" variant="error" />);
      const toast = screen.getByRole('alert');
      expect(toast).toHaveClass('bg-red-50', 'text-red-800');
    });

    it('should render warning variant', () => {
      render(<Toast message="Test" variant="warning" />);
      const toast = screen.getByRole('alert');
      expect(toast).toHaveClass('bg-yellow-50', 'text-yellow-800');
    });

    it('should render info variant', () => {
      render(<Toast message="Test" variant="info" />);
      const toast = screen.getByRole('alert');
      expect(toast).toHaveClass('bg-blue-50', 'text-blue-800');
    });
  });

  it('should apply custom className', () => {
    render(<Toast message="Test" className="custom-toast-class" />);
    const toast = screen.getByRole('alert');
    expect(toast).toHaveClass('custom-toast-class');
  });

  it('should return null after being dismissed', () => {
    const { container } = render(<Toast message="Test notification" />);
    
    fireEvent.click(screen.getByRole('button', { name: /dismiss/i }));
    
    expect(container.querySelector('[role="alert"]')).not.toBeInTheDocument();
  });
});
