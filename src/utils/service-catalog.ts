import type {
  AvailabilityModality,
  CatalogService,
  ServiceTypeOption,
} from '../types';

/**
 * Duración y modalidad por nombre de servicio.
 *
 * `Service` **todavía no guarda** `durationMinutes` ni la modalidad (es el ítem 6
 * del backlog del backend), así que estos dos datos siguen viviendo en el
 * cliente. La diferencia con antes es de dónde salen el nombre y el precio: del
 * catálogo (`GET /services/active`), que es lo único que el backend valida al
 * cobrar. Esta tabla solo aporta lo que el backend no modela.
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

/** Duración por defecto cuando el servicio no está en la tabla (misma que la web). */
const FALLBACK_DURATION_MINUTES = 45;

/**
 * Convierte el catálogo en opciones del selector.
 *
 * Un servicio creado desde el panel aparece en la app sin tocar código. Si no
 * está en `SERVICE_RULES` se usa la misma heurística que `/agendar`: 45 minutos y
 * "virtual" en el nombre ⇒ virtual; si no, presencial. Es una heurística, y por
 * eso el precio nunca se deduce: viene del catálogo.
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
      // El nombre es la llave: `create-preference` lo busca en el catálogo y
      // responde 400 si no existe o está inactivo.
      value: service.name,
      label: service.name,
      durationMinutes: rule?.durationMinutes ?? FALLBACK_DURATION_MINUTES,
      modality,
      price: service.price,
      currency: service.currency,
    };
  });
}
