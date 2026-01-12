/**
 * Import module - utilities for bulk student import
 */

export {
  detectFileType,
  parseCSVContent,
  parseCSVFile,
  parseExcelFile,
  parseImportFile,
  type SupportedFileType,
  type ParseResult,
} from './parser';

export {
  validateImportRows,
  getValidRows,
  getInvalidRows,
  type ValidationResult,
} from './validator';

export {
  importStudents,
  createImportController,
  generateFailureReport,
  generateFailureCSV,
  type ImportOptions,
  type ImportCallbacks,
  type ImportController,
} from './importer';
