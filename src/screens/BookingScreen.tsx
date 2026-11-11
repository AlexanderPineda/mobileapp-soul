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
import { createPaymentPreference, markPaymentFailed } from '../api/payments';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { useI18n } from '../i18n/I18nProvider';
import { borderRadius, colors, spacing, typography } from '../styles/theme';
import { formatHour, hasStarted } from '../utils/format';
import { isValidEmail, isValidPhone, normalizeEmail } from '../utils/validation';
import type { ConfirmationPatient } from '../navigation/types';
import type { ScreenProps } from '../navigation/types';

/** Errors per form field. */
type FieldErrors = Partial<
  Record<'firstName' | 'lastName' | 'email' | 'phone', string>
>;

/**
 * Releases the temporary hold of a payment that was never completed.
 *
 * Used when the checkout cannot be opened: the backend already took the slot
 * (15 minutes) and, without this, the patient would see their own time as busy
 * when retrying. Best-effort: if the call fails, the hold expires on its own.
 */
async function releaseHold(paymentId: string): Promise<void> {
  await markPaymentFailed(paymentId).catch(() => undefined);
}

export function BookingScreen({ route, navigation }: ScreenProps<'Booking'>) {
  const { t, formatLongDate, formatAmount } = useI18n();
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
    price,
    currency,
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
  /** Backend call error, not a specific field one. */
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // `startTime` is the exact instant the backend computed with the centre IANA
  // time zone (`Center.timezone`), so it does not have to be rebuilt here.
  const startISO = startTime;
  const startAsDate = new Date(startISO);
  const endAsDate = new Date(startAsDate.getTime() + duration * 60_000);

  /** Typing in a field clears its error so no stale message is left. */
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
      // Normalised: the backend identifies the patient by exact email.
      email: normalizeEmail(email),
      phone: phone.trim() || undefined,
    };

    // The form data travels to the next screens: the appointment is created
    // by the backend (webhook or `directCreate`), so the full name and the
    // email only exist here; the backend `patientName` arrives masked.
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
          // The hold already exists in the backend: with no checkout to open it has
          // to be released, or the slot stays blocked for 15 minutes and the
          // patient cannot try again.
          await releaseHold(preference.id);
          throw new Error(t('booking.checkoutUnavailable'));
        }

        try {
          // The checkout opens in the system browser: the app cannot embed
          // Mercado Pago without a native dependency, and the patient comes
          // back on their own when done. `Payment` confirms the real state.
          await Linking.openURL(checkoutUrl);
        } catch {
          await releaseHold(preference.id);
          throw new Error(t('booking.checkoutUnavailable'));
        }
      }

      // `replace` takes the form out of the stack: going back after paying must
      // not allow resubmitting the booking.
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
        With the keyboard open the form (summary + 4 fields + button) does not
        fit on small screens, so it has to be scrollable.
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
          {typeof price === 'number' ? (
            <>
              <Text style={styles.summaryLabel}>{t('booking.total')}</Text>
              <Text style={styles.totalValue}>
                {formatAmount(price, currency)}
              </Text>
            </>
          ) : null}
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
            // Announces the failure without making the user scan the screen.
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
  /** The amount charged: same size as the title so it is read first. */
  totalValue: {
    ...typography.h3,
    color: colors.primary,
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
