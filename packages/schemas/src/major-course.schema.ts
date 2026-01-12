import { z } from 'zod';
import { IdSchema, TimestampSchema } from './common.schema';

/**
 * MajorCourse schema - links courses to majors
 * Defines the curriculum for each major with ordering and requirement type
 */
export const MajorCourseSchema = z.object({
  id: IdSchema,
  majorId: IdSchema,
  courseId: IdSchema,
  order: z.number().int().nonnegative().default(0),
  isRequired: z.boolean().default(true),
  createdAt: TimestampSchema,
});

export type MajorCourse = z.infer<typeof MajorCourseSchema>;

/**
 * Create major course input schema
 * Omits auto-generated fields (id, createdAt)
 */
export const CreateMajorCourseInputSchema = MajorCourseSchema.omit({
  id: true,
  createdAt: true,
});

export type CreateMajorCourseInput = z.infer<typeof CreateMajorCourseInputSchema>;

/**
 * Update major course input schema
 * Only allows updating order and isRequired fields
 */
export const UpdateMajorCourseInputSchema = MajorCourseSchema.partial()
  .required({ id: true })
  .omit({ createdAt: true, majorId: true, courseId: true });

export type UpdateMajorCourseInput = z.infer<typeof UpdateMajorCourseInputSchema>;

/**
 * MajorCourse filter schema for querying
 */
export const MajorCourseFilterSchema = z.object({
  majorId: z.string().optional(),
  courseId: z.string().optional(),
  isRequired: z.boolean().optional(),
});

export type MajorCourseFilter = z.infer<typeof MajorCourseFilterSchema>;
