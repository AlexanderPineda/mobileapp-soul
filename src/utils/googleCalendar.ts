/**
 * Utilidad para generar enlaces "Agregar a Google Calendar".
 * Usa la URL pública de Google Calendar (action=TEMPLATE), sin OAuth.
 * Referencia: https://calendar.google.com/calendar/render?action=TEMPLATE
 */

export interface GoogleCalendarEventInput {
  /** Título del evento */
  title: string;
  /** Fecha/hora de inicio en formato ISO 8601 */
  startTime: string;
  /** Fecha/hora de fin en formato ISO 8601 */
  endTime: string;
  /** Detalle/descripción del evento */
  description?: string;
  /** Ubicación (no usar para sesiones virtuales) */
  location?: string;
}

/**
 * Convierte una fecha ISO a formato UTC de Google: yyyyMMddTHHmmssZ
 * Ejemplo: 2026-10-20T15:30:00.000Z -> 20261020T153000Z
 */
function toGoogleUtcDate(isoDate: string): string {
  return new Date(isoDate)
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');
}

/**
 * Construye la URL de Google Calendar con el evento prellenado.
 */
export function buildGoogleCalendarUrl(event: GoogleCalendarEventInput): string {
  const params: string[] = [
    'action=TEMPLATE',
    `text=${encodeURIComponent(event.title)}`,
    `dates=${toGoogleUtcDate(event.startTime)}/${toGoogleUtcDate(event.endTime)}`,
  ];

  if (event.description) {
    params.push(`details=${encodeURIComponent(event.description)}`);
  }
  if (event.location) {
    params.push(`location=${encodeURIComponent(event.location)}`);
  }

  return `https://calendar.google.com/calendar/render?${params.join('&')}`;
}