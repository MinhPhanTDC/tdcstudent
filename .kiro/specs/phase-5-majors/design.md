# Design Document - Phase 5: Majors (Quản lý Chuyên ngành)

## Overview

Phase 5 xây dựng hệ thống quản lý chuyên ngành cho The Design Council. Hệ thống cho phép:
- Admin CRUD chuyên ngành (Graphic Design, UI/UX, Motion Graphics...)
- Gắn môn học vào từng chuyên ngành với thứ tự và loại (bắt buộc/tự chọn)
- Cấu hình học kỳ yêu cầu chọn chuyên ngành
- Học viên chọn chuyên ngành (không thể đổi sau khi chọn)
- Hiển thị lộ trình học tập theo chuyên ngành đã chọn

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Admin App                                    │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │
│  │  MajorList      │  │  MajorForm      │  │  MajorCourses   │     │
│  │  Page           │  │  Page           │  │  Manager        │     │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘     │
│           │                    │                    │               │
│           └────────────────────┼────────────────────┘               │
│                                │                                    │
│                    ┌───────────▼───────────┐                       │
│                    │     useMajors()       │                       │
│                    │   useMajorCourses()   │                       │
│                    └───────────┬───────────┘                       │
└────────────────────────────────┼────────────────────────────────────┘
                                 │
┌────────────────────────────────┼────────────────────────────────────┐
│                         Student App                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │
│  │  SelectMajor    │  │  MyMajor        │  │  LearningTree   │     │
│  │  Page           │  │  Page           │  │  (integrated)   │     │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘     │
│           │                    │                    │               │
│           └────────────────────┼────────────────────┘               │
│                                │                                    │
│                    ┌───────────▼───────────┐                       │
│                    │   useSelectMajor()    │                       │
│                    │   useMyMajor()        │                       │
│                    └───────────┬───────────┘                       │
└────────────────────────────────┼────────────────────────────────────┘
                                 │
┌────────────────────────────────▼────────────────────────────────────┐
│                      Firebase Services                               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │
│  │  MajorService   │  │ MajorCourse     │  │  StudentService │     │
│  │                 │  │ Service         │  │  (extended)     │     │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘     │
│           │                    │                    │               │
│           └────────────────────┼────────────────────┘               │
│                                │                                    │
│                    ┌───────────▼───────────┐                       │
│                    │     Repositories      │                       │
│                    │  major.repository     │                       │
│                    │  majorCourse.repo     │                       │
│                    └───────────┬───────────┘                       │
└────────────────────────────────┼────────────────────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │       Firestore         │
                    │  /majors/{majorId}      │
                    │  /majorCourses/{id}     │
                    │  /students/{id}         │
                    │  /semesters/{id}        │
                    └─────────────────────────┘
```

## Components and Interfaces

### Admin Components

```
apps/admin/src/
├── app/(dashboard)/majors/
│   ├── page.tsx                    # Danh sách chuyên ngành
│   ├── new/page.tsx                # Tạo chuyên ngành mới
│   └── [id]/page.tsx               # Chi tiết/Sửa chuyên ngành
├── components/features/major-management/
│   ├── MajorList.tsx               # Danh sách chuyên ngành
│   ├── MajorCard.tsx               # Card hiển thị chuyên ngành
│   ├── MajorForm.tsx               # Form tạo/sửa chuyên ngành
│   ├── MajorCoursesManager.tsx     # Quản lý môn học của ngành
│   ├── MajorCourseItem.tsx         # Item môn học trong ngành
│   ├── AddCourseModal.tsx          # Modal thêm môn vào ngành
│   └── index.ts
└── hooks/
    ├── useMajors.ts                # Hook quản lý majors
    └── useMajorCourses.ts          # Hook quản lý major courses
```

### Student Components

```
apps/student/src/
├── app/(portal)/
│   ├── select-major/page.tsx       # Trang chọn chuyên ngành
│   └── my-major/page.tsx           # Trang chuyên ngành của tôi
├── components/features/major/
│   ├── MajorSelectionList.tsx      # Danh sách ngành để chọn
│   ├── MajorSelectionCard.tsx      # Card ngành với preview
│   ├── MajorCoursePreview.tsx      # Preview danh sách môn của ngành
│   ├── MajorConfirmModal.tsx       # Modal xác nhận chọn ngành
│   ├── MyMajorProgress.tsx         # Tiến độ chuyên ngành
│   ├── MajorCourseList.tsx         # Danh sách môn chuyên ngành
│   └── index.ts
├── lib/
│   └── majorGuard.ts               # Guard kiểm tra major selection
└── hooks/
    ├── useSelectMajor.ts           # Hook chọn chuyên ngành
    └── useMyMajor.ts               # Hook xem chuyên ngành của tôi
```

### Firebase Services

```
packages/firebase/src/
├── services/
│   ├── major.service.ts            # Major business logic
│   └── major-course.service.ts     # MajorCourse business logic
└── repositories/
    ├── major.repository.ts         # Major CRUD
    └── major-course.repository.ts  # MajorCourse CRUD
