import {
  formatDate,
  formatHour,
  formatLongDate,
  isToday,
  toISODate,
  toISOTime,
} from '../src/utils/format';

describe('toISODate', () => {
  it('formatea con ceros a la izquierda', () => {
    expect(toISODate(new Date(2026, 10, 6))).toBe('2026-11-06');
    expect(toISODate(new Date(2026, 0, 1))).toBe('2026-01-01');
  });
});

describe('toISOTime', () => {
  it('devuelve HH:MM con ceros a la izquierda', () => {
    expect(toISOTime(new Date(2026, 10, 6, 8, 5))).toBe('08:05');
    expect(toISOTime(new Date(2026, 10, 6, 20, 30))).toBe('20:30');
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

describe('isToday', () => {
  it('detecta el día actual', () => {
    expect(isToday(new Date())).toBe(true);
    expect(isToday(new Date(2020, 0, 1))).toBe(false);
  });
});
