import { describe, it, expect } from 'vitest';
import {
  StudentSchema,
  CreateStudentInputSchema,
  UpdateProgressSchema,
  EnrollStudentSchema,
} from '../student.schema';

describe('StudentSchema', () => {
  const validStudent = {
    id: 'student-1',
    userId: 'user-1',
    email: 'student@example.com',
    displayName: 'Test Student',
    enrolledCourses: ['course-1', 'course-2'],
    progress: {
      'course-1': 50,
      'course-2': 25,
    },
    enrolledAt: new Date(),
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('should validate a valid student', () => {
    const result = StudentSchema.safeParse(validStudent);

    expect(result.success).toBe(true);
  });

  it('should allow empty enrolled courses', () => {
    const result = StudentSchema.safeParse({
      ...validStudent,
      enrolledCourses: [],
    });

    expect(result.success).toBe(true);
  });

  it('should allow empty progress', () => {
    const result = StudentSchema.safeParse({
      ...validStudent,
      progress: {},
    });

    expect(result.success).toBe(true);
  });

  it('should reject progress over 100', () => {
    const result = StudentSchema.safeParse({
      ...validStudent,
      progress: { 'course-1': 150 },
    });

    expect(result.success).toBe(false);
  });

  it('should reject negative progress', () => {
    const result = StudentSchema.safeParse({
      ...validStudent,
      progress: { 'course-1': -10 },
    });

    expect(result.success).toBe(false);
  });
});

describe('CreateStudentInputSchema', () => {
  it('should validate valid input', () => {
    const result = CreateStudentInputSchema.safeParse({
      email: 'student@example.com',
      displayName: 'Test Student',
    });

    expect(result.success).toBe(true);
  });

  it('should reject invalid email', () => {
    const result = CreateStudentInputSchema.safeParse({
      email: 'invalid-email',
      displayName: 'Test Student',
    });

    expect(result.success).toBe(false);
  });

  it('should allow optional password', () => {
    const result = CreateStudentInputSchema.safeParse({
      email: 'student@example.com',
      displayName: 'Test Student',
      password: 'securepassword123',
    });

    expect(result.success).toBe(true);
  });

  it('should reject short password', () => {
    const result = CreateStudentInputSchema.safeParse({
      email: 'student@example.com',
      displayName: 'Test Student',
      password: '12345',
    });

    expect(result.success).toBe(false);
  });
});

describe('UpdateProgressSchema', () => {
  it('should validate valid progress update', () => {
    const result = UpdateProgressSchema.safeParse({
      studentId: 'student-1',
      courseId: 'course-1',
      progress: 75,
    });

    expect(result.success).toBe(true);
  });

  it('should reject progress over 100', () => {
    const result = UpdateProgressSchema.safeParse({
      studentId: 'student-1',
      courseId: 'course-1',
      progress: 101,
    });

    expect(result.success).toBe(false);
  });

  it('should reject negative progress', () => {
    const result = UpdateProgressSchema.safeParse({
      studentId: 'student-1',
      courseId: 'course-1',
      progress: -5,
    });

    expect(result.success).toBe(false);
  });
});

describe('EnrollStudentSchema', () => {
  it('should validate valid enrollment', () => {
    const result = EnrollStudentSchema.safeParse({
      studentId: 'student-1',
      courseId: 'course-1',
    });

    expect(result.success).toBe(true);
  });

  it('should reject empty studentId', () => {
    const result = EnrollStudentSchema.safeParse({
      studentId: '',
      courseId: 'course-1',
    });

    expect(result.success).toBe(false);
  });

  it('should reject empty courseId', () => {
    const result = EnrollStudentSchema.safeParse({
      studentId: 'student-1',
      courseId: '',
    });

    expect(result.success).toBe(false);
  });
});
