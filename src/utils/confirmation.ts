import type { PaymentStatusResponse } from '../api/payments';
import type {
  BookingConfirmation,
  BookingParams,
  ConfirmationPatient,
} from '../navigation/types';

/**
 * Builds the summary the patient sees once the appointment exists.
 *
 * Two sources meet here, and neither is enough on its own:
 * - the backend (`/payments/status/:id`) knows the service, therapist and centre
 *   that were actually assigned — it may not be the therapist the patient
 *   picked, because the backend reassigns to the free one with fewer
 *   appointments;
 * - the client knows the centre day and wall-clock time, the full name and the
 *   email as the patient typed them (the backend `patientName` arrives masked on
 *   purpose, because the return link can be shared).
 *
 * Returns `null` when the payment has not generated an appointment yet: the
 * payment can be approved with the appointment under manual review, which is a
 * real state and different from an error.
 */
export function buildConfirmation(
  booking: BookingParams,
  patient: ConfirmationPatient,
  status: PaymentStatusResponse,
): BookingConfirmation | null {
  const appointment = status.appointment;
  if (!appointment) return null;

  const fullName = `${patient.firstName} ${patient.lastName}`.trim();

  return {
    appointmentId: appointment.id,
    startTime: appointment.startTime,
    endTime: appointment.endTime,
    serviceName: appointment.serviceName ?? booking.serviceLabel,
    therapistName: appointment.therapistName || undefined,
    centerName: appointment.centerName || undefined,
    isVirtual: appointment.isVirtual,
    date: booking.date,
    time: booking.time,
    patientName: fullName || status.patientName || '',
    patientEmail: patient.email,
    patientPhone: patient.phone,
    amount: status.amount,
    // The payment status does not return the currency, and the catalogue does know
// it: without
    // this, "Psicoterapia virtual internacional" (USD 50) would show up as
    // "COP 50" on the confirmation screen.
    currency: booking.currency ?? 'COP',
  };
}
