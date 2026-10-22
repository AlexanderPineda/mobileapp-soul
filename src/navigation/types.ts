import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { NavigatorScreenParams } from '@react-navigation/native';

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
    modality: 'VIRTUAL' | 'PRESENCIAL';
    date: string;
    duration: number;
    time: string;
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
    appointment: Record<string, unknown>;
    patientName: string;
    patientLastName: string;
    patientEmail: string;
    patientPhone?: string;
  };
};

// ================================
// Props tipadas para las pantallas
// ================================

export type ScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;
