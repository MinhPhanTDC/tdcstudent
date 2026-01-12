/**
 * Flipbook utility functions
 * Requirements: 8.4
 */

/**
 * Flipbook dimensions interface
 */
export interface FlipbookDimensions {
  width: number;
  height: number;
}

/**
 * Default flipbook dimensions (A4 aspect ratio)
 */
export const DEFAULT_FLIPBOOK_WIDTH = 400;
export const DEFAULT_FLIPBOOK_HEIGHT = 566; // A4 aspect ratio ~1:1.414

/**
 * Mobile breakpoint in pixels
 */
export const MOBILE_BREAKPOINT = 768;

/**
 * Minimum padding from viewport edges
 */
export const VIEWPORT_PADDING = 32;

/**
 * A4 aspect ratio (height / width)
 */
export const A4_ASPECT_RATIO = 1.414;

/**
 * Calculate responsive flipbook dimensions based on viewport width
 * Requirements: 8.4
 * 
 * Property 15: Flipbook responsive dimensions
 * For any viewport width less than 768px, the flipbook dimensions SHALL scale
 * proportionally to fit within the viewport while maintaining aspect ratio.
 * 
 * @param viewportWidth - The current viewport width in pixels
 * @param baseWidth - The base width for desktop (default: 400)
 * @param baseHeight - The base height for desktop (default: 566)
 * @returns Calculated dimensions that fit within viewport while maintaining aspect ratio
 */
export function calculateResponsiveDimensions(
  viewportWidth: number,
  baseWidth: number = DEFAULT_FLIPBOOK_WIDTH,
  baseHeight: number = DEFAULT_FLIPBOOK_HEIGHT
): FlipbookDimensions {
  // Ensure positive values
  if (viewportWidth <= 0 || baseWidth <= 0 || baseHeight <= 0) {
    return { width: baseWidth, height: baseHeight };
  }

  // Calculate aspect ratio from base dimensions
  const aspectRatio = baseHeight / baseWidth;

  // For mobile viewports (< 768px), scale to fit
  if (viewportWidth < MOBILE_BREAKPOINT) {
    // Calculate maximum available width (viewport - padding)
    const maxWidth = Math.max(viewportWidth - VIEWPORT_PADDING, 100);
    
    // Scale width to fit viewport
    const scaledWidth = Math.min(baseWidth, maxWidth);
    
    // Calculate height maintaining aspect ratio, ensure minimum of 1
    const scaledHeight = Math.max(1, Math.round(scaledWidth * aspectRatio));
    
    return {
      width: Math.max(1, Math.round(scaledWidth)),
      height: scaledHeight,
    };
  }

  // For desktop, use base dimensions
  return {
    width: baseWidth,
    height: baseHeight,
  };
}

/**
 * Check if viewport is mobile-sized
 * @param viewportWidth - The current viewport width
 * @returns true if viewport is less than mobile breakpoint
 */
export function isMobileViewport(viewportWidth: number): boolean {
  return viewportWidth < MOBILE_BREAKPOINT;
}
