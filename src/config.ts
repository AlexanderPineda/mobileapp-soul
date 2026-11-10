import { Platform } from 'react-native';

/**
 * Configuración de la app por entorno.
 *
 * Por qué no se lee `process.env.UI_API_URL`: React Native **no inyecta**
 * variables de entorno en el bundle (no hay dotenv en `babel.config.js`), así
 * que ese valor era siempre `undefined` y la app caía siempre a `localhost`,
 * incluso en un build de release instalado en un teléfono.
 *
 * Mientras no exista un entorno de staging, los dos entornos se distinguen con
 * `__DEV__`, que el bundler resuelve en tiempo de build: no depende de ninguna
 * dependencia y no se puede olvidar en un `.env`.
 */
export type Environment = 'development' | 'production';

/**
 * URL base del API por entorno. Se exporta para poder verificarla en tests y
 * documentarla; la app usa `API_BASE_URL`.
 */
export const API_URLS_BY_ENVIRONMENT: Record<Environment, string> = {
  // El emulador de Android no ve el `localhost` del host: 10.0.2.2 es su loopback.
  development: Platform.select({
    android: 'http://10.0.2.2:777/api',
    default: 'http://localhost:777/api',
  }) as string,
  // Producción: https con certificado válido, así que iOS ATS no necesita
  // excepciones y Android no necesita permitir tráfico en claro (en release
  // `usesCleartextTraffic` queda en `false`).
  production: 'https://api.soulrenacecontigo.com/api',
};

/** Entorno del build actual. `true` en debug, `false` en release. */
export const environment: Environment = __DEV__ ? 'development' : 'production';

export const API_BASE_URL = API_URLS_BY_ENVIRONMENT[environment];

/** Tiempo máximo de una petición. El sondeo de pagos también lo respeta. */
export const API_TIMEOUT_MS = 30_000;
