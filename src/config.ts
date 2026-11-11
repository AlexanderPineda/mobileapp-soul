import { Platform } from 'react-native';

/**
 * App configuration per environment.
 *
 * Why `process.env.UI_API_URL` is not read: React Native does **not inject**
 * environment variables into the bundle (there is no dotenv in
 * `babel.config.js`), so that value was always `undefined` and the app always
 * fell back to `localhost`, even in a release build installed on a phone.
 *
 * Until a staging environment exists, the two environments are told apart with
 * `__DEV__`, which the bundler resolves at build time: it depends on no
 * dependency and cannot be forgotten in a `.env`.
 */
export type Environment = 'development' | 'production';

/**
 * API base URL per environment. Exported so it can be checked in tests and
 * documented; the app uses `API_BASE_URL`.
 */
export const API_URLS_BY_ENVIRONMENT: Record<Environment, string> = {
  // The Android emulator cannot see the host `localhost`: 10.0.2.2 is its loopback.
  development: Platform.select({
    android: 'http://10.0.2.2:777/api',
    default: 'http://localhost:777/api',
  }) as string,
  // Production: https with a valid certificate, so iOS ATS needs no
  // exceptions and Android does not need to allow cleartext traffic (in release
  // `usesCleartextTraffic` stays `false`).
  production: 'https://api.soulrenacecontigo.com/api',
};

/** Current build environment. `true` in debug, `false` in release. */
export const environment: Environment = __DEV__ ? 'development' : 'production';

export const API_BASE_URL = API_URLS_BY_ENVIRONMENT[environment];

/** Request timeout. The payment polling respects it too. */
export const API_TIMEOUT_MS = 30_000;
