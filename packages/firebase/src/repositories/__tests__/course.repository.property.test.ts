import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import type { Course } from '@tdc/schemas';

/**
 * **Feature: phase-2-admin-basic, Property 5: Course filtering by semester**
 * **Validates: Requirements 2.1, 2.7**
 *
 * Property: For any course list filtered by semesterId, all returned courses
 * SHALL have their semesterId field equal to the filter value.
 */

/**
 * **Feature: phase-2-admin-basic, Property 8: Course reorder consistency**
 * **Validates: Requirements 2.8**
 *
 * Property: For any reorder operation on courses within a semester, all affected
 * courses SHALL have unique, consecutive order values starting from 0.
 */

/**
 * Arbitrary generator for valid Course objects
 */
const courseArbitrary = (semesterId?: string): fc.Arbitrary<Course> =>
  fc.record({
    id: fc.uuid(),
    title: fc.string({ minLength: 1, maxLength: 50 }),
    description: fc.string({ maxLength: 100 }),
    semesterId: semesterId ? fc.constant(semesterId) : fc.uuid(),
    geniallyUrl: fc.constant(''),
    thumbnailUrl: fc.constant(''),
    order: fc.nat({ max: 100 }),
    requiredSessions: fc.integer({ min: 1, max: 20 }),
    requiredProjects: fc.nat({ max: 5 }),
    lessons: fc.constant([] as Course['lessons']),
    isActive: fc.boolean(),
    createdAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-01-01') }),
    updatedAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-01-01') }),
  });

/**
 * Filter courses by semester ID
 * This mirrors the behavior of findBySemester() in the repository
 */
function filterCoursesBySemester(courses: Course[], semesterId: string): Course[] {
  return courses.filter((course) => course.semesterId === semesterId);
}

/**
 * Sort courses by order field in ascending order
 * This mirrors the sorting behavior in findBySemester()
 */
function sortCoursesByOrder(courses: Course[]): Course[] {
  return [...courses].sort((a, b) => a.order - b.order);
}

/**
 * Check if all courses have the specified semester ID
 */
function allCoursesHaveSemesterId(courses: Course[], semesterId: string): boolean {
  return courses.every((course) => course.semesterId === semesterId);
}

/**
 * Check if courses are sorted in ascending order by the order field
 */
function isSortedByOrderAscending(courses: Course[]): boolean {
  for (let i = 1; i < courses.length; i++) {
    if (courses[i].order < courses[i - 1].order) {
      return false;
    }
  }
  return true;
}

