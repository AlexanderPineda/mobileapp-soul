import type { Locale } from '../i18n/locale';
import { translate, type MessageKey } from '../i18n/messages';

/**
 * Error de la API de Soul.
 *
 * Se lanza desde `fetchJson` cuando el backend responde con un status >= 400,
 * conservando el `message` que envía NestJS (string o array del ValidationPipe).
 */
export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/** Traductor que recibe la UI para hablar el idioma activo. */
export type ErrorTranslator = (key: MessageKey) => string;

/**
 * Traductor por defecto: español.
 *
 * `getErrorMessage` se usa también fuera de React (y en los tests), así que no
 * puede depender de un hook. Las pantallas pasan el `t` de `useI18n`.
 */
const defaultTranslator: ErrorTranslator = (key) => translate('es', key);

/**
 * Traduce cualquier error a un texto mostrable al paciente.
 *
 * React Native no distingue bien los fallos de red: `fetch` rechaza con
 * "Network request failed" (Android) o "Failed to fetch" (iOS/web), y un
 * timeout del `AbortController` llega como `AbortError`. Sin esta traducción el
 * paciente ve mensajes en inglés o el literal `undefined` cuando el valor
 * lanzado no es un `Error`.
 *
 * Los estados que el backend no explica con texto propio se traducen aquí:
 * `429` (los endpoints de pago están limitados por IP) y `401`, que hoy no
 * aparecen en la app pero llegarán cuando exista identidad del paciente.
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
 * Variante con locale explícito, para código que no es React.
 * Se apoya en el mismo diccionario, así que no hay textos duplicados.
 */
export function getErrorMessageFor(
  error: unknown,
  locale: Locale,
): string {
  return getErrorMessage(error, (key) => translate(locale, key));
}

