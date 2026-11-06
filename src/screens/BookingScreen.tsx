import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { api } from '../api/apiClient';
import { getErrorMessage } from '../api/errors';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { colors, spacing, typography } from '../styles/theme';
import { formatHour, formatLongDate, hasStarted } from '../utils/format';
import type { PublicAppointment } from '../types';
import type { ScreenProps } from '../navigation/types';

export function BookingScreen({ route, navigation }: ScreenProps<'Booking'>) {
  const {
    centerId,
    modality,
    date,
    duration,
    time,
    startTime,
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

  // `startTime` es el instante exacto que calculó el backend con la zona horaria
  // IANA del centro (`Center.timezone`), así que aquí no hay que reconstruirlo.
  const startISO = startTime;
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
    if (hasStarted(startISO)) {
      setError('Ese horario ya pasó. Vuelve atrás y elige otro, por favor.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const appointment = await api.post<PublicAppointment>(
        '/public/appointments',
        {
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
        },
      );

      // `replace` saca la pantalla del formulario del stack: si el paciente
      // vuelve atrás desde la confirmación no puede reenviar la reserva.
      navigation.replace('Confirmation', {
        appointment,
        date,
        time,
        patientPhone: phone.trim() || undefined,
      });
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/*
        Con el teclado abierto el formulario (resumen + 4 campos + botón) no cabe
        en pantallas pequeñas, así que debe poder desplazarse.
      */}
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
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
            {formatLongDate(date)} a las {formatHour(time)}
          </Text>
        </View>

        <View style={styles.fields}>
          <Input
            label="Nombre"
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Tu nombre"
            autoComplete="given-name"
            textContentType="givenName"
          />
          <Input
            label="Apellido"
            value={lastName}
            onChangeText={setLastName}
            placeholder="Tu apellido"
            autoComplete="family-name"
            textContentType="familyName"
          />
          <Input
            label="Correo"
            value={email}
            onChangeText={setEmail}
            placeholder="tu@correo.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
          />
          <Input
            label="Teléfono"
            value={phone}
            onChangeText={setPhone}
            placeholder="Opcional"
            keyboardType="phone-pad"
            autoComplete="tel"
            textContentType="telephoneNumber"
          />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button
          title="Confirmar reserva"
          onPress={handleSubmit}
          loading={submitting}
          disabled={submitting}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
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
  fields: { gap: spacing.sm },
  error: {
    color: colors.error,
    fontSize: 13,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
});
