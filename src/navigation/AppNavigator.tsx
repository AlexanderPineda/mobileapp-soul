import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { MainTabsNavigator } from './MainTabsNavigator';
import type { RootStackParamList } from './types';
import { TherapistListScreen } from '../screens/TherapistListScreen';
import { AvailabilityScreen } from '../screens/AvailabilityScreen';
import { BookingScreen } from '../screens/BookingScreen';
import { ConfirmationScreen } from '../screens/ConfirmationScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: true,
          headerBackButtonDisplayMode: 'minimal',
        }}
      >
        <Stack.Screen
          name="MainTabs"
          component={MainTabsNavigator}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="TherapistList"
          component={TherapistListScreen}
          options={{ title: 'Terapeutas' }}
        />
        <Stack.Screen
          name="Availability"
          component={AvailabilityScreen}
          options={{ title: 'Horarios disponibles' }}
        />
        <Stack.Screen
          name="Booking"
          component={BookingScreen}
          options={{ title: 'Reservar sesión' }}
        />
        <Stack.Screen
          name="Confirmation"
          component={ConfirmationScreen}
          options={{
            title: '¡Reserva confirmada!',
            // La cita ya se envió al backend: si el paciente vuelve atrás llega
            // al formulario y puede crear una reserva duplicada.
            headerBackVisible: false,
            gestureEnabled: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
