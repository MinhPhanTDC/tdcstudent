# Design Document - Phase 7: Email & Settings

## Overview

Phase 7 bổ sung các tính năng cấu hình hệ thống và quản lý tài khoản:
- **Admin Settings Page**: Đổi password, kết nối Google OAuth cho Gmail API
- **Email Template Editor**: Cấu hình email HTML với placeholder system
- **Admin User Guide**: Trang hướng dẫn sử dụng Admin App
- **Student Handbook**: Trang xem handbook cho học viên
- **Student Password Change**: Cho phép học viên đổi password từ Profile

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Admin App                                    │
├─────────────────────────────────────────────────────────────────────┤
│  /settings                                                           │
│  ├── AccountSettings (Password Change)                              │
│  ├── EmailSettings (Google OAuth)                                   │
│  └── EmailTemplates (Template Editor)                               │
│                                                                      │
│  /help                                                               │
│  └── UserGuide (Help Topics)                                        │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                        Student App                                   │
├─────────────────────────────────────────────────────────────────────┤
│  /handbook                                                           │
│  └── HandbookViewer (Flipbook)                                      │
│                                                                      │
│  /profile                                                            │
│  └── PasswordChangeSection                                          │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                      Firebase Services                               │
├─────────────────────────────────────────────────────────────────────┤
│  packages/firebase/src/services/                                     │
│  ├── settings.service.ts (Gmail OAuth, Settings)                    │
│  ├── email-template.service.ts (Template CRUD)                      │
│  ├── email.service.ts (Send emails via Gmail API)                   │
│  └── password.service.ts (Password change)                          │
└─────────────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### Admin Sidebar Update

```typescript
// apps/admin/src/components/layout/AdminSidebar.tsx
// Add new menu items:
// - "Học kỳ" (/semesters) - between "Khóa học" and "Chuyên ngành"
// - "Cài đặt" (/settings) - at bottom
// - "Hướng dẫn" (/help) - after Settings

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: ... },
  { label: 'Học viên', href: '/students', icon: ... },
  { label: 'Khóa học', href: '/courses', icon: ... },
  { label: 'Học kỳ', href: '/semesters', icon: ... },      // NEW
  { label: 'Chuyên ngành', href: '/majors', icon: ... },
  { label: 'Tracking', href: '/tracking', icon: ... },
  { label: 'Lab Settings', href: '/lab-settings', icon: ... },
  { label: 'Cài đặt', href: '/settings', icon: ... },      // NEW
  { label: 'Hướng dẫn', href: '/help', icon: ... },        // NEW
];
```

### Admin Settings Components

```typescript
// apps/admin/src/components/features/settings/AccountSettings.tsx
interface AccountSettingsProps {
  user: User;
}

// apps/admin/src/components/features/settings/PasswordChangeForm.tsx
interface PasswordChangeFormProps {
  onSuccess: () => void;
}

interface PasswordChangeInput {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// apps/admin/src/components/features/settings/EmailSettings.tsx
interface EmailSettingsProps {
  settings: EmailSettingsData;
  onConnect: () => void;
  onDisconnect: () => void;
  onTestEmail: () => void;
}

interface EmailSettingsData {
  isConnected: boolean;
  connectedEmail: string | null;
  connectedAt: Date | null;
}

// apps/admin/src/components/features/settings/EmailTemplateEditor.tsx
interface EmailTemplateEditorProps {
  template: EmailTemplate;
  onSave: (template: EmailTemplate) => void;
  onPreview: () => void;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  placeholders: string[];
  isDefault: boolean;
  updatedAt: Date;
}
```

### Admin Help Components

```typescript
// apps/admin/src/components/features/help/UserGuide.tsx
interface UserGuideProps {
  topics: HelpTopic[];
}

interface HelpTopic {
  id: string;
  title: string;
  category: HelpCategory;
  content: string;
  order: number;
}

type HelpCategory = 
  | 'getting-started'
  | 'student-management'
  | 'course-management'
  | 'tracking'
  | 'settings'
  | 'faq';

// apps/admin/src/components/features/help/HelpTopicList.tsx
interface HelpTopicListProps {
  topics: HelpTopic[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

// apps/admin/src/components/features/help/HelpSearch.tsx
interface HelpSearchProps {
  onSearch: (query: string) => void;
}
```

### Student Components

