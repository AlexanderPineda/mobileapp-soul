/**
 * Validación y normalización de los datos del paciente.
 *
 * Centralizado aquí para poder probarlo y para que el correo se envíe siempre
 * en el mismo formato: el backend busca al paciente por email exacto, así que
 * `Juan@X.com` y `juan@x.com` deben llegar como un único valor.
 */

/** Sin espacios, una sola arroba y un TLD alfabético de 2 o más letras. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

/** Entre 7 y 15 dígitos, el rango de E.164. */
const MIN_PHONE_DIGITS = 7;
const MAX_PHONE_DIGITS = 15;

/** Normaliza un correo para enviarlo y compararlo: sin espacios y en minúsculas. */
export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(normalizeEmail(value));
}

/**
 * Valida un teléfono ya normalizado a dígitos.
 * Acepta separadores habituales (`+57 300 123-4567`, `(601) 555 0000`).
 */
export function isValidPhone(value: string): boolean {
  const digits = value.replace(/\D/g, '');
  return digits.length >= MIN_PHONE_DIGITS && digits.length <= MAX_PHONE_DIGITS;
}
