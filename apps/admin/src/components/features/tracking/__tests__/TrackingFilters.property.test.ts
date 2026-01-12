import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

/**
 * Course type for testing
 */
interface Course {
  id: string;
  title: string;
  semesterId: string;
}

/**
 * Semester type for testing
 */
interface Semester {
  id: string;
  name: string;
}

/**
 * Filter courses by semester - mirrors the logic in TrackingFilters
 * Requirements: 1.3, 1.4
 */
function filterCoursesBySemester(
  courses: Course[],
  semesterId: string | null
): Course[] {
  if (!semesterId) {
    return courses;
  }
  return courses.filter((course) => course.semesterId === semesterId);
}

/**
 * Filter items by search term - mirrors the logic in useTracking
 * Requirements: 1.5
 */
function filterBySearch<T extends { name?: string; email?: string }>(
  items: T[],
  search: string
): T[] {
  if (!search) {
    return items;
  }
  const searchLower = search.toLowerCase();
  return items.filter(
    (item) =>
      (item.name && item.name.toLowerCase().includes(searchLower)) ||
      (item.email && item.email.toLowerCase().includes(searchLower))
  );
}

/**
 * Arbitrary generator for semester
 */
const semesterArbitrary = (): fc.Arbitrary<Semester> =>
  fc.record({
    id: fc.uuid(),
    name: fc.string({ minLength: 1, maxLength: 50 }),
  });

/**
 * Arbitrary generator for student data
 */
const studentArbitrary = (): fc.Arbitrary<{ name: string; email: string }> =>
  fc.record({
    name: fc.string({ minLength: 1, maxLength: 100 }),
    email: fc.emailAddress(),
  });

