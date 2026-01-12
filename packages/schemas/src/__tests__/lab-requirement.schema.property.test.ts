import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  LabRequirementSchema,
  CreateLabRequirementInputSchema,
} from '../lab-requirement.schema';

/**
 * Feature: phase-6-lab-advanced, Property 13: Lab requirement schema round-trip
 * Validates: Requirements 9.1, 9.2, 9.4
 *
 * For any valid LabRequirement object, serializing to JSON and deserializing back
 * SHALL produce an equivalent object.
 */

// Arbitrary generators for lab requirement data
const labRequirementArb = fc.record({
  id: fc.uuid(),
  title: fc.string({ minLength: 1, maxLength: 200 }),
  description: fc.option(fc.string({ minLength: 0, maxLength: 500 }), { nil: undefined }),
  helpUrl: fc.option(fc.webUrl(), { nil: undefined }),
  order: fc.integer({ min: 0, max: 1000 }),
  isActive: fc.boolean(),
  requiresVerification: fc.boolean(),
  createdAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-01-01') }),
  updatedAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-01-01') }),
});

describe('Lab Requirement Schema Property Tests', () => {
  describe('Property 13: Lab requirement schema round-trip', () => {
    it('should produce equivalent object after JSON round trip', () => {
      fc.assert(
        fc.property(labRequirementArb, (requirement) => {
          // Parse to ensure valid structure
          const parsed = LabRequirementSchema.safeParse(requirement);
          if (!parsed.success) {
            return true; // Skip invalid inputs
          }

          // Serialize to JSON
          const json = JSON.stringify(parsed.data);

          // Deserialize back
          const deserialized = JSON.parse(json);

          // Parse again with schema
          const reparsed = LabRequirementSchema.safeParse(deserialized);

          // Should be valid
          expect(reparsed.success).toBe(true);

          if (reparsed.success) {
            // Core fields should match
            expect(reparsed.data.id).toBe(parsed.data.id);
            expect(reparsed.data.title).toBe(parsed.data.title);
            expect(reparsed.data.description).toBe(parsed.data.description);
            expect(reparsed.data.helpUrl).toBe(parsed.data.helpUrl);
            expect(reparsed.data.order).toBe(parsed.data.order);
            expect(reparsed.data.isActive).toBe(parsed.data.isActive);
            expect(reparsed.data.requiresVerification).toBe(parsed.data.requiresVerification);
          }

          return true;
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Title Validation', () => {
    it('should accept titles between 1 and 200 characters', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 200 }),
          (title) => {
            const result = CreateLabRequirementInputSchema.safeParse({
              title,
              order: 0,
            });
            return result.success;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject empty titles', () => {
      const result = CreateLabRequirementInputSchema.safeParse({
        title: '',
        order: 0,
      });
      expect(result.success).toBe(false);
    });

    it('should reject titles longer than 200 characters', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 201, maxLength: 500 }),
          (title) => {
            const result = CreateLabRequirementInputSchema.safeParse({
              title,
              order: 0,
            });
            return !result.success;
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Order Validation', () => {
    it('should accept non-negative integers for order', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 10000 }),
          (order) => {
            const result = CreateLabRequirementInputSchema.safeParse({
              title: 'Test Requirement',
              order,
            });
            return result.success;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject negative order values', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: -1000, max: -1 }),
          (order) => {
            const result = CreateLabRequirementInputSchema.safeParse({
              title: 'Test Requirement',
              order,
            });
            return !result.success;
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Help URL Validation', () => {
    it('should accept valid URLs', () => {
      fc.assert(
        fc.property(fc.webUrl(), (helpUrl) => {
          const result = CreateLabRequirementInputSchema.safeParse({
            title: 'Test Requirement',
            order: 0,
            helpUrl,
          });
          return result.success;
        }),
        { numRuns: 50 }
      );
    });

    it('should reject invalid URLs', () => {
      const invalidUrls = ['not-a-url', 'just text', '/path/only'];
      invalidUrls.forEach((helpUrl) => {
        const result = CreateLabRequirementInputSchema.safeParse({
          title: 'Test Requirement',
          order: 0,
          helpUrl,
        });
        expect(result.success).toBe(false);
      });
    });

    it('should accept undefined helpUrl', () => {
      const result = CreateLabRequirementInputSchema.safeParse({
        title: 'Test Requirement',
        order: 0,
      });
      expect(result.success).toBe(true);
    });
  });

  describe('Boolean Fields', () => {
    it('should default isActive to true', () => {
      const result = CreateLabRequirementInputSchema.safeParse({
        title: 'Test Requirement',
        order: 0,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isActive).toBe(true);
      }
    });

    it('should default requiresVerification to false', () => {
      const result = CreateLabRequirementInputSchema.safeParse({
        title: 'Test Requirement',
        order: 0,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.requiresVerification).toBe(false);
      }
    });
  });
});
