'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { ToastProvider } from '@tdc/ui';
import { AuthProvider } from '@/contexts/AuthContext';
import { FirebaseProvider } from '@/providers/FirebaseProvider';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps): JSX.Element {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            retry: 1,
          },
        },
      })
  );

  return (
    <FirebaseProvider>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <AuthProvider requiredRole="admin">{children}</AuthProvider>
        </ToastProvider>
      </QueryClientProvider>
    </FirebaseProvider>
  );
}
