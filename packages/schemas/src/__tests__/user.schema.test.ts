import { describe, it, expect } from 'vitest';
import {
  UserSchema,
  CreateUserInputSchema,
  LoginCredentialsSchema,
  PasswordResetRequestSchema,
} from '../user.schema';

describe('UserSchema', () => {
  const validUser = {
    id: 'user-123',
    email: 'test@example.com',
    displayName: 'Test User',
    role: 'student' as const,
    isActive: true,
    lastLoginAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('should validate a valid user', () => {
    const result = UserSchema.safeParse(validUser);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('test@example.com');
      expect(result.data.role).toBe('student');
    }
  });

  it('should reject invalid email', () => {
    const result = UserSchema.safeParse({
      ...validUser,
      email: 'invalid-email',
    });

    expect(result.success).toBe(false);
  });

  it('should reject invalid role', () => {
    const result = UserSchema.safeParse({
      ...validUser,
      role: 'superadmin',
    });

    expect(result.success).toBe(false);
  });

  it('should reject short display name', () => {
    const result = UserSchema.safeParse({
      ...validUser,
      displayName: 'A',
    });

    expect(result.success).toBe(false);
  });

  it('should allow null lastLoginAt', () => {
    const result = UserSchema.safeParse({
      ...validUser,
      lastLoginAt: null,
    });

    expect(result.success).toBe(true);
  });
});

describe('CreateUserInputSchema', () => {
  it('should validate valid input', () => {
    const result = CreateUserInputSchema.safeParse({
      email: 'new@example.com',
      displayName: 'New User',
      role: 'admin',
      isActive: true,
    });

    expect(result.success).toBe(true);
  });

  it('should reject missing required fields', () => {
    const result = CreateUserInputSchema.safeParse({
      email: 'new@example.com',
    });

    expect(result.success).toBe(false);
  });
});

describe('LoginCredentialsSchema', () => {
  it('should validate valid credentials', () => {
    const result = LoginCredentialsSchema.safeParse({
      email: 'user@example.com',
      password: 'password123',
    });

    expect(result.success).toBe(true);
  });

  it('should reject invalid email', () => {
    const result = LoginCredentialsSchema.safeParse({
      email: 'not-an-email',
      password: 'password123',
    });

    expect(result.success).toBe(false);
  });

  it('should reject short password', () => {
    const result = LoginCredentialsSchema.safeParse({
      email: 'user@example.com',
      password: '12345',
    });

    expect(result.success).toBe(false);
  });
});

describe('PasswordResetRequestSchema', () => {
  it('should validate valid email', () => {
    const result = PasswordResetRequestSchema.safeParse({
      email: 'user@example.com',
    });

    expect(result.success).toBe(true);
  });

  it('should reject invalid email', () => {
    const result = PasswordResetRequestSchema.safeParse({
      email: 'invalid',
    });

    expect(result.success).toBe(false);
  });
});
