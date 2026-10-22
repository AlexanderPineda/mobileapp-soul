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

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" />
      <AppNavigator />
    </SafeAreaProvider>
  );
}
