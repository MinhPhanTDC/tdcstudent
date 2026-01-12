import {
  reauthenticateWithCredential,
  updatePassword,
  EmailAuthProvider,
} from 'firebase/auth';
import { type Result, success, failure, AppError, ErrorCode } from '@tdc/types';
import {
  validatePasswordStrength,
  type PasswordValidationResult,
} from '@tdc/schemas';
import { getFirebaseAuth } from '../config';
import { mapFirebaseError } from '../errors';

/**
 * Password service for handling password changes
 * Requirements: 1.2, 10.3
 */
export const passwordService = {
  /**
   * Change the current user's password
   * Requirements: 1.2, 1.3, 10.3, 10.4
   *
   * @param currentPassword - The user's current password for re-authentication
   * @param newPassword - The new password to set
   * @returns Result indicating success or failure
   */
  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<Result<void>> {
    const auth = getFirebaseAuth();
    const user = auth.currentUser;

    // Check if user is logged in
    if (!user || !user.email) {
      return failure(
        new AppError(ErrorCode.AUTH_REQUIRED, 'Vui lòng đăng nhập lại')
      );
    }

    // Validate new password strength
    const validation = validatePasswordStrength(newPassword);
    if (!validation.isValid) {
      return failure(
        new AppError(ErrorCode.WEAK_PASSWORD, validation.errors[0], {
          errors: validation.errors,
        })
      );
    }

    try {
      // Re-authenticate user with current password
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);

      return success(undefined);
    } catch (error) {
      // Map Firebase errors to user-friendly messages
      const appError = mapFirebaseError(error);

      // Provide more specific error messages for password change
      if (appError.code === ErrorCode.INVALID_CREDENTIALS) {
        return failure(
          new AppError(
            ErrorCode.WRONG_PASSWORD,
            'Mật khẩu hiện tại không đúng'
          )
        );
      }

      if (appError.code === ErrorCode.SESSION_EXPIRED) {
        return failure(
          new AppError(ErrorCode.AUTH_REQUIRED, 'Vui lòng đăng nhập lại')
        );
      }

      return failure(appError);
    }
  },

  /**
   * Validate password strength without changing it
   * Requirements: 1.4, 10.5
   *
   * @param password - The password to validate
   * @returns Validation result with isValid flag and error messages
   */
  validatePasswordStrength(password: string): PasswordValidationResult {
    return validatePasswordStrength(password);
  },
};
