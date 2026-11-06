// ================================
// Helpers de formato (fechas, horas)
// ================================

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
  const [h, m] = hour.split(':');
  const hoursNum = Number(h);
  const period = hoursNum >= 12 ? 'PM' : 'AM';
  const displayHour = hoursNum % 12 || 12;
  return `${displayHour}:${m} ${period}`;
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
