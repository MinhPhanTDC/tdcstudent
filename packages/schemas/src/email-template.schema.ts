import { z } from 'zod';
import { IdSchema, TimestampSchema } from './common.schema';

/**
 * Placeholder enum for email templates
 * Requirements: 4.1
 */
export const PlaceholderSchema = z.enum([
  'name',
  'email',
  'password',
  'login_url',
  'timestamp',
  'semester',
  'course_name',
  'admin_name',
]);

export type Placeholder = z.infer<typeof PlaceholderSchema>;

/**
 * All valid placeholders as array
 */
export const VALID_PLACEHOLDERS: Placeholder[] = [
  'name',
  'email',
  'password',
  'login_url',
  'timestamp',
  'semester',
  'course_name',
  'admin_name',
];

/**
 * Placeholder descriptions for UI display
 * Requirements: 4.4
 */
export const PLACEHOLDER_INFO: Record<Placeholder, { description: string; example: string }> = {
  name: { description: 'Tên học viên', example: 'Nguyễn Văn A' },
  email: { description: 'Email đăng nhập', example: 'a@example.com' },
  password: { description: 'Mật khẩu (chỉ khi tạo mới)', example: 'TDC2026@abc' },
  login_url: { description: 'Link đăng nhập', example: 'https://auth.tdc.com' },
  timestamp: { description: 'Thời gian gửi', example: '15/01/2026 10:30' },
  semester: { description: 'Học kỳ hiện tại', example: 'Học kỳ 1' },
  course_name: { description: 'Tên khóa học', example: 'Design Fundamentals' },
  admin_name: { description: 'Tên admin gửi', example: 'Admin TDC' },
};

/**
 * Email template type enum
 */
export const EmailTemplateTypeSchema = z.enum([
  'welcome',
  'password_reset',
  'course_notification',
]);

export type EmailTemplateType = z.infer<typeof EmailTemplateTypeSchema>;

/**
 * Email template schema
 * Requirements: 3.1
 */
export const EmailTemplateSchema = z.object({
  id: IdSchema,
  name: z.string().min(1, 'Tên template không được để trống'),
  type: EmailTemplateTypeSchema,
  subject: z.string().min(1, 'Tiêu đề email không được để trống'),
  body: z.string().min(1, 'Nội dung email không được để trống'),
  placeholders: z.array(PlaceholderSchema),
  isDefault: z.boolean().default(false),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});

export type EmailTemplate = z.infer<typeof EmailTemplateSchema>;

/**
 * Create email template input schema
 */
export const CreateEmailTemplateInputSchema = EmailTemplateSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateEmailTemplateInput = z.infer<typeof CreateEmailTemplateInputSchema>;

/**
 * Update email template input schema
 * Requirements: 3.6
 */
export const UpdateEmailTemplateInputSchema = z.object({
  name: z.string().min(1).optional(),
  subject: z.string().min(1).optional(),
  body: z.string().min(1).optional(),
  placeholders: z.array(PlaceholderSchema).optional(),
});

export type UpdateEmailTemplateInput = z.infer<typeof UpdateEmailTemplateInputSchema>;

/**
 * Regex pattern to match placeholders in template content
 */
export const PLACEHOLDER_REGEX = /\{([a-z_]+)\}/g;

/**
 * Extract placeholders from template content
 * Returns array of placeholder names found in the content
 */
export function extractPlaceholders(content: string): string[] {
  const matches = content.matchAll(PLACEHOLDER_REGEX);
  const placeholders = new Set<string>();
  for (const match of matches) {
    placeholders.add(match[1]);
  }
  return Array.from(placeholders);
}

/**
 * Validate placeholders in template content
 * Returns invalid placeholders if any
 * Requirements: 3.7
 */
export function validatePlaceholders(content: string): {
  isValid: boolean;
  invalidPlaceholders: string[];
} {
  const found = extractPlaceholders(content);
  const invalidPlaceholders = found.filter(
    (p) => !VALID_PLACEHOLDERS.includes(p as Placeholder)
  );
  return {
    isValid: invalidPlaceholders.length === 0,
    invalidPlaceholders,
  };
}

/**
 * Replace placeholders in template content with actual values
 * Requirements: 3.5, 4.2, 8.2
 */
export function replacePlaceholders(
  content: string,
  data: Record<string, string>
): { result: string; missingPlaceholders: string[] } {
  const missingPlaceholders: string[] = [];
  
  const result = content.replace(PLACEHOLDER_REGEX, (_, placeholder) => {
    if (placeholder in data) {
      return data[placeholder];
    }
    missingPlaceholders.push(placeholder);
    return ''; // Replace with empty string if no value
  });

  return { result, missingPlaceholders };
}

/**
 * Check if rendered content has any remaining placeholders
 * Requirements: 3.5 (Property 5)
 */
export function hasRemainingPlaceholders(content: string): boolean {
  return PLACEHOLDER_REGEX.test(content);
}

/**
 * Default email templates
 */
export const DEFAULT_EMAIL_TEMPLATES: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Thông tin đăng nhập',
    type: 'welcome',
    subject: '[TDC] Thông tin đăng nhập của bạn',
    body: `Xin chào {name},

Thông tin đăng nhập của bạn:
- Email: {email}
- Mật khẩu: {password}

Đăng nhập tại: {login_url}

Trân trọng,
{admin_name}`,
    placeholders: ['name', 'email', 'password', 'login_url', 'admin_name'],
    isDefault: true,
  },
  {
    name: 'Đặt lại mật khẩu',
    type: 'password_reset',
    subject: '[TDC] Yêu cầu đặt lại mật khẩu',
    body: `Xin chào {name},

Bạn đã yêu cầu đặt lại mật khẩu vào lúc {timestamp}.

Mật khẩu mới của bạn: {password}

Đăng nhập tại: {login_url}

Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng liên hệ admin.

Trân trọng,
{admin_name}`,
    placeholders: ['name', 'timestamp', 'password', 'login_url', 'admin_name'],
    isDefault: true,
  },
  {
    name: 'Thông báo khóa học',
    type: 'course_notification',
    subject: '[TDC] Thông báo về khóa học {course_name}',
    body: `Xin chào {name},

Bạn có thông báo mới về khóa học {course_name} trong {semester}.

Vui lòng đăng nhập để xem chi tiết: {login_url}

Trân trọng,
{admin_name}`,
    placeholders: ['name', 'course_name', 'semester', 'login_url', 'admin_name'],
    isDefault: true,
  },
];
