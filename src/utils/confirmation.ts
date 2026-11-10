import type { PaymentStatusResponse } from '../api/payments';
import type {
  BookingConfirmation,
  BookingParams,
  ConfirmationPatient,
} from '../navigation/types';

/**
 * Arma el resumen que ve el paciente cuando la cita ya existe.
 *
 * Dos fuentes se cruzan aquí, y ninguna basta sola:
 * - el backend (`/payments/status/:id`) sabe del servicio, el terapeuta y el
 *   centro que realmente quedaron asignados —puede no ser el terapeuta que el
 *   paciente eligió, porque el backend reasigna al libre con menos citas—;
 * - el cliente sabe el día y la hora de pared del centro, el nombre completo y
 *   el correo tal como los escribió el paciente (`patientName` del backend viene
 *   enmascarado a propósito, porque el enlace de retorno puede compartirse).
 *
 * Devuelve `null` cuando el pago no generó cita todavía: el pago puede estar
 * aprobado y la cita en revisión manual, que es un estado real y distinto de un
 * error.
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
    currency: 'COP',
  };
}
