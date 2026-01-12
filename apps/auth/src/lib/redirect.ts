import { type UserRole } from '@tdc/schemas';
import { getFirebaseAuth } from '@tdc/firebase';
import { parseReturnUrlFromUrl, clearAuthParamsFromUrl } from './authRedirect';

// Flag to prevent multiple redirects
let isRedirecting = false;

/**
 * Get redirect URL based on user role
 */
export function getRedirectUrl(role: UserRole): string {
  const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3001';
  const studentUrl = process.env.NEXT_PUBLIC_STUDENT_URL || 'http://localhost:3002';

  switch (role) {
    case 'admin':
      return `${adminUrl}/dashboard`;
    case 'student':
      return `${studentUrl}/dashboard`;
    default:
      return '/';
  }
}

/**
 * Get redirect URL considering return URL parameter
 * If returnUrl is provided and matches the user's role domain, use it
 * Otherwise, use the default redirect URL for the role
 */
export function getRedirectUrlWithReturn(role: UserRole): string {
  const returnUrl = parseReturnUrlFromUrl();
  
  if (returnUrl) {
    // Validate that the return URL matches the user's role domain
    const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3001';
    const studentUrl = process.env.NEXT_PUBLIC_STUDENT_URL || 'http://localhost:3002';
    
    try {
      const parsedReturnUrl = new URL(returnUrl);
      const adminDomain = new URL(adminUrl).hostname;
      const studentDomain = new URL(studentUrl).hostname;
      
      // Check if return URL matches the user's role domain
      if (role === 'admin' && parsedReturnUrl.hostname === adminDomain) {
        // Clear auth params before redirect
        clearAuthParamsFromUrl();
        return returnUrl;
      }
      
      if (role === 'student' && parsedReturnUrl.hostname === studentDomain) {
        // Clear auth params before redirect
        clearAuthParamsFromUrl();
        return returnUrl;
      }
    } catch {
      // Invalid URL, fall through to default
      console.warn('Invalid return URL:', returnUrl);
    }
  }
  
  // Clear auth params before redirect
  clearAuthParamsFromUrl();
  return getRedirectUrl(role);
}

/**
 * Wait for Firebase Auth to have a current user
 */
async function waitForAuthUser(maxWaitMs: number = 5000): Promise<boolean> {
  const auth = getFirebaseAuth();
  
  console.log('waitForAuthUser - checking currentUser:', auth.currentUser?.email || 'null');
  
  // If already have user, return immediately
  if (auth.currentUser) {
    console.log('waitForAuthUser - user already exists');
    return true;
  }

  console.log('waitForAuthUser - waiting for auth state...');
  
  // Wait for auth state to be ready
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const checkUser = (): void => {
      const elapsed = Date.now() - startTime;
      
      if (auth.currentUser) {
        console.log('waitForAuthUser - user found after', elapsed, 'ms');
        resolve(true);
        return;
      }
      
      if (elapsed > maxWaitMs) {
        console.log('waitForAuthUser - timeout after', elapsed, 'ms');
        resolve(false);
        return;
      }
      
      setTimeout(checkUser, 100);
    };
    
    checkUser();
  });
}

/**
 * Redirect to appropriate app based on role
 * Uses hash fragment for token to avoid Next.js parsing issues
 * Supports return URL for post-login redirect
 */
export async function redirectByRole(role: UserRole): Promise<void> {
  // Prevent multiple redirects
  if (isRedirecting) {
    console.log('Already redirecting, skipping...');
    return;
  }
  isRedirecting = true;

  // Get redirect URL considering return URL parameter
  const baseUrl = getRedirectUrlWithReturn(role);

  try {
    // Wait for Firebase Auth to be ready
    console.log('Waiting for Firebase Auth user...');
    const hasUser = await waitForAuthUser(5000);
    
    if (!hasUser) {
      console.error('No Firebase user after waiting');
      isRedirecting = false;
      window.location.replace(baseUrl);
      return;
    }

    const auth = getFirebaseAuth();
    const user = auth.currentUser;
    
    if (!user) {
      console.error('No current user');
      isRedirecting = false;
      window.location.replace(baseUrl);
      return;
    }

    console.log('Getting ID token for user:', user.email);
    const token = await user.getIdToken(true); // Force refresh
    
    console.log('Got ID token, length:', token.length);
    
    // Use hash fragment instead of query params to avoid Next.js parsing issues
    // Hash fragments are not sent to the server, only processed client-side
    const redirectUrl = `${baseUrl}#token=${encodeURIComponent(token)}`;
    console.log('Redirecting to:', redirectUrl.substring(0, 100) + '...');
    
    // Use replace to prevent back button issues
    window.location.replace(redirectUrl);
  } catch (error) {
    console.error('Error getting ID token:', error);
    isRedirecting = false;
    window.location.replace(baseUrl);
  }
}
