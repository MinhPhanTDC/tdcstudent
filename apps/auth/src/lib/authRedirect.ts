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
 * Parse auth error from URL search params
 */
export function parseAuthErrorFromUrl(): AuthErrorType | null {
  if (typeof window === 'undefined') return null;
  
  const params = new URLSearchParams(window.location.search);
  const error = params.get('error');
  
  if (error && isValidAuthError(error)) {
    return error as AuthErrorType;
  }
  
  return null;
}

/**
 * Parse return URL from URL search params
 */
export function parseReturnUrlFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  
  const params = new URLSearchParams(window.location.search);
  return params.get('returnUrl');
}

/**
 * Check if error string is a valid auth error type
 */
function isValidAuthError(error: string): error is AuthErrorType {
  return ['session_expired', 'unauthorized', 'invalid_token', 'permission_denied', 'account_disabled'].includes(error);
}

/**
 * Clear auth params from URL without page reload
 */
export function clearAuthParamsFromUrl(): void {
  if (typeof window === 'undefined') return;
  
  const url = new URL(window.location.href);
  url.searchParams.delete('error');
  url.searchParams.delete('returnUrl');
  
  // Update URL without reload
  window.history.replaceState({}, '', url.toString());
}

/**
 * Redirect to auth page with error and return URL
 */
export function redirectToAuth(options: {
  error?: AuthErrorType;
  includeReturnUrl?: boolean;
}): void {
  const { error, includeReturnUrl = true } = options;
  
  const returnUrl = includeReturnUrl ? getCurrentPageUrl() : undefined;
  const redirectUrl = buildAuthRedirectUrl({
    error,
    returnUrl: returnUrl || undefined,
  });
  
  window.location.href = redirectUrl;
}
