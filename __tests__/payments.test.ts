import {
  createPaymentPreference,
  getPaymentStatus,
  markPaymentFailed,
  type CreatePaymentPreferencePayload,
  type PaymentStatusResponse,
} from '../src/api/payments';
import { buildConfirmation } from '../src/utils/confirmation';
import type { BookingParams, ConfirmationPatient } from '../src/navigation/types';

/**
 * The network is mocked per test (not by `jest.setup`): what matters here is
 * which URL and which body are sent, because those decide whether the patient
 * pays or not.
 */
function mockFetch(body: unknown, status = 200) {
  const fetchMock = jest.fn(() =>
    Promise.resolve({
      ok: status < 400,
      status,
      json: () => Promise.resolve(body),
    }),
  );
  global.fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
}

const payload: CreatePaymentPreferencePayload = {
  patientFirstName: 'Ana',
  patientLastName: 'Gómez',
  patientEmail: 'ana@correo.com',
  patientPhone: '3001234567',
  serviceType: 'Terapia individual virtual',
  centerId: 'center-1',
  staffProfileId: 'staff-1',
  startTime: '2026-11-12T15:00:00.000Z',
  endTime: '2026-11-12T15:45:00.000Z',
  durationMinutes: 45,
  isVirtual: true,
};

describe('createPaymentPreference', () => {
  it('envía la reserva al endpoint de pago, no al de citas', async () => {
    const fetchMock = mockFetch({ id: 'pay-1', init_point: 'https://mp/checkout' });

    const result = await createPaymentPreference(payload);

    expect(result.id).toBe('pay-1');
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toContain('/payments/create-preference');
    expect(url).not.toContain('/public/appointments');
    expect(init.method).toBe('POST');
    expect(JSON.parse(String(init.body))).toEqual(payload);
  });
});

describe('getPaymentStatus', () => {
  it('consulta el estado por id', async () => {
    const fetchMock = mockFetch({ found: true, status: 'PAID' });

    const result = await getPaymentStatus('pay-1');

    expect(result.status).toBe('PAID');
    const [url] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toContain('/payments/status/pay-1');
  });
});

describe('markPaymentFailed', () => {
  it('libera la reserva cuando el paciente abandona el pago', async () => {
    const fetchMock = mockFetch({ success: true });

    await markPaymentFailed('pay-1');

    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toContain('/payments/mark-failed/pay-1');
    expect(init.method).toBe('POST');
  });
});

describe('buildConfirmation', () => {
  const booking: BookingParams = {
    centerId: 'center-1',
    modality: 'VIRTUAL',
    date: '2026-11-12',
    duration: 45,
    time: '10:00',
    startTime: '2026-11-12T15:00:00.000Z',
    serviceType: 'Terapia individual virtual',
    serviceLabel: 'Terapia individual virtual',
    patientName: '',
    patientLastName: '',
    patientEmail: '',
  };

  const patient: ConfirmationPatient = {
    firstName: 'Ana',
    lastName: 'Gómez',
    email: 'ana@correo.com',
    phone: '3001234567',
  };

  const paid: PaymentStatusResponse = {
    found: true,
    status: 'PAID',
    amount: 150000,
    // The backend masks the name because the return link gets shared.
    patientName: 'Ana G.',
    appointment: {
      id: 'appt-1',
      startTime: '2026-11-12T15:00:00.000Z',
      endTime: '2026-11-12T15:45:00.000Z',
      isVirtual: true,
      serviceName: 'Terapia individual virtual',
      therapistName: 'Laura Pérez',
      centerName: 'Sede Norte',
      locationName: null,
    },
  };

  it('cruza los datos del pago con los del formulario', () => {
    const confirmation = buildConfirmation(booking, patient, paid);

    expect(confirmation).toMatchObject({
      appointmentId: 'appt-1',
      serviceName: 'Terapia individual virtual',
      therapistName: 'Laura Pérez',
      centerName: 'Sede Norte',
      isVirtual: true,
      date: '2026-11-12',
      time: '10:00',
      // The client holds the full name; the backend one arrives masked.
      patientName: 'Ana Gómez',
      patientEmail: 'ana@correo.com',
      amount: 150000,
    });
  });

  it('devuelve null cuando el pago no generó cita', () => {
    const pending: PaymentStatusResponse = {
      found: true,
      status: 'PAID',
      appointment: null,
    };

    expect(buildConfirmation(booking, patient, pending)).toBeNull();
  });
});
