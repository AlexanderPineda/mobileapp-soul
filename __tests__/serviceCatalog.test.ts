import { toServiceOptions } from '../src/utils/service-catalog';

/**
 * El catálogo es la única fuente de nombres y precios: el backend cobra buscando
 * el nombre en `Service` y responde 400 si no existe. Estos tests fijan que la
 * app no vuelva a inventarse un servicio.
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

    // No está en las reglas: 45 minutos y virtual porque el nombre lo dice
    // (misma heurística que `isVirtualService` en `/agendar`).
    expect(option.durationMinutes).toBe(45);
    expect(option.modality).toBe('VIRTUAL');
  });

  it('cae en presencial cuando el nombre no lo aclara', () => {
    // Límite conocido: la heurística solo entiende "virtual". Un servicio
    // llamado "Terapia online" se trataría como presencial hasta que `Service`
    // guarde la modalidad (ítem 6 del backlog del backend).
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

    // Cualquier transformación aquí (minúsculas, trim) haría que el backend no
    // encuentre el servicio y el pago fallara con 400.
    expect(option.value).toBe('Psicoterapia virtual internacional');
    expect(option.currency).toBe('USD');
  });
});
