import { z } from 'zod';
import { BaseEntitySchema, IdSchema } from './common.schema';

/**
 * Notification type enum - types of notifications
 */
export const NotificationTypeSchema = z.enum([
  'course_completed',
  'course_rejected',
  'course_unlocked',
  'semester_unlocked',
  'lab_verification_approved',
  'lab_verification_rejected',
  'lab_verification_pending',
]);

export type NotificationType = z.infer<typeof NotificationTypeSchema>;

/**
 * Nullable timestamp preprocessor for optional date fields
 */
const NullableTimestampSchema = z.preprocess((val) => {
  if (val === null || val === undefined) return null;
  if (val && typeof val === 'object' && 'toDate' in val && typeof val.toDate === 'function') {
    return val.toDate();
  }
  if (val instanceof Date) return val;
  if (typeof val === 'string' || typeof val === 'number') return new Date(val);
  return val;
}, z.date().nullable());

/**
 * Notification schema - notifications for students
 */
export const NotificationSchema = BaseEntitySchema.extend({
  userId: IdSchema, // student userId
  type: NotificationTypeSchema,
  title: z.string().min(1, 'Tiêu đề không được để trống').max(200),
  message: z.string().min(1, 'Nội dung không được để trống').max(1000),
  metadata: z.record(z.unknown()).optional(),
  isRead: z.boolean().default(false),
  readAt: NullableTimestampSchema.default(null),
});

export type Notification = z.infer<typeof NotificationSchema>;

/**
 * Create notification input schema
 */
export const CreateNotificationInputSchema = NotificationSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  isRead: true,
  readAt: true,
});

export type CreateNotificationInput = z.infer<typeof CreateNotificationInputSchema>;

/**
 * Mark notification as read input schema
 */
export const MarkNotificationReadInputSchema = z.object({
  isRead: z.literal(true),
  readAt: z.date(),
});

export type MarkNotificationReadInput = z.infer<typeof MarkNotificationReadInputSchema>;

/**
 * Notification filter schema for querying
 */
export const NotificationFilterSchema = z.object({
  userId: IdSchema.optional(),
  type: NotificationTypeSchema.optional(),
  isRead: z.boolean().optional(),
});

export type NotificationFilter = z.infer<typeof NotificationFilterSchema>;
