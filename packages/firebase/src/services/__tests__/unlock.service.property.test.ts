import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  findNextCourseInSemester,
  areAllCoursesCompleted,
  findNextSemester,
} from '../unlock.service';
import type { Course, Semester, StudentProgress } from '@tdc/schemas';

describe('Unlock Service Property Tests', () => {
  /**
   * **Feature: phase-4-tracking, Property 15: Next Course Unlock**
   * **Validates: Requirements 5.1, 5.2**
   *
   * For any progress status change to completed, if a next course exists in
   * the same semester (by order), that course's progress status should change
   * from locked to not_started.
   */
  describe('Property 15: Next Course Unlock', () => {
    it('should find the next course with higher order', () => {
      fc.assert(
        fc.property(
          fc.uuid(),
          fc.array(fc.integer({ min: 0, max: 100 }), { minLength: 2, maxLength: 10 }),
          (semesterId, orders) => {
            // Create courses with unique orders
            const uniqueOrders = [...new Set(orders)].sort((a, b) => a - b);
            if (uniqueOrders.length < 2) return true; // Skip if not enough unique orders

            const courses: Course[] = uniqueOrders.map((order, index) => ({
              id: `course-${index}`,
              title: `Course ${index}`,
              description: '',
              semesterId,
              order,
              requiredSessions: 10,
              requiredProjects: 1,
              lessons: [],
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            }));

            // Test finding next course for each course except the last
            for (let i = 0; i < courses.length - 1; i++) {
              const currentOrder = courses[i].order;
              const nextCourse = findNextCourseInSemester(courses, currentOrder);

              expect(nextCourse).not.toBeNull();
              if (nextCourse) {
                expect(nextCourse.order).toBeGreaterThan(currentOrder);
              }
            }

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return null when no next course exists', () => {
      fc.assert(
        fc.property(
          fc.uuid(),
          fc.array(fc.integer({ min: 0, max: 100 }), { minLength: 1, maxLength: 10 }),
          (semesterId, orders) => {
            const uniqueOrders = [...new Set(orders)].sort((a, b) => a - b);
            const maxOrder = Math.max(...uniqueOrders);

            const courses: Course[] = uniqueOrders.map((order, index) => ({
              id: `course-${index}`,
              title: `Course ${index}`,
              description: '',
              semesterId,
              order,
              requiredSessions: 10,
              requiredProjects: 1,
              lessons: [],
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            }));

            // The last course should have no next course
            const nextCourse = findNextCourseInSemester(courses, maxOrder);
            expect(nextCourse).toBeNull();

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should find the immediate next course by order', () => {
      fc.assert(
        fc.property(
          fc.uuid(),
          fc.array(fc.integer({ min: 0, max: 100 }), { minLength: 3, maxLength: 10 }),
          (semesterId, orders) => {
            const uniqueOrders = [...new Set(orders)].sort((a, b) => a - b);
            if (uniqueOrders.length < 3) return true;

            const courses: Course[] = uniqueOrders.map((order, index) => ({
              id: `course-${index}`,
              title: `Course ${index}`,
              description: '',
              semesterId,
              order,
              requiredSessions: 10,
              requiredProjects: 1,
              lessons: [],
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            }));

            // For each course, the next course should be the one with the smallest order > current
            for (let i = 0; i < courses.length - 1; i++) {
              const currentOrder = courses[i].order;
              const nextCourse = findNextCourseInSemester(courses, currentOrder);

              if (nextCourse) {
                // Verify it's the immediate next (no course between current and next)
                const coursesBetween = courses.filter(
                  (c) => c.order > currentOrder && c.order < nextCourse.order
                );
                expect(coursesBetween.length).toBe(0);
              }
            }

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle empty course list', () => {
      const nextCourse = findNextCourseInSemester([], 0);
      expect(nextCourse).toBeNull();
    });

    it('should handle single course list', () => {
      const course: Course = {
        id: 'course-1',
        title: 'Course 1',
        description: '',
        semesterId: 'semester-1',
        order: 0,
        requiredSessions: 10,
        requiredProjects: 1,
        lessons: [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const nextCourse = findNextCourseInSemester([course], 0);
      expect(nextCourse).toBeNull();
    });
  });

  /**
   * **Feature: phase-4-tracking, Property 16: Semester Completion Check**
   * **Validates: Requirements 5.3, 5.4**
   *
   * For any completed course that is the last in its semester, the system
   * should verify all courses in that semester are completed before unlocking
   * the next semester.
   */
  describe('Property 16: Semester Completion Check', () => {
    it('should return true when all courses are completed', () => {
      fc.assert(
        fc.property(
          fc.uuid(),
          fc.uuid(),
          fc.integer({ min: 1, max: 10 }),
          (semesterId, studentId, courseCount) => {
            // Create courses
            const courses: Course[] = Array.from({ length: courseCount }, (_, i) => ({
              id: `course-${i}`,
              title: `Course ${i}`,
              description: '',
              semesterId,
              order: i,
              requiredSessions: 10,
              requiredProjects: 1,
              lessons: [],
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            }));

            // Create completed progress for all courses
            const progressList: StudentProgress[] = courses.map((course) => ({
              id: `progress-${course.id}`,
              studentId,
              courseId: course.id,
              completedSessions: 10,
              projectsSubmitted: 1,
              projectLinks: ['https://example.com'],
              status: 'completed' as const,
              completedAt: new Date(),
              approvedAt: new Date(),
              approvedBy: 'admin-1',
              createdAt: new Date(),
              updatedAt: new Date(),
            }));

            const result = areAllCoursesCompleted(progressList, courses);
            expect(result).toBe(true);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return false when any course is not completed', () => {
      fc.assert(
        fc.property(
          fc.uuid(),
          fc.uuid(),
          fc.integer({ min: 2, max: 10 }),
          fc.integer({ min: 0, max: 9 }),
          (semesterId, studentId, courseCount, incompleteIndex) => {
            const actualIncompleteIndex = incompleteIndex % courseCount;

            // Create courses
            const courses: Course[] = Array.from({ length: courseCount }, (_, i) => ({
              id: `course-${i}`,
              title: `Course ${i}`,
              description: '',
              semesterId,
              order: i,
              requiredSessions: 10,
              requiredProjects: 1,
              lessons: [],
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            }));

            // Create progress with one incomplete
            const progressList: StudentProgress[] = courses.map((course, i) => ({
              id: `progress-${course.id}`,
              studentId,
              courseId: course.id,
              completedSessions: 10,
              projectsSubmitted: 1,
              projectLinks: ['https://example.com'],
              status: i === actualIncompleteIndex ? ('in_progress' as const) : ('completed' as const),
              completedAt: i === actualIncompleteIndex ? null : new Date(),
              approvedAt: i === actualIncompleteIndex ? null : new Date(),
              approvedBy: i === actualIncompleteIndex ? undefined : 'admin-1',
              createdAt: new Date(),
              updatedAt: new Date(),
            }));

            const result = areAllCoursesCompleted(progressList, courses);
            expect(result).toBe(false);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return false when progress record is missing for a course', () => {
      fc.assert(
        fc.property(
          fc.uuid(),
          fc.uuid(),
          fc.integer({ min: 2, max: 10 }),
          (semesterId, studentId, courseCount) => {
            // Create courses
            const courses: Course[] = Array.from({ length: courseCount }, (_, i) => ({
              id: `course-${i}`,
              title: `Course ${i}`,
              description: '',
              semesterId,
              order: i,
              requiredSessions: 10,
              requiredProjects: 1,
              lessons: [],
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            }));

            // Create progress for all but one course
            const progressList: StudentProgress[] = courses.slice(0, -1).map((course) => ({
              id: `progress-${course.id}`,
              studentId,
              courseId: course.id,
              completedSessions: 10,
              projectsSubmitted: 1,
              projectLinks: ['https://example.com'],
              status: 'completed' as const,
              completedAt: new Date(),
              approvedAt: new Date(),
              approvedBy: 'admin-1',
              createdAt: new Date(),
              updatedAt: new Date(),
            }));

            const result = areAllCoursesCompleted(progressList, courses);
            expect(result).toBe(false);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return false for empty course list', () => {
      const result = areAllCoursesCompleted([], []);
      expect(result).toBe(false);
    });
  });

  /**
   * **Feature: phase-4-tracking, Property 17: Semester Transition**
   * **Validates: Requirements 5.5**
   *
   * For any semester where all courses are completed, if a next semester
   * exists, the student's currentSemesterId should be updated and the first
   * course of the new semester should be unlocked.
   */
  describe('Property 17: Semester Transition', () => {
    it('should find the next semester with higher order', () => {
      fc.assert(
        fc.property(
          fc.array(fc.integer({ min: 0, max: 100 }), { minLength: 2, maxLength: 10 }),
          (orders) => {
            const uniqueOrders = [...new Set(orders)].sort((a, b) => a - b);
            if (uniqueOrders.length < 2) return true;

            const semesters: Semester[] = uniqueOrders.map((order, index) => ({
              id: `semester-${index}`,
              name: `Semester ${index}`,
              description: '',
              order,
              isActive: true,
              requiresMajorSelection: false,
              createdAt: new Date(),
              updatedAt: new Date(),
            }));

            // Test finding next semester for each except the last
            for (let i = 0; i < semesters.length - 1; i++) {
              const currentOrder = semesters[i].order;
              const nextSemester = findNextSemester(semesters, currentOrder);

              expect(nextSemester).not.toBeNull();
              if (nextSemester) {
                expect(nextSemester.order).toBeGreaterThan(currentOrder);
              }
            }

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return null when no next semester exists', () => {
      fc.assert(
        fc.property(
          fc.array(fc.integer({ min: 0, max: 100 }), { minLength: 1, maxLength: 10 }),
          (orders) => {
            const uniqueOrders = [...new Set(orders)].sort((a, b) => a - b);
            const maxOrder = Math.max(...uniqueOrders);

            const semesters: Semester[] = uniqueOrders.map((order, index) => ({
              id: `semester-${index}`,
              name: `Semester ${index}`,
              description: '',
              order,
              isActive: true,
              requiresMajorSelection: false,
              createdAt: new Date(),
              updatedAt: new Date(),
            }));

            const nextSemester = findNextSemester(semesters, maxOrder);
            expect(nextSemester).toBeNull();

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should find the immediate next semester by order', () => {
      fc.assert(
        fc.property(
          fc.array(fc.integer({ min: 0, max: 100 }), { minLength: 3, maxLength: 10 }),
          (orders) => {
            const uniqueOrders = [...new Set(orders)].sort((a, b) => a - b);
            if (uniqueOrders.length < 3) return true;

            const semesters: Semester[] = uniqueOrders.map((order, index) => ({
              id: `semester-${index}`,
              name: `Semester ${index}`,
              description: '',
              order,
              isActive: true,
              requiresMajorSelection: false,
              createdAt: new Date(),
              updatedAt: new Date(),
            }));

            // For each semester, the next should be the one with smallest order > current
            for (let i = 0; i < semesters.length - 1; i++) {
              const currentOrder = semesters[i].order;
              const nextSemester = findNextSemester(semesters, currentOrder);

              if (nextSemester) {
                // Verify it's the immediate next
                const semestersBetween = semesters.filter(
                  (s) => s.order > currentOrder && s.order < nextSemester.order
                );
                expect(semestersBetween.length).toBe(0);
              }
            }

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle empty semester list', () => {
      const nextSemester = findNextSemester([], 0);
      expect(nextSemester).toBeNull();
    });

    it('should handle single semester list', () => {
      const semester: Semester = {
        id: 'semester-1',
        name: 'Semester 1',
        description: '',
        order: 0,
        isActive: true,
        requiresMajorSelection: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const nextSemester = findNextSemester([semester], 0);
      expect(nextSemester).toBeNull();
    });
  });
});
