/**
 * Setup global de Jest.
 *
 * 1. `SafeAreaProvider` no renderiza a sus hijos hasta que el módulo nativo le
 *    entrega los insets, por lo que en Jest el árbol queda vacío (`children:
 *    null`). El paquete publica un mock oficial con insets fijos.
 * 2. Los tests no deben tocar la red: cualquier `fetch` que llegue sin un mock
 *    explícito devuelve 404, en lugar de intentar alcanzar `localhost:777` y
 *    hacer que la suite pase o falle según si el backend está levantado.
 */

/* eslint-env jest */

jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default,
);

beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ message: 'fetch no mockeado en el test' }),
    }),
  );
});

afterEach(() => {
  jest.clearAllMocks();
});
