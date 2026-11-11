/**
 * @format
 *
 * Smoke test of the whole app: it mounts the navigation tree and checks that the
 * home screen queries the public centres endpoint.
 *
 * The network is mocked globally in `jest.setup.js`: this test does not depend on
 * the backend being up.
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

  // Read after `beforeEach`, which is where `jest.setup.js` installs the mock.
  const fetchMock = global.fetch as unknown as jest.Mock;

  expect(tree).toBeDefined();
  expect(tree!.toJSON()).not.toBeNull();
  expect(fetchMock).toHaveBeenCalledWith(
    expect.stringContaining('/public/centers'),
    expect.anything(),
  );

  // Unmounting inside `act` stops `react-native-screens` from scheduling
  // async work once the Jest environment is already torn down.
  await ReactTestRenderer.act(async () => {
    tree!.unmount();
  });
});
