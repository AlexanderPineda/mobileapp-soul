import { api } from './apiClient';

/**
 * Client del flujo de pago del paciente.
 *
 * La cita **solo existe si el pago se aprueba**: `create-preference` reserva el
 * horario (`SlotHold`, 15 min) y devuelve el checkout de Mercado Pago; la cita
 * la crea el webhook o, si no hay pasarela configurada, el propio backend
 * (`directCreate`). Por eso la app nunca llama a `POST /public/appointments`:
 * crearía una cita sin cobro, que es justo lo que la web no permite.
 *
 * Endpoints públicos, sin JWT (ver `payments.controller.ts`).
 */

export interface CreatePaymentPreferencePayload {
  patientFirstName: string;
  patientLastName: string;
  patientEmail: string;
  patientPhone?: string;
  serviceType: string;
  centerId: string;
  staffProfileId?: string;
  /** Instante exacto del slot (ISO 8601 UTC) que devolvió el backend. */
  startTime: string;
  endTime: string;
  durationMinutes: number;
  isVirtual: boolean;
}

export interface PaymentPreferenceResponse {
  id: string;
  /** Checkout de producción (`null` cuando el pago se creó directo). */
  init_point: string | null;
  /** Checkout de pruebas, solo como respaldo si no hay `init_point`. */
  sandbox_init_point?: string | null;
  preferenceId?: string;
  /**
   * `true` cuando el backend no tiene pasarela configurada y ya creó la cita.
   * En ese caso no hay checkout que abrir: se consulta el estado y se sigue.
   */
  directCreate?: boolean;
}

export type PaymentStatusValue =
  | 'PENDING'
  | 'PAID'
  | 'FAILED'
  | 'REFUNDED'
  | 'VOIDED';

/** Cita mínima que expone el estado del pago para la pantalla de confirmación. */
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
  /** Nombre parcialmente enmascarado por el backend (`Ana G.`). */
  patientName?: string;
  amount?: number;
  message?: string;
  /** `null` mientras el pago no generó cita (revisión manual, pago pendiente). */
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

/** Estado del pago. Es público a propósito: la app lo sondea sin sesión. */
export function getPaymentStatus(
  paymentId: string,
): Promise<PaymentStatusResponse> {
  return api.get<PaymentStatusResponse>(
    `/payments/status/${encodeURIComponent(paymentId)}`,
  );
}

/**
 * Marca el pago como fallido y libera el horario reservado.
 *
 * Se usa cuando el paciente abandona el checkout: así el horario vuelve a estar
 * disponible de inmediato en lugar de esperar los 15 minutos de la reserva
 * temporal. Best-effort: si falla, la reserva caduca sola.
 */
export function markPaymentFailed(
  paymentId: string,
): Promise<{ success: boolean; message?: string }> {
  return api.post<{ success: boolean; message?: string }>(
    `/payments/mark-failed/${encodeURIComponent(paymentId)}`,
    {},
  );
}
