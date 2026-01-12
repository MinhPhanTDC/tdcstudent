import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { filterActiveRequirements } from '../RequirementList';
import type { LabRequirement } from '@tdc/schemas';

/**
 * Generator for LabRequirement objects
 */
const labRequirementArb = fc.record({
  id: fc.uuid(),
  title: fc.string({ minLength: 1, maxLength: 200 }),
  description: fc.option(fc.string({ maxLength: 500 }), { nil: undefined }),
  helpUrl: fc.option(fc.webUrl(), { nil: undefined }),
  order: fc.integer({ min: 0, max: 100 }),
  isActive: fc.boolean(),
  requiresVerification: fc.boolean(),
  createdAt: fc.date(),
  updatedAt: fc.date(),
}) as fc.Arbitrary<LabRequirement>;

/**
 * Property-based tests for RequirementList
 * **Feature: phase-6-lab-advanced, Property 2: Active requirements filtering**
 * **Validates: Requirements 1.1, 1.5, 3.5**
 */
describe('RequirementList Property Tests', () => {
  describe('Property 2: Active requirements filtering', () => {
    /**
     * **Feature: phase-6-lab-advanced, Property 2: Active requirements filtering**
     * **Validates: Requirements 1.1, 1.5, 3.5**
     * 
     * For any list of Lab requirements, the student view SHALL display only
     * requirements where isActive equals true, maintaining the order field sorting.
     */
    it('should return only active requirements', () => {
      fc.assert(
        fc.property(
          fc.array(labRequirementArb, { minLength: 0, maxLength: 20 }),
          (requirements) => {
            const result = filterActiveRequirements(requirements);
            
            // All returned requirements should be active
            expect(result.every((req) => req.isActive === true)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should include all active requirements from input', () => {
      fc.assert(
        fc.property(
          fc.array(labRequirementArb, { minLength: 0, maxLength: 20 }),
          (requirements) => {
            const result = filterActiveRequirements(requirements);
            const activeFromInput = requirements.filter((req) => req.isActive);
            
            // Count should match
            expect(result.length).toBe(activeFromInput.length);
            
            // All active requirements from input should be in result
            const resultIds = new Set(result.map((r) => r.id));
            activeFromInput.forEach((req) => {
              expect(resultIds.has(req.id)).toBe(true);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain order field sorting (ascending)', () => {
      fc.assert(
        fc.property(
          fc.array(labRequirementArb, { minLength: 0, maxLength: 20 }),
          (requirements) => {
            const result = filterActiveRequirements(requirements);
            
            // Check that result is sorted by order field in ascending order
            for (let i = 1; i < result.length; i++) {
              expect(result[i].order).toBeGreaterThanOrEqual(result[i - 1].order);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return empty array when no active requirements exist', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              id: fc.uuid(),
              title: fc.string({ minLength: 1, maxLength: 200 }),
              description: fc.option(fc.string({ maxLength: 500 }), { nil: undefined }),
              helpUrl: fc.option(fc.webUrl(), { nil: undefined }),
              order: fc.integer({ min: 0, max: 100 }),
              isActive: fc.constant(false), // All inactive
              requiresVerification: fc.boolean(),
              createdAt: fc.date(),
              updatedAt: fc.date(),
            }) as fc.Arbitrary<LabRequirement>,
            { minLength: 0, maxLength: 10 }
          ),
          (requirements) => {
            const result = filterActiveRequirements(requirements);
            expect(result.length).toBe(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return all requirements when all are active', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              id: fc.uuid(),
              title: fc.string({ minLength: 1, maxLength: 200 }),
              description: fc.option(fc.string({ maxLength: 500 }), { nil: undefined }),
              helpUrl: fc.option(fc.webUrl(), { nil: undefined }),
              order: fc.integer({ min: 0, max: 100 }),
              isActive: fc.constant(true), // All active
              requiresVerification: fc.boolean(),
              createdAt: fc.date(),
              updatedAt: fc.date(),
            }) as fc.Arbitrary<LabRequirement>,
            { minLength: 0, maxLength: 10 }
          ),
          (requirements) => {
            const result = filterActiveRequirements(requirements);
            expect(result.length).toBe(requirements.length);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not modify the original array', () => {
      fc.assert(
        fc.property(
          fc.array(labRequirementArb, { minLength: 1, maxLength: 20 }),
          (requirements) => {
            const originalLength = requirements.length;
            const originalFirst = requirements[0];
            
            filterActiveRequirements(requirements);
            
            // Original array should be unchanged
            expect(requirements.length).toBe(originalLength);
            expect(requirements[0]).toBe(originalFirst);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
