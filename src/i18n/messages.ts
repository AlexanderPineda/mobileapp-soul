import type { Locale } from './locale';

/**
 * Diccionarios de la app.
 *
 * `es` es la fuente de verdad: define las claves y `en` se tipa contra él
 * (`Record<keyof typeof es, string>`), así que una clave sin traducir no
 * compila. `__tests__/i18n.test.ts` cierra lo que el tipo no ve: ninguna cadena
 * vacía y las dos listas con exactamente las mismas claves.
 *
 * Las claves son planas y con puntos (`booking.submit`) a propósito: se leen de
 * un vistazo, `keyof` da la unión exacta sin tipos recursivos y el test de
 * paridad compara listas planas.
 *
 * Los textos son los mismos que ve el paciente en `/agendar` (frontend-soul), no
 * una segunda redacción: la app y la web no deben sonar distintas.
 */
const es = {
  // ============================== Comunes ==============================
  'common.retry': 'Reintentar',
  'common.backHome': 'Volver al inicio',
  'common.cancel': 'Cancelar',

  // ============================== Idioma ==============================
  'language.change': 'Cambiar el idioma',
  'language.es': 'Español',
  'language.en': 'English',

  // ============================== Inicio ==============================
  'home.tab': 'Inicio',
  'home.title': 'Encuentra tu centro',
  'home.subtitle': 'Elige un centro para ver los terapeutas y horarios disponibles.',
  'home.errorTitle': 'No se pudieron cargar los centros',
  'home.emptyTitle': 'Aún no hay centros disponibles',
  'home.emptyDescription':
    'Comunícate con el administrador del sitio para conocer la ubicación de los centros.',
  'home.loading': 'Cargando centros…',

  // ============================== Terapeutas ==============================
  'therapists.screenTitle': 'Terapeutas',
  'therapists.title': 'Terapeutas',
  'therapists.subtitle': 'Elige un terapeuta para ver su disponibilidad.',
  'therapists.errorTitle': 'No se pudieron cargar los terapeutas',
  'therapists.emptyTitle': 'No hay terapeutas disponibles',
  'therapists.emptyDescription': 'Este centro aún no tiene terapeutas activos.',
  'therapists.loading': 'Cargando terapeutas…',

  // ============================== Disponibilidad ==============================
  'availability.screenTitle': 'Horarios disponibles',
  'availability.title': 'Horarios disponibles',
  'availability.subtitle': 'Elige el servicio y el día para ver los horarios libres.',
  'availability.service': 'Servicio',
  'availability.day': 'Día',
  'availability.info': 'Servicio: {service} · Duración: {duration} min · {modality}',
  'availability.errorTitle': 'No se pudieron cargar los horarios',
  'availability.notConfiguredTitle': 'Este centro aún no tiene agenda para este servicio',
  'availability.notConfiguredDescription':
    'Comunícate con el centro para conocer sus horarios de atención.',
  'availability.emptyTitle': 'No hay horarios disponibles',
  'availability.emptyDescription': 'Intenta otro día o cambia el servicio.',
  'availability.loading': 'Cargando horarios…',

  // ============================== Modalidad ==============================
  'modality.virtual': 'Virtual',
  'modality.onsite': 'Presencial',

  // ============================== Reserva ==============================
  'booking.screenTitle': 'Reservar sesión',
  'booking.title': 'Confirma tu reserva',
  'booking.subtitle': 'Revisa los datos y continúa al pago.',
  'booking.firstName': 'Nombre',
  'booking.lastName': 'Apellido',
  'booking.email': 'Correo electrónico',
  'booking.phone': 'Teléfono (opcional)',
  'booking.submit': 'Continuar al pago',
  'booking.submitting': 'Preparando el pago…',
  'booking.errorFirstName': 'Ingresa tu nombre',
  'booking.errorLastName': 'Ingresa tu apellido',
  'booking.errorEmailRequired': 'Ingresa tu correo',
  'booking.errorEmailInvalid': 'Ingresa un correo válido',
  'booking.errorPhone': 'Ingresa un teléfono válido (mínimo 7 dígitos)',
  'booking.errorPastSlot': 'Ese horario ya pasó. Vuelve atrás y elige otro, por favor.',
  'booking.paymentNotice':
    'El pago se hace antes de confirmar la cita. Al continuar te llevamos a la pasarela segura.',
  'booking.checkoutUnavailable': 'No pudimos abrir la pasarela de pago. Inténtalo de nuevo.',

  // ============================== Pago ==============================
  'payment.screenTitle': 'Pago',
  'payment.pendingTitle': 'Estamos confirmando tu pago',
  'payment.pendingDescription':
    'Si ya pagaste, espera unos segundos: la confirmación llega automáticamente. Puedes salir de esta pantalla y volver; conservas el horario mientras la reserva siga vigente.',
  'payment.checking': 'Verificando el pago…',
  'payment.failureTitle': 'El pago no se completó',
  'payment.failureDescription':
    'No se creó ninguna cita y el horario quedó libre. Puedes intentarlo de nuevo con otro medio de pago.',
  'payment.reviewTitle': 'Pago recibido, cita en revisión',
  'payment.reviewDescription':
    'Tu pago quedó registrado, pero la cita todavía no se generó. Escríbenos por WhatsApp y la confirmamos a mano.',
  'payment.notFoundTitle': 'No encontramos ese pago',
  'payment.notFoundDescription':
    'Puede que el enlace haya caducado. Vuelve a reservar tu horario.',

  // ============================== Confirmación ==============================
  'confirmation.screenTitle': '¡Reserva confirmada!',
  'confirmation.title': '¡Reserva confirmada!',
  'confirmation.subtitle':
    'Tu pago quedó aprobado y la cita está en la agenda del centro. Te esperamos.',
  'confirmation.patient': 'Paciente',
  'confirmation.email': 'Correo',
  'confirmation.phone': 'Teléfono',
  'confirmation.dateTime': 'Fecha y hora',
  'confirmation.dateTimeValue': '{date} a las {time}',
  'confirmation.service': 'Servicio',
  'confirmation.modality': 'Modalidad',
  'confirmation.therapist': 'Terapeuta asignado',
  'confirmation.center': 'Centro',
  'confirmation.amount': 'Pagado',
  'confirmation.addToCalendar': 'Agregar a Google Calendar',
  'confirmation.share': 'Compartir la cita',
  'confirmation.shareMessage': 'Mi cita en Soul: {service} el {date} a las {time}',
  'confirmation.done': 'Listo',

  // ============================== Perfil ==============================
  'profile.tab': 'Perfil',
  'profile.title': 'Perfil',
  'profile.subtitle':
    'Esta versión de la app no incluye el perfil de paciente. Pronto podrás ver tu historial de citas y datos de contacto.',

  // ============================== Errores ==============================
  'errors.timeout': 'La solicitud tardó demasiado. Revisa tu conexión e inténtalo de nuevo.',
  'errors.network': 'No pudimos conectar con el servidor. Revisa tu conexión a internet.',
  'errors.unexpected': 'Ocurrió un error inesperado. Inténtalo de nuevo.',
  'errors.tooManyRequests':
    'Hicimos demasiados intentos seguidos. Espera un momento y reinicia el proceso.',
  'errors.unauthorized': 'Tu sesión expiró. Vuelve a iniciar el proceso.',
};

