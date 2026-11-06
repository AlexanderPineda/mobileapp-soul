/**
 * App principal de Soul (móvil).
 *
 * Navegación:
 *   - MainTabs: Inicio | Perfil
 *   - Stack anidado: Home -> Terapeutas -> Disponibilidad -> Reserva -> Confirmación
 */

import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';

import { AppNavigator } from './src/navigation/AppNavigator';
import { ErrorBoundary } from './src/components/common/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        {/*
          El tema es claro (crema/sage): con `light-content` los iconos de la barra
          de estado quedaban blancos sobre fondo claro e invisibles. En RN 0.87 con
          edge-to-edge el fondo lo pinta la app, no `backgroundColor`.
        */}
        <StatusBar barStyle="dark-content" />
        <AppNavigator />
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
