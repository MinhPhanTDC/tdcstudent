import { z } from 'zod';
import { EmailSchema } from './common.schema';

/**
 * Import row schema - represents a single row from CSV/Excel file
 */
export const ImportRowSchema = z.object({
  name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự').max(100, 'Tên tối đa 100 ký tự'),
  email: EmailSchema,
});

export type ImportRow = z.infer<typeof ImportRowSchema>;

/**
 * Import row with validation status
 */
export const ValidatedImportRowSchema = z.object({
  row: z.number().int().positive(),
  name: z.string(),
  email: z.string(),
  isValid: z.boolean(),
  errors: z.array(z.string()).default([]),
});

export type ValidatedImportRow = z.infer<typeof ValidatedImportRowSchema>;

/**
 * Import failure record
 */
export const ImportFailureSchema = z.object({
  row: z.number().int().positive(),
  email: z.string(),
  reason: z.string(),
});

export type ImportFailure = z.infer<typeof ImportFailureSchema>;

/**
 * Import result schema - summary of import operation
 */
export const ImportResultSchema = z.object({
  totalRows: z.number().int().nonnegative(),
  validRows: z.number().int().nonnegative(),
  invalidRows: z.number().int().nonnegative(),
  successCount: z.number().int().nonnegative(),
  failureCount: z.number().int().nonnegative(),
  failures: z.array(ImportFailureSchema),
});

export type ImportResult = z.infer<typeof ImportResultSchema>;

/**
 * Import state enum
 */
export const ImportStatusSchema = z.enum([
  'idle',
  'parsing',
  'validating',
  'previewing',
  'importing',
  'complete',
  'error',
]);

export type ImportStatus = z.infer<typeof ImportStatusSchema>;

/**
 * Import progress schema
 */
export const ImportProgressSchema = z.object({
  current: z.number().int().nonnegative(),
  total: z.number().int().nonnegative(),
});

export type ImportProgress = z.infer<typeof ImportProgressSchema>;
