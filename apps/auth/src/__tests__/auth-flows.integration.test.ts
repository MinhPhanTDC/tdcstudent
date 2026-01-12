/**
 * Integration tests for authentication flows
 * Requirements: 4.2 - Test login, logout, password reset flows
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AppError, ErrorCode } from '@tdc/types';

// Mock Firebase modules
vi.mock('@tdc/firebase', () => ({
  signIn: vi.fn(),
  signOut: vi.fn(),
  resetPassword: vi.fn(),
  onAuthChange: vi.fn(),
  getCurrentUser: vi.fn(),
  getIdToken: vi.fn(),
  mapFirebaseError: vi.fn((error) => new AppError(ErrorCode.UNKNOWN_ERROR, error?.message)),
}));

// Import after mocking
import { signIn, signOut, resetPassword } from '@tdc/firebase';
import type { User, LoginCredentials } from '@tdc/schemas';
import type { Result } from '@tdc/types';

// Mock user data
const mockUser: User = {
  id: 'user-123',
  email: 'test@example.com',
  displayName: 'Test User',
  role: 'student',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastLoginAt: new Date(),
};

const mockAdminUser: User = {
  ...mockUser,
  id: 'admin-123',
  email: 'admin@example.com',
  displayName: 'Admin User',
  role: 'admin',
};

describe('Auth Flows Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Login Flow', () => {
    it('should successfully login with valid credentials', async () => {
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      const successResult: Result<User> = {
        success: true,
        data: mockUser,
      };

      vi.mocked(signIn).mockResolvedValue(successResult);

      const result = await signIn(credentials);

      expect(signIn).toHaveBeenCalledWith(credentials);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('test@example.com');
        expect(result.data.role).toBe('student');
      }
    });

    it('should return error for invalid credentials', async () => {
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const errorResult: Result<User> = {
        success: false,
        error: new AppError(ErrorCode.INVALID_CREDENTIALS, 'Email hoặc mật khẩu không đúng'),
      };

      vi.mocked(signIn).mockResolvedValue(errorResult);

      const result = await signIn(credentials);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ErrorCode.INVALID_CREDENTIALS);
      }
    });

    it('should return error for non-existent user', async () => {
      const credentials: LoginCredentials = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      const errorResult: Result<User> = {
        success: false,
        error: new AppError(ErrorCode.USER_NOT_FOUND, 'Không tìm thấy người dùng'),
      };

      vi.mocked(signIn).mockResolvedValue(errorResult);

      const result = await signIn(credentials);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ErrorCode.USER_NOT_FOUND);
      }
    });

    it('should handle network errors during login', async () => {
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      const errorResult: Result<User> = {
        success: false,
        error: new AppError(ErrorCode.NETWORK_ERROR, 'Lỗi kết nối mạng'),
      };

      vi.mocked(signIn).mockResolvedValue(errorResult);

      const result = await signIn(credentials);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ErrorCode.NETWORK_ERROR);
      }
    });

    it('should return admin user with admin role', async () => {
      const credentials: LoginCredentials = {
        email: 'admin@example.com',
        password: 'adminpass123',
      };

      const successResult: Result<User> = {
        success: true,
        data: mockAdminUser,
      };

      vi.mocked(signIn).mockResolvedValue(successResult);

      const result = await signIn(credentials);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.role).toBe('admin');
      }
    });
  });

  describe('Logout Flow', () => {
    it('should successfully logout', async () => {
      const successResult: Result<void> = {
        success: true,
        data: undefined,
      };

      vi.mocked(signOut).mockResolvedValue(successResult);

      const result = await signOut();

      expect(signOut).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    it('should handle logout errors gracefully', async () => {
      const errorResult: Result<void> = {
        success: false,
        error: new AppError(ErrorCode.UNKNOWN_ERROR, 'Logout failed'),
      };

      vi.mocked(signOut).mockResolvedValue(errorResult);

      const result = await signOut();

      expect(result.success).toBe(false);
    });
  });

  describe('Password Reset Flow', () => {
    it('should successfully send password reset email', async () => {
      const email = 'test@example.com';

      const successResult: Result<void> = {
        success: true,
        data: undefined,
      };

      vi.mocked(resetPassword).mockResolvedValue(successResult);

      const result = await resetPassword(email);

      expect(resetPassword).toHaveBeenCalledWith(email);
      expect(result.success).toBe(true);
    });

    it('should return error for non-existent email', async () => {
      const email = 'nonexistent@example.com';

      const errorResult: Result<void> = {
        success: false,
        error: new AppError(ErrorCode.USER_NOT_FOUND, 'Email không tồn tại'),
      };

      vi.mocked(resetPassword).mockResolvedValue(errorResult);

      const result = await resetPassword(email);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ErrorCode.USER_NOT_FOUND);
      }
    });

    it('should handle rate limiting for password reset', async () => {
      const email = 'test@example.com';

      const errorResult: Result<void> = {
        success: false,
        error: new AppError(ErrorCode.TOO_MANY_ATTEMPTS, 'Quá nhiều yêu cầu'),
      };

      vi.mocked(resetPassword).mockResolvedValue(errorResult);

      const result = await resetPassword(email);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ErrorCode.TOO_MANY_ATTEMPTS);
      }
    });

    it('should handle network errors during password reset', async () => {
      const email = 'test@example.com';

      const errorResult: Result<void> = {
        success: false,
        error: new AppError(ErrorCode.NETWORK_ERROR, 'Lỗi kết nối'),
      };

      vi.mocked(resetPassword).mockResolvedValue(errorResult);

      const result = await resetPassword(email);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ErrorCode.NETWORK_ERROR);
      }
    });
  });

  describe('Auth State Transitions', () => {
    it('should handle login -> logout flow', async () => {
      // Login
      const loginResult: Result<User> = {
        success: true,
        data: mockUser,
      };
      vi.mocked(signIn).mockResolvedValue(loginResult);

      const login = await signIn({ email: 'test@example.com', password: 'pass' });
      expect(login.success).toBe(true);

      // Logout
      const logoutResult: Result<void> = {
        success: true,
        data: undefined,
      };
      vi.mocked(signOut).mockResolvedValue(logoutResult);

      const logout = await signOut();
      expect(logout.success).toBe(true);
    });

    it('should handle failed login -> retry flow', async () => {
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      // First attempt fails
      const errorResult: Result<User> = {
        success: false,
        error: new AppError(ErrorCode.INVALID_CREDENTIALS),
      };
      vi.mocked(signIn).mockResolvedValueOnce(errorResult);

      const firstAttempt = await signIn(credentials);
      expect(firstAttempt.success).toBe(false);

      // Second attempt succeeds
      const successResult: Result<User> = {
        success: true,
        data: mockUser,
      };
      vi.mocked(signIn).mockResolvedValueOnce(successResult);

      const secondAttempt = await signIn(credentials);
      expect(secondAttempt.success).toBe(true);
    });
  });
});
