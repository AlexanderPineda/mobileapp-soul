import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { getErrorMessage } from '../api/errors';
import { createPaymentPreference } from '../api/payments';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { useI18n } from '../i18n/I18nProvider';
import { borderRadius, colors, spacing, typography } from '../styles/theme';
import { formatHour, hasStarted } from '../utils/format';
import { isValidEmail, isValidPhone, normalizeEmail } from '../utils/validation';
import type { ConfirmationPatient } from '../navigation/types';
import type { ScreenProps } from '../navigation/types';

/** Errores por campo del formulario. */
type FieldErrors = Partial<
  Record<'firstName' | 'lastName' | 'email' | 'phone', string>
>;

export function BookingScreen({ route, navigation }: ScreenProps<'Booking'>) {
  const { t, formatLongDate } = useI18n();
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

    if (!firstName.trim()) next.firstName = t('booking.errorFirstName');
    if (!lastName.trim()) next.lastName = t('booking.errorLastName');

    if (!email.trim()) {
      next.email = t('booking.errorEmailRequired');
    } else if (!isValidEmail(email)) {
      next.email = t('booking.errorEmailInvalid');
    }

    if (phone.trim() && !isValidPhone(phone)) {
      next.phone = t('booking.errorPhone');
    }

    return next;
  };

  const handleSubmit = async () => {
    const nextErrors = validate();
    setFieldErrors(nextErrors);
    setError(null);

    if (Object.keys(nextErrors).length > 0) return;

    if (hasStarted(startISO)) {
      setError(t('booking.errorPastSlot'));
      return;
    }

    setSubmitting(true);
    setError(null);

    const patientData: ConfirmationPatient = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      // Normalizado: el backend identifica al paciente por email exacto.
      email: normalizeEmail(email),
      phone: phone.trim() || undefined,
    };

    // Los datos del formulario viajan a las siguientes pantallas: la cita la
    // crea el backend (webhook o `directCreate`), así que el nombre completo y
    // el correo solo existen aquí; `patientName` del backend viene enmascarado.
    const booking = {
      ...route.params,
      patientName: patientData.firstName,
      patientLastName: patientData.lastName,
      patientEmail: patientData.email,
      patientPhone: patientData.phone,
    };

    try {
      const preference = await createPaymentPreference({
        patientFirstName: patientData.firstName,
        patientLastName: patientData.lastName,
        patientEmail: patientData.email,
        ...(patientData.phone ? { patientPhone: patientData.phone } : {}),
        serviceType,
        centerId,
        ...(staffProfileId ? { staffProfileId } : {}),
        startTime: startISO,
        endTime: endAsDate.toISOString(),
        durationMinutes: duration,
        isVirtual: modality === 'VIRTUAL',
      });

      if (!preference.directCreate) {
        const checkoutUrl =
          preference.init_point ?? preference.sandbox_init_point;

        if (!checkoutUrl) {
          throw new Error(t('booking.checkoutUnavailable'));
        }

        // Se abre el checkout en el navegador del sistema: la app no puede
        // incrustar Mercado Pago sin una dependencia nativa, y el paciente
        // vuelve solo cuando termina. El estado real lo confirma `Payment`.
        await Linking.openURL(checkoutUrl);
      }

      // `replace` saca el formulario del stack: volver atrás después de pagar no
      // debe permitir reenviar la reserva.
      navigation.replace('Payment', {
        paymentId: preference.id,
        booking,
        patient: patientData,
      });
    } catch (err: unknown) {
      setError(getErrorMessage(err, t));
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
          <Text style={styles.title}>{t('booking.title')}</Text>
          <Text style={styles.subtitle}>{t('booking.subtitle')}</Text>
        </View>

        <View style={styles.summary}>
          <Text style={styles.summaryLabel}>{t('confirmation.service')}</Text>
          <Text style={styles.summaryValue}>{serviceLabel}</Text>
          <Text style={styles.summaryLabel}>{t('confirmation.dateTime')}</Text>
          <Text style={styles.summaryValue}>
            {t('confirmation.dateTimeValue', {
              date: formatLongDate(date),
              time: formatHour(time),
            })}
          </Text>
          <Text style={styles.summaryLabel}>{t('confirmation.modality')}</Text>
          <Text style={styles.summaryValue}>
            {modality === 'VIRTUAL'
              ? t('modality.virtual')
              : t('modality.onsite')}
          </Text>
        </View>

        <View style={styles.fields}>
          <Input
            label={t('booking.firstName')}
            value={firstName}
            onChangeText={(value) => {
              setFirstName(value);
              clearFieldError('firstName');
            }}
            error={fieldErrors.firstName}
            autoComplete="given-name"
            textContentType="givenName"
          />
          <Input
            label={t('booking.lastName')}
            value={lastName}
            onChangeText={(value) => {
              setLastName(value);
              clearFieldError('lastName');
            }}
            error={fieldErrors.lastName}
            autoComplete="family-name"
            textContentType="familyName"
          />
          <Input
            label={t('booking.email')}
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
            label={t('booking.phone')}
            value={phone}
            onChangeText={(value) => {
              setPhone(value);
              clearFieldError('phone');
            }}
            error={fieldErrors.phone}
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

        <Text style={styles.notice}>{t('booking.paymentNotice')}</Text>

        <Button
          title={submitting ? t('booking.submitting') : t('booking.submit')}
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
  notice: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  error: {
    color: colors.error,
    fontSize: 13,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
});
