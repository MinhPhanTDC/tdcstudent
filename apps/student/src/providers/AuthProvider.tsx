'use client';

import { AuthProvider as BaseAuthProvider, useAuth } from '@/contexts/AuthContext';
import { type ReactNode } from 'react';

interface StudentAuthProviderProps {
  children: ReactNode;
}

/**
 * Student-specific auth provider that requires 'student' role
 */
export function StudentAuthProvider({ children }: StudentAuthProviderProps): JSX.Element {
  return (
    <BaseAuthProvider requiredRole="student">
      {children}
    </BaseAuthProvider>
  );
}

// Re-export useAuth for convenience
export { useAuth };
