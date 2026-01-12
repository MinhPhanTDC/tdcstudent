# Design Document - Phase 3: Student Portal

## Overview

Phase 3 xây dựng Student Portal với các tính năng chính cho học viên: xem danh sách học kỳ và môn học, học qua Genially embed, upload kết quả dự án, hiển thị tiến độ học tập, và Learning Tree visualization. Hệ thống sử dụng Next.js App Router, React Query cho data fetching, và Firestore cho persistence.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Student Portal                            │
│                     (apps/student)                               │
├─────────────────────────────────────────────────────────────────┤
│  Pages                                                           │
│  ├── /dashboard          - Student dashboard với tiến độ        │
│  ├── /semesters          - Danh sách học kỳ                     │
│  ├── /semesters/[id]     - Môn học trong học kỳ                 │
│  ├── /courses/[id]       - Chi tiết môn học + Genially          │
│  └── /learning-tree      - Learning Tree visualization          │
├─────────────────────────────────────────────────────────────────┤
│  Components                                                      │
│  ├── semester/           - SemesterList, SemesterCard           │
│  ├── course/             - CourseList, CourseCard, GeniallyEmbed│
│  ├── project/            - ProjectList, ProjectSubmitForm       │
│  ├── progress/           - ProgressBar, ProgressStats           │
│  └── learning-tree/      - LearningTree, TreeNode               │
├─────────────────────────────────────────────────────────────────┤
│  Hooks                                                           │
│  ├── useMySemesters      - Lấy học kỳ của student               │
│  ├── useMyCourses        - Lấy môn học theo học kỳ              │
│  ├── useMyProgress       - Lấy tiến độ tổng thể                 │
│  ├── useCourseProgress   - Lấy tiến độ theo môn                 │
│  ├── useMyProjects       - Lấy dự án đã submit                  │
│  └── useSubmitProject    - Submit dự án                         │
├─────────────────────────────────────────────────────────────────┤
│  Shared Packages                                                 │
│  ├── @tdc/schemas        - Progress, ProjectSubmission schemas  │
│  ├── @tdc/firebase       - Repositories cho progress, projects  │
│  ├── @tdc/ui             - Shared UI components                 │
│  └── @tdc/types          - Result type, AppError                │
└─────────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### Page Components

```typescript
// apps/student/src/app/(portal)/semesters/page.tsx
// Displays list of semesters with status

// apps/student/src/app/(portal)/semesters/[id]/page.tsx
// Displays courses within a semester

// apps/student/src/app/(portal)/courses/[id]/page.tsx
// Course detail with Genially embed and project submission

// apps/student/src/app/(portal)/dashboard/page.tsx
// Student dashboard with progress overview

// apps/student/src/app/(portal)/learning-tree/page.tsx
// Learning tree visualization
```

### Feature Components

```typescript
// Semester Components
interface SemesterCardProps {
  semester: Semester;
  status: 'completed' | 'in_progress' | 'locked';
  courseCount: number;
  completedCount: number;
}

interface SemesterListProps {
  semesters: SemesterWithStatus[];
}

// Course Components
interface CourseCardProps {
  course: Course;
  progress: StudentProgress;
  isLocked: boolean;
}

interface CourseListProps {
  courses: CourseWithProgress[];
  semesterId: string;
}

interface GeniallyEmbedProps {
  url: string;
  title: string;
}

// Project Components
interface ProjectListProps {
  courseId: string;
  requiredProjects: number;
  submissions: ProjectSubmission[];
}

interface ProjectSubmitFormProps {
  courseId: string;
  projectNumber: number;
  existingSubmission?: ProjectSubmission;
  onSuccess: () => void;
}

// Progress Components
interface ProgressBarProps {
  value: number;
  max: number;
  showLabel?: boolean;
}

interface ProgressStatsProps {
  totalCourses: number;
  completedCourses: number;
  totalProjects: number;
  submittedProjects: number;
}

// Learning Tree Components
interface TreeNodeProps {
  node: LearningTreeNode;
  status: 'completed' | 'current' | 'locked';
  onClick: () => void;
}

interface LearningTreeProps {
  semesters: SemesterWithStatus[];
  currentSemesterId?: string;
}
```

### Custom Hooks

```typescript
// apps/student/src/hooks/useMySemesters.ts
export function useMySemesters(): UseQueryResult<SemesterWithStatus[]>;

// apps/student/src/hooks/useSemesterCourses.ts
export function useSemesterCourses(semesterId: string): UseQueryResult<CourseWithProgress[]>;

// apps/student/src/hooks/useMyProgress.ts
export function useMyProgress(): UseQueryResult<OverallProgress>;

// apps/student/src/hooks/useCourseProgress.ts
export function useCourseProgress(courseId: string): UseQueryResult<StudentProgress>;

// apps/student/src/hooks/useMyProjects.ts
export function useMyProjects(courseId: string): UseQueryResult<ProjectSubmission[]>;

// apps/student/src/hooks/useSubmitProject.ts
export function useSubmitProject(): UseMutationResult<Result<ProjectSubmission>, Error, SubmitProjectInput>;

// apps/student/src/hooks/useUpdateProgress.ts
export function useUpdateProgress(): UseMutationResult<Result<void>, Error, UpdateProgressInput>;
```

