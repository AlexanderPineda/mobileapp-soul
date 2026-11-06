/**
 * Configuración de Jest.
 *
 * `@react-navigation/*`, `react-native-screens`, `react-native-safe-area-context`
 * y `@react-native-picker/picker` se publican como ESM (`lib/module`), así que
 * Jest debe transpilarlos. Sin este `transformIgnorePatterns` la suite falla con
 * `SyntaxError: Unexpected token 'export'` al importar `AppNavigator`.
 *
 * Referencia: https://reactnative.dev/docs/testing-overview
 */
module.exports = {
  preset: '@react-native/jest-preset',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(?:@react-native|react-native|@react-navigation|react-native-screens|react-native-safe-area-context|@react-native-picker)/)',
  ],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/generated/**'],
};
