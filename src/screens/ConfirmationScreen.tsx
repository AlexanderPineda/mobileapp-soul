import React from 'react';
import { Linking, Share, StyleSheet, Text, View } from 'react-native';

import { Button } from '../components/common/Button';
import { useI18n } from '../i18n/I18nProvider';
import { borderRadius, colors, spacing, typography } from '../styles/theme';
import { formatHour } from '../utils/format';
import { buildGoogleCalendarUrl } from '../utils/googleCalendar';
import type { ScreenProps } from '../navigation/types';

export function ConfirmationScreen({
  route,
  navigation,
}: ScreenProps<'Confirmation'>) {
  const { confirmation } = route.params;
  const { t, formatLongDate, formatAmount } = useI18n();

  const dateLabel = formatLongDate(confirmation.date);
  const timeLabel = formatHour(confirmation.time);
  const dateTimeLabel = t('confirmation.dateTimeValue', {
    date: dateLabel,
    time: timeLabel,
  });

  const handleAddToCalendar = () => {
    const url = buildGoogleCalendarUrl({
      title: confirmation.serviceName,
      startTime: confirmation.startTime,
      endTime: confirmation.endTime,
      location: confirmation.centerName,
      description: t('confirmation.subtitle'),
    });

    Linking.openURL(url).catch((err: unknown) =>
      console.error('Error opening Google Calendar:', err),
    );
  };

  const handleShare = () => {
    Share.share({
      message: t('confirmation.shareMessage', {
        service: confirmation.serviceName,
        date: dateLabel,
        time: timeLabel,
      }),
    }).catch((err: unknown) => console.error('Error sharing:', err));
  };

  const handleDone = () => {
    // The whole booking stack is cleared: going back is neither possible nor
    // desirable after paying the appointment.
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs', params: { screen: 'Home' } }],
    });
  };

  return (
    <View style={styles.container}>
      {/* Decorative emoji: hidden from the screen reader. */}
      <View
        style={styles.iconRow}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Text style={styles.icon}>✅</Text>
      </View>
      <Text style={styles.title} accessibilityRole="header">
        {t('confirmation.title')}
      </Text>
      <Text style={styles.subtitle}>{t('confirmation.subtitle')}</Text>

      <View style={styles.card}>
        <Text style={styles.label}>{t('confirmation.patient')}</Text>
        <Text style={styles.value}>{confirmation.patientName}</Text>

        <Text style={styles.label}>{t('confirmation.email')}</Text>
        <Text style={styles.value}>{confirmation.patientEmail}</Text>

        {confirmation.patientPhone ? (
          <>
            <Text style={styles.label}>{t('confirmation.phone')}</Text>
            <Text style={styles.value}>{confirmation.patientPhone}</Text>
          </>
        ) : null}

        <Text style={styles.label}>{t('confirmation.dateTime')}</Text>
        <Text style={styles.value}>{dateTimeLabel}</Text>

        <Text style={styles.label}>{t('confirmation.service')}</Text>
        <Text style={styles.value}>{confirmation.serviceName}</Text>

        <Text style={styles.label}>{t('confirmation.modality')}</Text>
        <Text style={styles.value}>
          {confirmation.isVirtual
            ? t('modality.virtual')
            : t('modality.onsite')}
        </Text>

        {confirmation.therapistName ? (
          <>
            <Text style={styles.label}>{t('confirmation.therapist')}</Text>
            <Text style={styles.value}>{confirmation.therapistName}</Text>
          </>
        ) : null}

        {confirmation.centerName ? (
          <>
            <Text style={styles.label}>{t('confirmation.center')}</Text>
            <Text style={styles.value}>{confirmation.centerName}</Text>
          </>
        ) : null}

        {typeof confirmation.amount === 'number' ? (
          <>
            <Text style={styles.label}>{t('confirmation.amount')}</Text>
            <Text style={styles.value}>
              {formatAmount(confirmation.amount, confirmation.currency)}
            </Text>
          </>
        ) : null}
      </View>

      <Button
        title={t('confirmation.addToCalendar')}
        variant="secondary"
        onPress={handleAddToCalendar}
      />
      <Button
        title={t('confirmation.share')}
        variant="ghost"
        onPress={handleShare}
      />
      <Button title={t('confirmation.done')} onPress={handleDone} />
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