```typescript
// apps/student/src/components/features/handbook/StudentHandbook.tsx
interface StudentHandbookProps {
  handbookUrl: string | null;
}

// apps/student/src/components/features/profile/PasswordChangeSection.tsx
interface PasswordChangeSectionProps {
  onSuccess: () => void;
}
```

### Service Interfaces

```typescript
// packages/firebase/src/services/settings.service.ts
interface SettingsService {
  getEmailSettings(): Promise<Result<EmailSettingsData>>;
  initiateGoogleOAuth(): Promise<Result<string>>; // Returns OAuth URL
  handleOAuthCallback(code: string): Promise<Result<void>>;
  disconnectGmail(): Promise<Result<void>>;
  sendTestEmail(): Promise<Result<void>>;
}

// packages/firebase/src/services/email-template.service.ts
interface EmailTemplateService {
  getTemplates(): Promise<Result<EmailTemplate[]>>;
  getTemplate(id: string): Promise<Result<EmailTemplate>>;
  updateTemplate(id: string, data: Partial<EmailTemplate>): Promise<Result<EmailTemplate>>;
  previewTemplate(id: string, sampleData: Record<string, string>): Promise<Result<string>>;
}

// packages/firebase/src/services/email.service.ts
interface EmailService {
  sendEmail(to: string, templateId: string, data: Record<string, string>): Promise<Result<void>>;
  sendBulkEmail(recipients: EmailRecipient[], templateId: string): Promise<Result<BulkEmailResult>>;
}

interface EmailRecipient {
  email: string;
  data: Record<string, string>;
}

interface BulkEmailResult {
  total: number;
  success: number;
  failed: number;
  errors: Array<{ email: string; error: string }>;
}

// packages/firebase/src/services/password.service.ts
interface PasswordService {
  changePassword(currentPassword: string, newPassword: string): Promise<Result<void>>;
  validatePasswordStrength(password: string): PasswordValidationResult;
}

interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}
```

## Data Models

### Firestore Collections

```typescript
// /settings/email
interface EmailSettingsDocument {
  gmailConnected: boolean;
  gmailEmail: string | null;
  gmailRefreshToken: string | null; // Encrypted
  connectedAt: Timestamp | null;
  connectedBy: string | null;
}

// /emailTemplates/{templateId}
interface EmailTemplateDocument {
  id: string;
  name: string;
  subject: string;
  body: string; // HTML content
  placeholders: string[];
  isDefault: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// /emailLogs/{logId}
interface EmailLogDocument {
  id: string;
  recipientEmail: string;
  recipientName: string;
  templateId: string;
  templateName: string;
  subject: string;
  sentAt: Timestamp;
  sentBy: string;
  status: 'sent' | 'failed';
  errorMessage: string | null;
}

// /helpTopics/{topicId}
interface HelpTopicDocument {
  id: string;
  title: string;
  category: HelpCategory;
  content: string; // Markdown content
  order: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Zod Schemas

```typescript
// packages/schemas/src/settings.schema.ts
export const EmailSettingsSchema = z.object({
  gmailConnected: z.boolean(),
  gmailEmail: z.string().email().nullable(),
  connectedAt: z.date().nullable(),
});

export const PasswordChangeInputSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// packages/schemas/src/email-template.schema.ts
export const EmailTemplateSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  subject: z.string().min(1),
  body: z.string().min(1),
  placeholders: z.array(z.string()),
  isDefault: z.boolean(),
  updatedAt: z.date(),
});

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

// packages/schemas/src/help-topic.schema.ts
export const HelpCategorySchema = z.enum([
  'getting-started',
  'student-management',
  'course-management',
  'tracking',
  'settings',
  'faq',
]);

