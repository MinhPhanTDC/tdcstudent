'use client';

import { AuthProvider as BaseAuthProvider, useAuth } from '@/contexts/AuthContext';
import { type ReactNode } from 'react';

interface AdminAuthProviderProps {
  children: ReactNode;
}

/**
 * Admin-specific auth provider that requires 'admin' role
 */
export function AdminAuthProvider({ children }: AdminAuthProviderProps): JSX.Element {
  return (
    <BaseAuthProvider requiredRole="admin">
      {children}
    </BaseAuthProvider>
  );
}

// Re-export useAuth for convenience
export { useAuth };
