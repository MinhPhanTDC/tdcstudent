import { z } from 'zod';
import { BaseEntitySchema } from './common.schema';

/**
 * Lab Requirement Schema
 * Defines requirements that students must complete before starting Lab phase
 * Requirements: 3.2, 9.1
 */
export const LabRequirementSchema = BaseEntitySchema.extend({
  title: z
    .string()
    .min(1, 'Tiêu đề không được để trống')
    .max(200, 'Tiêu đề tối đa 200 ký tự'),
  description: z
    .string()
    .max(500, 'Mô tả tối đa 500 ký tự')
    .optional(),
  helpUrl: z
    .string()
    .url('URL hướng dẫn không hợp lệ')
    .optional(),
  order: z
    .number()
    .int('Thứ tự phải là số nguyên')
    .nonnegative('Thứ tự không được âm'),
  isActive: z.boolean().default(true),
  requiresVerification: z.boolean().default(false),
});

export type LabRequirement = z.infer<typeof LabRequirementSchema>;

/**
 * Create Lab Requirement Input Schema
 * Omits auto-generated fields (id, createdAt, updatedAt)
 */
export const CreateLabRequirementInputSchema = LabRequirementSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateLabRequirementInput = z.infer<typeof CreateLabRequirementInputSchema>;

/**
 * Update Lab Requirement Input Schema
 * All fields optional except id
 */
export const UpdateLabRequirementInputSchema = LabRequirementSchema.partial()
  .required({ id: true })
  .omit({ createdAt: true });

export type UpdateLabRequirementInput = z.infer<typeof UpdateLabRequirementInputSchema>;