export const HelpTopicSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  category: HelpCategorySchema,
  content: z.string(),
  order: z.number().int().nonnegative(),
});
```



## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Password validation enforces complexity requirements
*For any* password string, the validation function SHALL return invalid if the password is less than 8 characters, lacks uppercase letters, lacks lowercase letters, or lacks numbers.
**Validates: Requirements 1.4, 9.5**

### Property 2: Password mismatch detection
*For any* pair of different password strings, the form validation SHALL return an error when newPassword and confirmPassword do not match.
**Validates: Requirements 1.5, 9.6**

### Property 3: Email settings state consistency
*For any* email settings state, if gmailConnected is true THEN connectedEmail SHALL be a non-null valid email string, and if gmailConnected is false THEN connectedEmail SHALL be null.
**Validates: Requirements 2.1**

### Property 4: Disconnect clears credentials
*For any* connected email settings, after calling disconnect, the settings SHALL have gmailConnected=false and connectedEmail=null.
**Validates: Requirements 2.4**

### Property 5: Placeholder replacement completeness
*For any* email template with placeholders and a data object containing all placeholder values, the rendered output SHALL contain no placeholder syntax (no {placeholder} patterns remain).
**Validates: Requirements 3.5, 4.2, 8.2**

### Property 6: Template save round-trip
*For any* valid email template, saving and then retrieving the template SHALL return an equivalent template object.
**Validates: Requirements 3.6**

### Property 7: Invalid placeholder detection
*For any* template containing placeholder syntax that is not in the allowed placeholder list, validation SHALL return an error identifying the invalid placeholder.
**Validates: Requirements 3.7**

### Property 8: Help search filtering
*For any* list of help topics and a search query, the filtered results SHALL only contain topics where the title or content contains the search query (case-insensitive).
**Validates: Requirements 5.3**

### Property 9: Form dirty state tracking
*For any* settings form, if any field value differs from the initial value THEN the save button SHALL be enabled, otherwise it SHALL be disabled.
**Validates: Requirements 7.3**

### Property 10: Email log completeness
*For any* successfully sent email, the log entry SHALL contain recipientEmail, templateId, sentAt timestamp, and sentBy user ID.
**Validates: Requirements 8.3**

## Error Handling

### Password Change Errors

| Error Code | User Message (VI) | User Message (EN) |
|------------|-------------------|-------------------|
| WRONG_PASSWORD | Mật khẩu hiện tại không đúng | Current password is incorrect |
| WEAK_PASSWORD | Mật khẩu mới không đủ mạnh | New password is not strong enough |
| PASSWORD_MISMATCH | Mật khẩu xác nhận không khớp | Passwords do not match |
| AUTH_REQUIRED | Vui lòng đăng nhập lại | Please sign in again |

### Email Errors

| Error Code | User Message (VI) | User Message (EN) |
|------------|-------------------|-------------------|
| GMAIL_NOT_CONNECTED | Chưa kết nối Gmail. Vui lòng kết nối trước khi gửi email | Gmail not connected. Please connect before sending emails |
| EMAIL_SEND_FAILED | Gửi email thất bại. Vui lòng thử lại | Failed to send email. Please try again |
| INVALID_TEMPLATE | Template email không hợp lệ | Invalid email template |
| INVALID_PLACEHOLDER | Placeholder không hợp lệ: {placeholder} | Invalid placeholder: {placeholder} |

### OAuth Errors

| Error Code | User Message (VI) | User Message (EN) |
|------------|-------------------|-------------------|
| OAUTH_FAILED | Kết nối Google thất bại | Google connection failed |
| OAUTH_CANCELLED | Đã hủy kết nối Google | Google connection cancelled |
| TOKEN_EXPIRED | Phiên đăng nhập Google đã hết hạn | Google session expired |

## Testing Strategy

### Property-Based Testing

Sử dụng **fast-check** library cho property-based testing.

**Test Files:**
- `packages/schemas/src/__tests__/settings.schema.property.test.ts`
- `packages/firebase/src/services/__tests__/password.service.property.test.ts`
- `packages/firebase/src/services/__tests__/email-template.service.property.test.ts`

**Configuration:**
- Minimum 100 iterations per property test
- Each test tagged with: `**Feature: phase-7-email-settings, Property {number}: {property_text}**`

### Unit Tests

- Password validation logic
- Placeholder replacement function
- Help topic filtering
- Form dirty state detection

### Integration Tests

- Password change flow (Firebase Auth)
- Email template CRUD operations
- Email sending with Gmail API (mocked)

## UI Mockups

### Settings Page Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  Settings                                                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ 👤 Tài khoản                                           [▼]  │    │
│  ├─────────────────────────────────────────────────────────────┤    │
│  │                                                              │    │
│  │  Đổi mật khẩu                                               │    │
│  │                                                              │    │
│  │  Mật khẩu hiện tại: [________________]                      │    │
│  │  Mật khẩu mới:      [________________]                      │    │
│  │  Xác nhận:          [________________]                      │    │
│  │                                                              │    │
│  │  [Đổi mật khẩu]                                             │    │
│  │                                                              │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ 📧 Cấu hình Email                                      [▼]  │    │
│  ├─────────────────────────────────────────────────────────────┤    │
│  │                                                              │    │
│  │  Trạng thái: ✓ Đã kết nối                                   │    │
│  │  Email: admin@thedesigncouncil.com                          │    │
│  │  Kết nối lúc: 15/01/2026 10:30                              │    │
│  │                                                              │    │
│  │  [Ngắt kết nối] [Test gửi email]                            │    │
│  │                                                              │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ 📝 Email Templates                                     [▼]  │    │
│  ├─────────────────────────────────────────────────────────────┤    │
│  │                                                              │    │
│  │  [Thông tin đăng nhập ▼]                                    │    │
│  │                                                              │    │
│  │  Subject: [TDC] Thông tin đăng nhập của bạn                 │    │
│  │                                                              │    │
│  │  ┌───────────────────────────────────────────────────────┐  │    │
│  │  │ [B] [I] [U] | {name} {email} {password} {login_url}   │  │    │
│  │  ├───────────────────────────────────────────────────────┤  │    │
│  │  │ Xin chào {name},                                      │  │    │
│  │  │                                                        │  │    │
│  │  │ Thông tin đăng nhập của bạn:                          │  │    │
│  │  │ - Email: {email}                                      │  │    │
│  │  │ - Mật khẩu: {password}                                │  │    │
│  │  │                                                        │  │    │
│  │  │ Đăng nhập tại: {login_url}                            │  │    │
│  │  └───────────────────────────────────────────────────────┘  │    │
│  │                                                              │    │
│  │  [Preview] [Lưu template]                                   │    │
│  │                                                              │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Placeholder Reference

| Placeholder | Mô tả | Ví dụ |
|-------------|-------|-------|
| `{name}` | Tên học viên | Nguyễn Văn A |
| `{email}` | Email đăng nhập | a@example.com |
| `{password}` | Mật khẩu (chỉ khi tạo mới) | TDC2026@abc |
| `{login_url}` | Link đăng nhập | https://auth.tdc.com |
| `{timestamp}` | Thời gian gửi | 15/01/2026 10:30 |
| `{semester}` | Học kỳ hiện tại | Học kỳ 1 |
| `{course_name}` | Tên khóa học | Design Fundamentals |
| `{admin_name}` | Tên admin gửi | Admin TDC |

### Help Page Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  Hướng dẫn sử dụng                                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  🔍 [Tìm kiếm...                                              ]     │
│                                                                      │
│  ┌──────────────────┐  ┌────────────────────────────────────────┐   │
│  │ 📚 Bắt đầu       │  │                                        │   │
│  │   • Đăng nhập    │  │  Quản lý Học viên                      │   │
│  │   • Dashboard    │  │                                        │   │
│  │                  │  │  1. Tạo học viên mới                   │   │
│  │ 👥 Học viên      │  │     - Vào menu "Học viên"              │   │
│  │   • Tạo mới  ◀──│──│     - Click "Thêm học viên"            │   │
│  │   • Import       │  │     - Điền thông tin                   │   │
│  │   • Gửi email    │  │     - Click "Lưu"                      │   │
│  │                  │  │                                        │   │
│  │ 📖 Khóa học      │  │  2. Import từ Excel                    │   │
│  │   • Tạo mới      │  │     - Click "Import"                   │   │
│  │   • Genially     │  │     - Chọn file Excel                  │   │
│  │                  │  │     - Xem preview                      │   │
│  │ 📊 Tracking      │  │     - Confirm import                   │   │
│  │   • Quick Track  │  │                                        │   │
│  │   • Pass/Fail    │  │  [Screenshot placeholder]              │   │
│  │                  │  │                                        │   │
│  │ ⚙️ Cấu hình      │  │                                        │   │
│  │   • Gmail        │  │                                        │   │
│  │   • Templates    │  │                                        │   │
│  │                  │  │                                        │   │
│  │ ❓ FAQ           │  │                                        │   │
│  └──────────────────┘  └────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Student Handbook Page

```
┌─────────────────────────────────────────────────────────────────────┐
│  Handbook                                                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                                                              │    │
│  │                    [Flipbook Component]                      │    │
│  │                                                              │    │
│  │    ┌─────────────┐  ┌─────────────┐                         │    │
│  │    │             │  │             │                         │    │
│  │    │   Page 1    │  │   Page 2    │                         │    │
│  │    │             │  │             │                         │    │
│  │    │             │  │             │                         │    │
│  │    └─────────────┘  └─────────────┘                         │    │
│  │                                                              │    │
│  │         [◀ Prev]  Page 1 of 20  [Next ▶]                    │    │
│  │                                                              │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

