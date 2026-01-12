import { z } from 'zod';
import { BaseEntitySchema, UrlSchema } from './common.schema';

/**
 * Hex color schema - validates hex color format (#RRGGBB)
 */
export const HexColorSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, 'Màu phải là mã hex hợp lệ (ví dụ: #FF5733)')
  .optional();

/**
 * Major schema - represents design specializations
 * Examples: Graphic Design, UI/UX Design, Motion Graphics
 */
export const MajorSchema = BaseEntitySchema.extend({
  name: z
    .string()
    .min(1, 'Tên chuyên ngành không được để trống')
    .max(100, 'Tên chuyên ngành tối đa 100 ký tự'),
  description: z.string().max(1000, 'Mô tả tối đa 1000 ký tự').default(''),
  thumbnailUrl: UrlSchema.optional().or(z.literal('')),
  color: HexColorSchema,
  isActive: z.boolean().default(true),
});

export type Major = z.infer<typeof MajorSchema>;

/**
 * Create major input schema
 * Omits auto-generated fields (id, createdAt, updatedAt)
 */
export const CreateMajorInputSchema = MajorSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateMajorInput = z.infer<typeof CreateMajorInputSchema>;

/**
 * Update major input schema
 * All fields optional except id
 */
export const UpdateMajorInputSchema = MajorSchema.partial()
  .required({ id: true })
  .omit({ createdAt: true });

export type UpdateMajorInput = z.infer<typeof UpdateMajorInputSchema>;

/**
 * Major filter schema for querying
 */
export const MajorFilterSchema = z.object({
  isActive: z.boolean().optional(),
});

export type MajorFilter = z.infer<typeof MajorFilterSchema>;
