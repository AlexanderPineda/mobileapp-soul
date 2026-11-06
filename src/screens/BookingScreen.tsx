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
import { borderRadius, colors, spacing, typography } from '../styles/theme';
import { formatHour, formatLongDate, hasStarted } from '../utils/format';
import { isValidEmail, isValidPhone, normalizeEmail } from '../utils/validation';
import type { PublicAppointment } from '../types';
import type { ScreenProps } from '../navigation/types';

/** Errores por campo del formulario. */
type FieldErrors = Partial<
  Record<'firstName' | 'lastName' | 'email' | 'phone', string>
>;

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
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  /** Error de la llamada al backend, no de un campo concreto. */
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // `startTime` es el instante exacto que calculó el backend con la zona horaria
  // IANA del centro (`Center.timezone`), así que aquí no hay que reconstruirlo.
  const startISO = startTime;
  const startAsDate = new Date(startISO);
  const endAsDate = new Date(startAsDate.getTime() + duration * 60_000);

  /** Al escribir en un campo se limpia su error para no dejar mensajes rancios. */
  const clearFieldError = (field: keyof FieldErrors) => {
    setFieldErrors((prev) =>
      prev[field] ? { ...prev, [field]: undefined } : prev,
    );
  };

  const validate = (): FieldErrors => {
    const next: FieldErrors = {};

    if (!firstName.trim()) next.firstName = 'Ingresa tu nombre';
    if (!lastName.trim()) next.lastName = 'Ingresa tu apellido';

    if (!email.trim()) {
      next.email = 'Ingresa tu correo';
    } else if (!isValidEmail(email)) {
      next.email = 'Ingresa un correo válido';
    }

    if (phone.trim() && !isValidPhone(phone)) {
      next.phone = 'Ingresa un teléfono válido (mínimo 7 dígitos)';
    }

    return next;
  };

  const handleSubmit = async () => {
    const nextErrors = validate();
    setFieldErrors(nextErrors);
    setError(null);

    if (Object.keys(nextErrors).length > 0) return;

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
          // Normalizado: el backend identifica al paciente por email exacto.
          patientEmail: normalizeEmail(email),
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
            onChangeText={(value) => {
              setFirstName(value);
              clearFieldError('firstName');
            }}
            error={fieldErrors.firstName}
            placeholder="Tu nombre"
            autoComplete="given-name"
            textContentType="givenName"
          />
          <Input
            label="Apellido"
            value={lastName}
            onChangeText={(value) => {
              setLastName(value);
              clearFieldError('lastName');
            }}
            error={fieldErrors.lastName}
            placeholder="Tu apellido"
            autoComplete="family-name"
            textContentType="familyName"
          />
          <Input
            label="Correo"
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              clearFieldError('email');
            }}
            error={fieldErrors.email}
            placeholder="tu@correo.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
          />
          <Input
            label="Teléfono"
            value={phone}
            onChangeText={(value) => {
              setPhone(value);
              clearFieldError('phone');
            }}
            error={fieldErrors.phone}
            placeholder="Opcional"
            keyboardType="phone-pad"
            autoComplete="tel"
            textContentType="telephoneNumber"
          />
        </View>

        {error ? (
          <Text
            style={styles.error}
            accessibilityRole="alert"
            // Anuncia el fallo sin que el usuario tenga que recorrer la pantalla.
            accessibilityLiveRegion="polite"
          >
            {error}
          </Text>
        ) : null}

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
    borderRadius: borderRadius.md,
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
