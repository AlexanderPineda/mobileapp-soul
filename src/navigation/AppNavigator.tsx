import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { MainTabsNavigator } from './MainTabsNavigator';
import type { RootStackParamList } from './types';
import { useI18n } from '../i18n/I18nProvider';
import { TherapistListScreen } from '../screens/TherapistListScreen';
import { AvailabilityScreen } from '../screens/AvailabilityScreen';
import { BookingScreen } from '../screens/BookingScreen';
import { PaymentScreen } from '../screens/PaymentScreen';
import { ConfirmationScreen } from '../screens/ConfirmationScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const { t } = useI18n();

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
          options={{ title: t('therapists.screenTitle') }}
        />
        <Stack.Screen
          name="Availability"
          component={AvailabilityScreen}
          options={{ title: t('availability.screenTitle') }}
        />
        <Stack.Screen
          name="Booking"
          component={BookingScreen}
          options={{ title: t('booking.screenTitle') }}
        />
        <Stack.Screen
          name="Payment"
          component={PaymentScreen}
          options={{
            title: t('payment.screenTitle'),
            // Mientras se espera la confirmación del pago no hay nada que hacer
            // atrás: la reserva ya está creada y salir solo confunde.
            headerBackVisible: false,
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="Confirmation"
          component={ConfirmationScreen}
          options={{
            title: t('confirmation.screenTitle'),
            // La cita ya está pagada: volver atrás no debe reabrir el formulario.
            headerBackVisible: false,
            gestureEnabled: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
