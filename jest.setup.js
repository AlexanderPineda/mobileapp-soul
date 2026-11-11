/**
 * Global Jest setup.
 *
 * 1. `SafeAreaProvider` does not render its children until the native module
 *    hands it the insets, so under Jest the tree stays empty (`children: null`).
 *    The package ships an official mock with fixed insets.
 * 2. Tests must not touch the network: any `fetch` arriving without an explicit
 *    mock returns 404, instead of trying to reach `localhost:777` and making the
 *    suite pass or fail depending on whether the backend is up.
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
