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
    // (same heuristic as `/agendar`, kept only for a catalogue without the
    // duration/modality columns).
    expect(option.durationMinutes).toBe(45);
    expect(option.modality).toBe('VIRTUAL');
  });

  it('toma duración y modalidad del catálogo, no del nombre', () => {
    const [option] = toServiceOptions([
      {
        id: 's5',
        name: 'Terapia online para expatriados',
        price: 150000,
        currency: 'COP',
        durationMinutes: 50,
        modality: 'VIRTUAL',
      },
    ]);

    // The dashboard decides: a new service arrives with its own values even
    // though the name is not in `SERVICE_RULES`.
    expect(option.durationMinutes).toBe(50);
    expect(option.modality).toBe('VIRTUAL');
  });

  it('el catálogo manda sobre la tabla heredada', () => {
    const [option] = toServiceOptions([
      {
        id: 's6',
        name: 'Terapia Familiar',
        price: 160000,
        currency: 'COP',
        durationMinutes: 90,
        modality: 'VIRTUAL',
      },
    ]);

    expect(option.durationMinutes).toBe(90);
    expect(option.modality).toBe('VIRTUAL');
  });

  it('cae en presencial cuando ni el catálogo ni el nombre lo aclaran', () => {
    const [option] = toServiceOptions([
      { id: 's4', name: 'Terapia online', price: 90000, currency: 'COP' },
    ]);

    // Legacy fallback only: the dashboard value is what counts, and this
    // payload does not carry one.
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
