import React from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';

import { Button } from '../components/common/Button';
import { buildGoogleCalendarUrl } from '../utils/googleCalendar';
import { formatHour, formatLongDate } from '../utils/format';
import { borderRadius, colors, spacing, typography } from '../styles/theme';
import type { ScreenProps } from '../navigation/types';

export function ConfirmationScreen({
  route,
  navigation,
}: ScreenProps<'Confirmation'>) {
  const { appointment, date, time, patientPhone } = route.params;

  const patient = appointment.patient;
  const fullName = `${patient?.firstName ?? ''} ${patient?.lastName ?? ''}`.trim();
  const therapist = appointment.staffProfile?.user;
  const therapistName = `${therapist?.firstName ?? ''} ${therapist?.lastName ?? ''}`.trim();

  const handleAddToGoogleCalendar = () => {
    const url = buildGoogleCalendarUrl({
      title: appointment.title || 'Sesión de terapia',
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      description: `Cita confirmada. Paciente: ${fullName}`,
    });
    Linking.openURL(url).catch((err: unknown) =>
      console.error('Error opening Google Calendar:', err),
    );
  };

  const handleDone = () => {
    // Se limpia todo el stack de reserva: volver atrás ya no es posible ni
    // deseable después de crear la cita.
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs', params: { screen: 'Home' } }],
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconRow}>
        <Text style={styles.icon}>✅</Text>
      </View>
      <Text style={styles.title}>¡Reserva confirmada!</Text>
      <Text style={styles.subtitle}>
        Hemos registrado tu solicitud. Un terapeuta revisará los detalles y
        confirmará tu cita.
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>Paciente</Text>
        <Text style={styles.value}>{fullName}</Text>

        <Text style={styles.label}>Correo</Text>
        <Text style={styles.value}>{patient?.email}</Text>

        {patientPhone ? (
          <>
            <Text style={styles.label}>Teléfono</Text>
            <Text style={styles.value}>{patientPhone}</Text>
          </>
        ) : null}

        <Text style={styles.label}>Fecha y hora</Text>
        <Text style={styles.value}>
          {formatLongDate(date)} a las {formatHour(time)}
        </Text>

        <Text style={styles.label}>Servicio</Text>
        <Text style={styles.value}>{appointment.title}</Text>

        <Text style={styles.label}>Modalidad</Text>
        <Text style={styles.value}>
          {appointment.isVirtual ? 'Virtual' : 'Presencial'}
        </Text>

        {therapistName ? (
          <>
            <Text style={styles.label}>Terapeuta asignado</Text>
            <Text style={styles.value}>{therapistName}</Text>
          </>
        ) : null}
      </View>

      <Button
        title="Agregar a Google Calendar"
        variant="secondary"
        onPress={handleAddToGoogleCalendar}
      />

      <Button title="Listo" onPress={handleDone} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  iconRow: { alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 40 },
  title: { ...typography.h1, color: colors.text },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md * 2,
    gap: spacing.sm,
    width: '100%',
  },
  label: { ...typography.label, color: colors.textSecondary },
  value: { ...typography.body, fontWeight: '600', color: colors.text },
});