## Data Models

### Progress Schema

```typescript
// packages/schemas/src/progress.schema.ts
import { z } from 'zod';
import { BaseEntitySchema, IdSchema, TimestampSchema } from './common.schema';

export const ProgressStatusSchema = z.enum(['not_started', 'in_progress', 'completed', 'locked']);
export type ProgressStatus = z.infer<typeof ProgressStatusSchema>;

export const StudentProgressSchema = BaseEntitySchema.extend({
  studentId: IdSchema,
  courseId: IdSchema,
  completedSessions: z.number().int().nonnegative().default(0),
  projectsSubmitted: z.number().int().nonnegative().default(0),
  status: ProgressStatusSchema.default('not_started'),
  completedAt: TimestampSchema.nullable().default(null),
});

export type StudentProgress = z.infer<typeof StudentProgressSchema>;

export const CreateProgressInputSchema = StudentProgressSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateProgressInput = z.infer<typeof CreateProgressInputSchema>;

export const UpdateProgressInputSchema = z.object({
  completedSessions: z.number().int().nonnegative().optional(),
  projectsSubmitted: z.number().int().nonnegative().optional(),
  status: ProgressStatusSchema.optional(),
});

export type UpdateProgressInput = z.infer<typeof UpdateProgressInputSchema>;
```

### Project Submission Schema

```typescript
// packages/schemas/src/project.schema.ts
import { z } from 'zod';
import { BaseEntitySchema, IdSchema, TimestampSchema } from './common.schema';

export const SubmissionTypeSchema = z.enum(['drive', 'behance', 'other']);
export type SubmissionType = z.infer<typeof SubmissionTypeSchema>;

export const ProjectSubmissionSchema = BaseEntitySchema.extend({
  studentId: IdSchema,
  courseId: IdSchema,
  projectNumber: z.number().int().positive(),
  title: z.string().max(200).optional(),
  submissionUrl: z.string().url('URL không hợp lệ'),
  submissionType: SubmissionTypeSchema,
  notes: z.string().max(500).optional(),
  submittedAt: TimestampSchema,
});

export type ProjectSubmission = z.infer<typeof ProjectSubmissionSchema>;

export const CreateProjectSubmissionInputSchema = z.object({
  courseId: IdSchema,
  projectNumber: z.number().int().positive(),
  title: z.string().max(200).optional(),
  submissionUrl: z.string().url('URL không hợp lệ'),
  notes: z.string().max(500).optional(),
});

export type CreateProjectSubmissionInput = z.infer<typeof CreateProjectSubmissionInputSchema>;

export const UpdateProjectSubmissionInputSchema = CreateProjectSubmissionInputSchema.partial();

export type UpdateProjectSubmissionInput = z.infer<typeof UpdateProjectSubmissionInputSchema>;

// Helper function to detect submission type from URL
export function detectSubmissionType(url: string): SubmissionType {
  if (url.includes('drive.google.com') || url.includes('docs.google.com')) {
    return 'drive';
  }
  if (url.includes('behance.net')) {
    return 'behance';
  }
  return 'other';
}
```

### Derived Types

```typescript
// packages/schemas/src/student-portal.types.ts

export interface SemesterWithStatus {
  semester: Semester;
  status: 'completed' | 'in_progress' | 'locked';
  courseCount: number;
  completedCount: number;
}

export interface CourseWithProgress {
  course: Course;
  progress: StudentProgress | null;
  isLocked: boolean;
  previousCourse?: Course;
  nextCourse?: Course;
}

export interface OverallProgress {
  totalCourses: number;
  completedCourses: number;
  inProgressCourses: number;
  totalProjects: number;
  submittedProjects: number;
  completionPercentage: number;
  currentCourse?: CourseWithProgress;
  nextCourses: Course[];
}

export interface LearningTreeNode {
  id: string;
  type: 'semester' | 'major' | 'milestone';
  label: string;
  status: 'completed' | 'current' | 'locked';
  children?: LearningTreeNode[];
}
```

## Firestore Collections

