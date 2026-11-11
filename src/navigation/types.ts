import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type {
  CompositeScreenProps,
  NavigatorScreenParams,
} from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { AvailabilityModality } from '../types';

// ================================
// Navigation param lists
// ================================

export type MainTabsParamList = {
  Home: undefined;
  Profile: undefined;
};

/** Booking form data. Also used to retry the payment. */
export interface BookingParams {
  centerId: string;
  modality: AvailabilityModality;
  date: string;
  duration: number;
  time: string;
  /** Exact slot instant in ISO 8601 (UTC), as the backend returns it. */
  startTime: string;
  staffProfileId?: string;
  /** Exact service value the backend expects (`ServiceType`). */
  serviceType: string;
  /** Human-readable service label, for display. */
  serviceLabel: string;
  /** Catalogue price at booking time (informational). */
  price?: number;
  currency?: string;
  patientName: string;
  patientLastName: string;
  patientEmail: string;
  patientPhone?: string;
}

/**
 * Summary of the confirmed appointment.
 *
 * The raw backend appointment is not passed around: with a payment, the webhook
 * creates the appointment and all the client knows is what
 * `/payments/status/:id` returns (service, therapist, centre) plus the data the
 * patient typed. This object is the intersection of both sources.
 */
export interface BookingConfirmation {
  appointmentId: string;
  startTime: string;
  endTime: string;
  serviceName: string;
  therapistName?: string;
  centerName?: string;
  isVirtual: boolean;
  /** Slot day in the centre local time (`YYYY-MM-DD`). */
  date: string;
  /** Slot time in the centre local time (`HH:MM`). */
  time: string;
  patientName: string;
  patientEmail: string;
  patientPhone?: string;
  /** Amount charged, when the backend reports it. */
  amount?: number;
  currency?: string;
}

/**
 * Summary of the confirmed appointment.
 *
 * The raw backend appointment is not passed around: with a payment, the webhook
 * creates the appointment and all the client knows is what
 * `/payments/status/:id` returns (service, therapist, centre) plus the data the
 * patient typed. This object is the intersection of both sources.
 */
export interface BookingConfirmation {
  appointmentId: string;
  startTime: string;
  endTime: string;
  serviceName: string;
  therapistName?: string;
  centerName?: string;
  isVirtual: boolean;
  /** Slot day in the centre local time (`YYYY-MM-DD`). */
  date: string;
  /** Slot time in the centre local time (`HH:MM`). */
  time: string;
  patientName: string;
  patientEmail: string;
  patientPhone?: string;
  /** Amount charged, when the backend reports it. */
  amount?: number;
  currency?: string;
}

/** Patient data already in the form when the payment starts. */
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
    /** Pre-selected therapist (optional). */
    staffProfileId?: string;
  };
  Booking: BookingParams;
  /**
   * Payment wait: it polls `GET /payments/status/:id` and decides where to go.
   * It receives the booking and patient data so the payment can be retried
   * without typing anything again.
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
// Typed props for the screens
// ================================

/** Main stack screen (Therapists → Booking → Confirmation). */
export type ScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

/**
 * Tab screen. It is composed with the stack so `navigate` accepts both sibling
 * tab routes (`Home`, `Profile`) and parent stack routes (`TherapistList`,
 * `Availability`, ...).
 */
export type MainTabScreenProps<T extends keyof MainTabsParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<MainTabsParamList, T>,
    NativeStackScreenProps<RootStackParamList>
  >;

