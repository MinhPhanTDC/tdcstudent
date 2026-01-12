import { z } from 'zod';

/**
 * Timestamp Schema for Handbook (handles both Date and Firestore Timestamp)
 */
const HandbookTimestampSchema = z.preprocess((val) => {
  if (val === null || val === undefined) {
    return new Date();
  }
  // Handle Firestore Timestamp (has toDate method)
  if (val && typeof val === 'object' && 'toDate' in val && typeof val.toDate === 'function') {
    return val.toDate();
  }
  // Handle regular Date or date string
  if (val instanceof Date) {
    return val;
  }
  if (typeof val === 'string' || typeof val === 'number') {
    return new Date(val);
  }
  return val;
}, z.date());

/**
 * Handbook Settings Schema
 * Stores information about the uploaded student handbook PDF
 * Requirements: 7.2
 */
export const HandbookSettingsSchema = z.object({
  pdfUrl: z.string().url('URL PDF không hợp lệ'),
  filename: z.string().min(1, 'Tên file không được để trống'),
  uploadedAt: HandbookTimestampSchema,
  uploadedBy: z.string().min(1, 'ID người upload không được để trống'),
  fileSize: z.number().positive('Kích thước file phải là số dương'),
});

export type HandbookSettings = z.infer<typeof HandbookSettingsSchema>;

/**
 * Upload Handbook Input Schema
 * Used when uploading a new handbook PDF
 */
export const UploadHandbookInputSchema = z.object({
  file: z.instanceof(File).optional(), // For client-side validation
  filename: z.string().min(1),
  fileSize: z.number().positive().max(10485760, 'File không được vượt quá 10MB'), // 10MB limit
  uploadedBy: z.string().min(1),
});

export type UploadHandbookInput = z.infer<typeof UploadHandbookInputSchema>;

/**
 * PDF Validation Schema
 * Used to validate PDF file before upload
 */
export const PdfValidationSchema = z.object({
  filename: z.string().refine(
    (name) => name.toLowerCase().endsWith('.pdf'),
    'File phải có định dạng PDF'
  ),
  fileSize: z.number().positive().max(10485760, 'File không được vượt quá 10MB'),
  mimeType: z.string().refine(
    (type) => type === 'application/pdf',
    'File phải có định dạng PDF'
  ),
});

export type PdfValidation = z.infer<typeof PdfValidationSchema>;
