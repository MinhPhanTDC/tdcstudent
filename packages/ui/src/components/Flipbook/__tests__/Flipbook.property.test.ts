import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  calculateResponsiveDimensions,
  MOBILE_BREAKPOINT,
  VIEWPORT_PADDING,
  DEFAULT_FLIPBOOK_WIDTH,
  DEFAULT_FLIPBOOK_HEIGHT,
} from '../flipbook.utils';

/**
 * Property-based tests for Flipbook responsive dimensions
 * **Feature: phase-6-lab-advanced, Property 15: Flipbook responsive dimensions**
 * **Validates: Requirements 8.4**
 */
describe('Flipbook Property Tests', () => {
  describe('Property 15: Flipbook responsive dimensions', () => {
    /**
     * **Feature: phase-6-lab-advanced, Property 15: Flipbook responsive dimensions**
     * **Validates: Requirements 8.4**
     * 
     * For any viewport width less than 768px, the flipbook dimensions SHALL scale
     * proportionally to fit within the viewport while maintaining aspect ratio.
     */
    it('should scale proportionally for mobile viewports (< 768px)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 100, max: MOBILE_BREAKPOINT - 1 }), // mobile viewport
          fc.integer({ min: 100, max: 800 }), // base width
          fc.integer({ min: 100, max: 1200 }), // base height
          (viewportWidth, baseWidth, baseHeight) => {
            const result = calculateResponsiveDimensions(viewportWidth, baseWidth, baseHeight);
            
            // Calculate expected aspect ratio
            const expectedAspectRatio = baseHeight / baseWidth;
            const actualAspectRatio = result.height / result.width;
            
            // Aspect ratio should be maintained (within floating point tolerance)
            expect(Math.abs(actualAspectRatio - expectedAspectRatio)).toBeLessThan(0.01);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should fit within viewport width minus padding for mobile', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 100, max: MOBILE_BREAKPOINT - 1 }), // mobile viewport
          fc.integer({ min: 100, max: 800 }), // base width
          fc.integer({ min: 100, max: 1200 }), // base height
          (viewportWidth, baseWidth, baseHeight) => {
            const result = calculateResponsiveDimensions(viewportWidth, baseWidth, baseHeight);
            
            // Width should not exceed viewport minus padding
            const maxAllowedWidth = Math.max(viewportWidth - VIEWPORT_PADDING, 100);
            expect(result.width).toBeLessThanOrEqual(maxAllowedWidth);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should use base dimensions for desktop viewports (>= 768px)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: MOBILE_BREAKPOINT, max: 2000 }), // desktop viewport
          fc.integer({ min: 100, max: 800 }), // base width
          fc.integer({ min: 100, max: 1200 }), // base height
          (viewportWidth, baseWidth, baseHeight) => {
            const result = calculateResponsiveDimensions(viewportWidth, baseWidth, baseHeight);
            
            // Should return base dimensions for desktop
            expect(result.width).toBe(baseWidth);
            expect(result.height).toBe(baseHeight);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should always return positive dimensions', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 2000 }), // any positive viewport
          fc.integer({ min: 1, max: 800 }), // any positive base width
          fc.integer({ min: 1, max: 1200 }), // any positive base height
          (viewportWidth, baseWidth, baseHeight) => {
            const result = calculateResponsiveDimensions(viewportWidth, baseWidth, baseHeight);
            
            expect(result.width).toBeGreaterThan(0);
            expect(result.height).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return default dimensions for invalid inputs', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: -100, max: 0 }), // invalid viewport
          fc.integer({ min: 100, max: 800 }), // base width
          fc.integer({ min: 100, max: 1200 }), // base height
          (viewportWidth, baseWidth, baseHeight) => {
            const result = calculateResponsiveDimensions(viewportWidth, baseWidth, baseHeight);
            
            // Should return base dimensions for invalid viewport
            expect(result.width).toBe(baseWidth);
            expect(result.height).toBe(baseHeight);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should use default values when base dimensions not provided', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: MOBILE_BREAKPOINT, max: 2000 }), // desktop viewport
          (viewportWidth) => {
            const result = calculateResponsiveDimensions(viewportWidth);
            
            expect(result.width).toBe(DEFAULT_FLIPBOOK_WIDTH);
            expect(result.height).toBe(DEFAULT_FLIPBOOK_HEIGHT);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should scale down when base width exceeds available space on mobile', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 100, max: 400 }), // small mobile viewport
          fc.integer({ min: 500, max: 800 }), // large base width (exceeds viewport)
          fc.integer({ min: 100, max: 1200 }), // base height
          (viewportWidth, baseWidth, baseHeight) => {
            const result = calculateResponsiveDimensions(viewportWidth, baseWidth, baseHeight);
            
            // Width should be scaled down to fit
            expect(result.width).toBeLessThan(baseWidth);
            
            // But should still maintain aspect ratio
            const expectedAspectRatio = baseHeight / baseWidth;
            const actualAspectRatio = result.height / result.width;
            expect(Math.abs(actualAspectRatio - expectedAspectRatio)).toBeLessThan(0.01);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not scale up when base width is smaller than available space on mobile', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 500, max: MOBILE_BREAKPOINT - 1 }), // larger mobile viewport
          fc.integer({ min: 100, max: 300 }), // small base width
          fc.integer({ min: 100, max: 500 }), // base height
          (viewportWidth, baseWidth, baseHeight) => {
            const result = calculateResponsiveDimensions(viewportWidth, baseWidth, baseHeight);
            
            // Width should not exceed base width (no scaling up)
            expect(result.width).toBeLessThanOrEqual(baseWidth);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