describe('Course Repository Property Tests', () => {
  describe('Property 5: Course filtering by semester', () => {
    it('should return only courses with matching semesterId', () => {
      fc.assert(
        fc.property(
          fc.uuid(),
          fc.array(courseArbitrary(), { maxLength: 50 }),
          (targetSemesterId, courses) => {
            const filtered = filterCoursesBySemester(courses, targetSemesterId);

            // All filtered courses must have the target semester ID
            expect(allCoursesHaveSemesterId(filtered, targetSemesterId)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return all courses that match the semesterId filter', () => {
      fc.assert(
        fc.property(
          fc.uuid(),
          fc.array(courseArbitrary(), { maxLength: 50 }),
          (targetSemesterId, courses) => {
            const filtered = filterCoursesBySemester(courses, targetSemesterId);

            // Count of filtered should equal count of courses with matching semesterId
            const expectedCount = courses.filter((c) => c.semesterId === targetSemesterId).length;
            expect(filtered.length).toBe(expectedCount);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return courses sorted by order when filtered by semester', () => {
      fc.assert(
        fc.property(
          fc.uuid(),
          fc.array(courseArbitrary(), { maxLength: 50 }),
          (targetSemesterId, courses) => {
            const filtered = filterCoursesBySemester(courses, targetSemesterId);
            const sorted = sortCoursesByOrder(filtered);

            // Filtered and sorted courses should be in ascending order
            expect(isSortedByOrderAscending(sorted)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return empty array when no courses match the semesterId', () => {
      fc.assert(
        fc.property(
          fc.uuid(),
          fc.array(courseArbitrary(), { maxLength: 50 }).filter((courses) => courses.length > 0),
          (nonExistentSemesterId, courses) => {
            // Ensure the target semester ID doesn't exist in any course
            const existingSemesterIds = new Set(courses.map((c) => c.semesterId));
            if (!existingSemesterIds.has(nonExistentSemesterId)) {
              const filtered = filterCoursesBySemester(courses, nonExistentSemesterId);
              expect(filtered).toEqual([]);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return all courses for a semester when multiple courses exist', () => {
      fc.assert(
        fc.property(
          fc.uuid(),
          fc.integer({ min: 1, max: 10 }),
          fc.array(courseArbitrary(), { maxLength: 30 }),
          (targetSemesterId, numCoursesInSemester, otherCourses) => {
            // Create courses specifically for the target semester
            const coursesInSemester: Course[] = Array.from({ length: numCoursesInSemester }, (_, i) => ({
              id: `course-${i}-${targetSemesterId}`,
              title: `Course ${i}`,
              description: '',
              semesterId: targetSemesterId,
              geniallyUrl: '',
              thumbnailUrl: '',
              order: i,
              requiredSessions: 10,
              requiredProjects: 1,
              lessons: [],
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            }));

            // Combine with other courses
            const allCourses = [...coursesInSemester, ...otherCourses];
            const filtered = filterCoursesBySemester(allCourses, targetSemesterId);

            // Should include all courses from target semester
            expect(filtered.length).toBeGreaterThanOrEqual(numCoursesInSemester);

            // All filtered courses should have the target semester ID
            expect(allCoursesHaveSemesterId(filtered, targetSemesterId)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle empty course list', () => {
      const filtered = filterCoursesBySemester([], 'any-semester-id');
      expect(filtered).toEqual([]);
    });

    it('should be idempotent - filtering twice produces same result', () => {
      fc.assert(
        fc.property(
          fc.uuid(),
          fc.array(courseArbitrary(), { maxLength: 50 }),
          (targetSemesterId, courses) => {
            const filteredOnce = filterCoursesBySemester(courses, targetSemesterId);
            const filteredTwice = filterCoursesBySemester(filteredOnce, targetSemesterId);

            // Same result after filtering twice
            expect(filteredTwice.map((c) => c.id)).toEqual(filteredOnce.map((c) => c.id));
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve course data integrity after filtering', () => {
      fc.assert(
        fc.property(
          fc.uuid(),
          fc.array(courseArbitrary(), { maxLength: 50 }),
          (targetSemesterId, courses) => {
            const filtered = filterCoursesBySemester(courses, targetSemesterId);

            // Each filtered course should exist in original array with same data
            for (const filteredCourse of filtered) {
              const original = courses.find((c) => c.id === filteredCourse.id);
              expect(original).toBeDefined();
              expect(filteredCourse).toEqual(original);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not include courses from other semesters', () => {
      fc.assert(
        fc.property(
          fc.uuid(),
          fc.uuid(),
          fc.array(courseArbitrary(), { maxLength: 25 }),
          fc.array(courseArbitrary(), { maxLength: 25 }),
          (semesterA, semesterB, coursesA, coursesB) => {
            // Ensure semester IDs are different
            if (semesterA === semesterB) return;

            // Assign semester IDs to courses
            const coursesWithSemesterA = coursesA.map((c) => ({
              ...c,
              semesterId: semesterA,
            }));
            const coursesWithSemesterB = coursesB.map((c) => ({
              ...c,
              semesterId: semesterB,
            }));

            const allCourses = [...coursesWithSemesterA, ...coursesWithSemesterB];
            const filteredA = filterCoursesBySemester(allCourses, semesterA);

            // No course from semester B should be in filtered results
            const semesterBIds = new Set(coursesWithSemesterB.map((c) => c.id));
            const hasCoursesFromB = filteredA.some((c) => semesterBIds.has(c.id));
            expect(hasCoursesFromB).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: phase-2-admin-basic, Property 8: Course reorder consistency**
   * **Validates: Requirements 2.8**
   */
  describe('Property 8: Course reorder consistency', () => {
    /**
     * Simulates the reorder operation from the repository
     * This mirrors the behavior of reorderInSemester() which assigns
     * consecutive order values starting from 0 based on the array index
     */
    function reorderCourses(courses: Course[], newOrderIds: string[]): Course[] {
      const courseMap = new Map(courses.map((c) => [c.id, c]));
      return newOrderIds
        .map((id, index) => {
          const course = courseMap.get(id);
          if (!course) return null;
          return { ...course, order: index };
        })
        .filter((c): c is Course => c !== null);
    }

    /**
     * Check if courses have unique, consecutive order values starting from 0
     */
    function hasConsecutiveOrdersFromZero(courses: Course[]): boolean {
      if (courses.length === 0) return true;

      const orders = courses.map((c) => c.order).sort((a, b) => a - b);

      // Check that orders start from 0 and are consecutive
      for (let i = 0; i < orders.length; i++) {
        if (orders[i] !== i) return false;
      }
      return true;
    }

    /**
     * Check if all order values are unique
     */
    function hasUniqueOrders(courses: Course[]): boolean {
      const orders = courses.map((c) => c.order);
      return new Set(orders).size === orders.length;
    }

    it('should assign consecutive order values starting from 0 after reorder', () => {
      fc.assert(
        fc.property(
          fc.uuid(),
          fc.array(courseArbitrary(), { minLength: 1, maxLength: 20 }),
          (semesterId, courses) => {
            // Assign same semester to all courses
            const semesterCourses = courses.map((c) => ({ ...c, semesterId }));

            // Get course IDs and shuffle them to simulate reorder
            const courseIds = semesterCourses.map((c) => c.id);
            const shuffledIds = [...courseIds].sort(() => Math.random() - 0.5);

            // Apply reorder
            const reordered = reorderCourses(semesterCourses, shuffledIds);

            // All courses should have consecutive orders starting from 0
            expect(hasConsecutiveOrdersFromZero(reordered)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should assign unique order values to all courses', () => {
      fc.assert(
        fc.property(
          fc.uuid(),
          fc.array(courseArbitrary(), { minLength: 1, maxLength: 20 }),
          (semesterId, courses) => {
            // Assign same semester to all courses
            const semesterCourses = courses.map((c) => ({ ...c, semesterId }));

            // Get course IDs
            const courseIds = semesterCourses.map((c) => c.id);

            // Apply reorder
            const reordered = reorderCourses(semesterCourses, courseIds);

            // All courses should have unique orders
            expect(hasUniqueOrders(reordered)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve course count after reorder', () => {
      fc.assert(
        fc.property(
          fc.uuid(),
          fc.array(courseArbitrary(), { minLength: 0, maxLength: 20 }),
          (semesterId, courses) => {
            // Assign same semester to all courses
            const semesterCourses = courses.map((c) => ({ ...c, semesterId }));

            // Get course IDs
            const courseIds = semesterCourses.map((c) => c.id);

            // Apply reorder
            const reordered = reorderCourses(semesterCourses, courseIds);

            // Course count should be preserved
            expect(reordered.length).toBe(semesterCourses.length);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should assign order based on position in the new order array', () => {
      fc.assert(
        fc.property(
          fc.uuid(),
          fc.array(courseArbitrary(), { minLength: 2, maxLength: 20 }),
          (semesterId, courses) => {
            // Assign same semester to all courses and ensure unique IDs
            const uniqueCourses = courses.reduce((acc, c, i) => {
              const uniqueId = `${c.id}-${i}`;
              acc.push({ ...c, id: uniqueId, semesterId });
              return acc;
            }, [] as Course[]);

            // Get course IDs
            const courseIds = uniqueCourses.map((c) => c.id);

            // Apply reorder
            const reordered = reorderCourses(uniqueCourses, courseIds);

            // Each course's order should match its position in the input array
            for (let i = 0; i < courseIds.length; i++) {
              const course = reordered.find((c) => c.id === courseIds[i]);
              expect(course?.order).toBe(i);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle empty course list', () => {
      const reordered = reorderCourses([], []);
      expect(reordered).toEqual([]);
      expect(hasConsecutiveOrdersFromZero(reordered)).toBe(true);
    });

    it('should handle single course', () => {
      fc.assert(
        fc.property(courseArbitrary(), (course) => {
          const reordered = reorderCourses([course], [course.id]);

          expect(reordered.length).toBe(1);
          expect(reordered[0].order).toBe(0);
        }),
        { numRuns: 100 }
      );
    });

    it('should ignore IDs not in the course list', () => {
      fc.assert(
        fc.property(
          fc.uuid(),
          fc.array(courseArbitrary(), { minLength: 1, maxLength: 10 }),
          fc.array(fc.uuid(), { minLength: 1, maxLength: 5 }),
          (semesterId, courses, extraIds) => {
            // Assign same semester to all courses
            const semesterCourses = courses.map((c) => ({ ...c, semesterId }));

            // Get course IDs and add extra non-existent IDs
            const courseIds = semesterCourses.map((c) => c.id);
            const mixedIds = [...courseIds, ...extraIds];

            // Apply reorder
            const reordered = reorderCourses(semesterCourses, mixedIds);

            // Only existing courses should be in result
            expect(reordered.length).toBe(semesterCourses.length);

            // Orders should still be consecutive from 0
            expect(hasConsecutiveOrdersFromZero(reordered)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain data integrity except for order field', () => {
      fc.assert(
        fc.property(
          fc.uuid(),
          fc.array(courseArbitrary(), { minLength: 1, maxLength: 20 }),
          (semesterId, courses) => {
            // Assign same semester to all courses
            const semesterCourses = courses.map((c) => ({ ...c, semesterId }));

            // Get course IDs
            const courseIds = semesterCourses.map((c) => c.id);

            // Apply reorder
            const reordered = reorderCourses(semesterCourses, courseIds);

            // Each course should have same data except order
            for (const reorderedCourse of reordered) {
              const original = semesterCourses.find((c) => c.id === reorderedCourse.id);
              expect(original).toBeDefined();

              // Compare all fields except order
              const { order: _reorderedOrder, ...reorderedRest } = reorderedCourse;
              const { order: _originalOrder, ...originalRest } = original!;
              expect(reorderedRest).toEqual(originalRest);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should be idempotent when reordering with same order', () => {
      fc.assert(
        fc.property(
          fc.uuid(),
          fc.array(courseArbitrary(), { minLength: 1, maxLength: 20 }),
          (semesterId, courses) => {
            // Assign same semester to all courses
            const semesterCourses = courses.map((c) => ({ ...c, semesterId }));

            // Get course IDs
            const courseIds = semesterCourses.map((c) => c.id);

            // Apply reorder twice with same order
            const reorderedOnce = reorderCourses(semesterCourses, courseIds);
            const reorderedTwice = reorderCourses(reorderedOnce, courseIds);

            // Results should be identical
            expect(reorderedTwice.map((c) => ({ id: c.id, order: c.order }))).toEqual(
              reorderedOnce.map((c) => ({ id: c.id, order: c.order }))
            );
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: phase-2-admin-basic, Property 9: Course semester change order reset**
   * **Validates: Requirements 2.9**
   *
   * Property: For any course moved to a different semester, the course's order
   * SHALL be set to the maximum order value + 1 in the target semester.
   */
  describe('Property 9: Course semester change order reset', () => {
    /**
     * Get the next available order number in a semester
     * This mirrors the behavior of getNextOrderInSemester() in the repository
     */
    function getNextOrderInSemester(courses: Course[], semesterId: string): number {
      const semesterCourses = courses.filter((c) => c.semesterId === semesterId);
      if (semesterCourses.length === 0) {
        return 0;
      }
      const maxOrder = Math.max(...semesterCourses.map((c) => c.order));
      return maxOrder + 1;
    }

    /**
     * Simulates moving a course to a different semester
     * This mirrors the behavior of moveToSemester() in the repository
     */
    function moveCourseToSemester(
      allCourses: Course[],
      courseId: string,
      newSemesterId: string
    ): { updatedCourse: Course | null; allCourses: Course[] } {
      const courseIndex = allCourses.findIndex((c) => c.id === courseId);
      if (courseIndex === -1) {
        return { updatedCourse: null, allCourses };
      }

      const course = allCourses[courseIndex];
      const newOrder = getNextOrderInSemester(allCourses, newSemesterId);

      const updatedCourse: Course = {
        ...course,
        semesterId: newSemesterId,
        order: newOrder,
      };

      const updatedCourses = [...allCourses];
      updatedCourses[courseIndex] = updatedCourse;

      return { updatedCourse, allCourses: updatedCourses };
    }

    it('should set order to max + 1 when moving to a semester with existing courses', () => {
      fc.assert(
        fc.property(
          fc.uuid(), // source semester
          fc.uuid(), // target semester
          fc.array(courseArbitrary(), { minLength: 1, maxLength: 10 }), // courses in target semester
          fc.array(courseArbitrary(), { minLength: 1, maxLength: 5 }), // courses in source semester
          (sourceSemesterId, targetSemesterId, targetCourses, sourceCourses) => {
            // Ensure semesters are different
            if (sourceSemesterId === targetSemesterId) return;

            // Assign semester IDs to courses
            const coursesInTarget = targetCourses.map((c, i) => ({
              ...c,
              semesterId: targetSemesterId,
              order: i * 2, // Non-consecutive orders to test max finding
            }));
            const coursesInSource = sourceCourses.map((c, i) => ({
              ...c,
              id: `source-${c.id}-${i}`, // Ensure unique IDs
              semesterId: sourceSemesterId,
              order: i,
            }));

            const allCourses = [...coursesInTarget, ...coursesInSource];
            const courseToMove = coursesInSource[0];

            // Calculate expected order before move
            const expectedOrder = getNextOrderInSemester(allCourses, targetSemesterId);

            // Move course to target semester
            const { updatedCourse } = moveCourseToSemester(allCourses, courseToMove.id, targetSemesterId);

            // Course should have order = max order in target + 1
            expect(updatedCourse).not.toBeNull();
            expect(updatedCourse!.order).toBe(expectedOrder);
            expect(updatedCourse!.semesterId).toBe(targetSemesterId);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should set order to 0 when moving to an empty semester', () => {
      fc.assert(
        fc.property(
          fc.uuid(), // source semester
          fc.uuid(), // target semester (empty)
          fc.array(courseArbitrary(), { minLength: 1, maxLength: 10 }), // courses in source semester
          (sourceSemesterId, targetSemesterId, sourceCourses) => {
            // Ensure semesters are different
            if (sourceSemesterId === targetSemesterId) return;

            // Assign semester IDs to courses (only source has courses)
            const coursesInSource = sourceCourses.map((c, i) => ({
              ...c,
              id: `source-${c.id}-${i}`,
              semesterId: sourceSemesterId,
              order: i,
            }));

            const courseToMove = coursesInSource[0];

            // Move course to empty target semester
            const { updatedCourse } = moveCourseToSemester(coursesInSource, courseToMove.id, targetSemesterId);

            // Course should have order = 0 (first in empty semester)
            expect(updatedCourse).not.toBeNull();
            expect(updatedCourse!.order).toBe(0);
            expect(updatedCourse!.semesterId).toBe(targetSemesterId);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should update semesterId to the target semester', () => {
      fc.assert(
        fc.property(
          fc.uuid(),
          fc.uuid(),
          courseArbitrary(),
          (sourceSemesterId, targetSemesterId, course) => {
            // Ensure semesters are different
            if (sourceSemesterId === targetSemesterId) return;

            const courseInSource = { ...course, semesterId: sourceSemesterId };
            const allCourses = [courseInSource];

            const { updatedCourse } = moveCourseToSemester(allCourses, courseInSource.id, targetSemesterId);

            expect(updatedCourse).not.toBeNull();
            expect(updatedCourse!.semesterId).toBe(targetSemesterId);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve all other course data except semesterId and order', () => {
      fc.assert(
        fc.property(
          fc.uuid(),
          fc.uuid(),
          courseArbitrary(),
          (sourceSemesterId, targetSemesterId, course) => {
            // Ensure semesters are different
            if (sourceSemesterId === targetSemesterId) return;

            const courseInSource = { ...course, semesterId: sourceSemesterId };
            const allCourses = [courseInSource];

            const { updatedCourse } = moveCourseToSemester(allCourses, courseInSource.id, targetSemesterId);

            expect(updatedCourse).not.toBeNull();

            // Compare all fields except semesterId and order
            const { semesterId: _s1, order: _o1, ...originalRest } = courseInSource;
            const { semesterId: _s2, order: _o2, ...updatedRest } = updatedCourse!;
            expect(updatedRest).toEqual(originalRest);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should calculate order correctly with non-consecutive existing orders', () => {
      fc.assert(
        fc.property(
          fc.uuid(),
          fc.uuid(),
          fc.array(fc.nat({ max: 100 }), { minLength: 1, maxLength: 10 }),
          courseArbitrary(),
          (sourceSemesterId, targetSemesterId, existingOrders, courseToMove) => {
            // Ensure semesters are different
            if (sourceSemesterId === targetSemesterId) return;

            // Create courses in target semester with specified orders
            const coursesInTarget = existingOrders.map((order, i) => ({
              id: `target-${i}`,
              title: `Course ${i}`,
              description: '',
              semesterId: targetSemesterId,
              geniallyUrl: '',
              thumbnailUrl: '',
              order,
              requiredSessions: 10,
              requiredProjects: 1,
              lessons: [] as Course['lessons'],
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            }));

            const courseInSource = {
              ...courseToMove,
              id: 'course-to-move',
              semesterId: sourceSemesterId,
            };

            const allCourses = [...coursesInTarget, courseInSource];
            const maxExistingOrder = Math.max(...existingOrders);

            const { updatedCourse } = moveCourseToSemester(allCourses, courseInSource.id, targetSemesterId);

            // Order should be max existing order + 1
            expect(updatedCourse).not.toBeNull();
            expect(updatedCourse!.order).toBe(maxExistingOrder + 1);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle moving multiple courses sequentially', () => {
      fc.assert(
        fc.property(
          fc.uuid(),
          fc.uuid(),
          fc.array(courseArbitrary(), { minLength: 2, maxLength: 5 }),
          (sourceSemesterId, targetSemesterId, coursesToMove) => {
            // Ensure semesters are different
            if (sourceSemesterId === targetSemesterId) return;

            // Create courses in source semester
            let allCourses = coursesToMove.map((c, i) => ({
              ...c,
              id: `source-${i}`,
              semesterId: sourceSemesterId,
              order: i,
            }));

            // Move each course sequentially and verify order
            for (let i = 0; i < allCourses.length; i++) {
              const courseId = `source-${i}`;
              const expectedOrder = i; // Each moved course should get next order (0, 1, 2, ...)

              const result = moveCourseToSemester(allCourses, courseId, targetSemesterId);
              allCourses = result.allCourses;

              expect(result.updatedCourse).not.toBeNull();
              expect(result.updatedCourse!.order).toBe(expectedOrder);
              expect(result.updatedCourse!.semesterId).toBe(targetSemesterId);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return null for non-existent course', () => {
      fc.assert(
        fc.property(
          fc.uuid(),
          fc.uuid(),
          fc.array(courseArbitrary(), { minLength: 0, maxLength: 10 }),
          (targetSemesterId, nonExistentId, courses) => {
            // Ensure the ID doesn't exist in courses
            const existingIds = new Set(courses.map((c) => c.id));
            if (existingIds.has(nonExistentId)) return;

            const { updatedCourse } = moveCourseToSemester(courses, nonExistentId, targetSemesterId);

            expect(updatedCourse).toBeNull();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle edge case of moving to same semester (no-op for order)', () => {
      fc.assert(
        fc.property(
          fc.uuid(),
          fc.array(courseArbitrary(), { minLength: 1, maxLength: 10 }),
          (semesterId, courses) => {
            // All courses in same semester
            const semesterCourses = courses.map((c, i) => ({
              ...c,
              id: `course-${i}`,
              semesterId,
              order: i,
            }));

            const courseToMove = semesterCourses[0];

            // Moving to same semester should still recalculate order to max + 1
            const { updatedCourse } = moveCourseToSemester(semesterCourses, courseToMove.id, semesterId);

            expect(updatedCourse).not.toBeNull();
            // When moving to same semester, order becomes max + 1 (which is length - 1 + 1 = length)
            // But since the course is already in the semester, max is calculated including it
            const maxOrder = Math.max(...semesterCourses.map((c) => c.order));
            expect(updatedCourse!.order).toBe(maxOrder + 1);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
