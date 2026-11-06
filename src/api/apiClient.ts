import { API_BASE_URL, API_TIMEOUT_MS } from '../config';
import { ApiError } from './errors';

interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean | undefined>;
}

/**
 * Cliente HTTP genérico para consumir la API de backend-soul.
 *
 * Nota: la app paciente usa la sección `/public` (sin autenticación).
 * Si más adelante se necesita un login de personal, aquí se puede agregar
 * el manejo de JWT (Storage + cabecera Authorization).
 */

async function fetchJson<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method, body, headers, params } = options;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  let url = `${API_BASE_URL}${endpoint}`;
  if (params && Object.keys(params).length > 0) {
    const query = Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== null)
      .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
      .join('&');
    url = `${url}?${query}`;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    if (!response.ok) {
      // NestJS devuelve `message` como string o como array (ValidationPipe).
      const errorBody = (await response.json().catch(() => null)) as
        | { message?: string | string[] }
        | null;

      let message = `Error ${response.status}`;
      if (Array.isArray(errorBody?.message)) {
        message = errorBody.message.join(', ');
      } else if (typeof errorBody?.message === 'string') {
        message = errorBody.message;
      }

      throw new ApiError(message, response.status);
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

export const api = {
  get: <T>(endpoint: string, params?: RequestOptions['params']) =>
    fetchJson<T>(endpoint, { params }),
  post: <T>(
    endpoint: string,
    body: unknown,
    params?: RequestOptions['params'],
  ) => fetchJson<T>(endpoint, { method: 'POST', body, params }),
  patch: <T>(
    endpoint: string,
    body: unknown,
    params?: RequestOptions['params'],
  ) => fetchJson<T>(endpoint, { method: 'PATCH', body, params }),
  delete: <T>(endpoint: string, params?: RequestOptions['params']) =>
    fetchJson<T>(endpoint, { method: 'DELETE', params }),
};

export { ApiError } from './errors';
