import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import {
  formatAmount as formatAmountUtil,
  formatDate as formatDateUtil,
  formatLongDate as formatLongDateUtil,
} from '../utils/format';
import { getRequestLocale, intlLocale, setRequestLocale, type Locale } from './locale';
import { translate, type MessageKey } from './messages';

interface I18nContextValue {
  locale: Locale;
  /** Changes the app language and the one sent to the backend. */
  setLocale: (locale: Locale) => void;
  /** Toggles between the two supported languages (ES/EN button). */
  toggleLocale: () => void;
  t: (key: MessageKey, params?: Record<string, string | number>) => string;
  /** Long date from the centre day (`YYYY-MM-DD`). */
  formatLongDate: (isoDate: string) => string;
  formatDate: (date: Date) => string;
  formatAmount: (amount: number, currency?: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

/**
 * App language.
 *
 * The initial state is the system one (`detectDeviceLocale`), which is also
 * stored in the HTTP client store: the first app request already travels with
 * the right `Accept-Language`, without waiting for an effect.
 *
 * The chosen language lives in memory only: the app has no persistent storage
 * yet. Reopening it goes back to the phone language, which is the expected
 * behaviour for whoever has the system in their language.
 */
export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => getRequestLocale());

  const setLocale = useCallback((next: Locale) => {
    setRequestLocale(next);
    setLocaleState(next);
  }, []);

  const value = useMemo<I18nContextValue>(() => {
    const intl = intlLocale(locale);

    return {
      locale,
      setLocale,
      toggleLocale: () => setLocale(locale === 'es' ? 'en' : 'es'),
      t: (key, params) => translate(locale, key, params),
      formatLongDate: (isoDate) => formatLongDateUtil(isoDate, intl),
      formatDate: (date) => formatDateUtil(date, intl),
      formatAmount: (amount, currency = 'COP') =>
        formatAmountUtil(amount, currency, intl),
    };
  }, [locale, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n debe usarse dentro de <I18nProvider>');
  }
  return context;
}
