import type {
  AvailabilityModality,
  CatalogService,
  ServiceTypeOption,
} from '../types';

/**
 * What the catalogue does not send, for the services the product shipped with.
 *
 * `Service` now stores `durationMinutes` and `modality` (set from the dashboard),
 * so this table only covers a backend that has not deployed that change yet;
 * the value from the API always wins.
 */
const SERVICE_RULES: Record<
  string,
  { durationMinutes: number; modality: AvailabilityModality }
> = {
  'Terapia Familiar': { durationMinutes: 60, modality: 'PRESENCIAL' },
  'Terapia de pareja': { durationMinutes: 60, modality: 'PRESENCIAL' },
  'Valoracion inicial': { durationMinutes: 90, modality: 'PRESENCIAL' },
  'Valoración inicial': { durationMinutes: 90, modality: 'PRESENCIAL' },
  'Terapia individual virtual': { durationMinutes: 45, modality: 'VIRTUAL' },
  'Terapia individual presencial': { durationMinutes: 45, modality: 'PRESENCIAL' },
  'Psicoterapia virtual internacional': {
    durationMinutes: 45,
    modality: 'VIRTUAL',
  },
};

/** Default duration when neither the API nor the table has a value. */
const FALLBACK_DURATION_MINUTES = 45;

/**
 * Turns the catalogue into options for the picker.
 *
 * Duration and modality come from the service row (`durationMinutes`,
 * `modality`): the dashboard is the single place that decides them, so a
 * service created there shows up in the app without touching code. `SERVICE_RULES`
 * and the "virtual" substring are only the legacy fallback for a service the API
 * does not describe. The price is never inferred: it always comes from the
 * catalogue, which is what the backend validates when charging.
 */
export function toServiceOptions(
  services: CatalogService[],
): ServiceTypeOption[] {
  return services.map((service) => {
    const rule = SERVICE_RULES[service.name];
    const modality: AvailabilityModality =
      service.modality ??
      rule?.modality ??
      (service.name.toLowerCase().includes('virtual') ? 'VIRTUAL' : 'PRESENCIAL');

    return {
      // The name is the key: `create-preference` looks it up in the catalogue and
      // answers 400 when it does not exist or is inactive.
      value: service.name,
      label: service.name,
      durationMinutes:
        service.durationMinutes ??
        rule?.durationMinutes ??
        FALLBACK_DURATION_MINUTES,
      modality,
      price: service.price,
      currency: service.currency,
    };
  });
}
