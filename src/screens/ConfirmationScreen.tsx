import React from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';

import { Button } from '../components/common/Button';
import { buildGoogleCalendarUrl } from '../utils/googleCalendar';
import { colors, spacing, typography } from '../styles/theme';

export function ConfirmationScreen({
  route,
  navigation,
}: {
  route: {
    params: {
      appointment: Record<string, unknown>;
      patientName: string;
      patientLastName: string;
      patientEmail: string;
      patientPhone?: string;
    };
  };
  navigation: any;
}) {
  const {
    appointment,
    patientName,
    patientLastName,
    patientEmail,
    patientPhone,
  } = route.params;

  const fullName = `${patientName} ${patientLastName}`.trim();

  const appointmentStart = appointment?.startTime as string | undefined;
  const appointmentEnd = appointment?.endTime as string | undefined;
  const appointmentTitle = (appointment?.title as string) || 'Sesión de terapia';
  const canAddToCalendar = Boolean(appointmentStart && appointmentEnd);

  const handleAddToGoogleCalendar = () => {
    if (!appointmentStart || !appointmentEnd) return;
    const url = buildGoogleCalendarUrl({
      title: appointmentTitle,
      startTime: appointmentStart,
      endTime: appointmentEnd,
      description: `Cita confirmada. Paciente: ${fullName}`,
    });
    Linking.openURL(url).catch((err) =>
      console.error('Error opening Google Calendar:', err),
    );
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
        <Text style={styles.value}>{patientEmail}</Text>

        {patientPhone ? (
          <>
            <Text style={styles.label}>Teléfono</Text>
            <Text style={styles.value}>{patientPhone}</Text>
          </>
        ) : null}
      </View>

      {canAddToCalendar ? (
        <Button
          title="Agregar a Google Calendar"
          variant="secondary"
          onPress={handleAddToGoogleCalendar}
        />
      ) : null}

      <Button
        title="Listo"
        onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
      />
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
  },
  iconRow: { alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 40 },
  title: { ...typography.h1, color: colors.text },
  subtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
  card: {
    backgroundColor: colors.surface,
    borderRadius: colors.borderRadius.md,
    padding: spacing.md * 2,
    gap: spacing.sm,
    width: '100%',
  },
  label: { ...typography.label, color: colors.textSecondary },
  value: { ...typography.body, fontWeight: '600', color: colors.text },
});
