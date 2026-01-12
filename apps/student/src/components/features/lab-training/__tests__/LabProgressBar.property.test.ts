import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { calculateProgressPercentage } from '../LabProgressBar';

/**
 * Property-based tests for LabProgressBar
 * **Feature: phase-6-lab-advanced, Property 1: Progress percentage calculation**
 * **Validates: Requirements 1.3, 2.3**
 */
describe('LabProgressBar Property Tests', () => {
  describe('Property 1: Progress percentage calculation', () => {
    /**
     * **Feature: phase-6-lab-advanced, Property 1: Progress percentage calculation**
     * **Validates: Requirements 1.3, 2.3**
     * 
     * For any set of Lab requirements and student progress records,
     * the progress percentage SHALL equal (completed count / total active requirements) * 100,
     * rounded to the nearest integer.
     */
    it('should calculate percentage as (completed / total) * 100 rounded to nearest integer', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 1000 }), // completed
          fc.integer({ min: 1, max: 1000 }), // total (must be > 0)
          (completed, total) => {
            // Ensure completed doesn't exceed total for valid input
            const validCompleted = Math.min(completed, total);
            
            const result = calculateProgressPercentage(validCompleted, total);
            const expected = Math.round((validCompleted / total) * 100);
            
            expect(result).toBe(expected);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return 0 when total is 0 or negative', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 100 }), // completed
          fc.integer({ min: -100, max: 0 }), // total <= 0
          (completed, total) => {
            const result = calculateProgressPercentage(completed, total);
            expect(result).toBe(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return 0 when completed is negative', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: -100, max: -1 }), // negative completed
          fc.integer({ min: 1, max: 100 }), // positive total
          (completed, total) => {
            const result = calculateProgressPercentage(completed, total);
            expect(result).toBe(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should cap at 100 when completed exceeds total', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100 }), // total
          fc.integer({ min: 1, max: 100 }), // extra amount
          (total, extra) => {
            const completed = total + extra;
            const result = calculateProgressPercentage(completed, total);
            expect(result).toBe(100);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should always return a value between 0 and 100 inclusive', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: -100, max: 200 }), // any completed
          fc.integer({ min: -100, max: 200 }), // any total
          (completed, total) => {
            const result = calculateProgressPercentage(completed, total);
            expect(result).toBeGreaterThanOrEqual(0);
            expect(result).toBeLessThanOrEqual(100);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return 100 when completed equals total', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 1000 }), // total
          (total) => {
            const result = calculateProgressPercentage(total, total);
            expect(result).toBe(100);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
