import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { type Result, success, failure, AppError, ErrorCode } from '@tdc/types';
import {
  type HandbookSettings,
  HandbookSettingsSchema,
  PdfValidationSchema,
} from '@tdc/schemas';
import { getFirebaseStorage, getFirebaseDb } from '../config';

/**
 * Handbook Service Error Codes
 * Requirements: 7.1, 7.2, 7.3
 */
export const HandbookErrorCode = {
  INVALID_PDF: 'HANDBOOK_INVALID_PDF',
  FILE_TOO_LARGE: 'HANDBOOK_FILE_TOO_LARGE',
  UPLOAD_FAILED: 'HANDBOOK_UPLOAD_FAILED',
  NOT_FOUND: 'HANDBOOK_NOT_FOUND',
  DELETE_FAILED: 'HANDBOOK_DELETE_FAILED',
  SETTINGS_UPDATE_FAILED: 'HANDBOOK_SETTINGS_UPDATE_FAILED',
} as const;

/**
 * Maximum file size in bytes (10MB)
 * Requirements: 7.1
 */
export const MAX_PDF_SIZE = 10 * 1024 * 1024; // 10MB = 10,485,760 bytes

/**
 * PDF magic bytes (header signature)
 */
const PDF_MAGIC_BYTES = [0x25, 0x50, 0x44, 0x46]; // %PDF

/**
 * Firestore path for handbook settings
 */
const HANDBOOK_SETTINGS_PATH = 'settings/handbook';

/**
 * Storage path for handbook PDFs
 */
const HANDBOOK_STORAGE_PATH = 'handbooks';

/**
 * Input for uploading a handbook
 */
export interface UploadHandbookInput {
  file: File;
  uploadedBy: string;
}

/**
 * Result of handbook upload
 */
export interface UploadHandbookResult {
  settings: HandbookSettings;
  previousSettings?: HandbookSettings;
}

/**
 * Validates PDF file constraints
 * Requirements: 7.1
 * 
 * Pure function for testing - validates file metadata
 * 
 * @param filename - The filename to validate
 * @param fileSize - The file size in bytes
 * @param mimeType - The MIME type of the file
 * @returns Result with validation status
 */
export function validatePdfMetadata(
  filename: string,
  fileSize: number,
  mimeType: string
): Result<true> {
  const validation = PdfValidationSchema.safeParse({
    filename,
    fileSize,
    mimeType,
  });

  if (!validation.success) {
    const errors = validation.error.flatten();
    const firstError = errors.fieldErrors.filename?.[0] 
      || errors.fieldErrors.fileSize?.[0] 
      || errors.fieldErrors.mimeType?.[0]
      || 'Invalid PDF file';
    
    return failure(
      new AppError(ErrorCode.VALIDATION_ERROR, firstError, {
        errors: errors.fieldErrors,
      })
    );
  }

  return success(true);
}

/**
 * Validates PDF file size constraint
 * Requirements: 7.1
 * 
 * Pure function for property testing
 * 
 * @param fileSize - The file size in bytes
 * @returns true if file size is valid (positive and under 10MB)
 */
export function isValidPdfSize(fileSize: number): boolean {
  return fileSize > 0 && fileSize <= MAX_PDF_SIZE;
}

/**
 * Validates PDF header bytes
 * Requirements: 7.1
 * 
 * Pure function for property testing
 * 
 * @param headerBytes - First 4 bytes of the file
 * @returns true if header matches PDF signature
 */
export function isValidPdfHeader(headerBytes: Uint8Array): boolean {
  if (headerBytes.length < 4) return false;
  
  return PDF_MAGIC_BYTES.every((byte, index) => headerBytes[index] === byte);
}

/**
 * Validates PDF file constraints (combined check)
 * Requirements: 7.1
 * 
 * @param fileSize - The file size in bytes
 * @param headerBytes - First 4 bytes of the file (optional for header validation)
 * @returns true if file passes all PDF validation constraints
 */
