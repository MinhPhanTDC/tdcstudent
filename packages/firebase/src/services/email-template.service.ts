import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { type Result, success, failure, AppError, ErrorCode } from '@tdc/types';
import {
  type EmailTemplate,
  type UpdateEmailTemplateInput,
  EmailTemplateSchema,
  DEFAULT_EMAIL_TEMPLATES,
  validatePlaceholders,
  replacePlaceholders,
  hasRemainingPlaceholders,
} from '@tdc/schemas';
import { getFirebaseDb } from '../config';

/**
 * Email Template Service Error Codes
 * Requirements: 3.1, 3.6, 3.7
 */
export const EmailTemplateErrorCode = {
  TEMPLATE_NOT_FOUND: 'TEMPLATE_NOT_FOUND',
  TEMPLATE_UPDATE_FAILED: 'TEMPLATE_UPDATE_FAILED',
  INVALID_PLACEHOLDER: 'INVALID_PLACEHOLDER',
  TEMPLATE_VALIDATION_FAILED: 'TEMPLATE_VALIDATION_FAILED',
} as const;

/**
 * Firestore collection name for email templates
 */
const EMAIL_TEMPLATES_COLLECTION = 'emailTemplates';

/**
 * Email Template Service
 * Handles CRUD operations for email templates
 * Requirements: 3.1, 3.5, 3.6
 */
