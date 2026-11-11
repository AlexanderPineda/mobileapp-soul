/**
 * Jest configuration.
 *
 * `@react-navigation/*`, `react-native-screens`, `react-native-safe-area-context`
 * and `@react-native-picker/picker` ship as ESM (`lib/module`), so Jest has to
 * transpile them. Without this `transformIgnorePatterns` the suite fails with
 * `SyntaxError: Unexpected token 'export'` when importing `AppNavigator`.
 *
 * Reference: https://reactnative.dev/docs/testing-overview
 */
module.exports = {
  preset: '@react-native/jest-preset',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(?:@react-native|react-native|@react-navigation|react-native-screens|react-native-safe-area-context|@react-native-picker)/)',
  ],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/generated/**'],
};
