/**
 * Helpers de formato (fechas, horas, dinero).
 *
 * Las fechas aceptan `locale` porque la app y la web comparten datos: el día del
 * centro se envía como `YYYY-MM-DD` y se formatea con `Intl`, así que el mismo
 * valor se lee "viernes, 6 de noviembre de 2026" o "Friday, November 6, 2026".
 */

export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * ¿El instante ISO ya pasó (o es justo ahora)?
 *
 * Se usa como guarda de UI: el backend ya no devuelve horarios pasados, pero el
 * listado puede quedar obsoleto si la pantalla lleva rato abierta. Un valor
 * inclasificable se considera pasado para no ofrecer una reserva inválida.
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

  // Ante un formato inesperado se devuelve el original: mejor mostrar lo que
  // llegó que inventar algo como "1:70 PM".
  if (!match) return hour;

  const hoursNum = Number(match[1]);
  const minutes = match[2];
  if (hoursNum > 23 || Number(minutes) > 59) return hour;

  const period = hoursNum >= 12 ? 'PM' : 'AM';
  const displayHour = hoursNum % 12 || 12;
  return `${displayHour}:${minutes} ${period}`;
}

/**
 * Formatea la fecha del slot (YYYY-MM-DD) como texto legible.
 * Se construye a partir de las partes UTC para evitar desfases de zona horaria.
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
 * Monto con la moneda del pago.
 *
 * El backend guarda pesos enteros (`Int` en `Payment.amount`), así que se
 * recortan los decimales: "COP 150.000" en lugar de "COP 150.000,00". Si el
 * runtime no soporta `Intl.NumberFormat` con moneda, se devuelve un formato
 * simple en vez de romper la pantalla de confirmación.
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

