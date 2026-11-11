/**
 * Validation and normalisation of the patient data.
 *
 * Centralised here so it can be tested and so the email always goes out in the
 * same format: the backend looks the patient up by exact email, so `Juan@X.com`
 * and `juan@x.com` must arrive as a single value.
 */

/** No spaces, a single at sign and an alphabetic TLD of 2 or more letters. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

/** Between 7 and 15 digits, the E.164 range. */
const MIN_PHONE_DIGITS = 7;
const MAX_PHONE_DIGITS = 15;

/** Normalises an email to send and compare it: no spaces, lowercase. */
export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(normalizeEmail(value));
}

/**
 * Validates a phone already normalised to digits.
 * It accepts the usual separators (`+57 300 123-4567`, `(601) 555 0000`).
 */
export function isValidPhone(value: string): boolean {
  const digits = value.replace(/\D/g, '');
  return digits.length >= MIN_PHONE_DIGITS && digits.length <= MAX_PHONE_DIGITS;
}
