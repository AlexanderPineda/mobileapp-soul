import { buildGoogleCalendarUrl } from '../src/utils/googleCalendar';

describe('buildGoogleCalendarUrl', () => {
  it('convierte los instantes ISO a formato UTC de Google', () => {
    const url = buildGoogleCalendarUrl({
      title: 'Terapia Familiar',
      startTime: '2026-11-06T13:00:00.000Z',
      endTime: '2026-11-06T14:00:00.000Z',
    });

    expect(url).toContain('action=TEMPLATE');
    expect(url).toContain('dates=20261106T130000Z/20261106T140000Z');
  });

  it('codifica título, descripción y ubicación', () => {
    const url = buildGoogleCalendarUrl({
      title: 'Sesión de prueba',
      startTime: '2026-11-06T13:00:00.000Z',
      endTime: '2026-11-06T14:00:00.000Z',
      description: 'Paciente: Ana Ruiz',
      location: 'Sede Norte, Calle 1 #2-3',
    });

    expect(url).toContain('text=Sesi%C3%B3n%20de%20prueba');
    expect(url).toContain('details=Paciente%3A%20Ana%20Ruiz');
    expect(url).toContain('location=Sede%20Norte%2C%20Calle%201%20%232-3');
  });

  it('omite los parámetros opcionales cuando no se envían', () => {
    const url = buildGoogleCalendarUrl({
      title: 'Terapia Familiar',
      startTime: '2026-11-06T13:00:00.000Z',
      endTime: '2026-11-06T14:00:00.000Z',
    });

    expect(url).not.toContain('details=');
    expect(url).not.toContain('location=');
  });
});
