/**
 * @format
 *
 * Smoke test de la app completa: monta el árbol de navegación y verifica que
 * la pantalla de inicio consulte el endpoint público de centros.
 *
 * La red está mockeada globalmente en `jest.setup.js`: este test no depende de
 * que el backend esté levantado.
 */

import React from 'react';
import ReactTestRenderer, {
  ReactTestRenderer as Renderer,
} from 'react-test-renderer';

import App from '../App';

test('monta la navegación y consulta los centros públicos', async () => {
  let tree: Renderer | undefined;

  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(<App />);
  });

  // Se lee después de `beforeEach`, que es donde `jest.setup.js` instala el mock.
  const fetchMock = global.fetch as unknown as jest.Mock;

  expect(tree).toBeDefined();
  expect(tree!.toJSON()).not.toBeNull();
  expect(fetchMock).toHaveBeenCalledWith(
    expect.stringContaining('/public/centers'),
    expect.anything(),
  );

  // Desmontar dentro de `act` evita que `react-native-screens` siga programando
  // trabajo asíncrono cuando el entorno de Jest ya se destruyó.
  await ReactTestRenderer.act(async () => {
    tree!.unmount();
  });
});
