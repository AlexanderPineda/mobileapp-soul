import { api } from './apiClient';

/**
 * Client for the patient payment flow.
 *
 * The appointment **only exists when the payment is approved**:
 * `create-preference` holds the slot (`SlotHold`, 15 min) and returns the Mercado
 * Pago checkout; the appointment is created by the webhook or, when no gateway is
 * configured, by the backend itself (`directCreate`). That is why the app never
 * calls `POST /public/appointments`: it would create an appointment with no
 * charge, which is exactly what the web does not allow.
 *
 * Public endpoints, no JWT (see `payments.controller.ts`).
 */

export interface CreatePaymentPreferencePayload {
  patientFirstName: string;
  patientLastName: string;
  patientEmail: string;
  patientPhone?: string;
  serviceType: string;
  centerId: string;
  staffProfileId?: string;
  /** Exact slot instant (ISO 8601 UTC) returned by the backend. */
  startTime: string;
  endTime: string;
  durationMinutes: number;
  isVirtual: boolean;
}

export interface PaymentPreferenceResponse {
  id: string;
  /** Production checkout (`null` when the payment was created directly). */
  init_point: string | null;
  /** Test checkout, only as a fallback when there is no `init_point`. */
  sandbox_init_point?: string | null;
  preferenceId?: string;
  /**
   * `true` when the backend has no gateway configured and already created the
   * appointment. In that case there is no checkout to open: the status is polled
   * and the flow continues.
   */
  directCreate?: boolean;
}

export type PaymentStatusValue =
  | 'PENDING'
  | 'PAID'
  | 'FAILED'
  | 'REFUNDED'
  | 'VOIDED';

/** Minimum appointment the payment status exposes for the confirmation screen. */
export interface PaymentAppointmentInfo {
  id: string;
  startTime: string;
  endTime: string;
  isVirtual: boolean;
  serviceName: string | null;
  therapistName: string;
  centerName: string;
  locationName: string | null;
}

export interface PaymentStatusResponse {
  found: boolean;
  status?: PaymentStatusValue;
  mpStatus?: string | null;
  serviceType?: string;
  /** Name partially masked by the backend (`Ana G.`). */
  patientName?: string;
  amount?: number;
  message?: string;
  /** `null` while the payment has not generated an appointment (manual review, pending payment). */
  appointment?: PaymentAppointmentInfo | null;
}

export function createPaymentPreference(
  payload: CreatePaymentPreferencePayload,
): Promise<PaymentPreferenceResponse> {
  return api.post<PaymentPreferenceResponse>(
    '/payments/create-preference',
    payload,
  );
}

/** Payment status. Public on purpose: the app polls it without a session. */
export function getPaymentStatus(
  paymentId: string,
): Promise<PaymentStatusResponse> {
  return api.get<PaymentStatusResponse>(
    `/payments/status/${encodeURIComponent(paymentId)}`,
  );
}

/**
 * Marks the payment as failed and releases the held slot.
 *
 * Used when the patient abandons the checkout: that way the time becomes
 * available again right away instead of waiting the 15 minutes of the temporary
 * hold. Best-effort: if it fails, the hold expires on its own.
 */
export function markPaymentFailed(
  paymentId: string,
): Promise<{ success: boolean; message?: string }> {
  return api.post<{ success: boolean; message?: string }>(
    `/payments/mark-failed/${encodeURIComponent(paymentId)}`,
    {},
  );
}
