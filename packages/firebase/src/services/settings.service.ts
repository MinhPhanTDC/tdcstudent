import { doc, getDoc, setDoc } from 'firebase/firestore';
import { type Result, success, failure, AppError, ErrorCode } from '@tdc/types';
import {
  type EmailSettings,
  EmailSettingsSchema,
  DEFAULT_EMAIL_SETTINGS,
} from '@tdc/schemas';
import { getFirebaseDb, getFirebaseAuth } from '../config';

/**
 * Settings Service Error Codes
 * Requirements: 2.1, 2.4
 */
export const SettingsErrorCode = {
  GMAIL_NOT_CONNECTED: 'GMAIL_NOT_CONNECTED',
  GMAIL_ALREADY_CONNECTED: 'GMAIL_ALREADY_CONNECTED',
  SETTINGS_NOT_FOUND: 'SETTINGS_NOT_FOUND',
  SETTINGS_UPDATE_FAILED: 'SETTINGS_UPDATE_FAILED',
  AUTH_REQUIRED: 'AUTH_REQUIRED',
} as const;

/**
 * Firestore path for email settings
 */
const EMAIL_SETTINGS_PATH = 'settings/email';

/**
 * Validates email settings state consistency
 * Requirements: 2.1
 * 
 * Property 3: Email settings state consistency
 * If gmailConnected is true, connectedEmail must be non-null valid email
 * If gmailConnected is false, connectedEmail must be null
 * 
 * @param settings - Email settings to validate
 * @returns true if settings state is consistent
 */
export function isEmailSettingsConsistent(settings: EmailSettings): boolean {
  if (settings.gmailConnected) {
    // When connected, email must be present
    return settings.gmailEmail !== null && settings.gmailEmail.length > 0;
  } else {
    // When disconnected, email should be null
    return settings.gmailEmail === null;
  }
}

/**
 * Creates a disconnected email settings state
 * Requirements: 2.4
 * 
 * Property 4: Disconnect clears credentials
 * After disconnect, gmailConnected=false and gmailEmail=null
 * 
 * @returns Disconnected email settings
 */
export function createDisconnectedState(): EmailSettings {
  return {
    gmailConnected: false,
    gmailEmail: null,
    connectedAt: null,
    connectedBy: null,
  };
}

/**
 * Creates a connected email settings state
 * Requirements: 2.1, 2.3
 * 
 * @param email - The connected Gmail address
 * @param userId - The user who connected
 * @returns Connected email settings
 */
export function createConnectedState(
  email: string,
  userId: string
): EmailSettings {
  return {
    gmailConnected: true,
    gmailEmail: email,
    connectedAt: new Date(),
    connectedBy: userId,
  };
}

/**
 * Settings Service
 * Handles email settings and Gmail OAuth integration
 * Requirements: 2.1, 2.4
 */
class SettingsService {
  /**
   * Get current email settings
   * Requirements: 2.1
   * 
   * @returns Result with email settings or default if not found
   */
  async getEmailSettings(): Promise<Result<EmailSettings>> {
    try {
      const db = getFirebaseDb();
      const settingsRef = doc(db, EMAIL_SETTINGS_PATH);
      const settingsSnap = await getDoc(settingsRef);

      if (!settingsSnap.exists()) {
        // Return default settings if none exist
        return success(DEFAULT_EMAIL_SETTINGS);
      }

      const data = settingsSnap.data();
      
      // Handle Firestore timestamp conversion
      const parsedData = {
        ...data,
        connectedAt: data.connectedAt?.toDate?.() ?? data.connectedAt ?? null,
      };

      // Validate with schema
      const parsed = EmailSettingsSchema.safeParse(parsedData);
      if (!parsed.success) {
        return failure(
          new AppError(
            ErrorCode.VALIDATION_ERROR,
            'Invalid email settings data',
            { errors: parsed.error.flatten() }
          )
        );
      }

      return success(parsed.data);
    } catch (error) {
      return failure(
        new AppError(
          ErrorCode.DATABASE_ERROR,
          'Failed to get email settings',
          { originalError: error instanceof Error ? error.message : String(error) }
        )
      );
    }
  }

