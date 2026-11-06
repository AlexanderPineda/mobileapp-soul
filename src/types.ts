// ================================
// Tipos compartidos de la app Soul
// ================================

export type AppointmentStatus =
  | 'SCHEDULED'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';

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

/**
 * Respuesta de `POST /public/appointments`.
 *
 * El backend devuelve la cita creada con el paciente y el terapeuta incluidos.
 * Es importante leerla en lugar de reconstruir la reserva en el cliente: el
 * servicio reasigna el terapeuta al profesional libre con menos citas, así que
 * `staffProfile` puede no ser el que el paciente eligió en la pantalla anterior.
 */
export interface PublicAppointment {
  id: string;
  title: string;
  status: AppointmentStatus;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  isVirtual: boolean;
  patient?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  staffProfile?: {
    id: string;
    specialty?: string;
    user?: { id: string; firstName: string; lastName: string };
  };
}

