import { describe, it, expect } from 'vitest';
import {
  LessonSchema,
  CourseSchema,
  CreateCourseInputSchema,
} from '../course.schema';

describe('LessonSchema', () => {
  const validLesson = {
    id: 'lesson-1',
    title: 'Introduction',
    content: 'Welcome to the course',
    duration: 30,
    order: 0,
  };

  it('should validate a valid lesson', () => {
    const result = LessonSchema.safeParse(validLesson);

    expect(result.success).toBe(true);
  });

  it('should reject empty title', () => {
    const result = LessonSchema.safeParse({
      ...validLesson,
      title: '',
    });

    expect(result.success).toBe(false);
  });

  it('should reject negative duration', () => {
    const result = LessonSchema.safeParse({
      ...validLesson,
      duration: -10,
    });

    expect(result.success).toBe(false);
  });

  it('should reject negative order', () => {
    const result = LessonSchema.safeParse({
      ...validLesson,
      order: -1,
    });

    expect(result.success).toBe(false);
  });
});

describe('CourseSchema', () => {
  const validCourse = {
    id: 'course-1',
    title: 'Web Development',
    description: 'Learn web development',
    semesterId: 'semester-1',
    thumbnailUrl: 'https://example.com/image.jpg',
    lessons: [],
    isActive: true,
    order: 0,
    requiredSessions: 10,
    requiredProjects: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('should validate a valid course', () => {
    const result = CourseSchema.safeParse(validCourse);

    expect(result.success).toBe(true);
  });

  it('should reject empty title', () => {
    const result = CourseSchema.safeParse({
      ...validCourse,
      title: '',
    });

    expect(result.success).toBe(false);
  });

  it('should allow empty thumbnailUrl', () => {
    const result = CourseSchema.safeParse({
      ...validCourse,
      thumbnailUrl: '',
    });

    expect(result.success).toBe(true);
  });

  it('should reject invalid thumbnailUrl', () => {
    const result = CourseSchema.safeParse({
      ...validCourse,
      thumbnailUrl: 'not-a-url',
    });

    expect(result.success).toBe(false);
  });

  it('should validate course with lessons', () => {
    const result = CourseSchema.safeParse({
      ...validCourse,
      lessons: [
        {
          id: 'lesson-1',
          title: 'Intro',
          content: 'Content',
          duration: 15,
          order: 0,
        },
      ],
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.lessons).toHaveLength(1);
    }
  });

  it('should validate geniallyUrl', () => {
    const result = CourseSchema.safeParse({
      ...validCourse,
      geniallyUrl: 'https://view.genial.ly/abc123',
    });

    expect(result.success).toBe(true);
  });

  it('should allow empty geniallyUrl', () => {
    const result = CourseSchema.safeParse({
      ...validCourse,
      geniallyUrl: '',
    });

    expect(result.success).toBe(true);
  });
});

describe('CreateCourseInputSchema', () => {
  it('should validate valid input', () => {
    const result = CreateCourseInputSchema.safeParse({
      title: 'New Course',
      description: 'Course description',
      semesterId: 'semester-1',
      isActive: true,
    });

    expect(result.success).toBe(true);
  });

  it('should use default values', () => {
    const result = CreateCourseInputSchema.safeParse({
      title: 'New Course',
      semesterId: 'semester-1',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBe('');
      expect(result.data.requiredSessions).toBe(10);
      expect(result.data.requiredProjects).toBe(1);
      expect(result.data.isActive).toBe(true);
    }
  });

  it('should require semesterId', () => {
    const result = CreateCourseInputSchema.safeParse({
      title: 'New Course',
    });

    expect(result.success).toBe(false);
  });
});
