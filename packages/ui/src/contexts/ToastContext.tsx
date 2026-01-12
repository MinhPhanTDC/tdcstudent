'use client';

import React, {
  createContext,
  useContext,
  useCallback,
  useState,
  type ReactNode,
} from 'react';
import { Toast, type ToastProps } from '../components/Toast';

type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info';

interface ToastItem extends Omit<ToastProps, 'onDismiss'> {
  id: string;
}

interface ToastContextValue {
  /** Show a toast notification */
  toast: (message: string, variant?: ToastVariant, duration?: number) => void;
  /** Show a success toast */
  success: (message: string, duration?: number) => void;
  /** Show an error toast */
  error: (message: string, duration?: number) => void;
  /** Show a warning toast */
  warning: (message: string, duration?: number) => void;
  /** Show an info toast */
  info: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export interface ToastProviderProps {
  children: ReactNode;
  /** Maximum number of toasts to show at once */
  maxToasts?: number;
  /** Default duration for toasts in ms */
  defaultDuration?: number;
}

/**
 * Toast provider component for global toast notifications
 * Requirements: 8.3, 8.4
 */
export function ToastProvider({
  children,
  maxToasts = 5,
  defaultDuration = 5000,
}: ToastProviderProps): React.ReactElement {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, variant: ToastVariant = 'default', duration?: number) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
      const newToast: ToastItem = {
        id,
        message,
        variant,
        duration: duration ?? defaultDuration,
      };

      setToasts((prev) => {
        const updated = [...prev, newToast];
        // Remove oldest toasts if exceeding max
        if (updated.length > maxToasts) {
          return updated.slice(-maxToasts);
        }
        return updated;
      });
    },
    [defaultDuration, maxToasts]
  );

  const toast = useCallback(
    (message: string, variant?: ToastVariant, duration?: number) => {
      addToast(message, variant, duration);
    },
    [addToast]
  );

  const success = useCallback(
    (message: string, duration?: number) => {
      addToast(message, 'success', duration);
    },
    [addToast]
  );

  const error = useCallback(
    (message: string, duration?: number) => {
      addToast(message, 'error', duration);
    },
    [addToast]
  );

  const warning = useCallback(
    (message: string, duration?: number) => {
      addToast(message, 'warning', duration);
    },
    [addToast]
  );

  const info = useCallback(
    (message: string, duration?: number) => {
      addToast(message, 'info', duration);
    },
    [addToast]
  );

  const value: ToastContextValue = {
    toast,
    success,
    error,
    warning,
    info,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast container */}
      <div
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none"
        aria-live="polite"
        aria-label="Notifications"
      >
        {toasts.map((t) => (
          <Toast
            key={t.id}
            message={t.message}
            variant={t.variant}
            duration={t.duration}
            onDismiss={() => removeToast(t.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/**
 * Hook to use toast notifications
 * Requirements: 8.3, 8.4
 */
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
