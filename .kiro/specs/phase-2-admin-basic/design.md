# Design Document

## Overview

Phase 2 - Admin Basic Management thiết kế các tính năng CRUD cho Admin Dashboard bao gồm quản lý Học kỳ, Môn học, Học viên và Import hàng loạt. Thiết kế tuân theo kiến trúc monorepo hiện có với shared packages và Firebase backend.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ADMIN APP (apps/admin)                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         PAGES (App Router)                           │    │
│  │  /semesters    /courses    /students    /dashboard                  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                         │
│  ┌─────────────────────────────────┴───────────────────────────────────┐    │
│  │                      FEATURE COMPONENTS                              │    │
│  │  semester-management/  course-management/  student-management/      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                         │
│  ┌─────────────────────────────────┴───────────────────────────────────┐    │
│  │                         CUSTOM HOOKS                                 │    │
│  │  useSemesters  useCourses  useStudents  useImport  useDashboard     │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                         │
└────────────────────────────────────┼─────────────────────────────────────────┘
                                     │
┌────────────────────────────────────┼─────────────────────────────────────────┐
│                          SHARED PACKAGES                                      │
├────────────────────────────────────┼─────────────────────────────────────────┤
│  @tdc/schemas          @tdc/firebase              @tdc/ui                    │
│  ├─ semester.schema    ├─ repositories/           ├─ Table                   │
│  ├─ course.schema      │  ├─ semester.repo        ├─ Modal                   │
│  └─ student.schema     │  ├─ course.repo          ├─ Toast                   │
│                        │  └─ student.repo         └─ FileUpload              │
│                        └─ auth.ts                                            │
└──────────────────────────────────────────────────────────────────────────────┘
                                     │
                          ┌──────────┴──────────┐
                          │      FIREBASE       │
                          │  ├─ Auth            │
                          │  └─ Firestore       │
                          └─────────────────────┘
```

## Components and Interfaces

### 1. Semester Management Components

```
apps/admin/src/components/features/semester-management/
├── SemesterList.tsx           # Danh sách học kỳ với reorder
├── SemesterForm.tsx           # Form tạo/sửa học kỳ
├── SemesterCard.tsx           # Card hiển thị thông tin học kỳ
├── SemesterDeleteModal.tsx    # Modal xác nhận xóa
└── index.ts
```

#### SemesterList Props
```typescript
interface SemesterListProps {
  semesters: Semester[];
  isLoading: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onReorder: (ids: string[]) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
}
```

#### SemesterForm Props
```typescript
interface SemesterFormProps {
  semester?: Semester;           // undefined = create mode
  onSubmit: (data: CreateSemesterInput | UpdateSemesterInput) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}
```

### 2. Course Management Components

```
apps/admin/src/components/features/course-management/
├── CourseList.tsx             # Danh sách môn học với filter
├── CourseForm.tsx             # Form tạo/sửa môn học
├── CourseCard.tsx             # Card hiển thị thông tin môn học
├── CourseSemesterFilter.tsx   # Filter theo học kỳ
├── CourseDeleteModal.tsx      # Modal xác nhận xóa
└── index.ts
```

#### CourseList Props
```typescript
interface CourseListProps {
  courses: Course[];
  isLoading: boolean;
  selectedSemesterId?: string;
  onSemesterFilter: (semesterId: string | undefined) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onReorder: (semesterId: string, courseIds: string[]) => void;
}
```

### 3. Student Management Components

```
apps/admin/src/components/features/student-management/
├── StudentList.tsx            # Danh sách học viên với pagination
├── StudentForm.tsx            # Form tạo/sửa học viên
├── StudentCard.tsx            # Card hiển thị thông tin học viên
├── StudentSearch.tsx          # Search component
├── StudentFilters.tsx         # Filter by status, semester
├── StudentImport/
│   ├── StudentImport.tsx      # Main import component
│   ├── ImportPreview.tsx      # Preview table
│   ├── ImportProgress.tsx     # Progress indicator
│   └── ImportResult.tsx       # Result summary
└── index.ts
```

#### StudentList Props
```typescript
interface StudentListProps {
  students: Student[];
  pagination: Pagination;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onSearch: (query: string) => void;
  onFilter: (filters: StudentFilters) => void;
  onEdit: (id: string) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
}
```

### 4. Dashboard Components

```
apps/admin/src/components/features/dashboard/
├── DashboardStats.tsx         # Statistics cards
├── RecentStudents.tsx         # Recent students list
├── QuickActions.tsx           # Quick action buttons
└── index.ts
```

## Data Models

### Semester Schema
```typescript
// packages/schemas/src/semester.schema.ts
import { z } from 'zod';
import { BaseEntitySchema } from './common.schema';

