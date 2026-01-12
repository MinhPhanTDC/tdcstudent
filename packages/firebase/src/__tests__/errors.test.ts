import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AppError, ErrorCode } from '@tdc/types';
import {
  isTransientError,
  calculateRetryDelay,
  withRetry,
  getUserFriendlyMessage,
  getErrorCategory,
  getErrorSeverity,
  shouldShowRetry,
  NetworkError,
  DEFAULT_RETRY_CONFIG,
} from '../errors';

describe('Error Handling', () => {
  describe('isTransientError', () => {
    it('should return true for NETWORK_ERROR AppError', () => {
      const error = new AppError(ErrorCode.NETWORK_ERROR);
      expect(isTransientError(error)).toBe(true);
    });

    it('should return true for DATABASE_ERROR AppError', () => {
      const error = new AppError(ErrorCode.DATABASE_ERROR);
      expect(isTransientError(error)).toBe(true);
    });

    it('should return true for error with retryable details', () => {
      const error = new AppError(ErrorCode.UNKNOWN_ERROR, 'test', { retryable: true });
      expect(isTransientError(error)).toBe(true);
    });

    it('should return true for network-related Error message', () => {
      const error = new Error('Network request failed');
      expect(isTransientError(error)).toBe(true);
    });

    it('should return true for timeout Error message', () => {
      const error = new Error('Request timeout');
      expect(isTransientError(error)).toBe(true);
    });

    it('should return true for connection Error message', () => {
      const error = new Error('Connection refused');
      expect(isTransientError(error)).toBe(true);
    });

    it('should return true for fetch failed Error message', () => {
      const error = new Error('fetch failed');
      expect(isTransientError(error)).toBe(true);
    });

    it('should return false for non-transient errors', () => {
      const error = new AppError(ErrorCode.USER_NOT_FOUND);
      expect(isTransientError(error)).toBe(false);
    });

    it('should return false for validation errors', () => {
      const error = new AppError(ErrorCode.VALIDATION_ERROR);
      expect(isTransientError(error)).toBe(false);
    });

    it('should return false for permission errors', () => {
      const error = new AppError(ErrorCode.PERMISSION_DENIED);
      expect(isTransientError(error)).toBe(false);
    });
  });

  describe('calculateRetryDelay', () => {
    it('should return base delay for first attempt', () => {
      const delay = calculateRetryDelay(0);
      // Base delay is 1000ms, with ±10% jitter
      expect(delay).toBeGreaterThanOrEqual(900);
      expect(delay).toBeLessThanOrEqual(1100);
    });

    it('should increase delay exponentially', () => {
      const delay0 = calculateRetryDelay(0, { ...DEFAULT_RETRY_CONFIG, baseDelayMs: 1000 });
      const delay1 = calculateRetryDelay(1, { ...DEFAULT_RETRY_CONFIG, baseDelayMs: 1000 });
      const delay2 = calculateRetryDelay(2, { ...DEFAULT_RETRY_CONFIG, baseDelayMs: 1000 });
      
      // Each delay should be roughly double the previous (accounting for jitter)
      expect(delay1).toBeGreaterThan(delay0 * 1.5);
      expect(delay2).toBeGreaterThan(delay1 * 1.5);
    });

    it('should not exceed max delay', () => {
      const config = { ...DEFAULT_RETRY_CONFIG, maxDelayMs: 5000 };
      const delay = calculateRetryDelay(10, config);
      expect(delay).toBeLessThanOrEqual(5500); // max + 10% jitter
    });

    it('should use custom config values', () => {
      const config = { ...DEFAULT_RETRY_CONFIG, baseDelayMs: 500 };
      const delay = calculateRetryDelay(0, config);
      expect(delay).toBeGreaterThanOrEqual(450);
      expect(delay).toBeLessThanOrEqual(550);
    });
  });

  describe('withRetry', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return result on first success', async () => {
      const fn = vi.fn().mockResolvedValue('success');
      
      const resultPromise = withRetry(fn, { maxRetries: 3 });
      await vi.runAllTimersAsync();
      const result = await resultPromise;
      
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry on transient error', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new AppError(ErrorCode.NETWORK_ERROR))
        .mockResolvedValueOnce('success');
      
      const resultPromise = withRetry(fn, { maxRetries: 3, baseDelayMs: 100 });
      await vi.runAllTimersAsync();
      const result = await resultPromise;
      
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should not retry on non-transient error', async () => {
      const fn = vi.fn().mockRejectedValue(new AppError(ErrorCode.USER_NOT_FOUND));
      
      const resultPromise = withRetry(fn, { maxRetries: 3 });
      
      await expect(resultPromise).rejects.toThrow();
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should throw after max retries', async () => {
      const fn = vi.fn().mockRejectedValue(new AppError(ErrorCode.NETWORK_ERROR));
      
      // Use real timers for this test to avoid timing issues
      vi.useRealTimers();
      
      await expect(
        withRetry(fn, { maxRetries: 1, baseDelayMs: 10, maxDelayMs: 20 })
      ).rejects.toThrow();
      
      expect(fn).toHaveBeenCalledTimes(2); // initial + 1 retry
      
      // Restore fake timers for other tests
      vi.useFakeTimers();
    });
  });

  describe('getUserFriendlyMessage', () => {
    it('should return Vietnamese message for USER_NOT_FOUND', () => {
      const message = getUserFriendlyMessage(ErrorCode.USER_NOT_FOUND);
      expect(message).toBe('Không tìm thấy người dùng');
    });

    it('should return Vietnamese message for INVALID_CREDENTIALS', () => {
      const message = getUserFriendlyMessage(ErrorCode.INVALID_CREDENTIALS);
      expect(message).toBe('Email hoặc mật khẩu không đúng');
    });

    it('should return Vietnamese message for NETWORK_ERROR', () => {
      const message = getUserFriendlyMessage(ErrorCode.NETWORK_ERROR);
      expect(message).toContain('kết nối');
    });

    it('should return Vietnamese message for SESSION_EXPIRED', () => {
      const message = getUserFriendlyMessage(ErrorCode.SESSION_EXPIRED);
      expect(message).toContain('hết hạn');
    });

    it('should return Vietnamese message for PERMISSION_DENIED', () => {
      const message = getUserFriendlyMessage(ErrorCode.PERMISSION_DENIED);
      expect(message).toContain('quyền');
    });

    it('should return default message for unknown code', () => {
      const message = getUserFriendlyMessage('UNKNOWN_CODE' as any);
      expect(message).toBe('Đã xảy ra lỗi không xác định');
    });

    it('should accept AppError instance', () => {
      const error = new AppError(ErrorCode.SESSION_EXPIRED);
      const message = getUserFriendlyMessage(error);
      expect(message).toContain('hết hạn');
    });
  });

  describe('getErrorCategory', () => {
    it('should return network for NETWORK_ERROR', () => {
      expect(getErrorCategory(ErrorCode.NETWORK_ERROR)).toBe('network');
    });

    it('should return network for DATABASE_ERROR', () => {
      expect(getErrorCategory(ErrorCode.DATABASE_ERROR)).toBe('network');
    });

    it('should return auth for UNAUTHORIZED', () => {
      expect(getErrorCategory(ErrorCode.UNAUTHORIZED)).toBe('auth');
    });

    it('should return auth for INVALID_CREDENTIALS', () => {
      expect(getErrorCategory(ErrorCode.INVALID_CREDENTIALS)).toBe('auth');
    });

    it('should return auth for SESSION_EXPIRED', () => {
      expect(getErrorCategory(ErrorCode.SESSION_EXPIRED)).toBe('auth');
    });

    it('should return permission for PERMISSION_DENIED', () => {
      expect(getErrorCategory(ErrorCode.PERMISSION_DENIED)).toBe('permission');
    });

    it('should return notFound for USER_NOT_FOUND', () => {
      expect(getErrorCategory(ErrorCode.USER_NOT_FOUND)).toBe('notFound');
    });

    it('should return notFound for STUDENT_NOT_FOUND', () => {
      expect(getErrorCategory(ErrorCode.STUDENT_NOT_FOUND)).toBe('notFound');
    });

    it('should return notFound for COURSE_NOT_FOUND', () => {
      expect(getErrorCategory(ErrorCode.COURSE_NOT_FOUND)).toBe('notFound');
    });

    it('should return validation for VALIDATION_ERROR', () => {
      expect(getErrorCategory(ErrorCode.VALIDATION_ERROR)).toBe('validation');
    });

    it('should return validation for INVALID_INPUT', () => {
      expect(getErrorCategory(ErrorCode.INVALID_INPUT)).toBe('validation');
    });

    it('should return system for UNKNOWN_ERROR', () => {
      expect(getErrorCategory(ErrorCode.UNKNOWN_ERROR)).toBe('system');
    });

    it('should accept AppError instance', () => {
      const error = new AppError(ErrorCode.NETWORK_ERROR);
      expect(getErrorCategory(error)).toBe('network');
    });
  });

  describe('getErrorSeverity', () => {
    it('should return warning for validation errors', () => {
      expect(getErrorSeverity(ErrorCode.VALIDATION_ERROR)).toBe('warning');
    });

    it('should return warning for INVALID_INPUT', () => {
      expect(getErrorSeverity(ErrorCode.INVALID_INPUT)).toBe('warning');
    });

    it('should return info for not found errors', () => {
      expect(getErrorSeverity(ErrorCode.USER_NOT_FOUND)).toBe('info');
    });

    it('should return info for STUDENT_NOT_FOUND', () => {
      expect(getErrorSeverity(ErrorCode.STUDENT_NOT_FOUND)).toBe('info');
    });

    it('should return error for network errors', () => {
      expect(getErrorSeverity(ErrorCode.NETWORK_ERROR)).toBe('error');
    });

    it('should return error for auth errors', () => {
      expect(getErrorSeverity(ErrorCode.UNAUTHORIZED)).toBe('error');
    });

    it('should return error for permission errors', () => {
      expect(getErrorSeverity(ErrorCode.PERMISSION_DENIED)).toBe('error');
    });

    it('should accept AppError instance', () => {
      const error = new AppError(ErrorCode.VALIDATION_ERROR);
      expect(getErrorSeverity(error)).toBe('warning');
    });
  });

  describe('shouldShowRetry', () => {
    it('should return true for NetworkError', () => {
      const error = new NetworkError('connection');
      expect(shouldShowRetry(error)).toBe(true);
    });

    it('should return false for offline NetworkError', () => {
      const error = new NetworkError('offline');
      expect(shouldShowRetry(error)).toBe(false);
    });

    it('should return true for network category AppError', () => {
      const error = new AppError(ErrorCode.NETWORK_ERROR);
      expect(shouldShowRetry(error)).toBe(true);
    });

    it('should return true for DATABASE_ERROR', () => {
      const error = new AppError(ErrorCode.DATABASE_ERROR);
      expect(shouldShowRetry(error)).toBe(true);
    });

    it('should return true for error with retryable details', () => {
      const error = new AppError(ErrorCode.UNKNOWN_ERROR, 'test', { retryable: true });
      expect(shouldShowRetry(error)).toBe(true);
    });

    it('should return false for non-retryable errors', () => {
      const error = new AppError(ErrorCode.USER_NOT_FOUND);
      expect(shouldShowRetry(error)).toBe(false);
    });

    it('should return false for validation errors', () => {
      const error = new AppError(ErrorCode.VALIDATION_ERROR);
      expect(shouldShowRetry(error)).toBe(false);
    });
  });

  describe('NetworkError', () => {
    it('should create NetworkError with correct type', () => {
      const error = new NetworkError('timeout', 'Request timed out');
      expect(error.networkType).toBe('timeout');
      expect(error.message).toBe('Request timed out');
    });

    it('should use default message when not provided', () => {
      const error = new NetworkError('timeout');
      expect(error.message).toContain('thời gian');
    });

    it('should be retryable by default for non-offline errors', () => {
      const error = new NetworkError('connection');
      expect(error.retryable).toBe(true);
      expect(error.canRetry()).toBe(true);
    });

    it('should be retryable for timeout errors', () => {
      const error = new NetworkError('timeout');
      expect(error.retryable).toBe(true);
    });

    it('should be retryable for server errors', () => {
      const error = new NetworkError('server');
      expect(error.retryable).toBe(true);
    });

    it('should not be retryable for offline errors', () => {
      const error = new NetworkError('offline');
      expect(error.retryable).toBe(false);
      expect(error.canRetry()).toBe(false);
    });

    it('should have network category', () => {
      const error = new NetworkError('server');
      expect(error.category).toBe('network');
    });

    it('should have error severity for server errors', () => {
      const error = new NetworkError('server');
      expect(error.severity).toBe('error');
    });

    it('should have warning severity for non-server errors', () => {
      const error = new NetworkError('timeout');
      expect(error.severity).toBe('warning');
    });

    it('should have warning severity for connection errors', () => {
      const error = new NetworkError('connection');
      expect(error.severity).toBe('warning');
    });

    it('should extend AppError', () => {
      const error = new NetworkError('timeout');
      expect(error).toBeInstanceOf(AppError);
    });

    it('should have NETWORK_ERROR code', () => {
      const error = new NetworkError('timeout');
      expect(error.code).toBe(ErrorCode.NETWORK_ERROR);
    });
  });
});
