/**
 * File parsing utilities for CSV and Excel import
 * Requirements: 4.1, 4.2
 */

import type { ImportRow } from '@tdc/schemas';

/**
 * Supported file types for import
 */
export type SupportedFileType = 'csv' | 'xlsx' | 'xls';

/**
 * Parse result containing extracted rows
 */
export interface ParseResult {
  rows: ImportRow[];
  errors: string[];
}

/**
 * Detect file type from file extension
 */
export function detectFileType(filename: string): SupportedFileType | null {
  const ext = filename.toLowerCase().split('.').pop();
  switch (ext) {
    case 'csv':
      return 'csv';
    case 'xlsx':
      return 'xlsx';
    case 'xls':
      return 'xls';
    default:
      return null;
  }
}

/**
 * Normalize text by handling encoding issues and trimming whitespace
 */
function normalizeText(text: string): string {
  return text
    .trim()
    // Remove BOM characters
    .replace(/^\uFEFF/, '')
    // Normalize unicode
    .normalize('NFC');
}

/**
 * Parse CSV content and extract name/email columns
 * Handles various CSV formats and encoding issues
 */
export function parseCSVContent(content: string): ParseResult {
  const errors: string[] = [];
  const rows: ImportRow[] = [];

  // Normalize content and handle different line endings
  const normalizedContent = normalizeText(content).replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  const lines = normalizedContent.split('\n').filter((line) => line.trim() !== '');

  if (lines.length === 0) {
    errors.push('File rỗng hoặc không có dữ liệu');
    return { rows, errors };
  }

  // Detect delimiter (comma, semicolon, or tab)
  const firstLine = lines[0];
  const delimiter = detectDelimiter(firstLine);

  // Parse header row to find name and email columns
  const headers = parseCSVLine(firstLine, delimiter).map((h) => h.toLowerCase().trim());

  const nameIndex = findColumnIndex(headers, ['name', 'tên', 'họ tên', 'ho ten', 'fullname', 'full name']);
  const emailIndex = findColumnIndex(headers, ['email', 'e-mail', 'mail', 'email address']);

  if (nameIndex === -1) {
    errors.push('Không tìm thấy cột tên (name, tên, họ tên)');
  }
  if (emailIndex === -1) {
    errors.push('Không tìm thấy cột email (email, e-mail, mail)');
  }

  if (nameIndex === -1 || emailIndex === -1) {
    return { rows, errors };
  }

  // Parse data rows (skip header)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCSVLine(line, delimiter);

    const name = normalizeText(values[nameIndex] || '');
    const email = normalizeText(values[emailIndex] || '');

    if (name || email) {
      rows.push({ name, email });
    }
  }

  return { rows, errors };
}

/**
 * Detect CSV delimiter from first line
 */
function detectDelimiter(line: string): string {
  const delimiters = [',', ';', '\t'];
  let maxCount = 0;
  let bestDelimiter = ',';

  for (const delimiter of delimiters) {
    const count = (line.match(new RegExp(escapeRegex(delimiter), 'g')) || []).length;
    if (count > maxCount) {
      maxCount = count;
      bestDelimiter = delimiter;
    }
  }

  return bestDelimiter;
}

/**
 * Escape special regex characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Parse a single CSV line handling quoted values
 */
function parseCSVLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else if (char === '"') {
        // End of quoted value
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        // Start of quoted value
        inQuotes = true;
      } else if (char === delimiter) {
        // End of field
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
  }

  // Add last field
  result.push(current);

  return result;
}

/**
 * Find column index by matching against possible column names
 */
function findColumnIndex(headers: string[], possibleNames: string[]): number {
  for (let i = 0; i < headers.length; i++) {
    const header = headers[i].toLowerCase().trim();
    if (possibleNames.some((name) => header.includes(name))) {
      return i;
    }
  }
  return -1;
}

/**
 * XLSX library type for dynamic import
 */
interface XLSXModule {
  read: (data: ArrayBuffer, opts: { type: string }) => {
    SheetNames: string[];
    Sheets: Record<string, unknown>;
  };
  utils: {
    sheet_to_json: (
      worksheet: unknown,
      opts: { header: number; defval: string; blankrows: boolean }
    ) => unknown[][];
  };
}

/**
 * Parse Excel file content (first sheet)
 * Uses SheetJS (xlsx) library for parsing
 */
export async function parseExcelFile(file: File): Promise<ParseResult> {
  const errors: string[] = [];
  const rows: ImportRow[] = [];

  try {
    // Dynamic import to avoid bundling xlsx in main bundle
    const xlsxModule = await import('xlsx');
    const XLSX = xlsxModule as unknown as XLSXModule;

    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });

    // Get first sheet
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
      errors.push('File Excel không có sheet nào');
      return { rows, errors };
    }

    const worksheet = workbook.Sheets[firstSheetName];
    if (!worksheet) {
      errors.push('Không thể đọc sheet đầu tiên');
      return { rows, errors };
    }

    // Convert to JSON with header row
    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: '',
      blankrows: false,
    }) as string[][];

    if (jsonData.length === 0) {
      errors.push('File Excel rỗng hoặc không có dữ liệu');
      return { rows, errors };
    }

    // Parse header row to find name and email columns
    const headers = (jsonData[0] || []).map((h: unknown) => String(h).toLowerCase().trim());

    const nameIndex = findColumnIndex(headers, ['name', 'tên', 'họ tên', 'ho ten', 'fullname', 'full name']);
    const emailIndex = findColumnIndex(headers, ['email', 'e-mail', 'mail', 'email address']);

    if (nameIndex === -1) {
      errors.push('Không tìm thấy cột tên (name, tên, họ tên)');
    }
    if (emailIndex === -1) {
      errors.push('Không tìm thấy cột email (email, e-mail, mail)');
    }

    if (nameIndex === -1 || emailIndex === -1) {
      return { rows, errors };
    }

    // Parse data rows (skip header)
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      if (!row) continue;

      const name = normalizeText(String(row[nameIndex] || ''));
      const email = normalizeText(String(row[emailIndex] || ''));

      if (name || email) {
        rows.push({ name, email });
      }
    }

    return { rows, errors };
  } catch (error) {
    errors.push(`Lỗi đọc file Excel: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return { rows, errors };
  }
}

/**
 * Parse CSV file
 */
export async function parseCSVFile(file: File): Promise<ParseResult> {
  try {
    // Try UTF-8 first
    let content = await file.text();

    // Check for encoding issues (common with Vietnamese text)
    if (content.includes('�')) {
      // Try reading with different encoding
      const buffer = await file.arrayBuffer();
      const decoder = new TextDecoder('windows-1252');
      content = decoder.decode(buffer);
    }

    return parseCSVContent(content);
  } catch (error) {
    return {
      rows: [],
      errors: [`Lỗi đọc file CSV: ${error instanceof Error ? error.message : 'Unknown error'}`],
    };
  }
}

/**
 * Parse import file (auto-detect type)
 */
export async function parseImportFile(file: File): Promise<ParseResult> {
  const fileType = detectFileType(file.name);

  if (!fileType) {
    return {
      rows: [],
      errors: ['Định dạng file không được hỗ trợ. Vui lòng sử dụng file CSV hoặc Excel (.xlsx, .xls)'],
    };
  }

  switch (fileType) {
    case 'csv':
      return parseCSVFile(file);
    case 'xlsx':
    case 'xls':
      return parseExcelFile(file);
    default:
      return {
        rows: [],
        errors: ['Định dạng file không được hỗ trợ'],
      };
  }
}
