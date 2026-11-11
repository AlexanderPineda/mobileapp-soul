/**
 * Helper to build "Add to Google Calendar" links.
 * It uses the public Google Calendar URL (action=TEMPLATE), no OAuth.
 * Reference: https://calendar.google.com/calendar/render?action=TEMPLATE
 */

export interface GoogleCalendarEventInput {
  /** Event title */
  title: string;
  /** Start date/time in ISO 8601 format */
  startTime: string;
  /** End date/time in ISO 8601 format */
  endTime: string;
  /** Event details/description */
  description?: string;
  /** Location (do not use for virtual sessions) */
  location?: string;
}

/**
 * Converts an ISO date to the Google UTC format: yyyyMMddTHHmmssZ
 * Example: 2026-10-20T15:30:00.000Z -> 20261020T153000Z
 */
function toGoogleUtcDate(isoDate: string): string {
  return new Date(isoDate)
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');
}

/**
 * Builds the Google Calendar URL with the event pre-filled.
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