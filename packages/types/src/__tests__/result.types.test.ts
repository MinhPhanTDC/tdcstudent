import { describe, it, expect } from 'vitest';
import {
  success,
  failure,
  isSuccess,
  isFailure,
  unwrap,
  unwrapOr,
  type Result,
} from '../result.types';
import { AppError, ErrorCode } from '../error.types';

describe('Result type helpers', () => {
  describe('success', () => {
    it('should create a success result with data', () => {
      const result = success({ id: '1', name: 'Test' });

      expect(result.success).toBe(true);
      if (isSuccess(result)) {
        expect(result.data).toEqual({ id: '1', name: 'Test' });
      }
    });

    it('should work with primitive values', () => {
      const result = success(42);

      expect(result.success).toBe(true);
      if (isSuccess(result)) {
        expect(result.data).toBe(42);
      }
    });

    it('should work with null', () => {
      const result = success(null);

      expect(result.success).toBe(true);
      if (isSuccess(result)) {
        expect(result.data).toBeNull();
      }
    });
  });

  describe('failure', () => {
    it('should create a failure result with error', () => {
      const error = new AppError(ErrorCode.USER_NOT_FOUND, 'User not found');
      const result: Result<never, AppError> = failure(error);

      expect(result.success).toBe(false);
      if (isFailure(result)) {
        expect(result.error).toBe(error);
      }
    });

    it('should work with string errors', () => {
      const result: Result<never, string> = failure('Something went wrong');

      expect(result.success).toBe(false);
      if (isFailure(result)) {
        expect(result.error).toBe('Something went wrong');
      }
    });
  });

  describe('isSuccess', () => {
    it('should return true for success results', () => {
      const result = success('data');

      expect(isSuccess(result)).toBe(true);
    });

    it('should return false for failure results', () => {
      const result = failure(new AppError(ErrorCode.UNKNOWN_ERROR));

      expect(isSuccess(result)).toBe(false);
    });
  });

  describe('isFailure', () => {
    it('should return true for failure results', () => {
      const result = failure(new AppError(ErrorCode.UNKNOWN_ERROR));

      expect(isFailure(result)).toBe(true);
    });

    it('should return false for success results', () => {
      const result = success('data');

      expect(isFailure(result)).toBe(false);
    });
  });

  describe('unwrap', () => {
    it('should return data for success results', () => {
      const result = success({ value: 42 });

      expect(unwrap(result)).toEqual({ value: 42 });
    });

    it('should throw error for failure results', () => {
      const error = new AppError(ErrorCode.USER_NOT_FOUND);
      const result = failure(error);

      expect(() => unwrap(result)).toThrow(error);
    });
  });

  describe('unwrapOr', () => {
    it('should return data for success results', () => {
      const result = success(42);

      expect(unwrapOr(result, 0)).toBe(42);
    });

    it('should return default value for failure results', () => {
      const result = failure(new AppError(ErrorCode.UNKNOWN_ERROR));

      expect(unwrapOr(result, 0)).toBe(0);
    });
  });
});
