// ================================
// Tipos compartidos de la app Soul
// ================================

export type AvailabilityModality = 'VIRTUAL' | 'PRESENCIAL';

/** Servicio del catálogo (`GET /services/active`). */
export interface CatalogService {
  id: string;
  name: string;
  description?: string | null;
  /** Precio en la unidad mínima de `currency` (pesos enteros). */
  price: number;
  currency: string;
}

/** Opción del selector de servicios, ya con lo que necesita el flujo. */
export interface ServiceTypeOption {
  /** Nombre exacto del catálogo: es lo que valida el backend al cobrar. */
  value: string;
  label: string;
  durationMinutes: number;
  modality: AvailabilityModality;
  price: number;
  currency: string;
}

export interface Center {
  id: string;
  name: string;
  /** El endpoint público solo expone `id` y `name`; el resto es opcional. */
  phone?: string;
  email?: string;
  address?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface StaffProfile {
  id: string;
  userId: string;
  centerId: string;
  specialty?: string;
  licenseNumber?: string;
  bio?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user?: { id: string; firstName: string; lastName: string };
  center?: { id: string; name: string };
}

export interface FreeSlot {
  /** Hora de pared del centro (`HH:MM`), tal como se muestra al paciente. */
  time: string;
  /** Instante exacto de inicio en ISO 8601 (UTC), calculado por el backend. */
  startTime: string;
  staffProfileIds: string[];
}

export interface FreeSlotsResult {
  configured: boolean;
  slots: FreeSlot[];
}

// La cita ya no se lee de `POST /public/appointments`: la crea el backend al
// aprobarse el pago y la app recibe solo el resumen que arma
// `utils/confirmation.ts` a partir de `/payments/status/:id`.
//
// El catálogo de servicios tampoco está escrito aquí: se pide a
// `GET /services/active` y se combina con `utils/service-catalog.ts`. Antes
// había una lista fija con cuatro nombres, y uno de ellos ("Valoración
// inicial") no existía en la base: pagar ese servicio devolvía 400.