export function validatePdfConstraints(
  fileSize: number,
  headerBytes?: Uint8Array
): boolean {
  // Check size constraint
  if (!isValidPdfSize(fileSize)) {
    return false;
  }

  // Check header if provided
  if (headerBytes && !isValidPdfHeader(headerBytes)) {
    return false;
  }

  return true;
}

/**
 * Compares two handbook settings to verify replacement
 * Requirements: 7.3
 * 
 * Pure function for property testing
 * 
 * @param previous - Previous handbook settings
 * @param current - Current handbook settings
 * @returns true if current is a valid replacement of previous
 */
export function isValidReplacement(
  previous: HandbookSettings,
  current: HandbookSettings
): boolean {
  // New URL should be different (new file uploaded)
  const hasNewUrl = current.pdfUrl !== previous.pdfUrl;
  
  // Timestamp should be greater
  const hasNewerTimestamp = current.uploadedAt.getTime() > previous.uploadedAt.getTime();
  
  return hasNewUrl && hasNewerTimestamp;
}

/**
 * Handbook Service
 * Handles PDF upload, storage, and settings management
 * Requirements: 7.1, 7.2, 7.3
 */
class HandbookService {
  /**
   * Validate a PDF file before upload
   * Requirements: 7.1
   * 
   * @param file - The File object to validate
   * @returns Result with validation status
   */
  async validatePdf(file: File): Promise<Result<true>> {
    // Validate metadata first
    const metadataResult = validatePdfMetadata(
      file.name,
      file.size,
      file.type
    );
    
    if (!metadataResult.success) {
      return metadataResult;
    }

    // Read file header to validate PDF signature
    try {
      const headerBuffer = await file.slice(0, 4).arrayBuffer();
      const headerBytes = new Uint8Array(headerBuffer);
      
      if (!isValidPdfHeader(headerBytes)) {
        return failure(
          new AppError(
            ErrorCode.VALIDATION_ERROR,
            'File does not have a valid PDF header',
            { code: HandbookErrorCode.INVALID_PDF }
          )
        );
      }
    } catch {
      return failure(
        new AppError(
          ErrorCode.VALIDATION_ERROR,
          'Could not read file header',
          { code: HandbookErrorCode.INVALID_PDF }
        )
      );
    }

    return success(true);
  }

  /**
   * Upload a handbook PDF to Firebase Storage
   * Requirements: 7.1, 7.2, 7.3
   * 
   * @param input - Upload input with file and uploader ID
   * @returns Result with new settings and optional previous settings
   */
  async uploadHandbook(
    input: UploadHandbookInput
  ): Promise<Result<UploadHandbookResult>> {
    const { file, uploadedBy } = input;

    // Validate PDF first
    const validationResult = await this.validatePdf(file);
    if (!validationResult.success) {
      return failure(validationResult.error);
    }

    // Get current handbook settings (if exists) for replacement tracking
    const currentResult = await this.getHandbook();
    const previousSettings = currentResult.success ? currentResult.data : undefined;

    try {
      const storage = getFirebaseStorage();
      const db = getFirebaseDb();

      // Generate unique filename with timestamp
      const timestamp = Date.now();
      const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storagePath = `${HANDBOOK_STORAGE_PATH}/${timestamp}_${sanitizedFilename}`;
      
      // Upload to Firebase Storage
      const storageRef = ref(storage, storagePath);
      const uploadResult = await uploadBytes(storageRef, file, {
        contentType: 'application/pdf',
      });

      // Get download URL
      const pdfUrl = await getDownloadURL(uploadResult.ref);

      // Create new settings
      const newSettings: HandbookSettings = {
        pdfUrl,
        filename: file.name,
        uploadedAt: new Date(),
        uploadedBy,
        fileSize: file.size,
      };

      // Validate settings before saving
      const settingsValidation = HandbookSettingsSchema.safeParse(newSettings);
      if (!settingsValidation.success) {
        // Cleanup uploaded file on validation failure
        await deleteObject(storageRef).catch(() => {});
        return failure(
          new AppError(
            ErrorCode.VALIDATION_ERROR,
            'Invalid handbook settings',
            { errors: settingsValidation.error.flatten() }
          )
        );
      }

      // Save settings to Firestore
      const settingsRef = doc(db, HANDBOOK_SETTINGS_PATH);
      await setDoc(settingsRef, {
        ...settingsValidation.data,
        uploadedAt: settingsValidation.data.uploadedAt,
      });

      // Delete previous file from storage if exists
      if (previousSettings) {
        try {
          // Extract storage path from previous URL
          const previousUrl = new URL(previousSettings.pdfUrl);
          const previousPath = decodeURIComponent(
            previousUrl.pathname.split('/o/')[1]?.split('?')[0] || ''
          );
          if (previousPath) {
            const previousRef = ref(storage, previousPath);
            await deleteObject(previousRef);
          }
        } catch {
          // Ignore errors when deleting old file
          console.warn('Could not delete previous handbook file');
        }
      }

      return success({
        settings: settingsValidation.data,
        previousSettings,
      });
    } catch (error) {
      return failure(
        new AppError(
          ErrorCode.DATABASE_ERROR,
          'Failed to upload handbook',
          { 
            code: HandbookErrorCode.UPLOAD_FAILED,
            originalError: error instanceof Error ? error.message : String(error),
          }
        )
      );
    }
  }

