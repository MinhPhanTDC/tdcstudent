/**
 * Major Selection Guard
 * 
 * Utility functions to check if a student needs to select a major
 * before accessing certain semesters.
 * 
 * Requirements: 3.4, 4.1
 * - Check if student needs to select major before accessing semester
 * - Block access to semester courses if major selection is required
 */

import type { Student, Semester } from '@tdc/schemas';

/**
 * Result of major selection guard check
 */
export interface MajorGuardResult {
  /** Whether access is allowed */
  allowed: boolean;
  /** Whether major selection is required */
  requiresMajorSelection: boolean;
  /** Whether student has already selected a major */
  hasSelectedMajor: boolean;
  /** Reason for blocking (if blocked) */
  reason?: string;
}

/**
 * Check if a student can access a specific semester
 * 
 * Requirements: 3.4 - Block access to semester courses if major selection required
 * Requirements: 4.1 - Redirect to major selection page if needed
 * 
 * @param student - The student to check
 * @param semester - The semester being accessed
 * @returns MajorGuardResult indicating if access is allowed
 */
export function checkMajorSelectionRequired(
  student: Student | null | undefined,
  semester: Semester | null | undefined
): MajorGuardResult {
  // If no student, allow access (will be handled by auth guard)
  if (!student) {
    return {
      allowed: true,
      requiresMajorSelection: false,
      hasSelectedMajor: false,
    };
  }

  // If no semester, allow access
  if (!semester) {
    return {
      allowed: true,
      requiresMajorSelection: false,
      hasSelectedMajor: !!student.selectedMajorId,
    };
  }

  const hasSelectedMajor = !!student.selectedMajorId;
  const requiresMajorSelection = semester.requiresMajorSelection === true;

  // If semester doesn't require major selection, allow access
  if (!requiresMajorSelection) {
    return {
      allowed: true,
      requiresMajorSelection: false,
      hasSelectedMajor,
    };
  }

  // Semester requires major selection
  // If student has selected a major, allow access
  if (hasSelectedMajor) {
    return {
      allowed: true,
      requiresMajorSelection: true,
      hasSelectedMajor: true,
    };
  }

  // Student needs to select major but hasn't
  return {
    allowed: false,
    requiresMajorSelection: true,
    hasSelectedMajor: false,
    reason: 'Bạn cần chọn chuyên ngành trước khi truy cập học kỳ này',
  };
}

/**
 * Check if student should be redirected to major selection page
 * 
 * @param student - The student to check
 * @param semester - The semester being accessed
 * @returns true if student should be redirected to select-major page
 */
export function shouldRedirectToMajorSelection(
  student: Student | null | undefined,
  semester: Semester | null | undefined
): boolean {
  const result = checkMajorSelectionRequired(student, semester);
  return !result.allowed && result.requiresMajorSelection && !result.hasSelectedMajor;
}

/**
 * Get the redirect path for major selection
 */
export const MAJOR_SELECTION_PATH = '/select-major';

/**
 * Hook-friendly guard check that returns redirect info
 * 
 * @param student - The student to check
 * @param semester - The semester being accessed
 * @returns Object with shouldRedirect and redirectPath
 */
export function getMajorSelectionRedirect(
  student: Student | null | undefined,
  semester: Semester | null | undefined
): { shouldRedirect: boolean; redirectPath: string | null } {
  if (shouldRedirectToMajorSelection(student, semester)) {
    return {
      shouldRedirect: true,
      redirectPath: MAJOR_SELECTION_PATH,
    };
  }

  return {
    shouldRedirect: false,
    redirectPath: null,
  };
}
