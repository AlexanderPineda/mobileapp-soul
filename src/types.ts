// ================================
// Tipos compartidos de la app Soul
// ================================

export type AvailabilityModality = 'VIRTUAL' | 'PRESENCIAL';

/** Catalogue service (`GET /services/active`). */
export interface CatalogService {
  id: string;
  name: string;
  description?: string | null;
  /** Price in the smallest unit of `currency` (whole pesos). */
  price: number;
  currency: string;
  /** Session length in minutes, set from the dashboard. */
  durationMinutes?: number;
  /** Modality the service is sold in, set from the dashboard. */
  modality?: AvailabilityModality;
}

/** Service picker option, with everything the flow needs. */
export interface ServiceTypeOption {
  /** Exact catalogue name: it is what the backend validates when charging. */
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
  /** The public endpoint only exposes `id` and `name`; the rest is optional. */
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
  /** Centre wall-clock time (`HH:MM`), as shown to the patient. */
  time: string;
  /** Exact start instant in ISO 8601 (UTC), computed by the backend. */
  startTime: string;
  staffProfileIds: string[];
}

export interface FreeSlotsResult {
  configured: boolean;
  slots: FreeSlot[];
}

// The appointment is no longer read from `POST /public/appointments`: the
// backend creates it when the payment is approved, and the app only receives
// the summary `utils/confirmation.ts` builds from `/payments/status/:id`.
//
// The service catalogue is not hardcoded here either: it is requested from
// `GET /services/active` and combined with `utils/service-catalog.ts`. There
// used to be a fixed list of four names, and one of them (the Spanish for
// "initial assessment") did not exist in the database: paying it returned 400.

