import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  aggregateBulkPassResults,
  type SinglePassResult,
} from '../bulk-pass.service';

/**
 * Arbitrary generator for a successful single pass result
 */
const successfulPassResultArbitrary = (): fc.Arbitrary<SinglePassResult> =>
  fc.record({
    studentId: fc.uuid(),
    progressId: fc.uuid(),
    success: fc.constant(true),
    error: fc.constant(undefined),
  });

/**
 * Arbitrary generator for a failed single pass result
 */
const failedPassResultArbitrary = (): fc.Arbitrary<SinglePassResult> =>
  fc.record({
    studentId: fc.uuid(),
    progressId: fc.uuid(),
    success: fc.constant(false),
    error: fc.string({ minLength: 1, maxLength: 200 }),
  });

/**
 * Arbitrary generator for a mixed array of pass results
 */
const mixedPassResultsArbitrary = (): fc.Arbitrary<SinglePassResult[]> =>
  fc.array(
    fc.oneof(successfulPassResultArbitrary(), failedPassResultArbitrary()),
    { minLength: 1, maxLength: 50 }
  );

/**
 * Arbitrary generator for all successful results
 */
const allSuccessfulResultsArbitrary = (): fc.Arbitrary<SinglePassResult[]> =>
  fc.array(successfulPassResultArbitrary(), { minLength: 1, maxLength: 50 });

/**
 * Arbitrary generator for all failed results
 */
const allFailedResultsArbitrary = (): fc.Arbitrary<SinglePassResult[]> =>
  fc.array(failedPassResultArbitrary(), { minLength: 1, maxLength: 50 });

describe('Bulk Pass Service Property Tests', () => {
  /**
   * **Feature: phase-4-tracking, Property 13: Bulk Pass Processing**
   * **Validates: Requirements 4.5, 4.6**
   *
   * For any bulk pass operation, all selected students should be processed
   * and the result should accurately report success and failure counts.
   */
  describe('Property 13: Bulk Pass Processing', () => {
    it('should accurately count total processed students', () => {
      fc.assert(
        fc.property(mixedPassResultsArbitrary(), (results) => {
          const bulkResult = aggregateBulkPassResults(results);
          expect(bulkResult.total).toBe(results.length);
        }),
        { numRuns: 100 }
      );
    });

    it('should accurately count successful passes', () => {
      fc.assert(
        fc.property(mixedPassResultsArbitrary(), (results) => {
          const expectedSuccess = results.filter((r) => r.success).length;
          const bulkResult = aggregateBulkPassResults(results);
          expect(bulkResult.success).toBe(expectedSuccess);
        }),
        { numRuns: 100 }
      );
    });

    it('should accurately count failed passes', () => {
      fc.assert(
        fc.property(mixedPassResultsArbitrary(), (results) => {
          const expectedFailed = results.filter((r) => !r.success).length;
          const bulkResult = aggregateBulkPassResults(results);
          expect(bulkResult.failed).toBe(expectedFailed);
        }),
        { numRuns: 100 }
      );
    });

    it('should have success + failed = total', () => {
      fc.assert(
        fc.property(mixedPassResultsArbitrary(), (results) => {
          const bulkResult = aggregateBulkPassResults(results);
          expect(bulkResult.success + bulkResult.failed).toBe(bulkResult.total);
        }),
        { numRuns: 100 }
      );
    });

    it('should include all results in the results array', () => {
      fc.assert(
        fc.property(mixedPassResultsArbitrary(), (results) => {
          const bulkResult = aggregateBulkPassResults(results);
          expect(bulkResult.results.length).toBe(results.length);
        }),
        { numRuns: 100 }
      );
    });

    it('should report 100% success when all pass', () => {
      fc.assert(
        fc.property(allSuccessfulResultsArbitrary(), (results) => {
          const bulkResult = aggregateBulkPassResults(results);
          expect(bulkResult.success).toBe(results.length);
          expect(bulkResult.failed).toBe(0);
          expect(bulkResult.failures).toHaveLength(0);
        }),
        { numRuns: 100 }
      );
    });

    it('should report 100% failure when all fail', () => {
      fc.assert(
        fc.property(allFailedResultsArbitrary(), (results) => {
          const bulkResult = aggregateBulkPassResults(results);
          expect(bulkResult.success).toBe(0);
          expect(bulkResult.failed).toBe(results.length);
          expect(bulkResult.failures.length).toBe(results.length);
        }),
        { numRuns: 100 }
      );
    });

    it('should include failure reasons for all failed students', () => {
      fc.assert(
        fc.property(mixedPassResultsArbitrary(), (results) => {
          const bulkResult = aggregateBulkPassResults(results);
          const failedResults = results.filter((r) => !r.success);
          
          // Each failure should have a reason
          for (const failure of bulkResult.failures) {
            expect(failure.reason).toBeDefined();
            expect(failure.reason.length).toBeGreaterThan(0);
          }
          
          // Number of failures should match
          expect(bulkResult.failures.length).toBe(failedResults.length);
        }),
        { numRuns: 100 }
      );
    });

    it('should preserve student IDs in failure reports', () => {
      fc.assert(
        fc.property(allFailedResultsArbitrary(), (results) => {
          const bulkResult = aggregateBulkPassResults(results);
          
          // All failed student IDs should be in the failures array
          const failedStudentIds = new Set(results.map((r) => r.studentId));
          const reportedStudentIds = new Set(bulkResult.failures.map((f) => f.studentId));
          
          expect(reportedStudentIds.size).toBe(failedStudentIds.size);
        }),
        { numRuns: 100 }
      );
    });

    it('should preserve progress IDs in failure reports', () => {
      fc.assert(
        fc.property(allFailedResultsArbitrary(), (results) => {
          const bulkResult = aggregateBulkPassResults(results);
          
          // All failed progress IDs should be in the failures array
          const failedProgressIds = new Set(results.map((r) => r.progressId));
          const reportedProgressIds = new Set(bulkResult.failures.map((f) => f.progressId));
          
          expect(reportedProgressIds.size).toBe(failedProgressIds.size);
        }),
        { numRuns: 100 }
      );
    });

    it('should be deterministic - same input produces same output', () => {
      fc.assert(
        fc.property(mixedPassResultsArbitrary(), (results) => {
          const result1 = aggregateBulkPassResults(results);
          const result2 = aggregateBulkPassResults(results);
          
          expect(result1.total).toBe(result2.total);
          expect(result1.success).toBe(result2.success);
          expect(result1.failed).toBe(result2.failed);
          expect(result1.failures.length).toBe(result2.failures.length);
        }),
        { numRuns: 100 }
      );
    });
  });
});

