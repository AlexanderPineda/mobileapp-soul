import { toServiceOptions } from '../src/utils/service-catalog';

/**
 * The catalogue is the only source of names and prices: the backend charges by
 * looking the name up in `Service` and answers 400 when it does not exist. These
 * tests pin that the app does not invent a service again.
 */
describe('toServiceOptions', () => {
  it('copia nombre, precio y moneda del catálogo', () => {
    const options = toServiceOptions([
      { id: 's1', name: 'Terapia Familiar', price: 160000, currency: 'COP' },
    ]);

    expect(options).toEqual([
      {
        value: 'Terapia Familiar',
        label: 'Terapia Familiar',
        durationMinutes: 60,
        modality: 'PRESENCIAL',
        price: 160000,
        currency: 'COP',
      },
    ]);
  });

  it('resuelve un servicio nuevo con la heurística de la web', () => {
    const [option] = toServiceOptions([
      { id: 's2', name: 'Terapia virtual breve', price: 90000, currency: 'COP' },
    ]);

    // Not in the rules: 45 minutes and virtual because the name says so
    // (same heuristic as `isVirtualService` on `/agendar`).
    expect(option.durationMinutes).toBe(45);
    expect(option.modality).toBe('VIRTUAL');
  });

  it('cae en presencial cuando el nombre no lo aclara', () => {
    // Known limit: the heuristic only understands "virtual". A service
    // named "Terapia online" would be treated as on-site until `Service`
    // stores the modality (item 6 of the backend backlog).
    const [option] = toServiceOptions([
      { id: 's4', name: 'Terapia online', price: 90000, currency: 'COP' },
    ]);

    expect(option.modality).toBe('PRESENCIAL');
  });

  it('no ofrece servicios cuando el catálogo viene vacío', () => {
    expect(toServiceOptions([])).toEqual([]);
  });

  it('usa el nombre del servicio como valor, sin normalizarlo', () => {
    const [option] = toServiceOptions([
      { id: 's3', name: 'Psicoterapia virtual internacional', price: 50, currency: 'USD' },
    ]);

    // Any transformation here (lowercase, trim) would make the backend miss
    // the service and the payment would fail with 400.
    expect(option.value).toBe('Psicoterapia virtual internacional');
    expect(option.currency).toBe('USD');
  });
});