```

### Schemas

```
packages/schemas/src/
├── major.schema.ts                 # Major schema
└── major-course.schema.ts          # MajorCourse schema
```

## Data Models

### Major Schema

```typescript
// packages/schemas/src/major.schema.ts
import { z } from 'zod';
import { BaseEntitySchema, UrlSchema } from './common.schema';

export const MajorSchema = BaseEntitySchema.extend({
  name: z.string().min(1, 'Tên chuyên ngành không được để trống').max(100),
  description: z.string().max(1000).default(''),
  thumbnailUrl: UrlSchema.optional().or(z.literal('')),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Màu phải là mã hex hợp lệ').optional(),
  isActive: z.boolean().default(true),
});

export type Major = z.infer<typeof MajorSchema>;

export const CreateMajorInputSchema = MajorSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateMajorInput = z.infer<typeof CreateMajorInputSchema>;

export const UpdateMajorInputSchema = MajorSchema.partial()
  .required({ id: true })
  .omit({ createdAt: true });

export type UpdateMajorInput = z.infer<typeof UpdateMajorInputSchema>;
```

### MajorCourse Schema

```typescript
// packages/schemas/src/major-course.schema.ts
import { z } from 'zod';
import { IdSchema, TimestampSchema } from './common.schema';

export const MajorCourseSchema = z.object({
  id: IdSchema,
  majorId: IdSchema,
  courseId: IdSchema,
  order: z.number().int().nonnegative().default(0),
  isRequired: z.boolean().default(true),
  createdAt: TimestampSchema,
});

export type MajorCourse = z.infer<typeof MajorCourseSchema>;

export const CreateMajorCourseInputSchema = MajorCourseSchema.omit({
  id: true,
  createdAt: true,
});

export type CreateMajorCourseInput = z.infer<typeof CreateMajorCourseInputSchema>;

export const UpdateMajorCourseInputSchema = MajorCourseSchema.partial()
  .required({ id: true })
  .omit({ createdAt: true, majorId: true, courseId: true });

export type UpdateMajorCourseInput = z.infer<typeof UpdateMajorCourseInputSchema>;
```

### Extended Semester Schema

```typescript
// Update packages/schemas/src/semester.schema.ts
export const SemesterSchema = BaseEntitySchema.extend({
  // ... existing fields
  requiresMajorSelection: z.boolean().default(false), // NEW FIELD
});
```

### Extended Student Schema

```typescript
// Update packages/schemas/src/student.schema.ts
export const StudentSchema = BaseEntitySchema.extend({
  // ... existing fields
  selectedMajorId: z.string().optional(),
  majorSelectedAt: TimestampSchema.optional(), // NEW FIELD
});
```

### Firestore Collections

```
/majors/{majorId}
  - id: string
  - name: string
  - description: string
  - thumbnailUrl: string (optional)
  - color: string (optional, hex)
  - isActive: boolean
  - createdAt: timestamp
  - updatedAt: timestamp

/majorCourses/{majorCourseId}
  - id: string
  - majorId: string
  - courseId: string
  - order: number
  - isRequired: boolean
  - createdAt: timestamp

/semesters/{semesterId}
  + requiresMajorSelection: boolean (NEW)

/students/{studentId}
  + selectedMajorId: string (optional)
  + majorSelectedAt: timestamp (optional, NEW)
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Major schema round-trip
*For any* valid Major object, serializing to JSON and deserializing back through MajorSchema SHALL produce an equivalent object with all fields preserved.
**Validates: Requirements 7.1, 7.2, 7.5**

### Property 2: MajorCourse schema round-trip
*For any* valid MajorCourse object, serializing to JSON and deserializing back through MajorCourseSchema SHALL produce an equivalent object with all fields preserved.
**Validates: Requirements 7.3, 7.4, 7.6**

### Property 3: Major name validation
*For any* string composed entirely of whitespace characters, creating a Major with that name SHALL be rejected with a validation error.
**Validates: Requirements 1.5**

### Property 4: Major soft delete preserves data
*For any* Major, after soft delete, the Major SHALL have isActive set to false while all other fields remain unchanged.
**Validates: Requirements 1.4**

### Property 5: Major list sorting
*For any* list of Majors, the sorted result SHALL have all active majors before inactive majors, and within each group, majors SHALL be sorted alphabetically by name.
**Validates: Requirements 1.6**

### Property 6: MajorCourse order sorting
*For any* list of MajorCourses belonging to the same major, the sorted result SHALL be ordered by the order field in ascending sequence.
**Validates: Requirements 2.6**

### Property 7: Duplicate course prevention
*For any* Major and Course combination that already exists as a MajorCourse, attempting to add the same combination again SHALL be rejected.
**Validates: Requirements 2.7**

### Property 8: Course reorder consistency
*For any* list of MajorCourses after reordering, the order fields SHALL form a valid sequence (0, 1, 2, ...) with no gaps or duplicates.
**Validates: Requirements 2.3**

