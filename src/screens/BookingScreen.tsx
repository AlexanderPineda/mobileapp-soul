import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { api } from '../api/apiClient';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { colors, spacing, typography } from '../styles/theme';
import { buildISODateTime, formatHour } from '../utils/format';
import { SERVER_TIME_ZONE_OFFSET_MINUTES } from '../config';

/**
 * Formatea la fecha del slot (YYYY-MM-DD) como texto legible.
 * Se construye a partir de las partes UTC para evitar desfases de zona horaria.
 */
function formatBookingDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.toLocaleDateString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export function BookingScreen({
  route,
  navigation,
}: {
  route: {
    params: {
      centerId: string;
      modality: 'VIRTUAL' | 'PRESENCIAL';
      date: string;
      duration: number;
      time: string;
      staffProfileId?: string;
      serviceType: string;
      serviceLabel: string;
      patientName: string;
      patientLastName: string;
      patientEmail: string;
      patientPhone?: string;
    };
  };
  navigation: any;
}) {
  const {
    centerId,
    modality,
    date,
    duration,
    time,
    staffProfileId,
    serviceType,
    serviceLabel,
    patientName,
    patientLastName,
    patientEmail,
    patientPhone,
  } = route.params;

  const [firstName, setFirstName] = useState(patientName);
  const [lastName, setLastName] = useState(patientLastName);
  const [email, setEmail] = useState(patientEmail);
  const [phone, setPhone] = useState(patientPhone ?? '');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const startISO = buildISODateTime(
    new Date(date),
    time,
    SERVER_TIME_ZONE_OFFSET_MINUTES,
  );
  const startAsDate = new Date(startISO);
  const endAsDate = new Date(startAsDate.getTime() + duration * 60_000);

  const handleSubmit = async () => {
    if (!firstName.trim()) {
      setError('Ingresa tu nombre');
      return;
    }
    if (!lastName.trim()) {
      setError('Ingresa tu apellido');
      return;
    }
    if (!email.trim()) {
      setError('Ingresa tu correo');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Ingresa un correo válido');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await api.post('/public/appointments', {
        patientFirstName: firstName.trim(),
        patientLastName: lastName.trim(),
        patientEmail: email.trim(),
        patientPhone: phone.trim() || undefined,
        serviceType,
        centerId,
        staffProfileId: staffProfileId || undefined,
        startTime: startISO,
        endTime: endAsDate.toISOString(),
        durationMinutes: duration,
        isVirtual: modality === 'VIRTUAL',
      });

      navigation.navigate('Confirmation', {
        appointment: {
          startTime: startISO,
          endTime: endAsDate.toISOString(),
          title: serviceLabel,
          isVirtual: modality === 'VIRTUAL',
        },
        patientName: firstName.trim(),
        patientLastName: lastName.trim(),
        patientEmail: email.trim(),
        patientPhone: phone.trim() || undefined,
      });
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Reserva de sesión</Text>
        <Text style={styles.subtitle}>
          Completa tus datos y confirma. Ya casi terminas.
        </Text>
      </View>

      <View style={styles.summary}>
        <Text style={styles.summaryLabel}>Servicio</Text>
        <Text style={styles.summaryValue}>{serviceLabel}</Text>
        <Text style={styles.summaryLabel}>Duración</Text>
        <Text style={styles.summaryValue}>{duration} minutos</Text>
        <Text style={styles.summaryLabel}>Modalidad</Text>
        <Text style={styles.summaryValue}>
          {modality === 'VIRTUAL' ? 'Virtual' : 'Presencial'}
        </Text>
        <Text style={styles.summaryLabel}>Fecha y hora</Text>
        <Text style={styles.summaryValue}>
          {formatBookingDate(date)} a las {formatHour(time)}
        </Text>
      </View>

      <Input
        label="Nombre"
        value={firstName}
        onChangeText={setFirstName}
        placeholder="Tu nombre"
      />
      <Input
        label="Apellido"
        value={lastName}
        onChangeText={setLastName}
        placeholder="Tú apellido"
      />
      <Input
        label="Correo"
        value={email}
        onChangeText={setEmail}
        placeholder="tu@correo.com"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Input
        label="Teléfono"
        value={phone}
        onChangeText={setPhone}
        placeholder="Opcional"
        keyboardType="phone-pad"
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button
        title="Confirmar reserva"
        onPress={handleSubmit}
        loading={submitting}
        disabled={submitting}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  header: { padding: spacing.lg, gap: spacing.sm },
  title: { ...typography.h1, color: colors.text },
  subtitle: { ...typography.body, color: colors.textSecondary },
  summary: {
    backgroundColor: colors.surface,
    borderRadius: colors.borderRadius.md,
    padding: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  summaryLabel: { ...typography.label, color: colors.textSecondary },
  summaryValue: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  error: {
    color: colors.error,
    fontSize: 13,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
});
