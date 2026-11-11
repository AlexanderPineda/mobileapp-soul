import {
  API_BASE_URL,
  API_TIMEOUT_MS,
  API_URLS_BY_ENVIRONMENT,
  environment,
} from '../src/config';

/**
 * The API URL is the piece that, when wrong, leaves the app useless without a
 * single compilation error: in a release build it is only noticed when opening
 * the app. It used to read `process.env.UI_API_URL`, which React Native never
 * injects, so every build ended up pointing at `localhost`.
 */
describe('configuración por entorno', () => {
  it('en los tests (__DEV__) usa el backend local', () => {
    expect(environment).toBe('development');
    expect(API_BASE_URL).toMatch(/^http:\/\/(localhost|10\.0\.2\.2):777\/api$/);
  });

  it('producción habla https contra el dominio publicado', () => {
    expect(API_URLS_BY_ENVIRONMENT.production).toBe(
      'https://api.soulrenacecontigo.com/api',
    );
  });

  it('ningún valor de desarrollo se filtra a producción', () => {
    const production = API_URLS_BY_ENVIRONMENT.production;

    expect(production.startsWith('https://')).toBe(true);
    expect(production).not.toContain('localhost');
    expect(production).not.toContain('10.0.2.2');
    expect(production).not.toContain(':777');
  });

  it('el timeout permite el sondeo del pago sin cortar la espera', () => {
    expect(API_TIMEOUT_MS).toBeGreaterThanOrEqual(10_000);
  });
});
