# The Design Council - API & Schema Patterns

## Zod Schema Conventions

### Base Schema Pattern

```typescript
// packages/schemas/src/common.schema.ts
import { z } from 'zod';

// Reusable field schemas
export const IdSchema = z.string().min(1);
export const EmailSchema = z.string().email();
export const TimestampSchema = z.date();

// Base entity schema with audit fields
export const BaseEntitySchema = z.object({
  id: IdSchema,
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});

export type BaseEntity = z.infer<typeof BaseEntitySchema>;
```

### Entity Schema Pattern

```typescript
// packages/schemas/src/user.schema.ts
import { z } from 'zod';
import { BaseEntitySchema, EmailSchema } from './common.schema';

// Role enum - single source of truth
export const UserRoleSchema = z.enum(['admin', 'student']);
export type UserRole = z.infer<typeof UserRoleSchema>;

// User schema extending base
export const UserSchema = BaseEntitySchema.extend({
  email: EmailSchema,
  displayName: z.string().min(2).max(100),
  role: UserRoleSchema,
  isActive: z.boolean().default(true),
  lastLoginAt: z.date().nullable(),
});

export type User = z.infer<typeof UserSchema>;

// Create input schema (omit auto-generated fields)
export const CreateUserInputSchema = UserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastLoginAt: true,
});

export type CreateUserInput = z.infer<typeof CreateUserInputSchema>;

// Update input schema (all fields optional except id)
export const UpdateUserInputSchema = UserSchema.partial().required({ id: true });

export type UpdateUserInput = z.infer<typeof UpdateUserInputSchema>;
```

### Nested Schema Pattern

```typescript
// packages/schemas/src/course.schema.ts
import { z } from 'zod';
import { BaseEntitySchema, IdSchema } from './common.schema';

// Lesson schema (nested)
export const LessonSchema = z.object({
  id: IdSchema,
  title: z.string().min(1).max(200),
  content: z.string(),
  duration: z.number().positive(), // minutes
  order: z.number().int().nonnegative(),
});

export type Lesson = z.infer<typeof LessonSchema>;

// Course schema with nested lessons
export const CourseSchema = BaseEntitySchema.extend({
  title: z.string().min(1).max(200),
  description: z.string().max(1000),
  thumbnail: z.string().url().nullable(),
  lessons: z.array(LessonSchema),
  isPublished: z.boolean().default(false),
});

export type Course = z.infer<typeof CourseSchema>;
```

## API Response Pattern

### Result Type (Success/Error Union)

```typescript
// packages/types/src/result.types.ts

// Generic Result type
export type Result<T, E = AppError> =
  | { success: true; data: T }
  | { success: false; error: E };

// Helper functions
export function success<T>(data: T): Result<T> {
  return { success: true, data };
}

export function failure<E = AppError>(error: E): Result<never, E> {
  return { success: false, error };
}

// Type guard
export function isSuccess<T, E>(result: Result<T, E>): result is { success: true; data: T } {
  return result.success === true;
}
```

### API Response Schemas

```typescript
// packages/schemas/src/api.schema.ts
import { z } from 'zod';

// Pagination schema
export const PaginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
});

export type Pagination = z.infer<typeof PaginationSchema>;

// Paginated response schema factory
export function createPaginatedSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    items: z.array(itemSchema),
    pagination: PaginationSchema,
  });
}

// Error response schema
export const ApiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.record(z.string()).optional(),
});

export type ApiError = z.infer<typeof ApiErrorSchema>;
```

## AppError Class Pattern

```typescript
// packages/types/src/error.types.ts

// Error codes enum
export const ErrorCode = {
  // Auth errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  
  // User errors
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  EMAIL_EXISTS: 'EMAIL_EXISTS',
  
  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  
  // System errors
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
} as const;

export type ErrorCodeType = typeof ErrorCode[keyof typeof ErrorCode];

// AppError class
export class AppError extends Error {
  constructor(
    public readonly code: ErrorCodeType,
    message?: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message || code);
    this.name = 'AppError';
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
    };
  }
}
```

## Data Access Layer Pattern

### Repository Pattern

