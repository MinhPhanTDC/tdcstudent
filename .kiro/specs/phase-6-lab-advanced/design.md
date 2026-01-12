# Design Document - Phase 6: Lab Training & Advanced Features

## Overview

Phase 6 xây dựng hệ thống Lab Training với checklist yêu cầu cho học viên, admin setting nội dung động, realtime dashboard với số liệu online/activity feed, và handbook PDF viewer dạng flipbook. Hệ thống sử dụng Firebase Firestore cho data persistence, Firebase Realtime Database cho presence tracking, và Firebase Storage cho PDF storage.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Client Layer                                 │
├─────────────────────────────────────────────────────────────────────┤
│  apps/student                    │  apps/admin                      │
│  ├── Lab Training Page           │  ├── Lab Settings Page           │
│  │   ├── RequirementList         │  │   ├── RequirementManager      │
│  │   ├── ProgressBar             │  │   ├── DragDropList            │
│  │   └── RequirementCard         │  │   └── RequirementForm         │
│  └── Handbook Flipbook           │  ├── Verification Queue          │
│                                  │  ├── Realtime Dashboard          │
│  apps/auth                       │  │   ├── OnlineCounter           │
│  └── Handbook Flipbook           │  │   └── ActivityFeed            │
│                                  │  └── Handbook Upload             │
├─────────────────────────────────────────────────────────────────────┤
│                         Hooks Layer                                  │
├─────────────────────────────────────────────────────────────────────┤
│  useLabRequirements    │  useStudentLabProgress  │  usePresence     │
│  useLabVerification    │  useActivityFeed        │  useHandbook     │
├─────────────────────────────────────────────────────────────────────┤
│                         Service Layer                                │
├─────────────────────────────────────────────────────────────────────┤
│  packages/firebase                                                   │
│  ├── services/                                                       │
│  │   ├── lab-requirement.service.ts                                 │
│  │   ├── lab-progress.service.ts                                    │
│  │   ├── presence.service.ts                                        │
│  │   ├── activity.service.ts                                        │
│  │   └── handbook.service.ts                                        │
│  └── repositories/                                                   │
│      ├── lab-requirement.repository.ts                              │
│      ├── lab-progress.repository.ts                                 │
│      └── activity.repository.ts                                     │
├─────────────────────────────────────────────────────────────────────┤
│                         Data Layer                                   │
├─────────────────────────────────────────────────────────────────────┤
│  Firestore                       │  Realtime Database               │
│  ├── /labRequirements            │  ├── /status/{userId}            │
│  ├── /studentLabProgress         │  └── /activityFeed               │
│  └── /settings/handbook          │                                  │
│                                  │  Firebase Storage                │
│                                  │  └── /handbooks/{filename}       │
└─────────────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### Student Components

```typescript
// apps/student/src/components/features/lab-training/RequirementList.tsx
interface RequirementListProps {
  requirements: LabRequirement[];
  progress: StudentLabProgress[];
  onMarkComplete: (requirementId: string) => void;
}

// apps/student/src/components/features/lab-training/RequirementCard.tsx
interface RequirementCardProps {
  requirement: LabRequirement;
  status: 'completed' | 'pending' | 'not_started';
  onMarkComplete: () => void;
}

// apps/student/src/components/features/lab-training/LabProgressBar.tsx
interface LabProgressBarProps {
  completed: number;
  total: number;
}
```

### Admin Components

```typescript
// apps/admin/src/components/features/lab-settings/RequirementManager.tsx
interface RequirementManagerProps {
  requirements: LabRequirement[];
  onReorder: (requirements: LabRequirement[]) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
  onDelete: (id: string) => void;
}

// apps/admin/src/components/features/lab-settings/RequirementForm.tsx
interface RequirementFormProps {
  requirement?: LabRequirement;
  onSubmit: (data: CreateLabRequirementInput) => void;
  onCancel: () => void;
}

// apps/admin/src/components/features/lab-settings/VerificationQueue.tsx
interface VerificationQueueProps {
  pendingItems: PendingVerification[];
  onApprove: (progressId: string) => void;
  onReject: (progressId: string, reason: string) => void;
}

// apps/admin/src/components/features/dashboard/OnlineCounter.tsx
interface OnlineCounterProps {
  adminCount: number;
  studentCount: number;
}

// apps/admin/src/components/features/dashboard/ActivityFeed.tsx
interface ActivityFeedProps {
  activities: Activity[];
  maxItems?: number;
}
```

### Handbook Components

```typescript
// packages/ui/src/components/Flipbook/Flipbook.tsx
interface FlipbookProps {
  pdfUrl: string;
  width?: number;
  height?: number;
  onPageChange?: (page: number) => void;
}

// apps/admin/src/components/features/handbook/HandbookUpload.tsx
interface HandbookUploadProps {
  currentHandbook?: HandbookSettings;
  onUpload: (file: File) => Promise<void>;
}
```