```
/progress/{progressId}
  - id: string
  - studentId: string
  - courseId: string
  - completedSessions: number
  - projectsSubmitted: number
  - status: 'not_started' | 'in_progress' | 'completed' | 'locked'
  - completedAt: timestamp | null
  - createdAt: timestamp
  - updatedAt: timestamp

/projectSubmissions/{submissionId}
  - id: string
  - studentId: string
  - courseId: string
  - projectNumber: number
  - title: string (optional)
  - submissionUrl: string
  - submissionType: 'drive' | 'behance' | 'other'
  - notes: string (optional)
  - submittedAt: timestamp
  - createdAt: timestamp
  - updatedAt: timestamp
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Semester list ordering consistency
*For any* list of semesters, when displayed to a student, the semesters should be sorted by their order field in ascending order.
**Validates: Requirements 1.1**

### Property 2: Course list ordering consistency
*For any* list of courses within a semester, when displayed to a student, the courses should be sorted by their order field in ascending order.
**Validates: Requirements 2.1**

### Property 3: Progress percentage calculation
*For any* student progress record, the progress percentage should equal (completedSessions / requiredSessions) * 100, capped at 100%.
**Validates: Requirements 2.4, 5.2**

### Property 4: Genially embed URL transformation
*For any* valid Genially URL, the embed component should produce a valid iframe src URL that can be loaded.
**Validates: Requirements 3.2**

### Property 5: Course navigation consistency
*For any* course in a semester, the previous/next navigation should correctly identify adjacent courses based on order.
**Validates: Requirements 3.5**

### Property 6: Project submission URL validation
*For any* string input, the submission URL validation should accept valid URLs and reject invalid ones.
**Validates: Requirements 4.2**

### Property 7: Submission type detection
*For any* valid URL, the submission type detection should correctly identify drive, behance, or other based on URL patterns.
**Validates: Requirements 8.3**

### Property 8: Progress schema validation
*For any* progress record, completedSessions and projectsSubmitted should be non-negative integers, and status should be one of the valid enum values.
**Validates: Requirements 7.1, 7.2, 7.3**

### Property 9: Timestamp management
*For any* progress update operation, the updatedAt timestamp should be set to the current time, and completedAt should be set when status becomes 'completed'.
**Validates: Requirements 7.4, 7.5**

### Property 10: Project submission round-trip
*For any* valid project submission, serializing to JSON and deserializing back should produce an equivalent object.
**Validates: Requirements 8.5**

### Property 11: Overall progress calculation
*For any* student with progress records, the overall completion percentage should equal (completedCourses / totalCourses) * 100.
**Validates: Requirements 5.2, 5.3**

### Property 12: Prerequisite course identification
*For any* locked course, the system should correctly identify which prerequisite course needs to be completed.
**Validates: Requirements 10.3**

### Property 13: Error message localization
*For any* error code, the system should produce a user-friendly error message in Vietnamese.
**Validates: Requirements 10.1**

## Error Handling

### Error Codes

```typescript
// packages/types/src/error.types.ts - Phase 3 additions
export const ErrorCode = {
  // ... existing codes
  
  // Progress errors
  PROGRESS_NOT_FOUND: 'PROGRESS_NOT_FOUND',
  PROGRESS_UPDATE_FAILED: 'PROGRESS_UPDATE_FAILED',
  
  // Project submission errors
  SUBMISSION_NOT_FOUND: 'SUBMISSION_NOT_FOUND',
  SUBMISSION_CREATE_FAILED: 'SUBMISSION_CREATE_FAILED',
  SUBMISSION_UPDATE_FAILED: 'SUBMISSION_UPDATE_FAILED',
  SUBMISSION_DELETE_FAILED: 'SUBMISSION_DELETE_FAILED',
  INVALID_SUBMISSION_URL: 'INVALID_SUBMISSION_URL',
  
  // Course access errors
  COURSE_LOCKED: 'COURSE_LOCKED',
  PREREQUISITE_NOT_COMPLETED: 'PREREQUISITE_NOT_COMPLETED',
} as const;
```

### Vietnamese Error Messages

```json
// packages/ui/src/locales/vi.json - Phase 3 additions
{
  "errors": {
    "PROGRESS_NOT_FOUND": "Không tìm thấy tiến độ học tập",
    "PROGRESS_UPDATE_FAILED": "Cập nhật tiến độ thất bại",
    "SUBMISSION_NOT_FOUND": "Không tìm thấy bài nộp",
    "SUBMISSION_CREATE_FAILED": "Nộp bài thất bại",
    "SUBMISSION_UPDATE_FAILED": "Cập nhật bài nộp thất bại",
    "SUBMISSION_DELETE_FAILED": "Xóa bài nộp thất bại",
    "INVALID_SUBMISSION_URL": "URL không hợp lệ. Vui lòng sử dụng link Google Drive hoặc Behance",
    "COURSE_LOCKED": "Môn học chưa được mở khóa",
    "PREREQUISITE_NOT_COMPLETED": "Vui lòng hoàn thành môn {courseName} trước"
  }
}
```

## Testing Strategy

### Unit Testing

- Test schema validation for Progress and ProjectSubmission
- Test helper functions (detectSubmissionType, calculateProgress)
- Test URL transformation for Genially embed
- Test progress calculation logic

### Property-Based Testing

Using `fast-check` library for property-based tests:

- Test semester/course ordering consistency
- Test progress percentage calculation bounds
- Test URL validation with generated URLs
- Test submission type detection with various URL patterns
- Test round-trip serialization for submissions
- Test timestamp management on updates

### Integration Testing

- Test data fetching hooks with mock Firestore
- Test form submission flows
- Test navigation between pages

