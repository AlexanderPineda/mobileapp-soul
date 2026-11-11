/**
 * Soul mobile app entry point.
 *
 * Navigation:
 *   - MainTabs: Home | Profile
 *   - Nested stack: Home -> Therapists -> Availability -> Booking -> Confirmation
 */

import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';

import { AppNavigator } from './src/navigation/AppNavigator';
import { ErrorBoundary } from './src/components/common/ErrorBoundary';
import { I18nProvider } from './src/i18n/I18nProvider';

export default function App() {
  return (
    <ErrorBoundary>
      <I18nProvider>
        <SafeAreaProvider>
          {/*
            The theme is light (cream/sage): with `light-content` the status bar
            icons came out white over a light background and invisible. In RN 0.87
            with edge-to-edge the background is painted by the app, not by
            `backgroundColor`.
          */}
          <StatusBar barStyle="dark-content" />
          <AppNavigator />
        </SafeAreaProvider>
      </I18nProvider>
    </ErrorBoundary>
  );
}