class EmailTemplateService {
  /**
   * Get all email templates
   * Requirements: 3.1
   * 
   * @returns Result with array of email templates
   */
  async getTemplates(): Promise<Result<EmailTemplate[]>> {
    try {
      const db = getFirebaseDb();
      const templatesRef = collection(db, EMAIL_TEMPLATES_COLLECTION);
      const q = query(templatesRef, orderBy('name'));
      const snapshot = await getDocs(q);

      // If no templates exist, initialize with defaults
      if (snapshot.empty) {
        const initResult = await this.initializeDefaultTemplates();
        if (!initResult.success) {
          return failure(initResult.error);
        }
        return success(initResult.data);
      }

      const templates: EmailTemplate[] = [];
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const parsedData = {
          ...data,
          id: docSnap.id,
          createdAt: data.createdAt?.toDate?.() ?? data.createdAt ?? new Date(),
          updatedAt: data.updatedAt?.toDate?.() ?? data.updatedAt ?? new Date(),
        };

        const parsed = EmailTemplateSchema.safeParse(parsedData);
        if (parsed.success) {
          templates.push(parsed.data);
        }
      }

      return success(templates);
    } catch (error) {
      return failure(
        new AppError(
          ErrorCode.DATABASE_ERROR,
          'Failed to get email templates',
          { originalError: error instanceof Error ? error.message : String(error) }
        )
      );
    }
  }

  /**
   * Get a single email template by ID
   * Requirements: 3.1
   * 
   * @param id - Template ID
   * @returns Result with email template
   */
  async getTemplate(id: string): Promise<Result<EmailTemplate>> {
    try {
      const db = getFirebaseDb();
      const templateRef = doc(db, EMAIL_TEMPLATES_COLLECTION, id);
      const templateSnap = await getDoc(templateRef);

      if (!templateSnap.exists()) {
        return failure(
          new AppError(
            ErrorCode.EMAIL_TEMPLATE_NOT_FOUND,
            'Email template not found',
            { code: EmailTemplateErrorCode.TEMPLATE_NOT_FOUND, templateId: id }
          )
        );
      }

      const data = templateSnap.data();
      const parsedData = {
        ...data,
        id: templateSnap.id,
        createdAt: data.createdAt?.toDate?.() ?? data.createdAt ?? new Date(),
        updatedAt: data.updatedAt?.toDate?.() ?? data.updatedAt ?? new Date(),
      };

      const parsed = EmailTemplateSchema.safeParse(parsedData);
      if (!parsed.success) {
        return failure(
          new AppError(
            ErrorCode.VALIDATION_ERROR,
            'Invalid email template data',
            { 
              code: EmailTemplateErrorCode.TEMPLATE_VALIDATION_FAILED,
              errors: parsed.error.flatten(),
            }
          )
        );
      }

      return success(parsed.data);
    } catch (error) {
      return failure(
        new AppError(
          ErrorCode.DATABASE_ERROR,
          'Failed to get email template',
          { originalError: error instanceof Error ? error.message : String(error) }
        )
      );
    }
  }

  /**
   * Update an email template
   * Requirements: 3.6, 3.7
   * 
   * Validates:
   * - Template exists
   * - Placeholders are valid
   * 
   * @param id - Template ID
   * @param input - Update data
   * @returns Result with updated template
   */
  async updateTemplate(
    id: string,
    input: UpdateEmailTemplateInput
  ): Promise<Result<EmailTemplate>> {
    try {
      // Check template exists
      const existingResult = await this.getTemplate(id);
      if (!existingResult.success) {
        return failure(existingResult.error);
      }

      // Validate placeholders in subject and body if provided
      const contentToValidate = [
        input.subject ?? '',
        input.body ?? '',
      ].join(' ');

      if (contentToValidate.trim()) {
        const validation = validatePlaceholders(contentToValidate);
        if (!validation.isValid) {
          return failure(
            new AppError(
              ErrorCode.VALIDATION_ERROR,
              `Invalid placeholder(s): ${validation.invalidPlaceholders.join(', ')}`,
              { 
                code: EmailTemplateErrorCode.INVALID_PLACEHOLDER,
                invalidPlaceholders: validation.invalidPlaceholders,
              }
            )
          );
        }
      }

      const db = getFirebaseDb();
      const templateRef = doc(db, EMAIL_TEMPLATES_COLLECTION, id);

      const updateData = {
        ...input,
        updatedAt: new Date(),
      };

      await updateDoc(templateRef, updateData);

      // Return updated template
      return this.getTemplate(id);
    } catch (error) {
      return failure(
        new AppError(
          ErrorCode.DATABASE_ERROR,
          'Failed to update email template',
          { 
            code: EmailTemplateErrorCode.TEMPLATE_UPDATE_FAILED,
            originalError: error instanceof Error ? error.message : String(error),
          }
        )
      );
    }
  }

  /**
   * Preview a template with sample data
   * Requirements: 3.5
   * 
   * Replaces all placeholders with provided sample data
   * 
   * @param id - Template ID
   * @param sampleData - Data to replace placeholders
   * @returns Result with rendered subject and body
   */
  async previewTemplate(
    id: string,
    sampleData: Record<string, string>
  ): Promise<Result<{ subject: string; body: string; missingPlaceholders: string[] }>> {
    try {
      const templateResult = await this.getTemplate(id);
      if (!templateResult.success) {
        return failure(templateResult.error);
      }

      const template = templateResult.data;
      
      // Replace placeholders in subject
      const subjectResult = replacePlaceholders(template.subject, sampleData);
      
      // Replace placeholders in body
      const bodyResult = replacePlaceholders(template.body, sampleData);

      // Combine missing placeholders from both
      const allMissing = [
        ...new Set([...subjectResult.missingPlaceholders, ...bodyResult.missingPlaceholders]),
      ];

      return success({
        subject: subjectResult.result,
        body: bodyResult.result,
        missingPlaceholders: allMissing,
      });
    } catch (error) {
      return failure(
        new AppError(
          ErrorCode.UNKNOWN_ERROR,
          'Failed to preview template',
          { originalError: error instanceof Error ? error.message : String(error) }
        )
      );
    }
  }

  /**
   * Render a template with actual data for sending
   * Requirements: 3.5, 4.2, 8.2
   * 
   * Similar to preview but logs warnings for missing placeholders
   * 
   * @param id - Template ID
   * @param data - Actual data to replace placeholders
   * @returns Result with rendered subject and body
   */
  async renderTemplate(
    id: string,
    data: Record<string, string>
  ): Promise<Result<{ subject: string; body: string }>> {
    const previewResult = await this.previewTemplate(id, data);
    if (!previewResult.success) {
      return failure(previewResult.error);
    }

    const { subject, body, missingPlaceholders } = previewResult.data;

    // Log warning for missing placeholders (Requirements: 4.3)
    if (missingPlaceholders.length > 0) {
      console.warn(
        `[EmailTemplateService] Missing placeholders for template ${id}:`,
        missingPlaceholders
      );
    }

    // Verify no remaining placeholders (Property 5)
    if (hasRemainingPlaceholders(subject) || hasRemainingPlaceholders(body)) {
      console.warn(
        `[EmailTemplateService] Template ${id} has unreplaced placeholders after rendering`
      );
    }

    return success({ subject, body });
  }

  /**
   * Initialize default templates
   * Called when no templates exist in the database
   * 
   * @returns Result with created templates
   */
  private async initializeDefaultTemplates(): Promise<Result<EmailTemplate[]>> {
    try {
      const db = getFirebaseDb();
      const templates: EmailTemplate[] = [];
      const now = new Date();

      for (const defaultTemplate of DEFAULT_EMAIL_TEMPLATES) {
        const templateRef = doc(collection(db, EMAIL_TEMPLATES_COLLECTION));
        const template: EmailTemplate = {
          ...defaultTemplate,
          id: templateRef.id,
          createdAt: now,
          updatedAt: now,
        };

        await setDoc(templateRef, template);
        templates.push(template);
      }

      return success(templates);
    } catch (error) {
      return failure(
        new AppError(
          ErrorCode.DATABASE_ERROR,
          'Failed to initialize default templates',
          { originalError: error instanceof Error ? error.message : String(error) }
        )
      );
    }
  }
}

// Singleton export
export const emailTemplateService = new EmailTemplateService();
