import {
  formatDate,
  formatHour,
  formatLongDate,
  hasStarted,
  toISODate,
} from '../src/utils/format';

describe('toISODate', () => {
  it('formatea con ceros a la izquierda', () => {
    expect(toISODate(new Date(2026, 10, 6))).toBe('2026-11-06');
    expect(toISODate(new Date(2026, 0, 1))).toBe('2026-01-01');
  });
});

describe('formatHour', () => {
  it('convierte de 24 horas a 12 horas con AM/PM', () => {
    expect(formatHour('08:00')).toBe('8:00 AM');
    expect(formatHour('00:00')).toBe('12:00 AM');
    expect(formatHour('12:05')).toBe('12:05 PM');
    expect(formatHour('13:30')).toBe('1:30 PM');
    expect(formatHour('21:00')).toBe('9:00 PM');
  });

  it('devuelve el valor original si la hora no es válida', () => {
    // Antes se pintaba "1:70 PM" o "NaN:undefined AM".
    expect(formatHour('25:70')).toBe('25:70');
    expect(formatHour('24:00')).toBe('24:00');
    expect(formatHour('sin-hora')).toBe('sin-hora');
    expect(formatHour('')).toBe('');
  });
});

describe('formatLongDate', () => {
  it('formatea una fecha ISO sin desfase de zona horaria', () => {
    expect(formatLongDate('2026-11-06')).toBe(
      'viernes, 6 de noviembre de 2026',
    );
    expect(formatLongDate('2026-01-01')).toBe('jueves, 1 de enero de 2026');
  });
});

describe('formatDate', () => {
  it('usa el formato corto', () => {
    expect(formatDate(new Date(2026, 10, 6))).toBe('vie, 6 nov 2026');
  });
});

describe('hasStarted', () => {
  const now = new Date('2026-11-06T15:00:00.000Z');

  it('marca como pasados los instantes anteriores o iguales a ahora', () => {
    expect(hasStarted('2026-11-06T14:59:00.000Z', now)).toBe(true);
    expect(hasStarted('2026-11-06T15:00:00.000Z', now)).toBe(true);
  });

  it('deja pasar los instantes futuros', () => {
    expect(hasStarted('2026-11-06T15:01:00.000Z', now)).toBe(false);
  });

  it('considera pasado un valor que no se puede interpretar', () => {
    expect(hasStarted('no es una fecha', now)).toBe(true);
  });
});
