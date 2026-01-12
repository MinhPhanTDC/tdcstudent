'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { ToastProvider, TranslationProvider } from '@tdc/ui';
import { AuthProvider } from '@/contexts/AuthContext';
import { FirebaseProvider } from '@/providers/FirebaseProvider';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps): React.ReactElement {
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
        <TranslationProvider defaultLocale="vi">
          <AuthProvider requiredRole="student">
            <ToastProvider>{children}</ToastProvider>
          </AuthProvider>
        </TranslationProvider>
      </QueryClientProvider>
    </FirebaseProvider>
  );
}
