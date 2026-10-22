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
  time: string; // 'HH:MM'
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

export interface ApiError {
  message: string;
  status: number;
}
