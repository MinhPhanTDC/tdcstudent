import { z } from 'zod';

/**
 * Reusable field schemas
 */
export const IdSchema = z.string().min(1, 'ID is required');

export const EmailSchema = z.string().email('Invalid email format');

/**
 * Timestamp schema that handles both Date objects and Firestore Timestamps
 * Firestore Timestamp has toDate() method, regular Date doesn't need conversion
 */
export const TimestampSchema = z.preprocess((val) => {
  // Handle Firestore Timestamp (has toDate method)
  if (val && typeof val === 'object' && 'toDate' in val && typeof val.toDate === 'function') {
    return val.toDate();
  }
  // Handle regular Date or date string
  if (val instanceof Date) {
    return val;
  }
  if (typeof val === 'string' || typeof val === 'number') {
    return new Date(val);
  }
  return val;
}, z.date());

export const UrlSchema = z.string().url('Invalid URL format');

/**
 * Base entity schema with audit fields
 */
export const BaseEntitySchema = z.object({
  id: IdSchema,
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});

export type BaseEntity = z.infer<typeof BaseEntitySchema>;

/**
 * User role enum schema
 */
export const UserRoleSchema = z.enum(['admin', 'student']);

export type UserRole = z.infer<typeof UserRoleSchema>;
