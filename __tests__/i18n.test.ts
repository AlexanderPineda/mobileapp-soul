import { api } from '../src/api/apiClient';
import {
  getRequestLocale,
  intlLocale,
  normalizeLocale,
  setRequestLocale,
} from '../src/i18n/locale';
import { messagesByLocale, translate } from '../src/i18n/messages';

describe('diccionarios', () => {
  it('tienen exactamente las mismas claves en los dos idiomas', () => {
    expect(Object.keys(messagesByLocale.en).sort()).toEqual(
      Object.keys(messagesByLocale.es).sort(),
    );
  });

  it('no dejan ninguna cadena vacía', () => {
    for (const [locale, dictionary] of Object.entries(messagesByLocale)) {
      for (const [key, text] of Object.entries(dictionary)) {
        expect(`${locale}.${key}: ${text}`).not.toMatch(/: $/);
      }
    }
  });

  it('interpola los parámetros de la plantilla', () => {
    expect(
      translate('es', 'availability.info', {
        service: 'Terapia Familiar',
        duration: 60,
        modality: 'Presencial',
      }),
    ).toBe('Servicio: Terapia Familiar · Duración: 60 min · Presencial');

    expect(
      translate('en', 'availability.info', {
        service: 'Family therapy',
        duration: 60,
        modality: 'In person',
      }),
    ).toBe('Service: Family therapy · Duration: 60 min · In person');
  });

  it('devuelve el texto del idioma pedido', () => {
    expect(translate('es', 'booking.submit')).toBe('Continuar al pago');
    expect(translate('en', 'booking.submit')).toBe('Continue to payment');
  });
});

describe('normalizeLocale', () => {
  it('reconoce el idioma por su prefijo, con guion o guion bajo', () => {
    expect(normalizeLocale('en')).toBe('en');
    expect(normalizeLocale('en-US')).toBe('en');
    expect(normalizeLocale('es_CO')).toBe('es');
    expect(normalizeLocale('ES-co')).toBe('es');
  });

  it('descarta idiomas que la app no habla', () => {
    expect(normalizeLocale('fr-FR')).toBeNull();
    expect(normalizeLocale(undefined)).toBeNull();
  });

  it('mapea al locale de Intl que usa el producto', () => {
    expect(intlLocale('es')).toBe('es-CO');
    expect(intlLocale('en')).toBe('en-US');
  });
});

describe('Accept-Language', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    setRequestLocale('es');
  });

  it('envía el idioma activo en cada petición', async () => {
    const fetchMock = jest.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve([]),
      }),
    );
    global.fetch = fetchMock as unknown as typeof fetch;

    setRequestLocale('en');
    expect(getRequestLocale()).toBe('en');

    await api.get('/public/centers');

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/public/centers'),
      expect.objectContaining({
        headers: expect.objectContaining({ 'Accept-Language': 'en' }),
      }),
    );
  });
});
