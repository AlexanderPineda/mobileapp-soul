/**
 * Error de la API de Soul.
 *
 * Se lanza desde `fetchJson` cuando el backend responde con un status >= 400,
 * conservando el `message` que envía NestJS (string o array del ValidationPipe).
 */
export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/** Mensaje genérico cuando no sabemos qué pasó. */
const UNEXPECTED_ERROR = 'Ocurrió un error inesperado. Inténtalo de nuevo.';

/**
 * Traduce cualquier error a un texto mostrable al paciente.
 *
 * React Native no distingue bien los fallos de red: `fetch` rechaza con
 * "Network request failed" (Android) o "Failed to fetch" (iOS/web), y un
 * timeout del `AbortController` llega como `AbortError`. Sin esta traducción el
 * paciente ve mensajes en inglés o el literal `undefined` cuando el valor
 * lanzado no es un `Error`.
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    if (error.name === 'AbortError') {
      return 'La solicitud tardó demasiado. Revisa tu conexión e inténtalo de nuevo.';
    }
    if (
      error.message === 'Network request failed' ||
      error.message === 'Failed to fetch'
    ) {
      return 'No pudimos conectar con el servidor. Revisa tu conexión a internet.';
    }
    return error.message || UNEXPECTED_ERROR;
  }

  return UNEXPECTED_ERROR;
}
