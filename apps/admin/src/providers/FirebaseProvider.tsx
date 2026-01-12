'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { initializeFirebase, onAuthChange } from '@tdc/firebase';

interface FirebaseProviderProps {
  children: ReactNode;
}

/**
 * Check if URL has token in hash fragment (for cross-domain auth)
 */
function hasTokenInUrl(): boolean {
  if (typeof window === 'undefined') return false;
  const hash = window.location.hash;
  return hash.includes('token=');
}

/**
 * Firebase Provider - initializes Firebase with env vars from Next.js
 * This ensures env vars are read at runtime in the browser
 * Also waits for auth state to be restored before rendering children
 */
export function FirebaseProvider({ children }: FirebaseProviderProps): JSX.Element {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Read env vars at runtime (Next.js replaces these during build)
      const config = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      };

      // Validate required fields
      if (!config.apiKey || !config.authDomain || !config.projectId) {
        throw new Error(
          'Missing Firebase configuration. Check your .env.local file.'
        );
      }

      initializeFirebase(config);

      // If there's a token in URL, skip waiting for auth state
      // The AuthProvider will handle token exchange
      if (hasTokenInUrl()) {
        console.log('Token in URL detected, skipping auth state wait');
        setIsReady(true);
        return;
      }

      // Wait for auth state to be determined (restored from persistence)
      const unsubscribe = onAuthChange(() => {
        // Auth state has been determined (either user is logged in or not)
        console.log('Firebase auth state restored');
        setIsReady(true);
        unsubscribe();
      });

      // Cleanup in case component unmounts before auth state is determined
      return () => unsubscribe();
    } catch (err) {
      console.error('Firebase initialization error:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize Firebase');
    }
  }, []);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="rounded-lg bg-red-50 p-6 text-center">
          <h2 className="text-lg font-semibold text-red-800">Configuration Error</h2>
          <p className="mt-2 text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