  /**
   * Disconnect Gmail account
   * Requirements: 2.4
   * 
   * Clears stored credentials and sets connection status to false
   * 
   * @returns Result indicating success or failure
   */
  async disconnectGmail(): Promise<Result<EmailSettings>> {
    try {
      const db = getFirebaseDb();
      const settingsRef = doc(db, EMAIL_SETTINGS_PATH);

      // Get current settings to verify connected state
      const currentResult = await this.getEmailSettings();
      if (!currentResult.success) {
        return currentResult;
      }

      if (!currentResult.data.gmailConnected) {
        return failure(
          new AppError(
            ErrorCode.VALIDATION_ERROR,
            'Gmail is not connected',
            { code: SettingsErrorCode.GMAIL_NOT_CONNECTED }
          )
        );
      }

      // Create disconnected state
      const disconnectedSettings = createDisconnectedState();

      // Save to Firestore
      await setDoc(settingsRef, disconnectedSettings);

      return success(disconnectedSettings);
    } catch (error) {
      return failure(
        new AppError(
          ErrorCode.DATABASE_ERROR,
          'Failed to disconnect Gmail',
          { 
            code: SettingsErrorCode.SETTINGS_UPDATE_FAILED,
            originalError: error instanceof Error ? error.message : String(error),
          }
        )
      );
    }
  }

  /**
   * Update email settings (internal use)
   * Used by OAuth callback to save connected state
   * 
   * @param settings - New email settings to save
   * @returns Result with saved settings
   */
  async updateEmailSettings(settings: EmailSettings): Promise<Result<EmailSettings>> {
    try {
      // Validate settings
      const parsed = EmailSettingsSchema.safeParse(settings);
      if (!parsed.success) {
        return failure(
          new AppError(
            ErrorCode.VALIDATION_ERROR,
            'Invalid email settings',
            { errors: parsed.error.flatten() }
          )
        );
      }

      // Validate state consistency
      if (!isEmailSettingsConsistent(parsed.data)) {
        return failure(
          new AppError(
            ErrorCode.VALIDATION_ERROR,
            'Email settings state is inconsistent'
          )
        );
      }

      const db = getFirebaseDb();
      const settingsRef = doc(db, EMAIL_SETTINGS_PATH);

      // Save to Firestore
      await setDoc(settingsRef, parsed.data);

      return success(parsed.data);
    } catch (error) {
      return failure(
        new AppError(
          ErrorCode.DATABASE_ERROR,
          'Failed to update email settings',
          { 
            code: SettingsErrorCode.SETTINGS_UPDATE_FAILED,
            originalError: error instanceof Error ? error.message : String(error),
          }
        )
      );
    }
  }

  /**
   * Connect Gmail account (placeholder for OAuth flow)
   * Requirements: 2.2, 2.3
   * 
   * Note: Actual OAuth implementation requires server-side handling
   * This method is a placeholder that will be called after OAuth callback
   * 
   * @param email - The Gmail address to connect
   * @returns Result with connected settings
   */
  async connectGmail(email: string): Promise<Result<EmailSettings>> {
    const auth = getFirebaseAuth();
    const user = auth.currentUser;

    if (!user) {
      return failure(
        new AppError(
          ErrorCode.AUTH_REQUIRED,
          'Vui lòng đăng nhập để kết nối Gmail',
          { code: SettingsErrorCode.AUTH_REQUIRED }
        )
      );
    }

    // Get current settings
    const currentResult = await this.getEmailSettings();
    if (currentResult.success && currentResult.data.gmailConnected) {
      return failure(
        new AppError(
          ErrorCode.VALIDATION_ERROR,
          'Gmail đã được kết nối. Vui lòng ngắt kết nối trước.',
          { code: SettingsErrorCode.GMAIL_ALREADY_CONNECTED }
        )
      );
    }

    // Create connected state
    const connectedSettings = createConnectedState(email, user.uid);

    return this.updateEmailSettings(connectedSettings);
  }

  /**
   * Check if Gmail is connected
   * Requirements: 2.1
   * 
   * @returns Result with connection status
   */
  async isGmailConnected(): Promise<Result<boolean>> {
    const result = await this.getEmailSettings();
    if (!result.success) {
      return failure(result.error);
    }
    return success(result.data.gmailConnected);
  }
}

// Singleton export
export const settingsService = new SettingsService();
