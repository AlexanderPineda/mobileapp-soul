import { NativeModules } from 'react-native';

/**
 * Languages the app understands.
 *
 * The same ones the backend accepts in `Accept-Language`
 * (`src/common/i18n/locales.ts` in backend-soul). Adding a language means
 * touching both dictionaries in `messages.ts` and this list; the parity test
 * fails when a key is missing.
 */
export const SUPPORTED_LOCALES = ['es', 'en'] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

/** Default locale: the product was born in Spanish. */
export const DEFAULT_LOCALE: Locale = 'es';

/**
 * BCP 47 locale passed to `Intl` for dates and amounts.
 *
 * `es-CO` and not `es-ES` because the date format and thousands separator
 * Colombian patients see are the `es-CO` ones (and it matches the web).
 */
export function intlLocale(locale: Locale): string {
  return locale === 'en' ? 'en-US' : 'es-CO';
}

/** Is the value reported by the system English? Only the prefix is compared. */
export function normalizeLocale(value: string | undefined): Locale | null {
  if (!value) return null;
  const tag = value.toLowerCase();

  for (const candidate of SUPPORTED_LOCALES) {
    if (tag === candidate || tag.startsWith(`${candidate}-`) || tag.startsWith(`${candidate}_`)) {
      return candidate;
    }
  }

  // Any other language falls into the explicit fallback instead of being left
  // without text: the patient sees the app in Spanish, not in a mixture.
  return null;
}

/**
 * Phone language, without new native dependencies.
 *
 * `Intl` is tried first (Hermes ships it in RN 0.87 on iOS and Android). If the
 * runtime does not expose it, the native setting is read: `AppleLocale` on iOS
 * and `I18nManager.localeIdentifier` on Android. Everything sits inside a `try`
 * because they are native modules and do not exist in Jest.
 */
export function detectDeviceLocale(): Locale {
  const candidates: (string | undefined)[] = [];

  try {
    candidates.push(Intl.DateTimeFormat().resolvedOptions().locale);
  } catch {
    // Runtime without Intl: it continues with the native setting.
  }

  try {
    const settingsManager = NativeModules.SettingsManager as
      | { settings?: { AppleLocale?: string; AppleLanguages?: string[] } }
      | undefined;
    candidates.push(
      settingsManager?.settings?.AppleLocale ??
        settingsManager?.settings?.AppleLanguages?.[0],
    );

    const i18nManager = NativeModules.I18nManager as
      | { localeIdentifier?: string }
      | undefined;
    candidates.push(i18nManager?.localeIdentifier);
  } catch {
    // No access to the native modules: the fallback remains.
  }

  for (const candidate of candidates) {
    const locale = normalizeLocale(candidate);
    if (locale) return locale;
  }

  return DEFAULT_LOCALE;
}

/**
 * Language the HTTP client uses for `Accept-Language`.
 *
 * It lives outside React on purpose: `apiClient` reads it on every request and
 * cannot depend on a hook. The provider keeps it in sync with the chosen
 * language, including the startup one (that is why it is initialised with the
 * system one: the first screen already requests data in the right language).
 */
let requestLocale: Locale = detectDeviceLocale();

export function getRequestLocale(): Locale {
  return requestLocale;
}

export function setRequestLocale(locale: Locale): void {
  requestLocale = locale;
}
