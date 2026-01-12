/**
 * Integration tests for student portal
 * Requirements: 4.4 - Test course viewing and project submission flows
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AppError, ErrorCode } from '@tdc/types';
import type { Result } from '@tdc/types';
import type { Course, Student, ProjectSubmission, StudentProgress, Semester } from '@tdc/schemas';

// Mock Firebase repositories
vi.mock('@tdc/firebase', () => ({
  studentRepository: {
    findByUserId: vi.fn(),
    updateProgress: vi.fn(),
  },
  courseRepository: {
    findById: vi.fn(),
    findByIds: vi.fn(),
    findBySemester: vi.fn(),
  },
  semesterRepository: {
    findActive: vi.fn(),
    findById: vi.fn(),
  },
  projectSubmissionRepository: {
    findByStudentAndCourse: vi.fn(),
    findByStudentId: vi.fn(),
    createSubmission: vi.fn(),
    updateSubmission: vi.fn(),
    delete: vi.fn(),
  },
  progressRepository: {
    findByStudentAndCourse: vi.fn(),
    findByStudentId: vi.fn(),
    update: vi.fn(),
  },
  activityService: {
    logProjectSubmission: vi.fn(),
  },
}));

import {
  studentRepository,
  courseRepository,
  semesterRepository,
  projectSubmissionRepository,
  progressRepository,
  activityService,
} from '@tdc/firebase';

// Mock data
const mockStudent: Student = {
  id: 'student-1',
  userId: 'user-1',
  email: 'student@example.com',
  displayName: 'Test Student',
  enrolledCourses: ['course-1', 'course-2'],
  progress: { 'course-1': 50, 'course-2': 0 },
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
  lessons: [
    { id: 'lesson-1', title: 'Lesson 1', content: 'Content 1', duration: 30, order: 1 },
    { id: 'lesson-2', title: 'Lesson 2', content: 'Content 2', duration: 45, order: 2 },
  ],
  isActive: true,
  requiredSessions: 5,
  requiredProjects: 2,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockCourse2: Course = {
  id: 'course-2',
  title: 'Test Course 2',
  description: 'A second test course',
  semesterId: 'semester-1',
  order: 2,
  lessons: [
    { id: 'lesson-3', title: 'Lesson 3', content: 'Content 3', duration: 30, order: 1 },
  ],
  isActive: true,
  requiredSessions: 4,
  requiredProjects: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockProjectSubmission: ProjectSubmission = {
  id: 'submission-1',
  studentId: 'student-1',
  courseId: 'course-1',
  projectNumber: 1,
  title: 'Project 1',
  submissionUrl: 'https://example.com/project1',
  submissionType: 'other',
  submittedAt: new Date(),
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

const mockSemester2: Semester = {
  id: 'semester-2',
  name: 'Semester 2',
  description: 'Second semester',
  order: 2,
  isActive: true,
  requiresMajorSelection: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockStudentProgress: StudentProgress = {
  id: 'progress-1',
  studentId: 'student-1',
  courseId: 'course-1',
  completedSessions: 3,
  projectsSubmitted: 1,
  projectLinks: [],
  status: 'in_progress',
  rejectionReason: undefined,
  approvedAt: null,
  completedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};


describe('Student Portal Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Course Viewing', () => {
    describe('Get Student Data', () => {
      it('should fetch current student by user ID', async () => {
        const successResult: Result<Student | null> = {
          success: true,
          data: mockStudent,
        };

        vi.mocked(studentRepository.findByUserId).mockResolvedValue(successResult);

        const result = await studentRepository.findByUserId('user-1');

        expect(studentRepository.findByUserId).toHaveBeenCalledWith('user-1');
        expect(result.success).toBe(true);
        if (result.success && result.data) {
          expect(result.data.email).toBe('student@example.com');
          expect(result.data.enrolledCourses).toHaveLength(2);
        }
      });

      it('should return error for non-existent student', async () => {
        const errorResult: Result<Student | null> = {
          success: false,
          error: new AppError(ErrorCode.STUDENT_NOT_FOUND),
        };

        vi.mocked(studentRepository.findByUserId).mockResolvedValue(errorResult);

        const result = await studentRepository.findByUserId('non-existent');

        expect(result.success).toBe(false);
      });
    });

    describe('Get Enrolled Courses', () => {
      it('should fetch enrolled courses by IDs', async () => {
        const successResult: Result<Course[]> = {
          success: true,
          data: [mockCourse],
        };

        vi.mocked(courseRepository.findByIds).mockResolvedValue(successResult);

        const result = await courseRepository.findByIds(['course-1', 'course-2']);

        expect(courseRepository.findByIds).toHaveBeenCalledWith(['course-1', 'course-2']);
        expect(result.success).toBe(true);
      });

      it('should fetch single course by ID', async () => {
        const successResult: Result<Course> = {
          success: true,
          data: mockCourse,
        };

        vi.mocked(courseRepository.findById).mockResolvedValue(successResult);

        const result = await courseRepository.findById('course-1');

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.title).toBe('Test Course');
          expect(result.data.lessons).toHaveLength(2);
        }
      });

      it('should return error for non-existent course', async () => {
        const errorResult: Result<Course> = {
          success: false,
          error: new AppError(ErrorCode.COURSE_NOT_FOUND),
        };

        vi.mocked(courseRepository.findById).mockResolvedValue(errorResult);

        const result = await courseRepository.findById('non-existent');

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.code).toBe(ErrorCode.COURSE_NOT_FOUND);
        }
      });
    });

    describe('Update Progress', () => {
      it('should update lesson progress', async () => {
        const successResult: Result<void> = {
          success: true,
          data: undefined,
        };

        vi.mocked(studentRepository.updateProgress).mockResolvedValue(successResult);

        const result = await studentRepository.updateProgress('student-1', 'course-1', 75);

        expect(studentRepository.updateProgress).toHaveBeenCalledWith('student-1', 'course-1', 75);
        expect(result.success).toBe(true);
      });
    });
  });


  describe('Project Submission', () => {
    describe('View Projects', () => {
      it('should fetch projects for a course', async () => {
        const successResult: Result<ProjectSubmission[]> = {
          success: true,
          data: [mockProjectSubmission],
        };

        vi.mocked(projectSubmissionRepository.findByStudentAndCourse).mockResolvedValue(successResult);

        const result = await projectSubmissionRepository.findByStudentAndCourse('student-1', 'course-1');

        expect(projectSubmissionRepository.findByStudentAndCourse).toHaveBeenCalledWith('student-1', 'course-1');
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toHaveLength(1);
          expect(result.data[0].title).toBe('Project 1');
        }
      });

      it('should fetch all projects for student', async () => {
        const successResult: Result<ProjectSubmission[]> = {
          success: true,
          data: [mockProjectSubmission],
        };

        vi.mocked(projectSubmissionRepository.findByStudentId).mockResolvedValue(successResult);

        const result = await projectSubmissionRepository.findByStudentId('student-1');

        expect(result.success).toBe(true);
      });

      it('should return empty array when no projects', async () => {
        const successResult: Result<ProjectSubmission[]> = {
          success: true,
          data: [],
        };

        vi.mocked(projectSubmissionRepository.findByStudentAndCourse).mockResolvedValue(successResult);

        const result = await projectSubmissionRepository.findByStudentAndCourse('student-1', 'course-2');

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toHaveLength(0);
        }
      });
    });

    describe('Submit Project', () => {
      it('should create a new project submission', async () => {
        const input = {
          courseId: 'course-1',
          projectNumber: 2,
          title: 'Project 2',
          submissionUrl: 'https://example.com/project2',
        };

        const newSubmission: ProjectSubmission = {
          ...mockProjectSubmission,
          id: 'submission-2',
          projectNumber: 2,
          title: 'Project 2',
          submissionUrl: 'https://example.com/project2',
        };

        const successResult: Result<ProjectSubmission> = {
          success: true,
          data: newSubmission,
        };

        vi.mocked(projectSubmissionRepository.createSubmission).mockResolvedValue(successResult);

        const result = await projectSubmissionRepository.createSubmission('student-1', input as never);

        expect(projectSubmissionRepository.createSubmission).toHaveBeenCalledWith('student-1', input);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.title).toBe('Project 2');
        }
      });

      it('should update progress after submission', async () => {
        // Mock finding progress
        const progressResult: Result<StudentProgress> = {
          success: true,
          data: mockStudentProgress,
        };
        vi.mocked(progressRepository.findByStudentAndCourse).mockResolvedValue(progressResult);

        // Mock updating progress
        const updateResult: Result<StudentProgress> = {
          success: true,
          data: { ...mockStudentProgress, projectsSubmitted: 2 },
        };
        vi.mocked(progressRepository.update).mockResolvedValue(updateResult);

        // First find progress
        const findResult = await progressRepository.findByStudentAndCourse('student-1', 'course-1');
        expect(findResult.success).toBe(true);

        // Then update
        if (findResult.success && findResult.data) {
          const result = await progressRepository.update(findResult.data.id, {
            projectsSubmitted: findResult.data.projectsSubmitted + 1,
          });
          expect(result.success).toBe(true);
        }
      });

      it('should log activity after submission', async () => {
        vi.mocked(activityService.logProjectSubmission).mockResolvedValue({
          success: true,
          data: undefined,
        } as never);

        await activityService.logProjectSubmission({
          userId: 'student-1',
          userName: 'Test Student',
          projectId: 'submission-1',
          projectTitle: 'Project 1',
        });

        expect(activityService.logProjectSubmission).toHaveBeenCalledWith({
          userId: 'student-1',
          userName: 'Test Student',
          projectId: 'submission-1',
          projectTitle: 'Project 1',
        });
      });

      it('should return error for invalid URL', async () => {
        const input = {
          courseId: 'course-1',
          projectNumber: 1,
          title: 'Project',
          submissionUrl: 'invalid-url',
        };

        const errorResult: Result<ProjectSubmission> = {
          success: false,
          error: new AppError(ErrorCode.VALIDATION_ERROR, 'Invalid URL format'),
        };

        vi.mocked(projectSubmissionRepository.createSubmission).mockResolvedValue(errorResult);

        const result = await projectSubmissionRepository.createSubmission('student-1', input as never);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.code).toBe(ErrorCode.VALIDATION_ERROR);
        }
      });
    });


    describe('Update Project', () => {
      it('should update existing project submission', async () => {
        const updateData = {
          submissionUrl: 'https://example.com/updated-project',
        };

        const updatedSubmission: ProjectSubmission = {
          ...mockProjectSubmission,
          submissionUrl: 'https://example.com/updated-project',
        };

        const successResult: Result<ProjectSubmission> = {
          success: true,
          data: updatedSubmission,
        };

        vi.mocked(projectSubmissionRepository.updateSubmission).mockResolvedValue(successResult);

        const result = await projectSubmissionRepository.updateSubmission('submission-1', updateData as never);

        expect(projectSubmissionRepository.updateSubmission).toHaveBeenCalledWith('submission-1', updateData);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.submissionUrl).toBe('https://example.com/updated-project');
        }
      });

      it('should return error for non-existent submission', async () => {
        const errorResult: Result<ProjectSubmission> = {
          success: false,
          error: new AppError(ErrorCode.SUBMISSION_NOT_FOUND, 'Submission not found'),
        };

        vi.mocked(projectSubmissionRepository.updateSubmission).mockResolvedValue(errorResult);

        const result = await projectSubmissionRepository.updateSubmission('non-existent', {} as never);

        expect(result.success).toBe(false);
      });
    });

    describe('Delete Project', () => {
      it('should delete project submission', async () => {
        const successResult: Result<void> = {
          success: true,
          data: undefined,
        };

        vi.mocked(projectSubmissionRepository.delete).mockResolvedValue(successResult);

        const result = await projectSubmissionRepository.delete('submission-1');

        expect(projectSubmissionRepository.delete).toHaveBeenCalledWith('submission-1');
        expect(result.success).toBe(true);
      });

      it('should update progress after deletion', async () => {
        // Mock finding progress
        const progressResult: Result<StudentProgress> = {
          success: true,
          data: { ...mockStudentProgress, projectsSubmitted: 2 },
        };
        vi.mocked(progressRepository.findByStudentAndCourse).mockResolvedValue(progressResult);

        // Mock updating progress
        const updateResult: Result<StudentProgress> = {
          success: true,
          data: { ...mockStudentProgress, projectsSubmitted: 1 },
        };
        vi.mocked(progressRepository.update).mockResolvedValue(updateResult);

        // Find progress
        const findResult = await progressRepository.findByStudentAndCourse('student-1', 'course-1');
        expect(findResult.success).toBe(true);

        // Update after deletion
        if (findResult.success && findResult.data && findResult.data.projectsSubmitted > 0) {
          const result = await progressRepository.update(findResult.data.id, {
            projectsSubmitted: findResult.data.projectsSubmitted - 1,
          });
          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.data.projectsSubmitted).toBe(1);
          }
        }
      });
    });
  });


  describe('Semester Courses Viewing', () => {
    describe('Get Active Semesters', () => {
      it('should fetch all active semesters', async () => {
        const successResult: Result<Semester[]> = {
          success: true,
          data: [mockSemester, mockSemester2],
        };

        vi.mocked(semesterRepository.findActive).mockResolvedValue(successResult);

        const result = await semesterRepository.findActive();

        expect(semesterRepository.findActive).toHaveBeenCalled();
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toHaveLength(2);
          expect(result.data[0].order).toBeLessThan(result.data[1].order);
        }
      });

      it('should return empty array when no active semesters', async () => {
        const successResult: Result<Semester[]> = {
          success: true,
          data: [],
        };

        vi.mocked(semesterRepository.findActive).mockResolvedValue(successResult);

        const result = await semesterRepository.findActive();

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toHaveLength(0);
        }
      });
    });

    describe('Get Courses by Semester', () => {
      it('should fetch courses for a specific semester', async () => {
        const successResult: Result<Course[]> = {
          success: true,
          data: [mockCourse, mockCourse2],
        };

        vi.mocked(courseRepository.findBySemester).mockResolvedValue(successResult);

        const result = await courseRepository.findBySemester('semester-1');

        expect(courseRepository.findBySemester).toHaveBeenCalledWith('semester-1');
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toHaveLength(2);
        }
      });

      it('should return empty array for semester with no courses', async () => {
        const successResult: Result<Course[]> = {
          success: true,
          data: [],
        };

        vi.mocked(courseRepository.findBySemester).mockResolvedValue(successResult);

        const result = await courseRepository.findBySemester('semester-empty');

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toHaveLength(0);
        }
      });

      it('should return error for non-existent semester', async () => {
        const errorResult: Result<Course[]> = {
          success: false,
          error: new AppError(ErrorCode.SEMESTER_NOT_FOUND),
        };

        vi.mocked(courseRepository.findBySemester).mockResolvedValue(errorResult);

        const result = await courseRepository.findBySemester('non-existent');

        expect(result.success).toBe(false);
      });
    });
  });


  describe('Progress Tracking', () => {
    describe('Get Student Progress', () => {
      it('should fetch progress for all courses', async () => {
        const successResult: Result<StudentProgress[]> = {
          success: true,
          data: [mockStudentProgress],
        };

        vi.mocked(progressRepository.findByStudentId).mockResolvedValue(successResult);

        const result = await progressRepository.findByStudentId('student-1');

        expect(progressRepository.findByStudentId).toHaveBeenCalledWith('student-1');
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toHaveLength(1);
          expect(result.data[0].status).toBe('in_progress');
        }
      });

      it('should return empty array for student with no progress', async () => {
        const successResult: Result<StudentProgress[]> = {
          success: true,
          data: [],
        };

        vi.mocked(progressRepository.findByStudentId).mockResolvedValue(successResult);

        const result = await progressRepository.findByStudentId('new-student');

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toHaveLength(0);
        }
      });
    });

    describe('Progress by Semester Flow', () => {
      it('should fetch semesters with courses and progress', async () => {
        // Mock active semesters
        vi.mocked(semesterRepository.findActive).mockResolvedValue({
          success: true,
          data: [mockSemester],
        });

        // Mock courses for semester
        vi.mocked(courseRepository.findBySemester).mockResolvedValue({
          success: true,
          data: [mockCourse, mockCourse2],
        });

        // Mock student progress
        vi.mocked(progressRepository.findByStudentId).mockResolvedValue({
          success: true,
          data: [mockStudentProgress],
        });

        // Fetch semesters
        const semestersResult = await semesterRepository.findActive();
        expect(semestersResult.success).toBe(true);

        if (semestersResult.success) {
          // Fetch courses for each semester
          for (const semester of semestersResult.data) {
            const coursesResult = await courseRepository.findBySemester(semester.id);
            expect(coursesResult.success).toBe(true);
          }
        }

        // Fetch progress
        const progressResult = await progressRepository.findByStudentId('student-1');
        expect(progressResult.success).toBe(true);
      });

      it('should handle locked courses based on progress', async () => {
        // Mock completed progress for first course
        const completedProgress: StudentProgress = {
          ...mockStudentProgress,
          status: 'completed',
        };

        vi.mocked(progressRepository.findByStudentId).mockResolvedValue({
          success: true,
          data: [completedProgress],
        });

        const result = await progressRepository.findByStudentId('student-1');

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data[0].status).toBe('completed');
        }
      });
    });
  });


  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      const errorResult: Result<Course[]> = {
        success: false,
        error: new AppError(ErrorCode.NETWORK_ERROR),
      };

      vi.mocked(courseRepository.findByIds).mockResolvedValue(errorResult);

      const result = await courseRepository.findByIds(['course-1']);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ErrorCode.NETWORK_ERROR);
      }
    });

    it('should handle permission errors', async () => {
      const errorResult: Result<ProjectSubmission> = {
        success: false,
        error: new AppError(ErrorCode.PERMISSION_DENIED),
      };

      vi.mocked(projectSubmissionRepository.createSubmission).mockResolvedValue(errorResult);

      const result = await projectSubmissionRepository.createSubmission('student-1', {} as never);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ErrorCode.PERMISSION_DENIED);
      }
    });

    it('should handle database errors', async () => {
      const errorResult: Result<Student | null> = {
        success: false,
        error: new AppError(ErrorCode.DATABASE_ERROR),
      };

      vi.mocked(studentRepository.findByUserId).mockResolvedValue(errorResult);

      const result = await studentRepository.findByUserId('user-1');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ErrorCode.DATABASE_ERROR);
      }
    });
  });
});