### Property 9: Toggle requiresMajorSelection
*For any* Semester, toggling requiresMajorSelection SHALL correctly flip the boolean value (true→false, false→true).
**Validates: Requirements 3.1, 3.2**

### Property 10: Major selection blocking
*For any* Student without selectedMajorId accessing a Semester with requiresMajorSelection=true, the System SHALL block access (return blocked status).
**Validates: Requirements 3.4**

### Property 11: Major selection permanence
*For any* Student with an existing selectedMajorId, attempting to change the major SHALL be rejected and the original selectedMajorId SHALL remain unchanged.
**Validates: Requirements 4.6**

### Property 12: Major selection updates both fields
*For any* Student confirming major selection, both selectedMajorId and majorSelectedAt SHALL be set, with majorSelectedAt being a valid timestamp.
**Validates: Requirements 4.5**

### Property 13: Major progress calculation
*For any* Student with a selected major, the progress percentage SHALL equal (completed courses / total courses) * 100, rounded appropriately.
**Validates: Requirements 5.3**

### Property 14: Course status derivation
*For any* MajorCourse and Student progress data, the course status SHALL be correctly derived as 'completed' (100%), 'in-progress' (1-99%), or 'locked' (0% or prerequisites not met).
**Validates: Requirements 5.2**

### Property 15: Admin major override
*For any* Student with or without selectedMajorId, when an admin overrides the major, the selectedMajorId SHALL be updated to the new value.
**Validates: Requirements 6.2**

## Error Handling

### Error Codes

```typescript
// packages/types/src/error.types.ts (extend)
export const ErrorCode = {
  // ... existing codes
  
  // Major errors
  MAJOR_NOT_FOUND: 'MAJOR_NOT_FOUND',
  MAJOR_NAME_REQUIRED: 'MAJOR_NAME_REQUIRED',
  MAJOR_ALREADY_EXISTS: 'MAJOR_ALREADY_EXISTS',
  
  // MajorCourse errors
  MAJOR_COURSE_NOT_FOUND: 'MAJOR_COURSE_NOT_FOUND',
  MAJOR_COURSE_DUPLICATE: 'MAJOR_COURSE_DUPLICATE',
  
  // Major selection errors
  MAJOR_SELECTION_REQUIRED: 'MAJOR_SELECTION_REQUIRED',
  MAJOR_ALREADY_SELECTED: 'MAJOR_ALREADY_SELECTED',
  MAJOR_SELECTION_BLOCKED: 'MAJOR_SELECTION_BLOCKED',
} as const;
```

### Error Messages

```typescript
// packages/ui/src/utils/errorMessages.ts (extend)
export const errorMessages: Record<string, string> = {
  // ... existing messages
  
  MAJOR_NOT_FOUND: 'Không tìm thấy chuyên ngành',
  MAJOR_NAME_REQUIRED: 'Tên chuyên ngành không được để trống',
  MAJOR_ALREADY_EXISTS: 'Chuyên ngành đã tồn tại',
  MAJOR_COURSE_NOT_FOUND: 'Không tìm thấy môn học trong chuyên ngành',
  MAJOR_COURSE_DUPLICATE: 'Môn học đã có trong chuyên ngành',
  MAJOR_SELECTION_REQUIRED: 'Bạn cần chọn chuyên ngành để tiếp tục',
  MAJOR_ALREADY_SELECTED: 'Bạn đã chọn chuyên ngành và không thể thay đổi',
  MAJOR_SELECTION_BLOCKED: 'Chưa đến thời điểm chọn chuyên ngành',
};
```

## Testing Strategy

### Property-Based Testing

Sử dụng **fast-check** library cho property-based testing.

Mỗi property test phải:
- Chạy tối thiểu 100 iterations
- Tag với format: `**Feature: phase-5-majors, Property {number}: {property_text}**`
- Reference correctness property từ design document

### Unit Testing

Unit tests cover:
- Schema validation edge cases
- Repository CRUD operations
- Service business logic
- Component rendering

### Test Files Structure

```
packages/schemas/src/__tests__/
├── major.schema.property.test.ts       # Property 1, 3
└── major-course.schema.property.test.ts # Property 2

packages/firebase/src/services/__tests__/
├── major.service.property.test.ts      # Property 4, 5, 7
└── major-course.service.property.test.ts # Property 6, 8

packages/firebase/src/repositories/__tests__/
├── major.repository.property.test.ts
└── major-course.repository.property.test.ts

apps/admin/src/hooks/__tests__/
├── useMajors.property.test.ts
└── useMajorCourses.property.test.ts

apps/student/src/hooks/__tests__/
├── useSelectMajor.property.test.ts     # Property 10, 11, 12
└── useMyMajor.property.test.ts         # Property 13, 14
```

### Integration Points

- Semester form: thêm toggle requiresMajorSelection
- Student service: thêm major selection logic
- Learning tree: tích hợp major courses
- Progress calculation: include major courses
