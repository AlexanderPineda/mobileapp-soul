import type {
  AvailabilityModality,
  CatalogService,
  ServiceTypeOption,
} from '../types';

/**
 * Duration and modality per service name.
 *
 * `Service` **does not store** `durationMinutes` or the modality yet (it is item 6
 * of the backend backlog), so these two values still live in the client. The
 * difference from before is where the name and price come from: the catalogue
 * (`GET /services/active`), which is the only thing the backend validates when
 * charging. This table only adds what the backend does not model.
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

/** Default duration when the service is not in the table (same as the web). */
const FALLBACK_DURATION_MINUTES = 45;

/**
 * Turns the catalogue into options for the picker.
 *
 * A service created from the dashboard shows up in the app without touching
 * code. When it is not in `SERVICE_RULES` the same heuristic as `/agendar` is
 * used: 45 minutes and "virtual" in the name ⇒ virtual; otherwise on-site. It is
 * a heuristic, which is why the price is never inferred: it comes from the
 * catalogue.
 */
export function toServiceOptions(
  services: CatalogService[],
): ServiceTypeOption[] {
  return services.map((service) => {
    const rule = SERVICE_RULES[service.name];
    const modality =
      rule?.modality ??
      (service.name.toLowerCase().includes('virtual') ? 'VIRTUAL' : 'PRESENCIAL');

    return {
      // The name is the key: `create-preference` looks it up in the catalogue and
      // answers 400 when it does not exist or is inactive.
      value: service.name,
      label: service.name,
      durationMinutes: rule?.durationMinutes ?? FALLBACK_DURATION_MINUTES,
      modality,
      price: service.price,
      currency: service.currency,
    };
  });
}
