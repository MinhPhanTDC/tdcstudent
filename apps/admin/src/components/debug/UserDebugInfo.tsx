'use client';

import { useState } from 'react';
import { getFirebaseAuth } from '@tdc/firebase';

/**
 * UserDebugInfo - Debug component to show current user info and claims
 * Only visible in development or when explicitly enabled
 */
export function UserDebugInfo(): JSX.Element | null {
  const [isExpanded, setIsExpanded] = useState(false);
  const [claims, setClaims] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  const loadUserInfo = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const auth = getFirebaseAuth();
      const currentUser = auth.currentUser;
      if (currentUser) {
        setUserEmail(currentUser.email);
        const idTokenResult = await currentUser.getIdTokenResult(true); // Force refresh
        setClaims(idTokenResult.claims);
      }
    } catch (error) {
      console.error('Failed to load user info:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <div className="rounded-lg border border-yellow-300 bg-yellow-50 shadow-lg">
        <button
          onClick={() => {
            setIsExpanded(!isExpanded);
            if (!isExpanded && !claims) {
              loadUserInfo();
            }
          }}
          className="flex w-full items-center justify-between p-3 text-left"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">🐛</span>
            <span className="text-sm font-medium text-yellow-900">Debug Info</span>
          </div>
          <svg
            className={`h-5 w-5 text-yellow-700 transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isExpanded && (
          <div className="border-t border-yellow-300 p-3 text-xs">
            <div className="space-y-2">
              {userEmail && (
                <div>
                  <span className="font-medium text-yellow-900">Email:</span>
                  <span className="ml-2 text-yellow-800">{userEmail}</span>
                </div>
              )}

              <div className="border-t border-yellow-300 pt-2">
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-medium text-yellow-900">Custom Claims:</span>
                  <button
                    onClick={loadUserInfo}
                    disabled={isLoading}
                    className="text-yellow-700 hover:text-yellow-900"
                  >
                    {isLoading ? '⏳' : '🔄'}
                  </button>
                </div>
                {claims ? (
                  <pre className="mt-1 max-h-40 overflow-auto rounded bg-yellow-100 p-2 text-xs">
                    {JSON.stringify(claims, null, 2)}
                  </pre>
                ) : (
                  <div className="text-yellow-700">Click refresh to load claims</div>
                )}
              </div>

              {claims && !claims.role && (
                <div className="rounded bg-red-100 p-2 text-red-800">
                  ⚠️ No role in custom claims! Run: <br />
                  <code className="text-xs">node scripts/setup-custom-claims.js</code>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
