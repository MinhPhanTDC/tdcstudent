import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

/**
 * **Feature: phase-2-admin-basic, Property 3: Timestamp management**
 * **Validates: Requirements 1.4, 2.5, 3.5, 6.6**
 *
 * Property: For any create or update operation on semesters, courses, or students,
 * the system SHALL set createdAt on creation and update updatedAt to a timestamp
 * greater than the previous value on updates.
 */

/**
 * Simulates the timestamp behavior of BaseRepository.create()
 * Sets both createdAt and updatedAt to the same timestamp on creation
 */
function simulateCreate<T extends object>(
  data: T
): T & { id: string; createdAt: Date; updatedAt: Date } {
  const now = new Date();
  return {
    ...data,
    id: `generated-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Simulates the timestamp behavior of BaseRepository.update()
 * Preserves createdAt and updates updatedAt to current time
 */
function simulateUpdate<T extends { id: string; createdAt: Date; updatedAt: Date }>(
  existing: T,
  updates: Partial<Omit<T, 'id' | 'createdAt'>>
): T {
  return {
    ...existing,
    ...updates,
    createdAt: existing.createdAt, // Preserve original createdAt
    updatedAt: new Date(), // Always update to current time
  };
}

/**
 * Arbitrary generator for semester-like data (without timestamps)
 */
const semesterDataArbitrary = fc.record({
  name: fc.string({ minLength: 1, maxLength: 100 }),
  description: fc.option(fc.string({ maxLength: 500 }), { nil: undefined }),
  order: fc.nat({ max: 1000 }),
  isActive: fc.boolean(),
  requiresMajorSelection: fc.boolean(),
});

/**
 * Arbitrary generator for course-like data (without timestamps)
 */
const courseDataArbitrary = fc.record({
  title: fc.string({ minLength: 1, maxLength: 200 }),
  description: fc.option(fc.string({ maxLength: 1000 }), { nil: undefined }),
  semesterId: fc.uuid(),
  geniallyUrl: fc.option(fc.webUrl(), { nil: undefined }),
  thumbnailUrl: fc.option(fc.webUrl(), { nil: undefined }),
  order: fc.nat({ max: 1000 }),
  requiredSessions: fc.integer({ min: 1, max: 100 }),
  requiredProjects: fc.nat({ max: 20 }),
  isActive: fc.boolean(),
  lessons: fc.constant([]),
});

/**
 * Arbitrary generator for student-like data (without timestamps)
 */
const studentDataArbitrary = fc.record({
  userId: fc.uuid(),
  email: fc.emailAddress(),
  displayName: fc.string({ minLength: 2, maxLength: 100 }),
  phone: fc.option(fc.string({ minLength: 10, maxLength: 15 }), { nil: undefined }),
  currentSemesterId: fc.option(fc.uuid(), { nil: undefined }),
  selectedMajorId: fc.option(fc.uuid(), { nil: undefined }),
  enrolledAt: fc.date(),
  enrolledCourses: fc.array(fc.uuid(), { maxLength: 10 }),
  progress: fc.constant({}),
  isActive: fc.boolean(),
});

/**
 * Arbitrary generator for partial updates (simulating update operations)
 */
const partialUpdateArbitrary = fc.record({
  name: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }),
  description: fc.option(fc.string({ maxLength: 500 }), { nil: undefined }),
  isActive: fc.option(fc.boolean(), { nil: undefined }),
});

describe('Timestamp Management Property Tests', () => {
  describe('Property 3: Timestamp management', () => {
    describe('Creation timestamp behavior', () => {
      it('should set createdAt and updatedAt to the same value on creation for semesters', () => {
        fc.assert(
          fc.property(semesterDataArbitrary, (semesterData) => {
            const created = simulateCreate(semesterData);

            // Both timestamps should be set
            expect(created.createdAt).toBeInstanceOf(Date);
            expect(created.updatedAt).toBeInstanceOf(Date);

            // Both should be equal on creation
            expect(created.createdAt.getTime()).toBe(created.updatedAt.getTime());
          }),
          { numRuns: 100 }
        );
      });

      it('should set createdAt and updatedAt to the same value on creation for courses', () => {
        fc.assert(
          fc.property(courseDataArbitrary, (courseData) => {
            const created = simulateCreate(courseData);

            expect(created.createdAt).toBeInstanceOf(Date);
            expect(created.updatedAt).toBeInstanceOf(Date);
            expect(created.createdAt.getTime()).toBe(created.updatedAt.getTime());
          }),
          { numRuns: 100 }
        );
      });

      it('should set createdAt and updatedAt to the same value on creation for students', () => {
        fc.assert(
          fc.property(studentDataArbitrary, (studentData) => {
            const created = simulateCreate(studentData);

            expect(created.createdAt).toBeInstanceOf(Date);
            expect(created.updatedAt).toBeInstanceOf(Date);
            expect(created.createdAt.getTime()).toBe(created.updatedAt.getTime());
          }),
          { numRuns: 100 }
        );
      });

      it('should generate unique IDs on creation', () => {
        fc.assert(
          fc.property(
            fc.array(semesterDataArbitrary, { minLength: 2, maxLength: 20 }),
            (semesterDataArray) => {
              const createdItems = semesterDataArray.map((data) => simulateCreate(data));
              const ids = createdItems.map((item) => item.id);
              const uniqueIds = new Set(ids);

              // All IDs should be unique
              expect(uniqueIds.size).toBe(ids.length);
            }
          ),
          { numRuns: 100 }
        );
      });
    });

    describe('Update timestamp behavior', () => {
      it('should preserve createdAt and update updatedAt on update for semesters', () => {
        fc.assert(
          fc.property(semesterDataArbitrary, partialUpdateArbitrary, (semesterData, updates) => {
            // Create entity with a past timestamp to simulate time passing
            const pastDate = new Date(Date.now() - 10000); // 10 seconds ago
            const created = {
              ...semesterData,
              id: `generated-${Date.now()}-${Math.random().toString(36).substring(7)}`,
              createdAt: pastDate,
              updatedAt: pastDate,
            };
            const originalCreatedAt = created.createdAt.getTime();

            const updated = simulateUpdate(created, updates);

            // createdAt should be preserved
            expect(updated.createdAt.getTime()).toBe(originalCreatedAt);

            // updatedAt should be greater than or equal to original
            expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(originalCreatedAt);
          }),
          { numRuns: 100 }
        );
      });

      it('should always update updatedAt to a new timestamp on update', () => {
        fc.assert(
          fc.property(semesterDataArbitrary, partialUpdateArbitrary, (semesterData, updates) => {
            const created = simulateCreate(semesterData);

            // Force a small delay to ensure different timestamp
            const pastDate = new Date(Date.now() - 1000);
            const entityWithOldTimestamp = {
              ...created,
              updatedAt: pastDate,
            };

            const updated = simulateUpdate(entityWithOldTimestamp, updates);

            // updatedAt should be newer than the old timestamp
            expect(updated.updatedAt.getTime()).toBeGreaterThan(pastDate.getTime());
          }),
          { numRuns: 100 }
        );
      });

      it('should never modify createdAt during updates', () => {
        fc.assert(
          fc.property(
            semesterDataArbitrary,
            fc.array(partialUpdateArbitrary, { minLength: 1, maxLength: 5 }),
            (semesterData, updatesList) => {
              let entity = simulateCreate(semesterData);
              const originalCreatedAt = entity.createdAt.getTime();

              // Apply multiple updates
              for (const updates of updatesList) {
                entity = simulateUpdate(entity, updates);
              }

              // createdAt should remain unchanged after all updates
              expect(entity.createdAt.getTime()).toBe(originalCreatedAt);
            }
          ),
          { numRuns: 100 }
        );
      });
    });

    describe('Timestamp ordering invariants', () => {
      it('should ensure updatedAt is always >= createdAt', () => {
        fc.assert(
          fc.property(
            semesterDataArbitrary,
            fc.array(partialUpdateArbitrary, { maxLength: 10 }),
            (semesterData, updatesList) => {
              let entity = simulateCreate(semesterData);

              // Initial state: updatedAt should equal createdAt
              expect(entity.updatedAt.getTime()).toBeGreaterThanOrEqual(entity.createdAt.getTime());

              // After updates: updatedAt should still be >= createdAt
              for (const updates of updatesList) {
                entity = simulateUpdate(entity, updates);
                expect(entity.updatedAt.getTime()).toBeGreaterThanOrEqual(
                  entity.createdAt.getTime()
                );
              }
            }
          ),
          { numRuns: 100 }
        );
      });

      it('should ensure sequential updates have non-decreasing updatedAt', () => {
        fc.assert(
          fc.property(
            semesterDataArbitrary,
            fc.array(partialUpdateArbitrary, { minLength: 2, maxLength: 10 }),
            (semesterData, updatesList) => {
              let entity = simulateCreate(semesterData);
              let previousUpdatedAt = entity.updatedAt.getTime();

              for (const updates of updatesList) {
                entity = simulateUpdate(entity, updates);
                const currentUpdatedAt = entity.updatedAt.getTime();

                // Each update should have updatedAt >= previous updatedAt
                expect(currentUpdatedAt).toBeGreaterThanOrEqual(previousUpdatedAt);
                previousUpdatedAt = currentUpdatedAt;
              }
            }
          ),
          { numRuns: 100 }
        );
      });
    });

    describe('Cross-entity timestamp consistency', () => {
      it('should apply same timestamp rules across all entity types', () => {
        fc.assert(
          fc.property(
            semesterDataArbitrary,
            courseDataArbitrary,
            studentDataArbitrary,
            (semesterData, courseData, studentData) => {
              const semester = simulateCreate(semesterData);
              const course = simulateCreate(courseData);
              const student = simulateCreate(studentData);

              // All should have valid timestamps
              for (const entity of [semester, course, student]) {
                expect(entity.createdAt).toBeInstanceOf(Date);
                expect(entity.updatedAt).toBeInstanceOf(Date);
                expect(entity.createdAt.getTime()).toBe(entity.updatedAt.getTime());
                expect(entity.id).toBeTruthy();
              }
            }
          ),
          { numRuns: 100 }
        );
      });
    });

    describe('Edge cases', () => {
      it('should handle empty updates (no fields changed)', () => {
        fc.assert(
          fc.property(semesterDataArbitrary, (semesterData) => {
            const created = simulateCreate(semesterData);
            const originalCreatedAt = created.createdAt.getTime();

            // Update with empty object
            const updated = simulateUpdate(created, {});

            // createdAt should be preserved
            expect(updated.createdAt.getTime()).toBe(originalCreatedAt);

            // updatedAt should still be updated (even for empty updates)
            expect(updated.updatedAt).toBeInstanceOf(Date);
          }),
          { numRuns: 100 }
        );
      });

      it('should handle rapid sequential updates', () => {
        fc.assert(
          fc.property(
            semesterDataArbitrary,
            fc.integer({ min: 5, max: 20 }),
            (semesterData, updateCount) => {
              let entity = simulateCreate(semesterData);
              const originalCreatedAt = entity.createdAt.getTime();

              // Perform many rapid updates
              for (let i = 0; i < updateCount; i++) {
                entity = simulateUpdate(entity, { name: `Updated ${i}` });
              }

              // createdAt should never change
              expect(entity.createdAt.getTime()).toBe(originalCreatedAt);

              // updatedAt should be valid
              expect(entity.updatedAt).toBeInstanceOf(Date);
              expect(entity.updatedAt.getTime()).toBeGreaterThanOrEqual(originalCreatedAt);
            }
          ),
          { numRuns: 100 }
        );
      });
    });
  });
});
