import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type {
  CompositeScreenProps,
  NavigatorScreenParams,
} from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { AvailabilityModality, PublicAppointment } from '../types';

// ================================
// Listas de parámetros de navegación
// ================================

export type MainTabsParamList = {
  Home: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabsParamList>;
  TherapistList: { centerId: string };
  Availability: {
    centerId: string;
    /** Terapeuta preseleccionado (opcional). */
    staffProfileId?: string;
  };
  Booking: {
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
  };
  Confirmation: {
    /** Cita creada, tal como la devolvió el backend. */
    appointment: PublicAppointment;
    /** Día del slot en hora local del centro (`YYYY-MM-DD`). */
    date: string;
    /** Hora del slot en hora local del centro (`HH:MM`). */
    time: string;
    patientPhone?: string;
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