  /**
   * Get current handbook settings
   * Requirements: 7.2, 7.4
   * 
   * @returns Result with handbook settings or not found error
   */
  async getHandbook(): Promise<Result<HandbookSettings>> {
    try {
      const db = getFirebaseDb();
      const settingsRef = doc(db, HANDBOOK_SETTINGS_PATH);
      const settingsSnap = await getDoc(settingsRef);

      if (!settingsSnap.exists()) {
        return failure(
          new AppError(
            ErrorCode.VALIDATION_ERROR,
            'No handbook has been uploaded',
            { code: HandbookErrorCode.NOT_FOUND }
          )
        );
      }

      const data = settingsSnap.data();
      
      // Parse with schema to handle timestamp conversion
      const parsed = HandbookSettingsSchema.safeParse(data);
      if (!parsed.success) {
        return failure(
          new AppError(
            ErrorCode.VALIDATION_ERROR,
            'Invalid handbook settings data',
            { errors: parsed.error.flatten() }
          )
        );
      }

      return success(parsed.data);
    } catch (error) {
      return failure(
        new AppError(
          ErrorCode.DATABASE_ERROR,
          'Failed to get handbook settings',
          { originalError: error instanceof Error ? error.message : String(error) }
        )
      );
    }
  }

  /**
   * Delete current handbook
   * 
   * @returns Result with success status
   */
  async deleteHandbook(): Promise<Result<true>> {
    try {
      const currentResult = await this.getHandbook();
      if (!currentResult.success) {
        return failure(currentResult.error);
      }

      const storage = getFirebaseStorage();
      const db = getFirebaseDb();

      // Delete from storage
      try {
        const url = new URL(currentResult.data.pdfUrl);
        const storagePath = decodeURIComponent(
          url.pathname.split('/o/')[1]?.split('?')[0] || ''
        );
        if (storagePath) {
          const storageRef = ref(storage, storagePath);
          await deleteObject(storageRef);
        }
      } catch {
        console.warn('Could not delete handbook file from storage');
      }

      // Delete settings from Firestore
      const settingsRef = doc(db, HANDBOOK_SETTINGS_PATH);
      await setDoc(settingsRef, {}, { merge: false });

      return success(true);
    } catch (error) {
      return failure(
        new AppError(
          ErrorCode.DATABASE_ERROR,
          'Failed to delete handbook',
          { 
            code: HandbookErrorCode.DELETE_FAILED,
            originalError: error instanceof Error ? error.message : String(error),
          }
        )
      );
    }
  }
}

// Singleton export
export const handbookService = new HandbookService();
