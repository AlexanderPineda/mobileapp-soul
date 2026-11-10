import {
  API_BASE_URL,
  API_TIMEOUT_MS,
  API_URLS_BY_ENVIRONMENT,
  environment,
} from '../src/config';

/**
 * La URL del API es la pieza que, si está mal, deja la app inservible sin un solo
 * error de compilación: en un build de release solo se nota al abrir la app.
 * Antes se leía `process.env.UI_API_URL`, que React Native nunca inyecta, así que
 * todo build terminaba apuntando a `localhost`.
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
