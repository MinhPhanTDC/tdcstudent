'use client';

import { type ReactNode } from 'react';
import { ErrorBoundary, ErrorPage, TranslationProvider } from '@tdc/ui';
import { FirebaseProvider } from '@/providers/FirebaseProvider';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps): JSX.Element {
  const handleError = (error: Error): void => {
    console.error('Application error:', error);
  };

  const handleRetry = (): void => {
    window.location.reload();
  };

  return (
    <FirebaseProvider>
      <TranslationProvider defaultLocale="vi">
        <ErrorBoundary
          onError={handleError}
          fallback={
            <ErrorPage
              title="Đã xảy ra lỗi"
              message="Rất tiếc, đã có lỗi xảy ra trong ứng dụng. Vui lòng thử lại."
              showRetry
              onRetry={handleRetry}
              showHome={false}
            />
          }
        >
          {children}
        </ErrorBoundary>
      </TranslationProvider>
    </FirebaseProvider>
  );
}
