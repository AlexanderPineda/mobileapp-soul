// ================================
// Tipos compartidos de la app Soul
// ================================

export type AvailabilityModality = 'VIRTUAL' | 'PRESENCIAL';

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

// Servicios ofertados. Deben coincidir exactamente con el enum `ServiceType` de
// `backend-soul` (`create-public-appointment.dto.ts`): el backend rechaza con
// 400 cualquier otro valor.
export interface ServiceTypeOption {
  value: string;
  label: string;
  durationMinutes: number;
  modality: AvailabilityModality;
}

export const SERVICE_TYPES: ServiceTypeOption[] = [
  { value: 'Terapia Familiar', label: 'Terapia Familiar', durationMinutes: 60, modality: 'PRESENCIAL' },
  { value: 'Valoracion inicial', label: 'Valoración inicial', durationMinutes: 90, modality: 'PRESENCIAL' },
  { value: 'Terapia individual virtual', label: 'Terapia individual virtual', durationMinutes: 45, modality: 'VIRTUAL' },
  { value: 'Terapia individual presencial', label: 'Terapia individual presencial', durationMinutes: 45, modality: 'PRESENCIAL' },
];

// La cita ya no se lee de `POST /public/appointments`: la crea el backend al
// aprobarse el pago y la app recibe solo el resumen que arma
// `utils/confirmation.ts` a partir de `/payments/status/:id`.

