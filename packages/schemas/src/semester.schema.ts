import { z } from 'zod';
import { BaseEntitySchema } from './common.schema';

/**
 * Semester schema - represents academic periods
 * Used to organize courses and track student progress by semester
 */
export const SemesterSchema = BaseEntitySchema.extend({
  name: z.string().min(1, 'Tên học kỳ không được để trống').max(100, 'Tên học kỳ tối đa 100 ký tự'),
  description: z.string().max(500, 'Mô tả tối đa 500 ký tự').optional(),
  order: z.number().int('Thứ tự phải là số nguyên').nonnegative('Thứ tự không được âm'),
  isActive: z.boolean().default(true),
  requiresMajorSelection: z.boolean().default(false),
});

export type Semester = z.infer<typeof SemesterSchema>;

/**
 * Create semester input schema
 * Omits auto-generated fields (id, createdAt, updatedAt)
 */
export const CreateSemesterInputSchema = SemesterSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateSemesterInput = z.infer<typeof CreateSemesterInputSchema>;

/**
 * Update semester input schema
 * All fields optional except id
 */
export const UpdateSemesterInputSchema = SemesterSchema.partial()
  .required({ id: true })
  .omit({ createdAt: true });

export type UpdateSemesterInput = z.infer<typeof UpdateSemesterInputSchema>;

/**
 * Semester filter schema for querying
 */
export const SemesterFilterSchema = z.object({
  isActive: z.boolean().optional(),
  requiresMajorSelection: z.boolean().optional(),
});

export type SemesterFilter = z.infer<typeof SemesterFilterSchema>;
