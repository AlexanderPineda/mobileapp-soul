import { NativeModules } from 'react-native';

/**
 * Idiomas que entiende la app.
 *
 * Son los mismos que acepta el backend en `Accept-Language` (`src/common/i18n/
 * locales.ts` de backend-soul). Sumar un idioma exige tocar los dos diccionarios
 * de `messages.ts` y esta lista; el test de paridad falla si falta una clave.
 */
export const SUPPORTED_LOCALES = ['es', 'en'] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

/** Locale por defecto: el producto nació en español. */
export const DEFAULT_LOCALE: Locale = 'es';

/**
 * Locale BCP 47 que se le pasa a `Intl` para fechas y montos.
 *
 * `es-CO` y no `es-ES` porque el formato de fecha y el separador de miles que
 * ven los pacientes colombianos son los de `es-CO` (y coincide con el web).
 */
export function intlLocale(locale: Locale): string {
  return locale === 'en' ? 'en-US' : 'es-CO';
}

/** ¿El valor que reporta el sistema es inglés? Se compara solo el prefijo. */
export function normalizeLocale(value: string | undefined): Locale | null {
  if (!value) return null;
  const tag = value.toLowerCase();

  for (const candidate of SUPPORTED_LOCALES) {
    if (tag === candidate || tag.startsWith(`${candidate}-`) || tag.startsWith(`${candidate}_`)) {
      return candidate;
    }
  }

  // Cualquier otro idioma cae en el fallback explícito en vez de quedar sin
  // texto: el paciente ve la app en español, no en una mezcla.
  return null;
}

/**
 * Idioma del teléfono, sin dependencias nativas nuevas.
 *
 * Se intenta primero `Intl` (Hermes lo incluye en RN 0.87 en iOS y Android).
 * Si el runtime no lo expone se lee el ajuste nativo: `AppleLocale` en iOS e
 * `I18nManager.localeIdentifier` en Android. Todo va dentro de `try` porque son
 * módulos nativos y en Jest no existen.
 */
export function detectDeviceLocale(): Locale {
  const candidates: (string | undefined)[] = [];

  try {
    candidates.push(Intl.DateTimeFormat().resolvedOptions().locale);
  } catch {
    // Runtime sin Intl: se sigue con el ajuste nativo.
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
    // Sin acceso a los módulos nativos: queda el fallback.
  }

  for (const candidate of candidates) {
    const locale = normalizeLocale(candidate);
    if (locale) return locale;
  }

  return DEFAULT_LOCALE;
}

/**
 * Idioma que usa el cliente HTTP para `Accept-Language`.
 *
 * Vive fuera de React a propósito: `apiClient` lo lee en cada petición y no
 * puede depender de un hook. El provider lo mantiene sincronizado con el idioma
 * elegido, incluido el del arranque (por eso se inicializa con el del sistema:
 * la primera pantalla ya pide los datos en el idioma correcto).
 */
let requestLocale: Locale = detectDeviceLocale();

export function getRequestLocale(): Locale {
  return requestLocale;
}

export function setRequestLocale(locale: Locale): void {
  requestLocale = locale;
}