export const SemesterSchema = BaseEntitySchema.extend({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  order: z.number().int().nonnegative(),
  isActive: z.boolean().default(true),
  requiresMajorSelection: z.boolean().default(false),
});

export type Semester = z.infer<typeof SemesterSchema>;

export const CreateSemesterInputSchema = SemesterSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateSemesterInput = z.infer<typeof CreateSemesterInputSchema>;

export const UpdateSemesterInputSchema = SemesterSchema.partial().required({ id: true });

export type UpdateSemesterInput = z.infer<typeof UpdateSemesterInputSchema>;
```

### Course Schema (Extended)
```typescript
// packages/schemas/src/course.schema.ts
import { z } from 'zod';
import { BaseEntitySchema } from './common.schema';

export const CourseSchema = BaseEntitySchema.extend({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  semesterId: z.string().min(1),
  geniallyUrl: z.string().url().optional().or(z.literal('')),
  thumbnailUrl: z.string().url().optional().or(z.literal('')),
  order: z.number().int().nonnegative(),
  requiredSessions: z.number().int().positive().default(10),
  requiredProjects: z.number().int().nonnegative().default(1),
  isActive: z.boolean().default(true),
});

export type Course = z.infer<typeof CourseSchema>;
```

### Student Schema (Extended)
```typescript
// packages/schemas/src/student.schema.ts
import { z } from 'zod';
import { BaseEntitySchema, EmailSchema } from './common.schema';

export const StudentSchema = BaseEntitySchema.extend({
  userId: z.string().min(1),
  email: EmailSchema,
  displayName: z.string().min(2).max(100),
  phone: z.string().optional(),
  currentSemesterId: z.string().optional(),
  selectedMajorId: z.string().optional(),
  enrolledAt: z.date(),
  isActive: z.boolean().default(true),
});

export type Student = z.infer<typeof StudentSchema>;

export const CreateStudentInputSchema = z.object({
  email: EmailSchema,
  displayName: z.string().min(2).max(100),
  phone: z.string().optional(),
  password: z.string().min(6).optional(),
});

export type CreateStudentInput = z.infer<typeof CreateStudentInputSchema>;
```

### Import Data Schema
```typescript
// packages/schemas/src/import.schema.ts
import { z } from 'zod';

export const ImportRowSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
});

export type ImportRow = z.infer<typeof ImportRowSchema>;

export const ImportResultSchema = z.object({
  totalRows: z.number(),
  validRows: z.number(),
  invalidRows: z.number(),
  successCount: z.number(),
  failureCount: z.number(),
  failures: z.array(z.object({
    row: z.number(),
    email: z.string(),
    reason: z.string(),
  })),
});

export type ImportResult = z.infer<typeof ImportResultSchema>;
```

## Repository Interfaces

### Semester Repository
```typescript
// packages/firebase/src/repositories/semester.repository.ts
interface SemesterRepository {
  findAll(): Promise<Result<Semester[]>>;
  findById(id: string): Promise<Result<Semester>>;
  create(data: CreateSemesterInput): Promise<Result<Semester>>;
  update(id: string, data: Partial<Semester>): Promise<Result<Semester>>;
  delete(id: string): Promise<Result<void>>;
  reorder(ids: string[]): Promise<Result<void>>;
  hasAssociatedCourses(id: string): Promise<Result<boolean>>;
}
```

### Course Repository
```typescript
// packages/firebase/src/repositories/course.repository.ts
interface CourseRepository {
  findAll(): Promise<Result<Course[]>>;
  findById(id: string): Promise<Result<Course>>;
  findBySemester(semesterId: string): Promise<Result<Course[]>>;
  create(data: CreateCourseInput): Promise<Result<Course>>;
  update(id: string, data: Partial<Course>): Promise<Result<Course>>;
  delete(id: string): Promise<Result<void>>;
  reorder(semesterId: string, courseIds: string[]): Promise<Result<void>>;
  moveTosemester(courseId: string, newSemesterId: string): Promise<Result<Course>>;
}
```

### Student Repository
```typescript
// packages/firebase/src/repositories/student.repository.ts
interface StudentRepository {
  findAll(filters?: StudentFilters, pagination?: PaginationInput): Promise<Result<PaginatedResult<Student>>>;
  findById(id: string): Promise<Result<Student>>;
  search(query: string): Promise<Result<Student[]>>;
  create(data: CreateStudentInput): Promise<Result<Student>>;
  update(id: string, data: Partial<Student>): Promise<Result<Student>>;
  deactivate(id: string): Promise<Result<void>>;
  activate(id: string): Promise<Result<void>>;
  bulkCreate(students: CreateStudentInput[]): Promise<Result<ImportResult>>;
}
```

## Custom Hooks

### useSemesters Hook
```typescript
// apps/admin/src/hooks/useSemesters.ts
export const semesterKeys = {
  all: ['semesters'] as const,
  lists: () => [...semesterKeys.all, 'list'] as const,
  detail: (id: string) => [...semesterKeys.all, 'detail', id] as const,
};

