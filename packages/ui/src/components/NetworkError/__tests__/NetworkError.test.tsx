import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NetworkError } from '../NetworkError';

describe('NetworkError', () => {
  describe('error types', () => {
    it('should render offline error with correct title', () => {
      render(<NetworkError type="offline" />);
      expect(screen.getByText('Không có kết nối mạng')).toBeInTheDocument();
    });

    it('should render timeout error with correct title', () => {
      render(<NetworkError type="timeout" />);
      expect(screen.getByText('Hết thời gian chờ')).toBeInTheDocument();
    });

    it('should render connection error with correct title', () => {
      render(<NetworkError type="connection" />);
      expect(screen.getByText('Lỗi kết nối')).toBeInTheDocument();
    });

    it('should render server error with correct title', () => {
      render(<NetworkError type="server" />);
      expect(screen.getByText('Lỗi máy chủ')).toBeInTheDocument();
    });

    it('should render unknown error with correct title', () => {
      render(<NetworkError type="unknown" />);
      expect(screen.getByText('Lỗi mạng')).toBeInTheDocument();
    });
  });

  describe('default messages', () => {
    it('should show offline message', () => {
      render(<NetworkError type="offline" />);
      expect(screen.getByText(/offline/i)).toBeInTheDocument();
    });

    it('should show timeout message', () => {
      render(<NetworkError type="timeout" />);
      expect(screen.getAllByText(/hết thời gian/i).length).toBeGreaterThan(0);
    });

    it('should show connection message', () => {
      render(<NetworkError type="connection" />);
      expect(screen.getByText(/kết nối đến máy chủ/i)).toBeInTheDocument();
    });

    it('should show server message', () => {
      render(<NetworkError type="server" />);
      expect(screen.getByText(/máy chủ đang gặp sự cố/i)).toBeInTheDocument();
    });
  });

  describe('custom message', () => {
    it('should display custom message when provided', () => {
      render(<NetworkError type="unknown" message="Custom error message" />);
      expect(screen.getByText('Custom error message')).toBeInTheDocument();
    });
  });

  describe('retry functionality', () => {
    it('should render retry button by default', () => {
      const onRetry = vi.fn();
      render(<NetworkError onRetry={onRetry} />);
      expect(screen.getByRole('button', { name: /thử lại/i })).toBeInTheDocument();
    });

    it('should not render retry button when showRetry is false', () => {
      render(<NetworkError showRetry={false} />);
      expect(screen.queryByRole('button', { name: /thử lại/i })).not.toBeInTheDocument();
    });

    it('should not render retry button when onRetry is not provided', () => {
      render(<NetworkError showRetry={true} />);
      expect(screen.queryByRole('button', { name: /thử lại/i })).not.toBeInTheDocument();
    });

    it('should call onRetry when retry button clicked', () => {
      const onRetry = vi.fn();
      render(<NetworkError onRetry={onRetry} />);
      
      fireEvent.click(screen.getByRole('button', { name: /thử lại/i }));
      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('should disable retry button when isRetrying is true', () => {
      const onRetry = vi.fn();
      render(<NetworkError onRetry={onRetry} isRetrying={true} />);
      
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('should disable retry button for offline errors', () => {
      const onRetry = vi.fn();
      render(<NetworkError type="offline" onRetry={onRetry} />);
      
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('should show loading state when isRetrying', () => {
      const onRetry = vi.fn();
      render(<NetworkError onRetry={onRetry} isRetrying={true} />);
      
      expect(screen.getByText(/đang thử lại/i)).toBeInTheDocument();
    });
  });

  describe('retry count', () => {
    it('should display retry count when provided', () => {
      const onRetry = vi.fn();
      render(<NetworkError onRetry={onRetry} retryCount={3} />);
      
      expect(screen.getByText(/đã thử lại 3 lần/i)).toBeInTheDocument();
    });

    it('should not display retry count when 0', () => {
      const onRetry = vi.fn();
      render(<NetworkError onRetry={onRetry} retryCount={0} />);
      
      expect(screen.queryByText(/đã thử lại/i)).not.toBeInTheDocument();
    });

    it('should not display retry count when not provided', () => {
      const onRetry = vi.fn();
      render(<NetworkError onRetry={onRetry} />);
      
      expect(screen.queryByText(/đã thử lại/i)).not.toBeInTheDocument();
    });
  });

  describe('offline auto-reconnect message', () => {
    it('should show auto-reconnect message for offline errors', () => {
      render(<NetworkError type="offline" />);
      expect(screen.getByText(/tự động kết nối lại/i)).toBeInTheDocument();
    });

    it('should not show auto-reconnect message for other errors', () => {
      render(<NetworkError type="connection" />);
      expect(screen.queryByText(/tự động kết nối lại/i)).not.toBeInTheDocument();
    });
  });

  describe('styling', () => {
    it('should apply custom className', () => {
      render(<NetworkError className="custom-class" />);
      const container = document.querySelector('.custom-class');
      expect(container).toBeInTheDocument();
    });

    it('should center content', () => {
      render(<NetworkError />);
      const container = document.querySelector('.flex.flex-col.items-center.justify-center');
      expect(container).toBeInTheDocument();
    });
  });

  describe('icons', () => {
    it('should render different icons for different error types', () => {
      const { rerender } = render(<NetworkError type="offline" />);
      let icon = document.querySelector('svg');
      expect(icon).toBeInTheDocument();
      
      rerender(<NetworkError type="timeout" />);
      icon = document.querySelector('svg');
      expect(icon).toBeInTheDocument();
      
      rerender(<NetworkError type="server" />);
      icon = document.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });
});
