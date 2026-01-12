import { z } from 'zod';
import { EmailSchema, TimestampSchema } from './common.schema';

/**
 * Password complexity requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * Requirements: 1.4, 10.5
 */
export const PasswordSchema = z
  .string()
  .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
  .regex(/[A-Z]/, 'Mật khẩu phải có ít nhất một chữ hoa')
  .regex(/[a-z]/, 'Mật khẩu phải có ít nhất một chữ thường')
  .regex(/[0-9]/, 'Mật khẩu phải có ít nhất một số');

/**
 * Password change input schema
 * Requirements: 1.1, 1.4, 1.5, 10.2, 10.5, 10.6
 */
export const PasswordChangeInputSchema = z
  .object({
    currentPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại'),
    newPassword: PasswordSchema,
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu mới'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

export type PasswordChangeInput = z.infer<typeof PasswordChangeInputSchema>;

/**
 * Password validation result
 */
export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Email settings schema for Gmail OAuth integration
 * Requirements: 2.1
 */
export const EmailSettingsSchema = z.object({
  gmailConnected: z.boolean(),
  gmailEmail: EmailSchema.nullable(),
  connectedAt: TimestampSchema.nullable(),
  connectedBy: z.string().nullable().optional(),
});

export type EmailSettings = z.infer<typeof EmailSettingsSchema>;

/**
 * Default email settings (disconnected state)
 */
export const DEFAULT_EMAIL_SETTINGS: EmailSettings = {
  gmailConnected: false,
  gmailEmail: null,
  connectedAt: null,
  connectedBy: null,
};

/**
 * Validate password strength
 * Returns validation result with specific error messages
 * Requirements: 1.4, 10.5
 */
export function validatePasswordStrength(password: string): PasswordValidationResult {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Mật khẩu phải có ít nhất 8 ký tự');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Mật khẩu phải có ít nhất một chữ hoa');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Mật khẩu phải có ít nhất một chữ thường');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Mật khẩu phải có ít nhất một số');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