const en: Record<keyof typeof es, string> = {
  // ============================== Common ==============================
  'common.retry': 'Try again',
  'common.backHome': 'Back to home',
  'common.cancel': 'Cancel',

  // ============================== Language ==============================
  'language.change': 'Change language',
  'language.es': 'Español',
  'language.en': 'English',

  // ============================== Home ==============================
  'home.tab': 'Home',
  'home.title': 'Find your centre',
  'home.subtitle': 'Pick a centre to see its therapists and available times.',
  'home.errorTitle': "We couldn't load the centres",
  'home.emptyTitle': 'No centres available yet',
  'home.emptyDescription':
    'Contact the site administrator to find out where the centres are located.',
  'home.loading': 'Loading centres…',

  // ============================== Therapists ==============================
  'therapists.screenTitle': 'Therapists',
  'therapists.title': 'Therapists',
  'therapists.subtitle': 'Pick a therapist to see their availability.',
  'therapists.errorTitle': "We couldn't load the therapists",
  'therapists.emptyTitle': 'No therapists available',
  'therapists.emptyDescription': 'This centre has no active therapists yet.',
  'therapists.loading': 'Loading therapists…',

  // ============================== Availability ==============================
  'availability.screenTitle': 'Available times',
  'availability.title': 'Available times',
  'availability.subtitle': 'Pick a service and a day to see the free times.',
  'availability.service': 'Service',
  'availability.day': 'Day',
  'availability.info': 'Service: {service} · Duration: {duration} min · {modality}',
  'availability.errorTitle': "We couldn't load the times",
  'availability.notConfiguredTitle': 'This centre has no schedule for that service yet',
  'availability.notConfiguredDescription':
    'Contact the centre to find out its opening hours.',
  'availability.emptyTitle': 'No times available',
  'availability.emptyDescription': 'Try another day or a different service.',
  'availability.loading': 'Loading times…',

  // ============================== Modality ==============================
  'modality.virtual': 'Virtual',
  'modality.onsite': 'In person',

  // ============================== Booking ==============================
  'booking.screenTitle': 'Book a session',
  'booking.title': 'Confirm your booking',
  'booking.subtitle': 'Check your details and continue to payment.',
  'booking.firstName': 'First name',
  'booking.lastName': 'Last name',
  'booking.email': 'Email',
  'booking.phone': 'Phone (optional)',
  'booking.submit': 'Continue to payment',
  'booking.submitting': 'Preparing payment…',
  'booking.errorFirstName': 'Enter your first name',
  'booking.errorLastName': 'Enter your last name',
  'booking.errorEmailRequired': 'Enter your email',
  'booking.errorEmailInvalid': 'Enter a valid email',
  'booking.errorPhone': 'Enter a valid phone number (at least 7 digits)',
  'booking.errorPastSlot': 'That time has already passed. Go back and pick another one.',
  'booking.paymentNotice':
    'Payment happens before the appointment is confirmed. We take you to the secure checkout next.',
  'booking.checkoutUnavailable': "We couldn't open the checkout. Please try again.",

  // ============================== Payment ==============================
  'payment.screenTitle': 'Payment',
  'payment.pendingTitle': "We're confirming your payment",
  'payment.pendingDescription':
    'If you already paid, wait a few seconds: the confirmation arrives automatically. You can leave this screen and come back; you keep the slot while the reservation is valid.',
  'payment.checking': 'Checking the payment…',
  'payment.failureTitle': 'The payment was not completed',
  'payment.failureDescription':
    'No appointment was created and the slot is free again. You can try again with another payment method.',
  'payment.reviewTitle': 'Payment received, appointment under review',
  'payment.reviewDescription':
    'Your payment was recorded, but the appointment has not been created yet. Message us on WhatsApp and we will confirm it by hand.',
  'payment.notFoundTitle': "We couldn't find that payment",
  'payment.notFoundDescription':
    'The link may have expired. Please book your time again.',

  // ============================== Confirmation ==============================
  'confirmation.screenTitle': 'Booking confirmed!',
  'confirmation.title': 'Booking confirmed!',
  'confirmation.subtitle':
    'Your payment was approved and the appointment is on the centre calendar. See you there.',
  'confirmation.patient': 'Patient',
  'confirmation.email': 'Email',
  'confirmation.phone': 'Phone',
  'confirmation.dateTime': 'Date and time',
  'confirmation.dateTimeValue': '{date} at {time}',
  'confirmation.service': 'Service',
  'confirmation.modality': 'Modality',
  'confirmation.therapist': 'Assigned therapist',
  'confirmation.center': 'Centre',
  'confirmation.amount': 'Paid',
  'confirmation.addToCalendar': 'Add to Google Calendar',
  'confirmation.share': 'Share the appointment',
  'confirmation.shareMessage': 'My appointment at Soul: {service} on {date} at {time}',
  'confirmation.done': 'Done',

  // ============================== Profile ==============================
  'profile.tab': 'Profile',
  'profile.title': 'Profile',
  'profile.subtitle':
    'This version of the app does not include the patient profile yet. Soon you will be able to see your appointment history and contact details.',

  // ============================== Errors ==============================
  'errors.timeout': 'The request took too long. Check your connection and try again.',
  'errors.network': "We couldn't reach the server. Check your internet connection.",
  'errors.unexpected': 'Something went wrong. Please try again.',
  'errors.tooManyRequests': 'Too many attempts in a row. Wait a moment and start over.',
  'errors.unauthorized': 'Your session expired. Please start the process again.',
};

export type MessageKey = keyof typeof es;
export type Dictionary = Record<MessageKey, string>;

export const messagesByLocale: Record<Locale, Dictionary> = { es, en };

/**
 * Texto de una clave, con `{placeholders}` interpolados.
 *
 * Si la clave falta en el idioma pedido se cae al español y, si tampoco está,
 * se devuelve la clave: un texto raro es preferible a una pantalla en blanco, y
 * el test de paridad evita que llegue a producción.
 */
export function translate(
  locale: Locale,
  key: MessageKey,
  params?: Record<string, string | number>,
): string {
  const dictionary = messagesByLocale[locale] ?? messagesByLocale.es;
  let text = dictionary[key] ?? messagesByLocale.es[key] ?? key;

  if (params) {
    for (const [name, value] of Object.entries(params)) {
      // `split/join` en lugar de `replaceAll`: no depende del runtime de Hermes.
      text = text.split(`{${name}}`).join(String(value));
    }
  }

  return text;
}
