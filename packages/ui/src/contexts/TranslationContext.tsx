'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import viTranslations from '../locales/vi.json';
import enTranslations from '../locales/en.json';

type Locale = 'vi' | 'en';
type TranslationData = typeof viTranslations;

interface TranslationContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const translations: Record<Locale, TranslationData> = {
  vi: viTranslations,
  en: enTranslations,
};

const TranslationContext = createContext<TranslationContextValue | null>(null);

interface TranslationProviderProps {
  children: ReactNode;
  defaultLocale?: Locale;
}

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj: Record<string, unknown>, path: string): string | undefined {
  const keys = path.split('.');
  let current: unknown = obj;

  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }

  return typeof current === 'string' ? current : undefined;
}

/**
 * Replace template params in string
 */
function replaceParams(str: string, params: Record<string, string | number>): string {
  return str.replace(/\{(\w+)\}/g, (_, key) => String(params[key] ?? `{${key}}`));
}

export function TranslationProvider({
  children,
  defaultLocale = 'vi',
}: TranslationProviderProps): JSX.Element {
  const [locale, setLocale] = useState<Locale>(() => {
    // Try to get from browser
    if (typeof window !== 'undefined') {
      const browserLang = navigator.language.split('-')[0];
      if (browserLang === 'en' || browserLang === 'vi') {
        return browserLang;
      }
    }
    return defaultLocale;
  });

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const translation = getNestedValue(
        translations[locale] as unknown as Record<string, unknown>,
        key
      );

      if (!translation) {
        console.warn(`Translation missing for key: ${key}`);
        return key;
      }

      if (params) {
        return replaceParams(translation, params);
      }

      return translation;
    },
    [locale]
  );

  return (
    <TranslationContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </TranslationContext.Provider>
  );
}

/**
 * Hook to access translation functions
 */
export function useTranslation(): TranslationContextValue {
  const context = useContext(TranslationContext);

  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }

  return context;
}
