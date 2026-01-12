import { z } from 'zod';
import { BaseEntitySchema, EmailSchema, UserRoleSchema, TimestampSchema } from './common.schema';

/**
 * User schema - represents authenticated users
 */
export const UserSchema = BaseEntitySchema.extend({
  email: EmailSchema,
  displayName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  role: UserRoleSchema,
  isActive: z.boolean().default(true),
  lastLoginAt: TimestampSchema.nullable(),
});

export type User = z.infer<typeof UserSchema>;

/**
 * Create user input schema (omit auto-generated fields)
 */
export const CreateUserInputSchema = UserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastLoginAt: true,
});

export type CreateUserInput = z.infer<typeof CreateUserInputSchema>;

/**
 * Update user input schema (all fields optional except id)
 */
export const UpdateUserInputSchema = UserSchema.partial()
  .required({ id: true })
  .omit({ createdAt: true });

export type UpdateUserInput = z.infer<typeof UpdateUserInputSchema>;

/**
 * Login credentials schema
 */
export const LoginCredentialsSchema = z.object({
  email: EmailSchema,
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginCredentials = z.infer<typeof LoginCredentialsSchema>;

/**
 * Password reset request schema
 */
export const PasswordResetRequestSchema = z.object({
  email: EmailSchema,
});

export type PasswordResetRequest = z.infer<typeof PasswordResetRequestSchema>;