describe('Bulk Pass Service Resilience Property Tests', () => {
  /**
   * **Feature: phase-4-tracking, Property 14: Bulk Pass Resilience**
   * **Validates: Requirements 4.7**
   *
   * For any bulk pass operation where some students fail, the remaining
   * students should still be processed and failures should be included
   * in the report.
   */
  describe('Property 14: Bulk Pass Resilience', () => {
    it('should process all students even when some fail', () => {
      fc.assert(
        fc.property(mixedPassResultsArbitrary(), (results) => {
          const bulkResult = aggregateBulkPassResults(results);
          
          // All students should be processed (total = input length)
          expect(bulkResult.total).toBe(results.length);
          
          // Results array should contain all processed students
          expect(bulkResult.results.length).toBe(results.length);
        }),
        { numRuns: 100 }
      );
    });

    it('should continue processing after a failure at any position', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 3, max: 20 }),
          fc.integer({ min: 0, max: 19 }),
          (totalCount, failurePosition) => {
            // Ensure failure position is within bounds
            const actualFailurePosition = failurePosition % totalCount;
            
            // Create results with a failure at the specified position
            const results: SinglePassResult[] = [];
            for (let i = 0; i < totalCount; i++) {
              if (i === actualFailurePosition) {
                results.push({
                  studentId: `student-${i}`,
                  progressId: `progress-${i}`,
                  success: false,
                  error: 'Test failure',
                });
              } else {
                results.push({
                  studentId: `student-${i}`,
                  progressId: `progress-${i}`,
                  success: true,
                });
              }
            }
            
            const bulkResult = aggregateBulkPassResults(results);
            
            // All students should be processed
            expect(bulkResult.total).toBe(totalCount);
            
            // Exactly one failure
            expect(bulkResult.failed).toBe(1);
            
            // Rest should succeed
            expect(bulkResult.success).toBe(totalCount - 1);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should include all failures in the report regardless of position', () => {
      fc.assert(
        fc.property(
          fc.array(fc.integer({ min: 0, max: 49 }), { minLength: 1, maxLength: 10 }),
          fc.integer({ min: 10, max: 50 }),
          (failurePositions, totalCount) => {
            // Create results with failures at specified positions
            const uniqueFailurePositions = [...new Set(failurePositions)]
              .filter((pos) => pos < totalCount);
            
            const results: SinglePassResult[] = [];
            for (let i = 0; i < totalCount; i++) {
              if (uniqueFailurePositions.includes(i)) {
                results.push({
                  studentId: `student-${i}`,
                  progressId: `progress-${i}`,
                  success: false,
                  error: `Failure at position ${i}`,
                });
              } else {
                results.push({
                  studentId: `student-${i}`,
                  progressId: `progress-${i}`,
                  success: true,
                });
              }
            }
            
            const bulkResult = aggregateBulkPassResults(results);
            
            // All failures should be reported
            expect(bulkResult.failures.length).toBe(uniqueFailurePositions.length);
            
            // Each failure should have the correct reason
            for (const failure of bulkResult.failures) {
              expect(failure.reason).toContain('Failure at position');
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle multiple consecutive failures', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 5, max: 20 }),
          fc.integer({ min: 0, max: 15 }),
          fc.integer({ min: 2, max: 5 }),
          (totalCount, startPosition, consecutiveFailures) => {
            // Ensure we don't exceed bounds
            const actualStart = startPosition % (totalCount - consecutiveFailures + 1);
            const actualConsecutive = Math.min(consecutiveFailures, totalCount - actualStart);
            
            const results: SinglePassResult[] = [];
            for (let i = 0; i < totalCount; i++) {
              const isFailure = i >= actualStart && i < actualStart + actualConsecutive;
              results.push({
                studentId: `student-${i}`,
                progressId: `progress-${i}`,
                success: !isFailure,
                error: isFailure ? 'Consecutive failure' : undefined,
              });
            }
            
            const bulkResult = aggregateBulkPassResults(results);
            
            // All students should be processed
            expect(bulkResult.total).toBe(totalCount);
            
            // Correct number of failures
            expect(bulkResult.failed).toBe(actualConsecutive);
            
            // Correct number of successes
            expect(bulkResult.success).toBe(totalCount - actualConsecutive);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle alternating success and failure', () => {
      fc.assert(
        fc.property(fc.integer({ min: 2, max: 30 }), (totalCount) => {
          // Create alternating results
          const results: SinglePassResult[] = [];
          for (let i = 0; i < totalCount; i++) {
            const isSuccess = i % 2 === 0;
            results.push({
              studentId: `student-${i}`,
              progressId: `progress-${i}`,
              success: isSuccess,
              error: isSuccess ? undefined : 'Alternating failure',
            });
          }
          
          const bulkResult = aggregateBulkPassResults(results);
          
          // All students should be processed
          expect(bulkResult.total).toBe(totalCount);
          
          // Calculate expected counts
          const expectedSuccess = Math.ceil(totalCount / 2);
          const expectedFailed = Math.floor(totalCount / 2);
          
          expect(bulkResult.success).toBe(expectedSuccess);
          expect(bulkResult.failed).toBe(expectedFailed);
        }),
        { numRuns: 100 }
      );
    });

    it('should provide default error message when error is undefined', () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 20 }), (count) => {
          // Create results with undefined errors
          const results: SinglePassResult[] = [];
          for (let i = 0; i < count; i++) {
            results.push({
              studentId: `student-${i}`,
              progressId: `progress-${i}`,
              success: false,
              error: undefined,
            });
          }
          
          const bulkResult = aggregateBulkPassResults(results);
          
          // All failures should have a reason (default message)
          for (const failure of bulkResult.failures) {
            expect(failure.reason).toBeDefined();
            expect(failure.reason.length).toBeGreaterThan(0);
          }
        }),
        { numRuns: 100 }
      );
    });

    it('should preserve order of results', () => {
      fc.assert(
        fc.property(mixedPassResultsArbitrary(), (results) => {
          const bulkResult = aggregateBulkPassResults(results);
          
          // Results should be in the same order as input
          for (let i = 0; i < results.length; i++) {
            expect(bulkResult.results[i].progressId).toBe(results[i].progressId);
            expect(bulkResult.results[i].studentId).toBe(results[i].studentId);
            expect(bulkResult.results[i].success).toBe(results[i].success);
          }
        }),
        { numRuns: 100 }
      );
    });
  });
});
