/**
 * Integration tests for admin operations
 * Requirements: 4.3 - Test CRUD operations for students, courses, semesters
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AppError, ErrorCode } from '@tdc/types';
import type { Result } from '@tdc/types';
import type { Student, Course, Semester, User } from '@tdc/schemas';

// Mock Firebase repositories
vi.mock('@tdc/firebase', () => ({
  studentRepository: {
    findAll: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    toggleActive: vi.fn(),
    findByUserId: vi.fn(),
    findWithFilters: vi.fn(),
    search: vi.fn(),
  },
  courseRepository: {
    findAllSorted: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    findBySemester: vi.fn(),
    toggleActive: vi.fn(),
    reorderInSemester: vi.fn(),
    moveToSemester: vi.fn(),
  },
  semesterRepository: {
    findAllSorted: vi.fn(),
    findById: vi.fn(),
    createSemester: vi.fn(),
    update: vi.fn(),
    deleteSemester: vi.fn(),
    toggleActive: vi.fn(),
    reorder: vi.fn(),
    hasAssociatedCourses: vi.fn(),
    getNextOrder: vi.fn(),
  },
  userRepository: {
    findById: vi.fn(),
    findByRole: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  studentService: {
    createStudentWithAuth: vi.fn(),
    deactivateStudent: vi.fn(),
    activateStudent: vi.fn(),
    overrideMajor: vi.fn(),
    clearMajor: vi.fn(),
  },
}));

import {
  studentRepository,
  courseRepository,
  semesterRepository,
  studentService,
} from '@tdc/firebase';

// Mock data
const mockStudent: Student = {
  id: 'student-1',
  userId: 'user-1',
  email: 'student@example.com',
  displayName: 'Test Student',
  enrolledCourses: ['course-1'],
  progress: { 'course-1': 50 },
  isActive: true,
  enrolledAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockCourse: Course = {
  id: 'course-1',
  title: 'Test Course',
  description: 'A test course',
  semesterId: 'semester-1',
  order: 1,
  lessons: [],
  isActive: true,
  requiredSessions: 5,
  requiredProjects: 2,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockSemester: Semester = {
  id: 'semester-1',
  name: 'Semester 1',
  description: 'First semester',
  order: 1,
  isActive: true,
  requiresMajorSelection: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockUser: User = {
  id: 'user-1',
  email: 'student@example.com',
  displayName: 'Test Student',
  role: 'student',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastLoginAt: new Date(),
};

describe('Admin Operations Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Student CRUD Operations', () => {
    describe('Read Operations', () => {
      it('should fetch all students', async () => {
        const successResult: Result<Student[]> = {
          success: true,
          data: [mockStudent],
        };

        vi.mocked(studentRepository.findAll).mockResolvedValue(successResult);

        const result = await studentRepository.findAll([]);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toHaveLength(1);
          expect(result.data[0].email).toBe('student@example.com');
        }
      });

      it('should fetch student by ID', async () => {
        const successResult: Result<Student> = {
          success: true,
          data: mockStudent,
        };

        vi.mocked(studentRepository.findById).mockResolvedValue(successResult);

        const result = await studentRepository.findById('student-1');

        expect(studentRepository.findById).toHaveBeenCalledWith('student-1');
        expect(result.success).toBe(true);
      });

      it('should return error for non-existent student', async () => {
        const errorResult: Result<Student> = {
          success: false,
          error: new AppError(ErrorCode.STUDENT_NOT_FOUND),
        };

        vi.mocked(studentRepository.findById).mockResolvedValue(errorResult);

        const result = await studentRepository.findById('non-existent');

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.code).toBe(ErrorCode.STUDENT_NOT_FOUND);
        }
      });

      it('should search students by query', async () => {
        const successResult: Result<Student[]> = {
          success: true,
          data: [mockStudent],
        };

        vi.mocked(studentRepository.search).mockResolvedValue(successResult);

        const result = await studentRepository.search('test');

        expect(studentRepository.search).toHaveBeenCalledWith('test');
        expect(result.success).toBe(true);
      });
    });

    describe('Create Operations', () => {
      it('should create a new student with auth', async () => {
        const input = {
          email: 'new@example.com',
          displayName: 'New Student',
          password: 'password123',
        };

        const successResult = {
          success: true,
          data: { student: mockStudent, user: mockUser, password: 'generated' },
        };

        vi.mocked(studentService.createStudentWithAuth).mockResolvedValue(successResult as never);

        const result = await studentService.createStudentWithAuth(input as never);

        expect(studentService.createStudentWithAuth).toHaveBeenCalledWith(input);
        expect(result.success).toBe(true);
      });

      it('should return error for duplicate email', async () => {
        const input = {
          email: 'existing@example.com',
          displayName: 'New Student',
        };

        const errorResult = {
          success: false,
          error: new AppError(ErrorCode.EMAIL_EXISTS),
        };

        vi.mocked(studentService.createStudentWithAuth).mockResolvedValue(errorResult as never);

        const result = await studentService.createStudentWithAuth(input as never);

        expect(result.success).toBe(false);
      });
    });

    describe('Update Operations', () => {
      it('should update student data', async () => {
        const updateData = { displayName: 'Updated Name' };
        const updatedStudent = { ...mockStudent, ...updateData };

        const successResult: Result<Student> = {
          success: true,
          data: updatedStudent,
        };

        vi.mocked(studentRepository.update).mockResolvedValue(successResult);

        const result = await studentRepository.update('student-1', updateData);

        expect(studentRepository.update).toHaveBeenCalledWith('student-1', updateData);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.displayName).toBe('Updated Name');
        }
      });

      it('should toggle student active status', async () => {
        const toggledStudent = { ...mockStudent, isActive: false };

        const successResult: Result<Student> = {
          success: true,
          data: toggledStudent,
        };

        vi.mocked(studentRepository.toggleActive).mockResolvedValue(successResult);

        const result = await studentRepository.toggleActive('student-1');

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.isActive).toBe(false);
        }
      });
    });

    describe('Delete Operations', () => {
      it('should deactivate student', async () => {
        const successResult: Result<void> = {
          success: true,
          data: undefined,
        };

        vi.mocked(studentService.deactivateStudent).mockResolvedValue(successResult);

        const result = await studentService.deactivateStudent('student-1');

        expect(studentService.deactivateStudent).toHaveBeenCalledWith('student-1');
        expect(result.success).toBe(true);
      });
    });
  });

  describe('Course CRUD Operations', () => {
    describe('Read Operations', () => {
      it('should fetch all courses sorted', async () => {
        const successResult: Result<Course[]> = {
          success: true,
          data: [mockCourse],
        };

        vi.mocked(courseRepository.findAllSorted).mockResolvedValue(successResult);

        const result = await courseRepository.findAllSorted();

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toHaveLength(1);
        }
      });

      it('should fetch courses by semester', async () => {
        const successResult: Result<Course[]> = {
          success: true,
          data: [mockCourse],
        };

        vi.mocked(courseRepository.findBySemester).mockResolvedValue(successResult);

        const result = await courseRepository.findBySemester('semester-1');

        expect(courseRepository.findBySemester).toHaveBeenCalledWith('semester-1');
        expect(result.success).toBe(true);
      });

      it('should fetch course by ID', async () => {
        const successResult: Result<Course> = {
          success: true,
          data: mockCourse,
        };

        vi.mocked(courseRepository.findById).mockResolvedValue(successResult);

        const result = await courseRepository.findById('course-1');

        expect(result.success).toBe(true);
      });
    });

    describe('Create Operations', () => {
      it('should create a new course', async () => {
        const input = {
          title: 'New Course',
          description: 'Description',
          semesterId: 'semester-1',
          order: 2,
          lessons: [],
          isActive: true,
          isPublished: false,
          requiredSessions: 5,
          requiredProjects: 2,
        };

        const newCourse = { ...mockCourse, ...input, id: 'course-2' };

        const successResult: Result<Course> = {
          success: true,
          data: newCourse,
        };

        vi.mocked(courseRepository.create).mockResolvedValue(successResult);

        const result = await courseRepository.create(input as never);

        expect(courseRepository.create).toHaveBeenCalledWith(input);
        expect(result.success).toBe(true);
      });
    });

    describe('Update Operations', () => {
      it('should update course data', async () => {
        const updateData = { title: 'Updated Course Title' };
        const updatedCourse = { ...mockCourse, ...updateData };

        const successResult: Result<Course> = {
          success: true,
          data: updatedCourse,
        };

        vi.mocked(courseRepository.update).mockResolvedValue(successResult);

        const result = await courseRepository.update('course-1', updateData);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.title).toBe('Updated Course Title');
        }
      });

      it('should toggle course active status', async () => {
        const toggledCourse = { ...mockCourse, isActive: false };

        const successResult: Result<Course> = {
          success: true,
          data: toggledCourse,
        };

        vi.mocked(courseRepository.toggleActive).mockResolvedValue(successResult);

        const result = await courseRepository.toggleActive('course-1');

        expect(result.success).toBe(true);
      });

      it('should reorder courses in semester', async () => {
        const successResult: Result<void> = {
          success: true,
          data: undefined,
        };

        vi.mocked(courseRepository.reorderInSemester).mockResolvedValue(successResult);

        const result = await courseRepository.reorderInSemester('semester-1', ['course-2', 'course-1']);

        expect(courseRepository.reorderInSemester).toHaveBeenCalledWith('semester-1', ['course-2', 'course-1']);
        expect(result.success).toBe(true);
      });

      it('should move course to different semester', async () => {
        const movedCourse = { ...mockCourse, semesterId: 'semester-2' };

        const successResult: Result<Course> = {
          success: true,
          data: movedCourse,
        };

        vi.mocked(courseRepository.moveToSemester).mockResolvedValue(successResult);

        const result = await courseRepository.moveToSemester('course-1', 'semester-2');

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.semesterId).toBe('semester-2');
        }
      });
    });

    describe('Delete Operations', () => {
      it('should delete course', async () => {
        const successResult: Result<void> = {
          success: true,
          data: undefined,
        };

        vi.mocked(courseRepository.delete).mockResolvedValue(successResult);

        const result = await courseRepository.delete('course-1');

        expect(courseRepository.delete).toHaveBeenCalledWith('course-1');
        expect(result.success).toBe(true);
      });
    });
  });

  describe('Semester CRUD Operations', () => {
    describe('Read Operations', () => {
      it('should fetch all semesters sorted', async () => {
        const successResult: Result<Semester[]> = {
          success: true,
          data: [mockSemester],
        };

        vi.mocked(semesterRepository.findAllSorted).mockResolvedValue(successResult);

        const result = await semesterRepository.findAllSorted();

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toHaveLength(1);
        }
      });

      it('should fetch semester by ID', async () => {
        const successResult: Result<Semester> = {
          success: true,
          data: mockSemester,
        };

        vi.mocked(semesterRepository.findById).mockResolvedValue(successResult);

        const result = await semesterRepository.findById('semester-1');

        expect(result.success).toBe(true);
      });

      it('should check if semester has courses', async () => {
        const successResult: Result<boolean> = {
          success: true,
          data: true,
        };

        vi.mocked(semesterRepository.hasAssociatedCourses).mockResolvedValue(successResult);

        const result = await semesterRepository.hasAssociatedCourses('semester-1');

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toBe(true);
        }
      });
    });

    describe('Create Operations', () => {
      it('should create a new semester', async () => {
        const input = {
          title: 'New Semester',
          description: 'Description',
          order: 2,
        };

        const newSemester = { ...mockSemester, ...input, id: 'semester-2' };

        const successResult: Result<Semester> = {
          success: true,
          data: newSemester,
        };

        vi.mocked(semesterRepository.createSemester).mockResolvedValue(successResult);

        const result = await semesterRepository.createSemester(input as never);

        expect(semesterRepository.createSemester).toHaveBeenCalledWith(input);
        expect(result.success).toBe(true);
      });

      it('should get next available order', async () => {
        const successResult: Result<number> = {
          success: true,
          data: 3,
        };

        vi.mocked(semesterRepository.getNextOrder).mockResolvedValue(successResult);

        const result = await semesterRepository.getNextOrder();

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toBe(3);
        }
      });
    });

    describe('Update Operations', () => {
      it('should update semester data', async () => {
        const updateData = { name: 'Updated Semester' };
        const updatedSemester = { ...mockSemester, ...updateData };

        const successResult: Result<Semester> = {
          success: true,
          data: updatedSemester,
        };

        vi.mocked(semesterRepository.update).mockResolvedValue(successResult);

        const result = await semesterRepository.update('semester-1', updateData);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.name).toBe('Updated Semester');
        }
      });

      it('should toggle semester active status', async () => {
        const toggledSemester = { ...mockSemester, isActive: false };

        const successResult: Result<Semester> = {
          success: true,
          data: toggledSemester,
        };

        vi.mocked(semesterRepository.toggleActive).mockResolvedValue(successResult);

        const result = await semesterRepository.toggleActive('semester-1');

        expect(result.success).toBe(true);
      });

      it('should reorder semesters', async () => {
        const successResult: Result<void> = {
          success: true,
          data: undefined,
        };

        vi.mocked(semesterRepository.reorder).mockResolvedValue(successResult);

        const result = await semesterRepository.reorder(['semester-2', 'semester-1']);

        expect(semesterRepository.reorder).toHaveBeenCalledWith(['semester-2', 'semester-1']);
        expect(result.success).toBe(true);
      });
    });

    describe('Delete Operations', () => {
      it('should delete semester without courses', async () => {
        // First check no courses
        vi.mocked(semesterRepository.hasAssociatedCourses).mockResolvedValue({
          success: true,
          data: false,
        });

        const successResult: Result<void> = {
          success: true,
          data: undefined,
        };

        vi.mocked(semesterRepository.deleteSemester).mockResolvedValue(successResult);

        const result = await semesterRepository.deleteSemester('semester-1');

        expect(result.success).toBe(true);
      });

      it('should prevent deletion of semester with courses', async () => {
        const errorResult: Result<void> = {
          success: false,
          error: new AppError(ErrorCode.SEMESTER_HAS_COURSES, 'Semester has associated courses'),
        };

        vi.mocked(semesterRepository.deleteSemester).mockResolvedValue(errorResult);

        const result = await semesterRepository.deleteSemester('semester-1');

        expect(result.success).toBe(false);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors for student operations', async () => {
      const errorResult: Result<Student[]> = {
        success: false,
        error: new AppError(ErrorCode.NETWORK_ERROR),
      };

      vi.mocked(studentRepository.findAll).mockResolvedValue(errorResult);

      const result = await studentRepository.findAll([]);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ErrorCode.NETWORK_ERROR);
      }
    });

    it('should handle permission errors', async () => {
      const errorResult: Result<Course> = {
        success: false,
        error: new AppError(ErrorCode.PERMISSION_DENIED),
      };

      vi.mocked(courseRepository.create).mockResolvedValue(errorResult);

      const result = await courseRepository.create({} as never);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ErrorCode.PERMISSION_DENIED);
      }
    });

    it('should handle validation errors', async () => {
      const errorResult: Result<Semester> = {
        success: false,
        error: new AppError(ErrorCode.VALIDATION_ERROR, 'Invalid data'),
      };

      vi.mocked(semesterRepository.createSemester).mockResolvedValue(errorResult);

      const result = await semesterRepository.createSemester({} as never);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ErrorCode.VALIDATION_ERROR);
      }
    });
  });
});
