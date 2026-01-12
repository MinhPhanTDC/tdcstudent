import { z } from 'zod';
import { BaseEntitySchema, IdSchema } from './common.schema';

/**
 * Media type enum
 */
export const MediaTypeSchema = z.enum(['image', 'video', 'document', 'other']);
export type MediaType = z.infer<typeof MediaTypeSchema>;

/**
 * Media category for organizing files
 */
export const MediaCategorySchema = z.enum(['login-background', 'general', 'course', 'handbook']);
export type MediaCategory = z.infer<typeof MediaCategorySchema>;

/**
 * Media file schema
 */
export const MediaFileSchema = BaseEntitySchema.extend({
  name: z.string().min(1).max(255),
  url: z.string().url(),
  type: MediaTypeSchema,
  category: MediaCategorySchema.default('general'),
  mimeType: z.string(),
  size: z.number().nonnegative(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  storagePath: z.string(), // Firebase Storage path
  isActive: z.boolean().default(true), // For login backgrounds
});

export type MediaFile = z.infer<typeof MediaFileSchema>;

/**
 * Create media input schema
 */
export const CreateMediaInputSchema = MediaFileSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateMediaInput = z.infer<typeof CreateMediaInputSchema>;

/**
 * Update media input schema
 */
export const UpdateMediaInputSchema = MediaFileSchema.partial().required({ id: true });

export type UpdateMediaInput = z.infer<typeof UpdateMediaInputSchema>;

/**
 * Media filter schema
 */
export const MediaFilterSchema = z.object({
  type: MediaTypeSchema.optional(),
  category: MediaCategorySchema.optional(),
  search: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type MediaFilter = z.infer<typeof MediaFilterSchema>;

/**
 * Login background settings schema
 */
export const LoginBackgroundSettingsSchema = z.object({
  activeImageIds: z.array(IdSchema), // IDs of images to show randomly
  lastUpdated: z.date(),
});

export type LoginBackgroundSettings = z.infer<typeof LoginBackgroundSettingsSchema>;
