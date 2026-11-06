import {
  isValidEmail,
  isValidPhone,
  normalizeEmail,
} from '../src/utils/validation';

describe('normalizeEmail', () => {
  it('quita espacios y pasa a minúsculas', () => {
    expect(normalizeEmail('  Juan.Perez@Soul.COM ')).toBe('juan.perez@soul.com');
    expect(normalizeEmail('ana@x.co')).toBe('ana@x.co');
  });

  it('converge los distintos formatos al mismo valor', () => {
    // El backend identifica al paciente por email exacto: estas dos entradas
    // deben producir el mismo registro.
    expect(normalizeEmail('Ana@Soul.com')).toBe(normalizeEmail(' ana@soul.COM'));
  });
});

describe('isValidEmail', () => {
  it.each([
    'ana@x.co',
    'juan.perez@clinica-soul.com',
    'nombre+etiqueta@dominio.org',
  ])('acepta %s', (value) => {
    expect(isValidEmail(value)).toBe(true);
  });

  it.each([
    '',
    '   ',
    'ana',
    'ana@',
    'ana@soul',
    'ana@.com',
    'ana soul@x.com',
    'ana@@x.com',
    'ana@x.c',
  ])('rechaza %s', (value) => {
    expect(isValidEmail(value)).toBe(false);
  });

  it('ignora mayúsculas y espacios alrededor', () => {
    expect(isValidEmail('  ANA@Soul.COM ')).toBe(true);
  });
});

describe('isValidPhone', () => {
  it('acepta números con separadores habituales', () => {
    expect(isValidPhone('3001234567')).toBe(true);
    expect(isValidPhone('+57 300 123-4567')).toBe(true);
    expect(isValidPhone('(601) 555 0000')).toBe(true);
  });

  it('rechaza números demasiado cortos o largos', () => {
    expect(isValidPhone('12345')).toBe(false);
    expect(isValidPhone('1234567890123456')).toBe(false);
    expect(isValidPhone('')).toBe(false);
    expect(isValidPhone('solo texto')).toBe(false);
  });
});
