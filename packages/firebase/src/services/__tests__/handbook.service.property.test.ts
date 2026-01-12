import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  isValidPdfSize,
  isValidPdfHeader,
  validatePdfConstraints,
  isValidReplacement,
  MAX_PDF_SIZE,
} from '../handbook.service';
import type { HandbookSettings } from '@tdc/schemas';

/**
 * Feature: phase-6-lab-advanced, Property 11: PDF validation constraints
 * Validates: Requirements 7.1
 *
 * For any uploaded file, validation SHALL pass if and only if the file has
 * a valid PDF header and size is less than 10MB (10,485,760 bytes).
 */
describe('Property 11: PDF validation constraints', () => {
  // PDF magic bytes: %PDF
  const PDF_MAGIC_BYTES = new Uint8Array([0x25, 0x50, 0x44, 0x46]);

  // Arbitrary for valid file sizes (1 byte to 10MB)
  const validFileSizeArb = fc.integer({ min: 1, max: MAX_PDF_SIZE });

  // Arbitrary for invalid file sizes (0 or > 10MB)
  const invalidFileSizeArb = fc.oneof(
    fc.constant(0),
    fc.integer({ min: MAX_PDF_SIZE + 1, max: MAX_PDF_SIZE * 2 })
  );

  // Arbitrary for invalid PDF header (not starting with %PDF)
  const invalidPdfHeaderArb = fc
    .uint8Array({ minLength: 4, maxLength: 4 })
    .filter(
      (arr) =>
        arr[0] !== 0x25 || arr[1] !== 0x50 || arr[2] !== 0x44 || arr[3] !== 0x46
    );

  describe('isValidPdfSize', () => {
    it('should return true for valid file sizes (1 byte to 10MB)', () => {
      fc.assert(
        fc.property(validFileSizeArb, (size) => {
          expect(isValidPdfSize(size)).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('should return false for zero size', () => {
      expect(isValidPdfSize(0)).toBe(false);
    });

    it('should return false for negative sizes', () => {
      fc.assert(
        fc.property(fc.integer({ min: -1000000, max: -1 }), (size) => {
          expect(isValidPdfSize(size)).toBe(false);
        }),
        { numRuns: 100 }
      );
    });

    it('should return false for sizes exceeding 10MB', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: MAX_PDF_SIZE + 1, max: MAX_PDF_SIZE * 10 }),
          (size) => {
            expect(isValidPdfSize(size)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return true for exactly 10MB', () => {
      expect(isValidPdfSize(MAX_PDF_SIZE)).toBe(true);
    });

    it('should return false for exactly 10MB + 1 byte', () => {
      expect(isValidPdfSize(MAX_PDF_SIZE + 1)).toBe(false);
    });

    it('should return true for exactly 1 byte', () => {
      expect(isValidPdfSize(1)).toBe(true);
    });
  });

  describe('isValidPdfHeader', () => {
    it('should return true for valid PDF header (%PDF)', () => {
      expect(isValidPdfHeader(PDF_MAGIC_BYTES)).toBe(true);
    });

    it('should return false for invalid PDF headers', () => {
      fc.assert(
        fc.property(invalidPdfHeaderArb, (header) => {
          expect(isValidPdfHeader(header)).toBe(false);
        }),
        { numRuns: 100 }
      );
    });

    it('should return false for headers shorter than 4 bytes', () => {
      fc.assert(
        fc.property(fc.uint8Array({ minLength: 0, maxLength: 3 }), (header) => {
          expect(isValidPdfHeader(header)).toBe(false);
        }),
        { numRuns: 100 }
      );
    });

    it('should return true for headers starting with %PDF followed by any bytes', () => {
      fc.assert(
        fc.property(fc.uint8Array({ minLength: 0, maxLength: 100 }), (extra) => {
          const header = new Uint8Array([...PDF_MAGIC_BYTES, ...extra]);
          expect(isValidPdfHeader(header)).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('should be case-sensitive (lowercase pdf should fail)', () => {
      // %pdf in lowercase
      const lowercaseHeader = new Uint8Array([0x25, 0x70, 0x64, 0x66]);
      expect(isValidPdfHeader(lowercaseHeader)).toBe(false);
    });
  });

  describe('validatePdfConstraints', () => {
    it('should return true when both size and header are valid', () => {
      fc.assert(
        fc.property(validFileSizeArb, (size) => {
          expect(validatePdfConstraints(size, PDF_MAGIC_BYTES)).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('should return false when size is invalid', () => {
      fc.assert(
        fc.property(invalidFileSizeArb, (size) => {
          expect(validatePdfConstraints(size, PDF_MAGIC_BYTES)).toBe(false);
        }),
        { numRuns: 100 }
      );
    });

    it('should return false when header is invalid', () => {
      fc.assert(
        fc.property(validFileSizeArb, invalidPdfHeaderArb, (size, header) => {
          expect(validatePdfConstraints(size, header)).toBe(false);
        }),
        { numRuns: 100 }
      );
    });

    it('should return false when both size and header are invalid', () => {
      fc.assert(
        fc.property(invalidFileSizeArb, invalidPdfHeaderArb, (size, header) => {
          expect(validatePdfConstraints(size, header)).toBe(false);
        }),
        { numRuns: 100 }
      );
    });

    it('should return true when only size is provided and valid', () => {
      fc.assert(
        fc.property(validFileSizeArb, (size) => {
          expect(validatePdfConstraints(size)).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('should return false when only size is provided and invalid', () => {
      fc.assert(
        fc.property(invalidFileSizeArb, (size) => {
          expect(validatePdfConstraints(size)).toBe(false);
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('boundary conditions', () => {
    it('should correctly handle boundary at exactly 10MB', () => {
      expect(validatePdfConstraints(MAX_PDF_SIZE, PDF_MAGIC_BYTES)).toBe(true);
      expect(validatePdfConstraints(MAX_PDF_SIZE + 1, PDF_MAGIC_BYTES)).toBe(
        false
      );
    });

    it('should correctly handle boundary at 1 byte', () => {
      expect(validatePdfConstraints(1, PDF_MAGIC_BYTES)).toBe(true);
      expect(validatePdfConstraints(0, PDF_MAGIC_BYTES)).toBe(false);
    });
  });
});

/**
 * Feature: phase-6-lab-advanced, Property 12: Handbook replacement
 * Validates: Requirements 7.3
 *
 * For any new handbook upload, the settings document SHALL contain the new PDF URL
 * and the uploadedAt timestamp SHALL be greater than the previous value.
 */
describe('Property 12: Handbook replacement', () => {
  // Use timestamps as integers to avoid Date(NaN) issues during shrinking
  const MIN_TIMESTAMP = new Date('2020-01-01').getTime();
  const MAX_TIMESTAMP = new Date('2025-12-31').getTime();
  const FUTURE_MAX_TIMESTAMP = new Date('2030-12-31').getTime();

  // Generate a pair of settings where current is a valid replacement
  // Use integer arithmetic to ensure valid date ranges
  const validReplacementPairArb = fc
    .integer({ min: MIN_TIMESTAMP, max: MAX_TIMESTAMP - 10000 }) // Leave room for newer timestamp
    .chain((previousTimestamp) =>
      fc.tuple(
        fc.record({
          pdfUrl: fc.webUrl(),
          filename: fc.stringMatching(/^[a-zA-Z0-9_-]{1,50}\.pdf$/),
          uploadedAt: fc.constant(new Date(previousTimestamp)),
          uploadedBy: fc.uuid(),
          fileSize: fc.integer({ min: 1, max: MAX_PDF_SIZE }),
        }),
        fc.record({
          pdfUrl: fc.webUrl(),
          filename: fc.stringMatching(/^[a-zA-Z0-9_-]{1,50}\.pdf$/),
          uploadedAt: fc.integer({ min: previousTimestamp + 1000, max: FUTURE_MAX_TIMESTAMP }).map((ts) => new Date(ts)),
          uploadedBy: fc.uuid(),
          fileSize: fc.integer({ min: 1, max: MAX_PDF_SIZE }),
        })
      )
    )
    .filter(([previous, current]) => previous.pdfUrl !== current.pdfUrl)
    .map(([previous, current]) => ({ previous, current }));

  // Generate a pair where current has same URL (invalid replacement)
  const sameUrlPairArb = fc
    .integer({ min: MIN_TIMESTAMP, max: MAX_TIMESTAMP - 10000 })
    .chain((previousTimestamp) =>
      fc.tuple(
        fc.record({
          pdfUrl: fc.webUrl(),
          filename: fc.stringMatching(/^[a-zA-Z0-9_-]{1,50}\.pdf$/),
          uploadedAt: fc.constant(new Date(previousTimestamp)),
          uploadedBy: fc.uuid(),
          fileSize: fc.integer({ min: 1, max: MAX_PDF_SIZE }),
        }),
        fc.record({
          filename: fc.stringMatching(/^[a-zA-Z0-9_-]{1,50}\.pdf$/),
          uploadedAt: fc.integer({ min: previousTimestamp + 1000, max: FUTURE_MAX_TIMESTAMP }).map((ts) => new Date(ts)),
          uploadedBy: fc.uuid(),
          fileSize: fc.integer({ min: 1, max: MAX_PDF_SIZE }),
        })
      )
    )
    .map(([previous, currentPartial]) => ({
      previous,
      current: { ...currentPartial, pdfUrl: previous.pdfUrl },
    }));

  // Generate a pair where current has older timestamp (invalid replacement)
  const olderTimestampPairArb = fc
    .integer({ min: MIN_TIMESTAMP + 10000, max: MAX_TIMESTAMP })
    .chain((previousTimestamp) =>
      fc.tuple(
        fc.record({
          pdfUrl: fc.webUrl(),
          filename: fc.stringMatching(/^[a-zA-Z0-9_-]{1,50}\.pdf$/),
          uploadedAt: fc.constant(new Date(previousTimestamp)),
          uploadedBy: fc.uuid(),
          fileSize: fc.integer({ min: 1, max: MAX_PDF_SIZE }),
        }),
        fc.record({
          pdfUrl: fc.webUrl(),
          filename: fc.stringMatching(/^[a-zA-Z0-9_-]{1,50}\.pdf$/),
          uploadedAt: fc.integer({ min: MIN_TIMESTAMP, max: previousTimestamp - 1 }).map((ts) => new Date(ts)),
          uploadedBy: fc.uuid(),
          fileSize: fc.integer({ min: 1, max: MAX_PDF_SIZE }),
        })
      )
    )
    .filter(([previous, current]) => previous.pdfUrl !== current.pdfUrl)
    .map(([previous, current]) => ({ previous, current }));

  describe('isValidReplacement', () => {
    it('should return true when URL is different and timestamp is newer', () => {
      fc.assert(
        fc.property(validReplacementPairArb, ({ previous, current }) => {
          expect(isValidReplacement(previous, current)).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('should return false when URL is the same', () => {
      fc.assert(
        fc.property(sameUrlPairArb, ({ previous, current }) => {
          expect(isValidReplacement(previous, current)).toBe(false);
        }),
        { numRuns: 100 }
      );
    });

    it('should return false when timestamp is older', () => {
      fc.assert(
        fc.property(olderTimestampPairArb, ({ previous, current }) => {
          expect(isValidReplacement(previous, current)).toBe(false);
        }),
        { numRuns: 100 }
      );
    });

    it('should return false when timestamp is equal', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: MIN_TIMESTAMP, max: MAX_TIMESTAMP }).chain((ts) =>
            fc.record({
              pdfUrl: fc.webUrl(),
              filename: fc.stringMatching(/^[a-zA-Z0-9_-]{1,50}\.pdf$/),
              uploadedAt: fc.constant(new Date(ts)),
              uploadedBy: fc.uuid(),
              fileSize: fc.integer({ min: 1, max: MAX_PDF_SIZE }),
            })
          ),
          (settings) => {
            const current: HandbookSettings = {
              ...settings,
              pdfUrl: settings.pdfUrl + '/new',
            };
            expect(isValidReplacement(settings, current)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return false when both URL is same and timestamp is older', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: MIN_TIMESTAMP + 10000, max: MAX_TIMESTAMP }).chain((ts) =>
            fc.record({
              pdfUrl: fc.webUrl(),
              filename: fc.stringMatching(/^[a-zA-Z0-9_-]{1,50}\.pdf$/),
              uploadedAt: fc.constant(new Date(ts)),
              uploadedBy: fc.uuid(),
              fileSize: fc.integer({ min: 1, max: MAX_PDF_SIZE }),
            })
          ),
          (previous) => {
            const current: HandbookSettings = {
              ...previous,
              uploadedAt: new Date(previous.uploadedAt.getTime() - 1000),
            };
            expect(isValidReplacement(previous, current)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('replacement invariants', () => {
    it('should ensure new URL is always different from previous', () => {
      fc.assert(
        fc.property(validReplacementPairArb, ({ previous, current }) => {
          if (isValidReplacement(previous, current)) {
            expect(current.pdfUrl).not.toBe(previous.pdfUrl);
          }
        }),
        { numRuns: 100 }
      );
    });

    it('should ensure new timestamp is always greater than previous', () => {
      fc.assert(
        fc.property(validReplacementPairArb, ({ previous, current }) => {
          if (isValidReplacement(previous, current)) {
            expect(current.uploadedAt.getTime()).toBeGreaterThan(
              previous.uploadedAt.getTime()
            );
          }
        }),
        { numRuns: 100 }
      );
    });

    it('should be deterministic - same inputs produce same result', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: MIN_TIMESTAMP, max: MAX_TIMESTAMP }).chain((ts) =>
            fc.record({
              pdfUrl: fc.webUrl(),
              filename: fc.stringMatching(/^[a-zA-Z0-9_-]{1,50}\.pdf$/),
              uploadedAt: fc.constant(new Date(ts)),
              uploadedBy: fc.uuid(),
              fileSize: fc.integer({ min: 1, max: MAX_PDF_SIZE }),
            })
          ),
          fc.integer({ min: MIN_TIMESTAMP, max: MAX_TIMESTAMP }).chain((ts) =>
            fc.record({
              pdfUrl: fc.webUrl(),
              filename: fc.stringMatching(/^[a-zA-Z0-9_-]{1,50}\.pdf$/),
              uploadedAt: fc.constant(new Date(ts)),
              uploadedBy: fc.uuid(),
              fileSize: fc.integer({ min: 1, max: MAX_PDF_SIZE }),
            })
          ),
          (previous, current) => {
            const result1 = isValidReplacement(previous, current);
            const result2 = isValidReplacement(previous, current);
            expect(result1).toBe(result2);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
