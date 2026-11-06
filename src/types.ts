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

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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

export interface Patient {
  id: string;
  centerId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  address?: string;
  occupation?: string;
  referredBy?: string;
  insurance?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  staffProfileId: string;
  centerId: string;
  locationId?: string;
  createdBy: string;
  title: string;
  description?: string;
  status: AppointmentStatus;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  isVirtual: boolean;
  notes?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
  patient?: Patient;
  staffProfile?: StaffProfile;
  center?: Center;
  location?: { id: string; name: string };
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

// Servicios ofertados (coinciden con la palabra a la que responde el backend).
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

export interface LoginResponse {
  accessToken: string;
  user: User;
}

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

export interface ApiError {
  message: string;
  status: number;
}
