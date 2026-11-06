// ================================
// Helpers de formato (fechas, horas)
// ================================

export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function toISOTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Construye el instante UTC ISO 8601 que corresponde a una hora de pared
 * (hora local del centro) en una fecha concreta.
 *
 * El backend interpreta y compara los horarios de disponibilidad con la hora
 * local del servidor (ver `formatHHMM` en `availability.service.ts`), por lo
 * que hay que enviar el instante UTC que representa esa hora de pared en la
 * zona horaria del servidor.
 *
 * @param date        Fecha del slot (se usa su parte UTC, que corresponde
 *                    exactamente al día elegido en el calendario).
 * @param hour        Hora de pared en formato 'HH:MM'.
 * @param offsetMinutes Desplazamiento de la zona horaria del servidor respecto
 *                    a UTC, en minutos con signo (ej. -300 para UTC-5).
 *
 * Ejemplo (UTC-5): 22/10/2026 09:00 -> 2026-10-22T14:00:00.000Z
 */
export function toISODateTime(
  date: Date,
  hour: string,
  offsetMinutes = 0,
): string {
  const [hours, minutes] = hour.split(':');

  // Medianoche UTC del día elegido: Date.UTC ignora la zona horaria local.
  const dayStartUtc = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
  );

  const wallClockUtc =
    dayStartUtc + Number(hours) * 60 * 60_000 + Number(minutes) * 60_000;

  // La hora de pared está expresada en la zona del servidor, así que se
  // descuenta el offset para obtener el instante UTC real.
  const instant = wallClockUtc - offsetMinutes * 60_000;

  return new Date(instant).toISOString();
}

/** Alias de `toISODateTime` usado en la pantalla de reserva. */
export const buildISODateTime = toISODateTime;

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

export function isToday(date: Date): boolean {
  const today = new Date();
  return toISODate(date) === toISODate(today);
}
