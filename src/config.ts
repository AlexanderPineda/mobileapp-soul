import { Platform } from 'react-native';

/**
 * URL base del backend Soul (NestJS, puerto 777).
 *
 * IMPORTANTE: el backend aplica `app.setGlobalPrefix('api')` en `main.ts`,
 * por lo que todas las rutas cuelgan de `/api`
 * (ej. `http://localhost:777/api/public/centers`).
 *
 * Valores por defecto en desarrollo:
 *   - iOS Simulator  : http://localhost:777/api
 *   - Android Emulator: http://10.0.2.2:777/api (loopback del anfitrión)
 *
 * Para producción, reemplaza el valor por la URL publicada del backend.
 *
 * Si más adelante usas `react-native-dotenv`, puedes dejar la variable
 * `UI_API_URL` en tu .env y ese valor tendrá prioridad.
 */
export const API_BASE_URL =
  process.env.UI_API_URL ??
  (Platform.OS === 'android' ? 'http://10.0.2.2:777/api' : 'http://localhost:777/api');

export const API_TIMEOUT_MS = 30_000;