describe('TrackingFilters Property Tests', () => {
  /**
   * **Feature: phase-4-tracking, Property 1: Filter Results Consistency**
   * **Validates: Requirements 1.3**
   *
   * For any semester filter selection, all displayed courses in the tracking table
   * should belong to that selected semester.
   */
  describe('Property 1: Filter Results Consistency', () => {
    it('should return only courses belonging to the selected semester', () => {
      fc.assert(
        fc.property(
          fc.array(semesterArbitrary(), { minLength: 1, maxLength: 5 }),
          fc.integer({ min: 1, max: 20 }),
          (semesters, numCourses) => {
            // Generate courses based on semesters
            const semesterIds = semesters.map((s) => s.id);
            
            // Create courses manually to ensure they reference valid semesters
            const courses: Course[] = [];
            for (let i = 0; i < numCourses; i++) {
              courses.push({
                id: `course-${i}`,
                title: `Course ${i}`,
                semesterId: semesterIds[i % semesterIds.length],
              });
            }

            // Pick a random semester to filter by
            const selectedSemesterId = semesterIds[0];

            // Apply filter
            const filteredCourses = filterCoursesBySemester(courses, selectedSemesterId);

            // All filtered courses should belong to the selected semester
            for (const course of filteredCourses) {
              expect(course.semesterId).toBe(selectedSemesterId);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return all courses when no semester is selected', () => {
      fc.assert(
        fc.property(
          fc.array(semesterArbitrary(), { minLength: 1, maxLength: 5 }),
          (semesters) => {
            const semesterIds = semesters.map((s) => s.id);
            
            // Create courses
            const courses: Course[] = semesterIds.flatMap((semId, idx) => [
              { id: `course-${idx}-1`, title: `Course ${idx}-1`, semesterId: semId },
              { id: `course-${idx}-2`, title: `Course ${idx}-2`, semesterId: semId },
            ]);

            // Apply filter with null semester
            const filteredCourses = filterCoursesBySemester(courses, null);

            // Should return all courses
            expect(filteredCourses.length).toBe(courses.length);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return empty array when semester has no courses', () => {
      fc.assert(
        fc.property(
          fc.array(semesterArbitrary(), { minLength: 2, maxLength: 5 }),
          (semesters) => {
            const semesterIds = semesters.map((s) => s.id);
            
            // Create courses only for first semester
            const courses: Course[] = [
              { id: 'course-1', title: 'Course 1', semesterId: semesterIds[0] },
              { id: 'course-2', title: 'Course 2', semesterId: semesterIds[0] },
            ];

            // Filter by second semester (which has no courses)
            const filteredCourses = filterCoursesBySemester(courses, semesterIds[1]);

            // Should return empty array
            expect(filteredCourses.length).toBe(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve course count for selected semester', () => {
      fc.assert(
        fc.property(
          fc.array(semesterArbitrary(), { minLength: 1, maxLength: 5 }),
          fc.integer({ min: 1, max: 10 }),
          (semesters, coursesPerSemester) => {
            const semesterIds = semesters.map((s) => s.id);
            
            // Create equal number of courses per semester
            const courses: Course[] = semesterIds.flatMap((semId, semIdx) =>
              Array.from({ length: coursesPerSemester }, (_, courseIdx) => ({
                id: `course-${semIdx}-${courseIdx}`,
                title: `Course ${semIdx}-${courseIdx}`,
                semesterId: semId,
              }))
            );

            // Filter by first semester
            const filteredCourses = filterCoursesBySemester(courses, semesterIds[0]);

            // Should return exactly coursesPerSemester courses
            expect(filteredCourses.length).toBe(coursesPerSemester);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: phase-4-tracking, Property 2: Search Results Containment**
   * **Validates: Requirements 1.5**
   *
   * For any search term entered, all students in the filtered results should have
   * either name or email containing that search term (case-insensitive).
   */
  describe('Property 2: Search Results Containment', () => {
    it('should return only students whose name or email contains the search term', () => {
      fc.assert(
        fc.property(
          fc.array(studentArbitrary(), { minLength: 0, maxLength: 50 }),
          fc.string({ minLength: 1, maxLength: 20 }),
          (students, searchTerm) => {
            // Apply search filter
            const filteredStudents = filterBySearch(students, searchTerm);

            // All filtered students should contain the search term in name or email
            const searchLower = searchTerm.toLowerCase();
            for (const student of filteredStudents) {
              const nameContains = student.name.toLowerCase().includes(searchLower);
              const emailContains = student.email.toLowerCase().includes(searchLower);
              expect(nameContains || emailContains).toBe(true);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return all students when search term is empty', () => {
      fc.assert(
        fc.property(
          fc.array(studentArbitrary(), { minLength: 0, maxLength: 50 }),
          (students) => {
            // Apply empty search filter
            const filteredStudents = filterBySearch(students, '');

            // Should return all students
            expect(filteredStudents.length).toBe(students.length);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should be case-insensitive when searching', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 20 }),
          (baseTerm) => {
            // Create students with various case combinations
            const students = [
              { name: baseTerm.toLowerCase(), email: 'test1@example.com' },
              { name: baseTerm.toUpperCase(), email: 'test2@example.com' },
              { name: `prefix${baseTerm}suffix`, email: 'test3@example.com' },
              { name: 'NoMatch', email: 'nomatch@example.com' },
            ];

            // Search with lowercase
            const lowerResults = filterBySearch(students, baseTerm.toLowerCase());
            // Search with uppercase
            const upperResults = filterBySearch(students, baseTerm.toUpperCase());

            // Both searches should return the same results
            expect(lowerResults.length).toBe(upperResults.length);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should find students by email containing search term', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 3, maxLength: 10 }).filter((s) => /^[a-z]+$/.test(s)),
          (searchTerm) => {
            // Create students where only email matches
            const students = [
              { name: 'John Doe', email: `${searchTerm}@example.com` },
              { name: 'Jane Smith', email: `user.${searchTerm}.test@example.com` },
              { name: 'Bob Wilson', email: 'nomatch@example.com' },
            ];

            // Apply search filter
            const filteredStudents = filterBySearch(students, searchTerm);

            // Should find students with matching email
            expect(filteredStudents.length).toBeGreaterThanOrEqual(2);
            
            // All results should contain search term in email
            for (const student of filteredStudents) {
              const nameContains = student.name.toLowerCase().includes(searchTerm.toLowerCase());
              const emailContains = student.email.toLowerCase().includes(searchTerm.toLowerCase());
              expect(nameContains || emailContains).toBe(true);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return empty array when no students match search term', () => {
      fc.assert(
        fc.property(
          fc.uuid(), // Use UUID as search term to ensure no match
          (searchTerm) => {
            const students = [
              { name: 'John Doe', email: 'john@example.com' },
              { name: 'Jane Smith', email: 'jane@example.com' },
            ];

            // Apply search filter with UUID (unlikely to match)
            const filteredStudents = filterBySearch(students, searchTerm);

            // Should return empty array
            expect(filteredStudents.length).toBe(0);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
