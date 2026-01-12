import { z } from 'zod';
import { BaseEntitySchema, IdSchema, UrlSchema } from './common.schema';

/**
 * Genially URL schema - validates Genially embed URLs
 */
export const GeniallyUrlSchema = z
  .string()
  .url('URL Genially không hợp lệ')
  .refine(
    (url) => url === '' || url.includes('genially') || url.includes('genial.ly'),
    'URL phải là link Genially hợp lệ'
  )
  .optional()
  .or(z.literal(''));

/**
 * Lesson schema (nested within course)
 */
export const LessonSchema = z.object({
  id: IdSchema,
  title: z.string().min(1, 'Tiêu đề bài học không được để trống').max(200),
  content: z.string(),
  duration: z.number().positive('Thời lượng phải là số dương'), // minutes
  order: z.number().int().nonnegative(),
});

export type Lesson = z.infer<typeof LessonSchema>;

/**
 * Create lesson input schema
 */
export const CreateLessonInputSchema = LessonSchema.omit({ id: true });

export type CreateLessonInput = z.infer<typeof CreateLessonInputSchema>;

/**
 * Course schema - extended for Phase 2
 * Includes semester association and Genially integration
 */
export const CourseSchema = BaseEntitySchema.extend({
  title: z.string().min(1, 'Tên môn học không được để trống').max(200, 'Tên môn học tối đa 200 ký tự'),
  description: z.string().max(1000, 'Mô tả tối đa 1000 ký tự').default(''),
  semesterId: z.string().min(1, 'Học kỳ không được để trống'),
  geniallyUrl: GeniallyUrlSchema,
  thumbnailUrl: UrlSchema.optional().or(z.literal('')),
  order: z.number().int('Thứ tự phải là số nguyên').nonnegative('Thứ tự không được âm').default(0),
  requiredSessions: z.number().int().positive('Số buổi phải là số dương').default(10),
  requiredProjects: z.number().int().nonnegative('Số dự án không được âm').default(1),
  lessons: z.array(LessonSchema).default([]),
  isActive: z.boolean().default(true),
});

export type Course = z.infer<typeof CourseSchema>;

/**
 * Create course input schema
 */
export const CreateCourseInputSchema = CourseSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lessons: true,
});

export type CreateCourseInput = z.infer<typeof CreateCourseInputSchema>;

/**
 * Update course input schema
 */
export const UpdateCourseInputSchema = CourseSchema.partial()
  .required({ id: true })
  .omit({ createdAt: true });

export type UpdateCourseInput = z.infer<typeof UpdateCourseInputSchema>;

/**
 * Course filter schema for querying
 */
export const CourseFilterSchema = z.object({
  semesterId: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type CourseFilter = z.infer<typeof CourseFilterSchema>;
