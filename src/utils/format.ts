/**
 * Formatting helpers (dates, times, money).
 *
 * Dates accept `locale` because the app and the web share data: the centre day is
 * sent as `YYYY-MM-DD` and formatted with `Intl`, so the same value reads
 * "Friday, 6 November 2026" or "viernes, 6 de noviembre de 2026".
 */

export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Has the ISO instant already passed (or is it right now)?
 *
 * Used as a UI guard: the backend no longer returns past slots, but the list can
 * go stale when the screen has been open for a while. An unclassifiable value
 * counts as past, so no invalid booking is offered.
 */
export function hasStarted(
  isoDateTime: string,
  now: Date = new Date(),
): boolean {
  const start = new Date(isoDateTime).getTime();
  if (Number.isNaN(start)) return true;
  return start <= now.getTime();
}

export function formatHour(hour: string): string {
  const match = /^(\d{1,2}):(\d{2})$/.exec(hour.trim());

  // On an unexpected format the original is returned: better to show what
  // arrived than to invent something like "1:70 PM".
  if (!match) return hour;

  const hoursNum = Number(match[1]);
  const minutes = match[2];
  if (hoursNum > 23 || Number(minutes) > 59) return hour;

  const period = hoursNum >= 12 ? 'PM' : 'AM';
  const displayHour = hoursNum % 12 || 12;
  return `${displayHour}:${minutes} ${period}`;
}

/**
 * Formats the slot date (YYYY-MM-DD) as readable text.
 * It is built from the UTC parts to avoid time-zone shifts.
 */
export function formatLongDate(isoDate: string, locale = 'es-CO'): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.toLocaleDateString(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export function formatDate(date: Date, locale = 'es-CO'): string {
  return date.toLocaleDateString(locale, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Amount with the payment currency.
 *
 * The backend stores whole pesos (`Int` in `Payment.amount`), so decimals are
 * trimmed: "COP 150.000" instead of "COP 150.000,00". If the runtime does not
 * support `Intl.NumberFormat` with a currency, a simple format is returned
 * instead of breaking the confirmation screen.
 */
export function formatAmount(
  amount: number,
  currency = 'COP',
  locale = 'es-CO',
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
}

