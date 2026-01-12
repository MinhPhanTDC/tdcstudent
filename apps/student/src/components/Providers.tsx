'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { ToastProvider, TranslationProvider, ErrorBoundary, ErrorPage } from '@tdc/ui';
import { createQueryClientConfig } from '@tdc/firebase';
import { AuthProvider } from '@/contexts/AuthContext';
import { FirebaseProvider } from '@/providers/FirebaseProvider';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps): React.ReactElement {
  const [queryClient] = useState(
    () => new QueryClient(createQueryClientConfig())
  );

  const handleError = (error: Error): void => {
    console.error('Application error:', error);
  };

  const handleRetry = (): void => {
    window.location.reload();
  };

  return (
    <FirebaseProvider>
      <QueryClientProvider client={queryClient}>
        <TranslationProvider defaultLocale="vi">
          <AuthProvider requiredRole="student">
            <ToastProvider>
              <ErrorBoundary
                onError={handleError}
                fallback={
                  <ErrorPage
                    title="Đã xảy ra lỗi"
                    message="Rất tiếc, đã có lỗi xảy ra trong ứng dụng. Vui lòng thử lại."
                    showRetry
                    onRetry={handleRetry}
                    showHome
                    homeHref="/"
                  />
                }
              >
                {children}
              </ErrorBoundary>
            </ToastProvider>
          </AuthProvider>
        </TranslationProvider>
      </QueryClientProvider>
    </FirebaseProvider>
  );
}
