import { API_BASE_URL, API_TIMEOUT_MS } from '../config';
import { getRequestLocale } from '../i18n/locale';
import { ApiError } from './errors';

interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean | undefined>;
}

/**
 * Generic HTTP client to consume the backend-soul API.
 *
 * The patient app uses the `/public` section (no authentication).
 * If staff login is needed later, JWT handling (Storage + Authorization header)
 * can be added here.
 *
 * `Accept-Language` is always sent: the backend translates error messages with
 * that header (`src/common/i18n`), so the text the patient sees in a toast is in
 * the same language as the screen, including the schedule conflicts the server
 * builds.
 */

async function fetchJson<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method, body, headers, params } = options;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept-Language': getRequestLocale(),
    ...headers,
  };

  let url = `${API_BASE_URL}${endpoint}`;
  if (params && Object.keys(params).length > 0) {
    const query = Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== null)
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
      )
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
      // NestJS returns `message` as a string or as an array (ValidationPipe).
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

    // 204 No Content (e.g. DELETE) has no body to parse.
    if (response.status === 204) {
      return undefined as T;
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
