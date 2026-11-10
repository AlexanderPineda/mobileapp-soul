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
  /** Cambia el idioma de la app y el que se envía al backend. */
  setLocale: (locale: Locale) => void;
  /** Alterna entre los dos idiomas soportados (botón ES/EN). */
  toggleLocale: () => void;
  t: (key: MessageKey, params?: Record<string, string | number>) => string;
  /** Fecha larga a partir del día del centro (`YYYY-MM-DD`). */
  formatLongDate: (isoDate: string) => string;
  formatDate: (date: Date) => string;
  formatAmount: (amount: number, currency?: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

/**
 * Idioma de la app.
 *
 * El estado inicial es el del sistema (`detectDeviceLocale`), que también quedó
 * guardado en el store del cliente HTTP: la primera petición de la app ya viaja
 * con el `Accept-Language` correcto, sin esperar a un efecto.
 *
 * El idioma elegido vive solo en memoria: la app no tiene almacenamiento
 * persistente todavía. Al reabrirla vuelve al del teléfono, que es el
 * comportamiento esperado para quien tiene el sistema en su idioma.
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