export function useSemesters() {
  return useQuery({
    queryKey: semesterKeys.lists(),
    queryFn: () => semesterRepository.findAll(),
  });
}

export function useCreateSemester() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSemesterInput) => semesterRepository.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: semesterKeys.lists() }),
  });
}

export function useReorderSemesters() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => semesterRepository.reorder(ids),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: semesterKeys.lists() }),
  });
}
```

### useStudentImport Hook
```typescript
// apps/admin/src/hooks/useStudentImport.ts
interface ImportState {
  status: 'idle' | 'parsing' | 'validating' | 'previewing' | 'importing' | 'complete' | 'error';
  rows: ImportRow[];
  validRows: ImportRow[];
  invalidRows: { row: ImportRow; errors: string[] }[];
  progress: { current: number; total: number };
  result: ImportResult | null;
  error: string | null;
}

export function useStudentImport() {
  const [state, dispatch] = useReducer(importReducer, initialState);
  
  const parseFile = async (file: File) => { /* ... */ };
  const validateRows = async () => { /* ... */ };
  const executeImport = async () => { /* ... */ };
  const reset = () => { /* ... */ };
  
  return { state, parseFile, validateRows, executeImport, reset };
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Semester list ordering consistency
*For any* list of semesters retrieved from the system, the semesters SHALL be sorted in ascending order by the `order` field, with no duplicate order values.
**Validates: Requirements 1.1, 1.7**

### Property 2: Semester schema validation
*For any* semester data being persisted, the data SHALL pass SemesterSchema validation, ensuring name is 1-100 characters and order is a non-negative integer.
**Validates: Requirements 1.2, 6.1**

### Property 3: Timestamp management
*For any* create or update operation on semesters, courses, or students, the system SHALL set createdAt on creation and update updatedAt to a timestamp greater than the previous value on updates.
**Validates: Requirements 1.4, 2.5, 3.5, 6.6**

### Property 4: Active status toggle round-trip
*For any* semester or student, toggling the isActive status twice SHALL return the entity to its original isActive state.
**Validates: Requirements 1.8, 3.6, 3.7**

### Property 5: Course filtering by semester
*For any* course list filtered by semesterId, all returned courses SHALL have their semesterId field equal to the filter value.
**Validates: Requirements 2.1, 2.7**

### Property 6: Course schema validation with defaults
*For any* course created without specifying requiredSessions or requiredProjects, the system SHALL set default values of 10 and 1 respectively.
**Validates: Requirements 2.4, 6.2**

### Property 7: URL validation for Genially
*For any* course with a non-empty geniallyUrl, the URL SHALL be a valid URL format according to the URL specification.
**Validates: Requirements 2.3**

### Property 8: Course reorder consistency
*For any* reorder operation on courses within a semester, all affected courses SHALL have unique, consecutive order values starting from 0.
**Validates: Requirements 2.8**

### Property 9: Course semester change order reset
*For any* course moved to a different semester, the course's order SHALL be set to the maximum order value + 1 in the target semester.
**Validates: Requirements 2.9**

### Property 10: Student search result relevance
*For any* search query on students, all returned results SHALL contain the search term in either the displayName or email field (case-insensitive).
**Validates: Requirements 3.1**

### Property 11: Student creation dual-record consistency
*For any* student created through the admin interface, both a Firebase Auth account and corresponding Firestore documents (users and students collections) SHALL exist with matching userId references.
**Validates: Requirements 3.2**

### Property 12: Password generation security
*For any* student created without a provided password, the generated password SHALL be at least 12 characters and contain uppercase, lowercase, numbers, and special characters.
**Validates: Requirements 3.3**

### Property 13: Student filter accuracy
*For any* student list filtered by active status or currentSemesterId, all returned students SHALL match the specified filter criteria.
**Validates: Requirements 3.9**

### Property 14: Import file parsing round-trip
*For any* valid CSV or Excel file with name and email columns, parsing the file SHALL extract all rows with correct name and email values matching the source data.
**Validates: Requirements 4.1, 4.2**

### Property 15: Import validation completeness
*For any* import file, the validation process SHALL identify all rows with missing required fields or invalid email formats, and the sum of valid + invalid rows SHALL equal total rows.
**Validates: Requirements 4.3**

### Property 16: Import selective creation
*For any* confirmed import operation, the number of created student accounts SHALL equal the number of valid rows, and no accounts SHALL be created for invalid rows.
**Validates: Requirements 4.6**

### Property 17: Import result accuracy
*For any* completed import, the result summary SHALL have successCount + failureCount equal to the number of attempted creations, and all failures SHALL have documented reasons.
**Validates: Requirements 4.8**

### Property 18: Import rate limiting
*For any* bulk import operation, the system SHALL not create more than 10 Firebase Auth accounts per second.
**Validates: Requirements 4.9**

### Property 19: Dashboard statistics accuracy
*For any* dashboard view, the displayed counts SHALL equal the actual count of documents in the respective Firestore collections.
**Validates: Requirements 5.1**

### Property 20: Recent students ordering
*For any* dashboard view, the recent students list SHALL display exactly 5 students (or fewer if total < 5) sorted by createdAt in descending order.
**Validates: Requirements 5.3**

### Property 21: Schema validation on read
*For any* data retrieved from Firestore, the data SHALL pass validation against the corresponding Zod schema before being returned to the application.
**Validates: Requirements 6.4**

### Property 22: Validation error structure
*For any* validation failure, the returned error SHALL include the specific field names and error messages for all invalid fields.
**Validates: Requirements 6.5**

### Property 23: Firebase error mapping completeness
*For any* Firebase Auth error, the system SHALL map the error code to a localized Vietnamese error message.
**Validates: Requirements 7.5**

### Property 24: URL state preservation
*For any* navigation between list pages, the filter and search parameters SHALL be preserved in the URL and restored when returning to the page.
**Validates: Requirements 8.5**

## Error Handling

### Error Code Mapping
```typescript
// packages/firebase/src/errors.ts (extended)
export const PHASE2_ERROR_CODES = {
  // Semester errors
  SEMESTER_NOT_FOUND: 'SEMESTER_NOT_FOUND',
  SEMESTER_HAS_COURSES: 'SEMESTER_HAS_COURSES',
  DUPLICATE_SEMESTER_ORDER: 'DUPLICATE_SEMESTER_ORDER',
  
  // Course errors
  COURSE_NOT_FOUND: 'COURSE_NOT_FOUND',
  INVALID_SEMESTER_REFERENCE: 'INVALID_SEMESTER_REFERENCE',
  INVALID_GENIALLY_URL: 'INVALID_GENIALLY_URL',
  
  // Student errors
  STUDENT_NOT_FOUND: 'STUDENT_NOT_FOUND',
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
  INVALID_EMAIL_FORMAT: 'INVALID_EMAIL_FORMAT',
  
  // Import errors
  INVALID_FILE_FORMAT: 'INVALID_FILE_FORMAT',
  IMPORT_RATE_LIMITED: 'IMPORT_RATE_LIMITED',
  IMPORT_PARTIAL_FAILURE: 'IMPORT_PARTIAL_FAILURE',
} as const;
```

### Vietnamese Error Messages
```typescript
// packages/ui/src/locales/vi.json (extended)
{
  "errors": {
    "SEMESTER_NOT_FOUND": "Không tìm thấy học kỳ",
    "SEMESTER_HAS_COURSES": "Không thể xóa học kỳ đang có môn học",
    "DUPLICATE_SEMESTER_ORDER": "Thứ tự học kỳ đã tồn tại",
    "COURSE_NOT_FOUND": "Không tìm thấy môn học",
    "INVALID_SEMESTER_REFERENCE": "Học kỳ không hợp lệ",
    "INVALID_GENIALLY_URL": "URL Genially không hợp lệ",
    "STUDENT_NOT_FOUND": "Không tìm thấy học viên",
    "EMAIL_ALREADY_EXISTS": "Email đã được sử dụng",
    "INVALID_EMAIL_FORMAT": "Định dạng email không hợp lệ",
    "INVALID_FILE_FORMAT": "Định dạng file không hỗ trợ",
    "IMPORT_RATE_LIMITED": "Đang xử lý, vui lòng đợi",
    "IMPORT_PARTIAL_FAILURE": "Một số bản ghi không thể import"
  }
}
```

## Testing Strategy

### Property-Based Testing Library
Sử dụng **fast-check** cho property-based testing trong TypeScript/JavaScript.

### Unit Tests
- Schema validation tests (valid/invalid inputs)
- Repository function tests with mocked Firestore
- Hook tests with mocked queries
- Utility function tests (password generation, file parsing)

### Property-Based Tests
Mỗi correctness property sẽ được implement bằng một property-based test với fast-check:

```typescript
// Example: Property 1 - Semester list ordering
import fc from 'fast-check';

describe('Semester ordering', () => {
  it('should always return semesters sorted by order field', () => {
    fc.assert(
      fc.property(
        fc.array(semesterArbitrary),
        (semesters) => {
          const sorted = sortSemesters(semesters);
          for (let i = 1; i < sorted.length; i++) {
            expect(sorted[i].order).toBeGreaterThan(sorted[i-1].order);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Test Configuration
- Minimum 100 iterations per property test
- Each test tagged with property reference: `**Feature: phase-2-admin-basic, Property {number}: {property_text}**`

## UI/UX Flow Diagrams

### Semester Management Flow
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Semester    │────▶│ Create/Edit │────▶│   Save      │
│ List Page   │     │ Form Modal  │     │  Success    │
└─────────────┘     └─────────────┘     └─────────────┘
      │                                        │
      │ Delete                                 │
      ▼                                        ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Check for   │────▶│ Confirm     │────▶│ Delete      │
│ Courses     │     │ Modal       │     │ Success     │
└─────────────┘     └─────────────┘     └─────────────┘
```

### Student Import Flow
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Upload      │────▶│ Parse &     │────▶│ Preview     │
│ File        │     │ Validate    │     │ Table       │
└─────────────┘     └─────────────┘     └─────────────┘
                                              │
                                              │ Confirm
                                              ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Result      │◀────│ Progress    │◀────│ Execute     │
│ Summary     │     │ Indicator   │     │ Import      │
└─────────────┘     └─────────────┘     └─────────────┘
```

## Firestore Collections Structure

```
/semesters/{semesterId}
  - id: string
  - name: string
  - description: string?
  - order: number
  - isActive: boolean
  - requiresMajorSelection: boolean
  - createdAt: timestamp
  - updatedAt: timestamp

/courses/{courseId}
  - id: string
  - title: string
  - description: string?
  - semesterId: string
  - geniallyUrl: string?
  - thumbnailUrl: string?
  - order: number
  - requiredSessions: number
  - requiredProjects: number
  - isActive: boolean
  - createdAt: timestamp
  - updatedAt: timestamp

/students/{studentId}
  - id: string
  - userId: string
  - email: string
  - displayName: string
  - phone: string?
  - currentSemesterId: string?
  - selectedMajorId: string?
  - enrolledAt: timestamp
  - isActive: boolean
  - createdAt: timestamp
  - updatedAt: timestamp
```

## Security Rules (Extended)

```javascript
// firebase/firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAdmin() {
      return request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Semesters: admin only
    match /semesters/{semesterId} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }
    
    // Courses: authenticated read, admin write
    match /courses/{courseId} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }
    
    // Students: admin full access, student read own
    match /students/{studentId} {
      allow read: if isAdmin() || 
        (request.auth != null && resource.data.userId == request.auth.uid);
      allow write: if isAdmin();
    }
  }
}
```

## Performance Considerations

1. **Pagination**: Student list uses cursor-based pagination for large datasets
2. **Caching**: TanStack Query với staleTime 5 minutes cho list data
3. **Rate Limiting**: Import throttled to 10 accounts/second
4. **Optimistic Updates**: Reorder operations use optimistic updates for instant feedback
5. **Lazy Loading**: Import preview table uses virtualization for large files
