import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type {
  CompositeScreenProps,
  NavigatorScreenParams,
} from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { AvailabilityModality } from '../types';

// ================================
// Listas de parámetros de navegación
// ================================

export type MainTabsParamList = {
  Home: undefined;
  Profile: undefined;
};

/** Datos del formulario de reserva. También sirven para reintentar el pago. */
export interface BookingParams {
  centerId: string;
  modality: AvailabilityModality;
  date: string;
  duration: number;
  time: string;
  /** Instante exacto del slot en ISO 8601 (UTC), tal como lo devuelve el backend. */
  startTime: string;
  staffProfileId?: string;
  /** Valor exacto del servicio que espera el backend (`ServiceType`). */
  serviceType: string;
  /** Etiqueta legible del servicio, para mostrar en la pantalla. */
  serviceLabel: string;
  patientName: string;
  patientLastName: string;
  patientEmail: string;
  patientPhone?: string;
}

/**
 * Resumen de la cita confirmada.
 *
 * No se pasa la cita cruda del backend: con el pago, la cita la crea el webhook
 * y lo único que el cliente conoce es lo que devuelve `/payments/status/:id`
 * (servicio, terapeuta, centro) más los datos que el paciente escribió. Este
 * objeto es la intersección de las dos fuentes.
 */
export interface BookingConfirmation {
  appointmentId: string;
  startTime: string;
  endTime: string;
  serviceName: string;
  therapistName?: string;
  centerName?: string;
  isVirtual: boolean;
  /** Día del slot en hora local del centro (`YYYY-MM-DD`). */
  date: string;
  /** Hora del slot en hora local del centro (`HH:MM`). */
  time: string;
  patientName: string;
  patientEmail: string;
  patientPhone?: string;
  /** Monto cobrado, cuando el backend lo reporta. */
  amount?: number;
  currency?: string;
}

/**
 * Resumen de la cita confirmada.
 *
 * No se pasa la cita cruda del backend: con el pago, la cita la crea el webhook
 * y lo único que el cliente conoce es lo que devuelve `/payments/status/:id`
 * (servicio, terapeuta, centro) más los datos que el paciente escribió. Este
 * objeto es la intersección de las dos fuentes.
 */
export interface BookingConfirmation {
  appointmentId: string;
  startTime: string;
  endTime: string;
  serviceName: string;
  therapistName?: string;
  centerName?: string;
  isVirtual: boolean;
  /** Día del slot en hora local del centro (`YYYY-MM-DD`). */
  date: string;
  /** Hora del slot en hora local del centro (`HH:MM`). */
  time: string;
  patientName: string;
  patientEmail: string;
  patientPhone?: string;
  /** Monto cobrado, cuando el backend lo reporta. */
  amount?: number;
  currency?: string;
}

/** Datos del paciente que ya están en el formulario al iniciar el pago. */
export interface ConfirmationPatient {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabsParamList>;
  TherapistList: { centerId: string };
  Availability: {
    centerId: string;
    /** Terapeuta preseleccionado (opcional). */
    staffProfileId?: string;
  };
  Booking: BookingParams;
  /**
   * Espera del pago: sondea `GET /payments/status/:id` y decide a dónde ir.
   * Recibe los datos de la reserva y del paciente para poder reintentar el pago
   * sin volver a escribir nada.
   */
  Payment: {
    paymentId: string;
    booking: BookingParams;
    patient: ConfirmationPatient;
  };
  Confirmation: {
    confirmation: BookingConfirmation;
  };
};


// ================================
// Props tipadas para las pantallas
// ================================

/** Pantalla del stack principal (Terapeutas → Reserva → Confirmación). */
export type ScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

/**
 * Pantalla de una pestaña. Se compone con el stack para que `navigate` acepte
 * tanto rutas hermanas de la tab (`Home`, `Profile`) como rutas del stack
 * padre (`TherapistList`, `Availability`, ...).
 */
export type MainTabScreenProps<T extends keyof MainTabsParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<MainTabsParamList, T>,
    NativeStackScreenProps<RootStackParamList>
  >;

