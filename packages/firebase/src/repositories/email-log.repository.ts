import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  type QueryConstraint,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { type Result, success, failure, AppError, ErrorCode } from '@tdc/types';
import {
  type EmailLog,
  type CreateEmailLogInput,
  type EmailLogFilter,
  EmailLogSchema,
} from '@tdc/schemas';
import { getFirebaseDb } from '../config';
import { mapFirebaseError } from '../errors';

/**
 * Email log repository error codes
 * Requirements: 8.3
 */
export const EmailLogRepositoryErrorCode = {
  LOG_NOT_FOUND: 'EMAIL_LOG_NOT_FOUND',
  LOG_CREATE_FAILED: 'EMAIL_LOG_CREATE_FAILED',
  LOG_QUERY_FAILED: 'EMAIL_LOG_QUERY_FAILED',
} as const;

/**
 * Firestore collection name for email logs
 */
const EMAIL_LOGS_COLLECTION = 'emailLogs';

/**
 * Email Log Repository
 * CRUD operations for email logs
 * Requirements: 8.3
 */
class EmailLogRepository {
  /**
   * Get collection reference
   */
  private get collectionRef() {
    return collection(getFirebaseDb(), EMAIL_LOGS_COLLECTION);
  }

  /**
   * Parse document data with schema validation
   */
  private parseDocument(docSnap: QueryDocumentSnapshot<DocumentData>): Result<EmailLog> {
    const data = docSnap.data();
    const parsedData = {
      ...data,
      id: docSnap.id,
      sentAt: data.sentAt?.toDate?.() ?? data.sentAt ?? new Date(),
    };

    const parsed = EmailLogSchema.safeParse(parsedData);
    if (!parsed.success) {
      return failure(
        new AppError(ErrorCode.VALIDATION_ERROR, 'Invalid email log data', {
          errors: parsed.error.flatten(),
        })
      );
    }

    return success(parsed.data);
  }

  /**
   * Find email log by ID
   * 
   * @param id - Email log ID
   * @returns Result with email log
   */
  async findById(id: string): Promise<Result<EmailLog>> {
    try {
      const docRef = doc(this.collectionRef, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return failure(
          new AppError(ErrorCode.EMAIL_LOG_NOT_FOUND, 'Email log not found', {
            code: EmailLogRepositoryErrorCode.LOG_NOT_FOUND,
            logId: id,
          })
        );
      }

      return this.parseDocument(docSnap as QueryDocumentSnapshot<DocumentData>);
    } catch (error) {
      return failure(mapFirebaseError(error));
    }
  }

  /**
   * Find all email logs with optional filters
   * 
   * @param filter - Optional filter criteria
   * @param maxResults - Maximum number of results (default 100)
   * @returns Result with array of email logs
   */
  async findAll(filter?: EmailLogFilter, maxResults = 100): Promise<Result<EmailLog[]>> {
    try {
      const constraints: QueryConstraint[] = [];

      // Apply filters
      if (filter?.recipientEmail) {
        constraints.push(where('recipientEmail', '==', filter.recipientEmail));
      }
      if (filter?.templateId) {
        constraints.push(where('templateId', '==', filter.templateId));
      }
      if (filter?.status) {
        constraints.push(where('status', '==', filter.status));
      }
      if (filter?.sentBy) {
        constraints.push(where('sentBy', '==', filter.sentBy));
      }

      // Order by sentAt descending (most recent first)
      constraints.push(orderBy('sentAt', 'desc'));
      constraints.push(limit(maxResults));

      const q = query(this.collectionRef, ...constraints);
      const snapshot = await getDocs(q);

      const logs: EmailLog[] = [];
      for (const docSnap of snapshot.docs) {
        const result = this.parseDocument(docSnap);
        if (result.success) {
          logs.push(result.data);
        }
      }

      return success(logs);
    } catch (error) {
      return failure(
        new AppError(ErrorCode.DATABASE_ERROR, 'Failed to query email logs', {
          code: EmailLogRepositoryErrorCode.LOG_QUERY_FAILED,
          originalError: error instanceof Error ? error.message : String(error),
        })
      );
    }
  }

  /**
   * Find email logs by recipient email
   * 
   * @param email - Recipient email address
   * @param maxResults - Maximum number of results
   * @returns Result with array of email logs
   */
  async findByRecipient(email: string, maxResults = 50): Promise<Result<EmailLog[]>> {
    return this.findAll({ recipientEmail: email }, maxResults);
  }

  /**
   * Find email logs by template ID
   * 
   * @param templateId - Template ID
   * @param maxResults - Maximum number of results
   * @returns Result with array of email logs
   */
  async findByTemplate(templateId: string, maxResults = 50): Promise<Result<EmailLog[]>> {
    return this.findAll({ templateId }, maxResults);
  }

  /**
   * Create a new email log
   * Requirements: 8.3
   * 
   * @param input - Email log data
   * @returns Result with created email log
   */
  async create(input: CreateEmailLogInput): Promise<Result<EmailLog>> {
    try {
      const docRef = doc(this.collectionRef);
      
      const emailLog: EmailLog = {
        ...input,
        id: docRef.id,
      };

      // Validate with schema
      const parsed = EmailLogSchema.safeParse(emailLog);
      if (!parsed.success) {
        return failure(
          new AppError(ErrorCode.VALIDATION_ERROR, 'Invalid email log data', {
            errors: parsed.error.flatten(),
          })
        );
      }

      // Save to Firestore with server timestamp
      await setDoc(docRef, {
        ...parsed.data,
        sentAt: serverTimestamp(),
      });

      return success(parsed.data);
    } catch (error) {
      return failure(
        new AppError(ErrorCode.EMAIL_LOG_CREATE_FAILED, 'Failed to create email log', {
          code: EmailLogRepositoryErrorCode.LOG_CREATE_FAILED,
          originalError: error instanceof Error ? error.message : String(error),
        })
      );
    }
  }

  /**
   * Count email logs by status
   * 
   * @param status - Email status to count
   * @returns Result with count
   */
  async countByStatus(status: 'sent' | 'failed'): Promise<Result<number>> {
    try {
      const q = query(this.collectionRef, where('status', '==', status));
      const snapshot = await getDocs(q);
      return success(snapshot.size);
    } catch (error) {
      return failure(mapFirebaseError(error));
    }
  }
}

// Singleton export
export const emailLogRepository = new EmailLogRepository();