```typescript
// packages/firebase/src/repositories/base.repository.ts
import { 
  collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, startAfter,
  type QueryConstraint 
} from 'firebase/firestore';
import { z } from 'zod';
import { db } from '../config';
import { Result, success, failure } from '@tdc/types';
import { AppError, ErrorCode } from '@tdc/types';

export abstract class BaseRepository<T extends { id: string }> {
  constructor(
    protected readonly collectionName: string,
    protected readonly schema: z.ZodType<T>
  ) {}

  protected get collectionRef() {
    return collection(db, this.collectionName);
  }

  async findById(id: string): Promise<Result<T>> {
    try {
      const docRef = doc(this.collectionRef, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return failure(new AppError(ErrorCode.USER_NOT_FOUND));
      }

      const parsed = this.schema.safeParse({ id: docSnap.id, ...docSnap.data() });
      if (!parsed.success) {
        return failure(new AppError(ErrorCode.VALIDATION_ERROR, undefined, parsed.error.flatten()));
      }

      return success(parsed.data);
    } catch (error) {
      return failure(new AppError(ErrorCode.DATABASE_ERROR));
    }
  }

  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<Result<T>> {
    try {
      const id = doc(this.collectionRef).id;
      const now = new Date();
      const entity = {
        ...data,
        id,
        createdAt: now,
        updatedAt: now,
      };

      const parsed = this.schema.safeParse(entity);
      if (!parsed.success) {
        return failure(new AppError(ErrorCode.VALIDATION_ERROR, undefined, parsed.error.flatten()));
      }

      await setDoc(doc(this.collectionRef, id), parsed.data);
      return success(parsed.data);
    } catch (error) {
      return failure(new AppError(ErrorCode.DATABASE_ERROR));
    }
  }

  async update(id: string, data: Partial<T>): Promise<Result<T>> {
    try {
      const existing = await this.findById(id);
      if (!existing.success) {
        return existing;
      }

      const updated = {
        ...existing.data,
        ...data,
        updatedAt: new Date(),
      };

      const parsed = this.schema.safeParse(updated);
      if (!parsed.success) {
        return failure(new AppError(ErrorCode.VALIDATION_ERROR, undefined, parsed.error.flatten()));
      }

      await updateDoc(doc(this.collectionRef, id), parsed.data as any);
      return success(parsed.data);
    } catch (error) {
      return failure(new AppError(ErrorCode.DATABASE_ERROR));
    }
  }
}
```

### Specific Repository

```typescript
// packages/firebase/src/repositories/user.repository.ts
import { UserSchema, type User } from '@tdc/schemas';
import { BaseRepository } from './base.repository';

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super('users', UserSchema);
  }

  async findByEmail(email: string): Promise<Result<User>> {
    // Implementation using query
  }

  async findByRole(role: UserRole): Promise<Result<User[]>> {
    // Implementation using query
  }
}

// Singleton export
export const userRepository = new UserRepository();
```

## Custom Hook Pattern for Data Fetching

```typescript
// apps/admin/src/hooks/useStudents.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentRepository } from '@tdc/firebase';
import type { Student, CreateStudentInput } from '@tdc/schemas';
import type { Result } from '@tdc/types';

// Query keys factory
export const studentKeys = {
  all: ['students'] as const,
  lists: () => [...studentKeys.all, 'list'] as const,
  list: (filters: StudentFilters) => [...studentKeys.lists(), filters] as const,
  details: () => [...studentKeys.all, 'detail'] as const,
  detail: (id: string) => [...studentKeys.details(), id] as const,
};

// List hook
export function useStudents(filters: StudentFilters) {
  return useQuery({
    queryKey: studentKeys.list(filters),
    queryFn: () => studentRepository.findAll(filters),
    select: (result) => {
      if (!result.success) throw result.error;
      return result.data;
    },
  });
}

// Detail hook
export function useStudent(id: string) {
  return useQuery({
    queryKey: studentKeys.detail(id),
    queryFn: () => studentRepository.findById(id),
    enabled: !!id,
  });
}

// Mutation hook
export function useCreateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateStudentInput) => studentRepository.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() });
    },
  });
}
```

## Form Validation Pattern

```typescript
// apps/admin/src/components/features/student-form/StudentForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateStudentInputSchema, type CreateStudentInput } from '@tdc/schemas';
import { useCreateStudent } from '@/hooks/useStudents';

export function StudentForm() {
  const createStudent = useCreateStudent();
  
  const form = useForm<CreateStudentInput>({
    resolver: zodResolver(CreateStudentInputSchema),
    defaultValues: {
      email: '',
      displayName: '',
    },
  });

  const onSubmit = async (data: CreateStudentInput) => {
    const result = await createStudent.mutateAsync(data);
    if (!result.success) {
      // Handle error - map to form errors
      if (result.error.code === 'VALIDATION_ERROR') {
        // Set field errors from result.error.details
      }
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

## Schema Export Pattern

```typescript
// packages/schemas/index.ts
// Always use explicit named exports

// Common
export { 
  IdSchema, 
  EmailSchema, 
  TimestampSchema, 
  BaseEntitySchema,
  type BaseEntity,
} from './src/common.schema';

// User
export {
  UserRoleSchema,
  UserSchema,
  CreateUserInputSchema,
  UpdateUserInputSchema,
  type UserRole,
  type User,
  type CreateUserInput,
  type UpdateUserInput,
} from './src/user.schema';

// Student
export {
  StudentSchema,
  CreateStudentInputSchema,
  type Student,
  type CreateStudentInput,
} from './src/student.schema';

// Course
export {
  LessonSchema,
  CourseSchema,
  type Lesson,
  type Course,
} from './src/course.schema';

// API
export {
  PaginationSchema,
  ApiErrorSchema,
  createPaginatedSchema,
  type Pagination,
  type ApiError,
} from './src/api.schema';
```

## Forbidden Patterns

❌ Never define types separately from Zod schemas (use z.infer)
❌ Never skip validation when reading from Firestore
❌ Never use `any` in API responses
❌ Never hardcode error messages (use error codes)
❌ Never create inline schemas (always in packages/schemas)
❌ Never use raw Firebase SDK in components (use repository)
❌ Never skip Result type for async operations
