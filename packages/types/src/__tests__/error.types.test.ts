import { describe, it, expect } from 'vitest';
import { AppError, ErrorCode } from '../error.types';

describe('AppError', () => {
  describe('constructor', () => {
    it('should create error with code only', () => {
      const error = new AppError(ErrorCode.USER_NOT_FOUND);

      expect(error.code).toBe(ErrorCode.USER_NOT_FOUND);
      expect(error.message).toBe(ErrorCode.USER_NOT_FOUND);
      expect(error.name).toBe('AppError');
      expect(error.details).toBeUndefined();
      expect(error.timestamp).toBeInstanceOf(Date);
    });

    it('should create error with code and message', () => {
      const error = new AppError(ErrorCode.INVALID_CREDENTIALS, 'Wrong password');

      expect(error.code).toBe(ErrorCode.INVALID_CREDENTIALS);
      expect(error.message).toBe('Wrong password');
    });

    it('should create error with code, message, and details', () => {
      const details = { field: 'email', reason: 'invalid format' };
      const error = new AppError(ErrorCode.VALIDATION_ERROR, 'Validation failed', details);

      expect(error.code).toBe(ErrorCode.VALIDATION_ERROR);
      expect(error.message).toBe('Validation failed');
      expect(error.details).toEqual(details);
    });
  });

  describe('toJSON', () => {
    it('should serialize error to JSON', () => {
      const error = new AppError(ErrorCode.USER_NOT_FOUND, 'Not found', { id: '123' });
      const json = error.toJSON();

      expect(json.code).toBe(ErrorCode.USER_NOT_FOUND);
      expect(json.message).toBe('Not found');
      expect(json.details).toEqual({ id: '123' });
      expect(typeof json.timestamp).toBe('string');
    });
  });

  describe('from', () => {
    it('should return same AppError if already AppError', () => {
      const original = new AppError(ErrorCode.USER_NOT_FOUND);
      const result = AppError.from(original);

      expect(result).toBe(original);
    });

    it('should convert Error to AppError', () => {
      const original = new Error('Something went wrong');
      const result = AppError.from(original);

      expect(result).toBeInstanceOf(AppError);
      expect(result.code).toBe(ErrorCode.UNKNOWN_ERROR);
      expect(result.message).toBe('Something went wrong');
    });

    it('should convert string to AppError', () => {
      const result = AppError.from('Error message');

      expect(result).toBeInstanceOf(AppError);
      expect(result.code).toBe(ErrorCode.UNKNOWN_ERROR);
      expect(result.message).toBe('Error message');
    });

    it('should use custom fallback code', () => {
      const result = AppError.from('Error', ErrorCode.NETWORK_ERROR);

      expect(result.code).toBe(ErrorCode.NETWORK_ERROR);
    });
  });
});

describe('ErrorCode', () => {
  it('should have all expected error codes', () => {
    expect(ErrorCode.UNAUTHORIZED).toBe('UNAUTHORIZED');
    expect(ErrorCode.INVALID_CREDENTIALS).toBe('INVALID_CREDENTIALS');
    expect(ErrorCode.USER_NOT_FOUND).toBe('USER_NOT_FOUND');
    expect(ErrorCode.VALIDATION_ERROR).toBe('VALIDATION_ERROR');
    expect(ErrorCode.UNKNOWN_ERROR).toBe('UNKNOWN_ERROR');
    expect(ErrorCode.NETWORK_ERROR).toBe('NETWORK_ERROR');
    expect(ErrorCode.DATABASE_ERROR).toBe('DATABASE_ERROR');
  });
});