### Hooks

```typescript
// apps/student/src/hooks/useLabRequirements.ts
function useLabRequirements(): {
  requirements: LabRequirement[];
  isLoading: boolean;
  error: AppError | null;
}

// apps/student/src/hooks/useStudentLabProgress.ts
function useStudentLabProgress(studentId: string): {
  progress: StudentLabProgress[];
  markComplete: (requirementId: string) => Promise<Result<void>>;
  isLoading: boolean;
}

// apps/admin/src/hooks/useLabVerification.ts
function useLabVerification(): {
  pendingItems: PendingVerification[];
  approve: (progressId: string) => Promise<Result<void>>;
  reject: (progressId: string, reason: string) => Promise<Result<void>>;
}

// apps/admin/src/hooks/usePresence.ts
function usePresence(): {
  onlineCount: { admin: number; student: number };
  isConnected: boolean;
}

// apps/admin/src/hooks/useActivityFeed.ts
function useActivityFeed(limit?: number): {
  activities: Activity[];
  isLoading: boolean;
}

// apps/admin/src/hooks/useHandbook.ts
function useHandbook(): {
  handbook: HandbookSettings | null;
  upload: (file: File) => Promise<Result<string>>;
  isUploading: boolean;
}
```

## Data Models

```typescript
// packages/schemas/src/lab-requirement.schema.ts
import { z } from 'zod';
import { BaseEntitySchema } from './common.schema';

export const LabRequirementSchema = BaseEntitySchema.extend({
  title: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  helpUrl: z.string().url().optional(),
  order: z.number().int().nonnegative(),
  isActive: z.boolean().default(true),
  requiresVerification: z.boolean().default(false),
});

export type LabRequirement = z.infer<typeof LabRequirementSchema>;

export const CreateLabRequirementInputSchema = LabRequirementSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateLabRequirementInput = z.infer<typeof CreateLabRequirementInputSchema>;

// packages/schemas/src/lab-progress.schema.ts
export const LabProgressStatusSchema = z.enum(['not_started', 'pending', 'completed', 'rejected']);
export type LabProgressStatus = z.infer<typeof LabProgressStatusSchema>;

export const StudentLabProgressSchema = BaseEntitySchema.extend({
  studentId: z.string().min(1),
  requirementId: z.string().min(1),
  status: LabProgressStatusSchema.default('not_started'),
  completedAt: z.date().nullable(),
  verifiedBy: z.string().nullable(),
  rejectionReason: z.string().max(500).nullable(),
  notes: z.string().max(500).optional(),
});

export type StudentLabProgress = z.infer<typeof StudentLabProgressSchema>;

// packages/schemas/src/activity.schema.ts
export const ActivityTypeSchema = z.enum([
  'course_completed',
  'project_submitted',
  'login',
  'lab_requirement_completed',
]);
export type ActivityType = z.infer<typeof ActivityTypeSchema>;

export const ActivitySchema = z.object({
  id: z.string(),
  type: ActivityTypeSchema,
  userId: z.string(),
  userName: z.string(),
  details: z.record(z.string()).optional(),
  timestamp: z.date(),
});

export type Activity = z.infer<typeof ActivitySchema>;

// packages/schemas/src/handbook.schema.ts
export const HandbookSettingsSchema = z.object({
  pdfUrl: z.string().url(),
  filename: z.string(),
  uploadedAt: z.date(),
  uploadedBy: z.string(),
  fileSize: z.number().positive(),
});

export type HandbookSettings = z.infer<typeof HandbookSettingsSchema>;

// Presence (Realtime Database)
export const UserPresenceSchema = z.object({
  state: z.enum(['online', 'offline']),
  lastSeen: z.number(), // timestamp
  role: z.enum(['admin', 'student']),
});

export type UserPresence = z.infer<typeof UserPresenceSchema>;
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Progress percentage calculation
*For any* set of Lab requirements and student progress records, the progress percentage SHALL equal (completed count / total active requirements) * 100, rounded to the nearest integer.
**Validates: Requirements 1.3, 2.3**

### Property 2: Active requirements filtering
*For any* list of Lab requirements, the student view SHALL display only requirements where isActive equals true, maintaining the order field sorting.
**Validates: Requirements 1.1, 1.5, 3.5**

### Property 3: Verification flow status transition
*For any* requirement with requiresVerification=true, marking as complete SHALL result in status='pending'. For requirements with requiresVerification=false, marking as complete SHALL result in status='completed'.
**Validates: Requirements 2.1, 2.2**

### Property 4: Title validation bounds
*For any* Lab requirement title string, validation SHALL pass if and only if the length is between 1 and 200 characters inclusive.
**Validates: Requirements 3.2**

### Property 5: Requirement ordering consistency
*For any* reorder operation on Lab requirements, the resulting order field values SHALL form a contiguous sequence starting from 0 with no gaps or duplicates.
**Validates: Requirements 3.6**

### Property 6: Cascade delete integrity
*For any* deleted Lab requirement, all related StudentLabProgress records with matching requirementId SHALL also be deleted.
**Validates: Requirements 3.4**

### Property 7: Verification approval state
*For any* approved verification, the StudentLabProgress record SHALL have status='completed', verifiedBy set to the admin's ID, and completedAt set to the approval timestamp.
**Validates: Requirements 4.3**

### Property 8: Verification rejection state
*For any* rejected verification, the StudentLabProgress record SHALL have status='rejected' and rejectionReason set to a non-empty string.
**Validates: Requirements 4.4**

### Property 9: Online count accuracy
*For any* set of user presence records, the online count SHALL equal the count of records where state='online', grouped by role.
**Validates: Requirements 5.1, 5.4**

### Property 10: Activity feed ordering
*For any* activity feed query with limit N, the returned activities SHALL be the N most recent by timestamp in descending order.
**Validates: Requirements 6.1**

### Property 11: PDF validation constraints
*For any* uploaded file, validation SHALL pass if and only if the file has a valid PDF header and size is less than 10MB (10,485,760 bytes).
**Validates: Requirements 7.1**

### Property 12: Handbook replacement
*For any* new handbook upload, the settings document SHALL contain the new PDF URL and the uploadedAt timestamp SHALL be greater than the previous value.
**Validates: Requirements 7.3**

### Property 13: Lab requirement schema round-trip
*For any* valid LabRequirement object, serializing to JSON and deserializing back SHALL produce an equivalent object.
**Validates: Requirements 9.1, 9.2, 9.4**

### Property 14: Student progress schema round-trip
*For any* valid StudentLabProgress object, serializing to JSON and deserializing back SHALL produce an equivalent object.
**Validates: Requirements 9.3, 9.4**

### Property 15: Flipbook responsive dimensions
*For any* viewport width less than 768px, the flipbook dimensions SHALL scale proportionally to fit within the viewport while maintaining aspect ratio.
**Validates: Requirements 8.4**

## Error Handling

```typescript
// Error codes for Lab Training
export const LabErrorCode = {
  // Requirement errors
  REQUIREMENT_NOT_FOUND: 'REQUIREMENT_NOT_FOUND',
  REQUIREMENT_TITLE_INVALID: 'REQUIREMENT_TITLE_INVALID',
  REQUIREMENT_ORDER_CONFLICT: 'REQUIREMENT_ORDER_CONFLICT',
  
  // Progress errors
  PROGRESS_NOT_FOUND: 'PROGRESS_NOT_FOUND',
  PROGRESS_ALREADY_COMPLETED: 'PROGRESS_ALREADY_COMPLETED',
  PROGRESS_PENDING_VERIFICATION: 'PROGRESS_PENDING_VERIFICATION',
  
  // Verification errors
  VERIFICATION_NOT_PENDING: 'VERIFICATION_NOT_PENDING',
  REJECTION_REASON_REQUIRED: 'REJECTION_REASON_REQUIRED',
  
  // Handbook errors
  HANDBOOK_INVALID_PDF: 'HANDBOOK_INVALID_PDF',
  HANDBOOK_FILE_TOO_LARGE: 'HANDBOOK_FILE_TOO_LARGE',
  HANDBOOK_UPLOAD_FAILED: 'HANDBOOK_UPLOAD_FAILED',
  
  // Presence errors
  PRESENCE_CONNECTION_FAILED: 'PRESENCE_CONNECTION_FAILED',
} as const;
```

## Testing Strategy

### Property-Based Testing

Sử dụng **fast-check** library cho property-based testing.

Mỗi property test PHẢI:
- Chạy tối thiểu 100 iterations
- Tag với comment format: `**Feature: phase-6-lab-advanced, Property {number}: {property_text}**`
- Reference correctness property từ design document

### Unit Testing

Unit tests cover:
- Schema validation edge cases
- Service method behavior
- Component rendering states
- Hook state management

### Test File Structure

```
packages/schemas/src/__tests__/
├── lab-requirement.schema.property.test.ts
├── lab-progress.schema.property.test.ts
└── activity.schema.property.test.ts

packages/firebase/src/services/__tests__/
├── lab-requirement.service.property.test.ts
├── lab-progress.service.property.test.ts
├── presence.service.property.test.ts
└── handbook.service.property.test.ts

apps/admin/src/components/features/lab-settings/__tests__/
├── RequirementManager.property.test.ts
└── VerificationQueue.property.test.ts

apps/student/src/components/features/lab-training/__tests__/
├── RequirementList.property.test.ts
└── LabProgressBar.property.test.ts
```
