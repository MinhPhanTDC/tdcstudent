/**
 * Auth redirect utilities for handling authentication errors and return URLs
 * Requirements: 3.4 - WHEN an authentication error occurs THEN the TDC_System SHALL redirect to the login page with an appropriate message
 */

import { ErrorCode, type ErrorCodeType } from '@tdc/types';

/**
 * Auth error types that trigger redirect to login
 */
export type AuthErrorType = 
  | 'session_expired'
  | 'unauthorized'
  | 'invalid_token'
  | 'permission_denied'
  | 'account_disabled';

/**
 * Map auth error types to error codes
 */
const AUTH_ERROR_CODE_MAP: Record<AuthErrorType, ErrorCodeType> = {
  session_expired: ErrorCode.SESSION_EXPIRED,
  unauthorized: ErrorCode.UNAUTHORIZED,
  invalid_token: ErrorCode.INVALID_CREDENTIALS,
  permission_denied: ErrorCode.PERMISSION_DENIED,
  account_disabled: ErrorCode.STUDENT_INACTIVE,
};

/**
 * Get error code from auth error type
 */
export function getErrorCodeFromAuthError(errorType: AuthErrorType): ErrorCodeType {
  return AUTH_ERROR_CODE_MAP[errorType] || ErrorCode.UNAUTHORIZED;
}

/**
 * Build auth redirect URL with error and return URL parameters
 */
export function buildAuthRedirectUrl(options: {
  authUrl?: string;
  error?: AuthErrorType;
  returnUrl?: string;
}): string {
  const { authUrl = process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3000', error, returnUrl } = options;
  
  const url = new URL(authUrl);
  
  if (error) {
    url.searchParams.set('error', error);
  }
  
  if (returnUrl) {
    // Encode the return URL to handle special characters
    url.searchParams.set('returnUrl', returnUrl);
  }
  
  return url.toString();
}

/**
 * Get current page URL for return URL parameter
 * Only works in browser environment
 */
export function getCurrentPageUrl(): string | null {
  if (typeof window === 'undefined') return null;
  
  // Get full URL including path and query params, but exclude hash
  const { origin, pathname, search } = window.location;
  return `${origin}${pathname}${search}`;
}

/**
 * Redirect to auth page with error and return URL
 * Requirements: 3.4 - Redirect to login page with appropriate message
 */
export function redirectToAuth(options: {
  error?: AuthErrorType;
  includeReturnUrl?: boolean;
  authUrl?: string;
}): void {
  const { error, includeReturnUrl = true, authUrl } = options;
  
  const returnUrl = includeReturnUrl ? getCurrentPageUrl() : undefined;
  const redirectUrl = buildAuthRedirectUrl({
    authUrl,
    error,
    returnUrl: returnUrl || undefined,
  });
  
  window.location.href = redirectUrl;
}

/**
 * Check if an error code indicates session expiry
 */
export function isSessionExpiredError(errorCode: ErrorCodeType): boolean {
  return errorCode === ErrorCode.SESSION_EXPIRED || 
         errorCode === ErrorCode.UNAUTHORIZED ||
         errorCode === ErrorCode.AUTH_REQUIRED;
}

/**
 * Check if an error code indicates permission denied
 */
export function isPermissionDeniedError(errorCode: ErrorCodeType): boolean {
  return errorCode === ErrorCode.PERMISSION_DENIED || 
         errorCode === ErrorCode.INVALID_ROLE;
}

/**
 * Get auth error type from error code
 */
export function getAuthErrorTypeFromCode(errorCode: ErrorCodeType): AuthErrorType {
  switch (errorCode) {
    case ErrorCode.SESSION_EXPIRED:
    case ErrorCode.AUTH_REQUIRED:
      return 'session_expired';
    case ErrorCode.PERMISSION_DENIED:
    case ErrorCode.INVALID_ROLE:
      return 'permission_denied';
    case ErrorCode.STUDENT_INACTIVE:
      return 'account_disabled';
    case ErrorCode.INVALID_CREDENTIALS:
      return 'invalid_token';
    default:
      return 'unauthorized';
  }
}
