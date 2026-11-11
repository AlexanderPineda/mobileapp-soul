import type { Locale } from '../i18n/locale';
import { translate, type MessageKey } from '../i18n/messages';

/**
 * Soul API error.
 *
 * Thrown by `fetchJson` when the backend answers with a status >= 400, keeping
 * the `message` NestJS sends (a string or a ValidationPipe array).
 */
export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/** Translator the UI receives to speak the active language. */
export type ErrorTranslator = (key: MessageKey) => string;

/**
 * Default translator: Spanish.
 *
 * `getErrorMessage` is also used outside React (and in the tests), so it cannot
 * depend on a hook. The screens pass the `t` from `useI18n`.
 */
const defaultTranslator: ErrorTranslator = (key) => translate('es', key);

/**
 * Translates any error into text that can be shown to the patient.
 *
 * React Native does not tell network failures apart well: `fetch` rejects with
 * "Network request failed" (Android) or "Failed to fetch" (iOS/web), and an
 * `AbortController` timeout arrives as `AbortError`. Without this translation the
 * patient sees English messages, or the literal `undefined` when the thrown
 * value is not an `Error`.
 *
 * The statuses the backend does not explain with its own copy are translated
 * here: `429` (payment endpoints are rate-limited per IP) and `401`, which do not
 * show up in the app today but will once patient identity exists.
 */
export function getErrorMessage(
  error: unknown,
  t: ErrorTranslator = defaultTranslator,
): string {
  if (error instanceof ApiError) {
    if (error.status === 429) return t('errors.tooManyRequests');
    if (error.status === 401) return t('errors.unauthorized');
    return error.message;
  }

  if (error instanceof Error) {
    if (error.name === 'AbortError') {
      return t('errors.timeout');
    }
    if (
      error.message === 'Network request failed' ||
      error.message === 'Failed to fetch'
    ) {
      return t('errors.network');
    }
    return error.message || t('errors.unexpected');
  }

  return t('errors.unexpected');
}

/**
 * Variant with an explicit locale, for non-React code.
 * It relies on the same dictionary, so there are no duplicated texts.
 */
export function getErrorMessageFor(
  error: unknown,
  locale: Locale,
): string {
  return getErrorMessage(error, (key) => translate(locale, key));
}

