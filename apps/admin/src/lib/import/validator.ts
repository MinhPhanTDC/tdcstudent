/**
 * Import validation service
 * Requirements: 4.3
 */

import { ImportRowSchema, type ImportRow, type ValidatedImportRow } from '@tdc/schemas';

/**
 * Validation result containing validated rows and summary
 */
export interface ValidationResult {
  validatedRows: ValidatedImportRow[];
  validCount: number;
  invalidCount: number;
  duplicateEmails: string[];
}

/**
 * Email validation regex (RFC 5322 simplified)
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate a single import row
 */
function validateRow(row: ImportRow, rowNumber: number): ValidatedImportRow {
  const errors: string[] = [];

  // Validate using Zod schema
  const result = ImportRowSchema.safeParse(row);

  if (!result.success) {
    // Extract field-level errors
    for (const issue of result.error.issues) {
      const field = issue.path.join('.');
      errors.push(`${field}: ${issue.message}`);
    }
  } else {
    // Additional validation beyond schema
    // Check name length
    if (row.name.trim().length < 2) {
      errors.push('Tên phải có ít nhất 2 ký tự');
    }

    // Check email format
    if (!EMAIL_REGEX.test(row.email)) {
      errors.push('Email không đúng định dạng');
    }
  }

  return {
    row: rowNumber,
    name: row.name,
    email: row.email.toLowerCase().trim(),
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Check for duplicate emails within the import file
 */
function findDuplicateEmails(rows: ImportRow[]): Map<string, number[]> {
  const emailOccurrences = new Map<string, number[]>();

  rows.forEach((row, index) => {
    const email = row.email.toLowerCase().trim();
    if (email) {
      const existing = emailOccurrences.get(email) || [];
      existing.push(index + 1); // 1-based row number
      emailOccurrences.set(email, existing);
    }
  });

  // Filter to only duplicates (more than one occurrence)
  const duplicates = new Map<string, number[]>();
  emailOccurrences.forEach((rowNumbers, email) => {
    if (rowNumbers.length > 1) {
      duplicates.set(email, rowNumbers);
    }
  });

  return duplicates;
}

/**
 * Validate all import rows
 * - Validates required fields (name, email)
 * - Validates email format
 * - Checks for duplicate emails in file
 */
export function validateImportRows(rows: ImportRow[]): ValidationResult {
  // Find duplicates first
  const duplicateMap = findDuplicateEmails(rows);
  const duplicateEmails = Array.from(duplicateMap.keys());

  // Validate each row
  const validatedRows: ValidatedImportRow[] = rows.map((row, index) => {
    const rowNumber = index + 1;
    const validated = validateRow(row, rowNumber);

    // Add duplicate error if applicable
    const email = row.email.toLowerCase().trim();
    if (duplicateMap.has(email)) {
      const duplicateRows = duplicateMap.get(email)!;
      const otherRows = duplicateRows.filter((r) => r !== rowNumber);
      if (otherRows.length > 0) {
        validated.errors.push(`Email trùng lặp với dòng ${otherRows.join(', ')}`);
        validated.isValid = false;
      }
    }

    return validated;
  });

  // Count valid/invalid
  const validCount = validatedRows.filter((r) => r.isValid).length;
  const invalidCount = validatedRows.filter((r) => !r.isValid).length;

  return {
    validatedRows,
    validCount,
    invalidCount,
    duplicateEmails,
  };
}

/**
 * Get only valid rows from validation result
 */
export function getValidRows(validationResult: ValidationResult): ImportRow[] {
  return validationResult.validatedRows
    .filter((r) => r.isValid)
    .map((r) => ({
      name: r.name,
      email: r.email,
    }));
}

/**
 * Get only invalid rows from validation result
 */
export function getInvalidRows(validationResult: ValidationResult): ValidatedImportRow[] {
  return validationResult.validatedRows.filter((r) => !r.isValid);
}
