/**
 * Type-safe environment variable access
 * Use this instead of accessing process.env directly
 */

// Firebase config
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? '',
} as const;

// App URLs with defaults
export const appUrls = {
  auth: process.env.NEXT_PUBLIC_AUTH_URL ?? 'http://localhost:3000',
  admin: process.env.NEXT_PUBLIC_ADMIN_URL ?? 'http://localhost:3001',
  student: process.env.NEXT_PUBLIC_STUDENT_URL ?? 'http://localhost:3002',
} as const;

// Check if running in development
export const isDev = process.env.NODE_ENV === 'development';
export const isProd = process.env.NODE_ENV === 'production';

// Check if using emulator
export const useEmulator = process.env.NEXT_PUBLIC_USE_EMULATOR === 'true';

/**
 * Validate that required env vars are set
 * Call this at app startup
 */
export function validateEnvRuntime(): void {
  const required = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0 && isProd) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
        'Please check your deployment configuration.'
    );
  }

  if (missing.length > 0 && isDev) {
    console.warn(
      `⚠️ Missing environment variables: ${missing.join(', ')}\n` +
        'Copy .env.example to .env.local and fill in your values.'
    );
  }
}
