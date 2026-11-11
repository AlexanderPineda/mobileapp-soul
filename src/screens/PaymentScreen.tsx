import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import {
  getPaymentStatus,
  markPaymentFailed,
  type PaymentStatusResponse,
} from '../api/payments';
import { getErrorMessage } from '../api/errors';
import { Button } from '../components/common/Button';
import { useI18n } from '../i18n/I18nProvider';
import type { MessageKey } from '../i18n/messages';
import { borderRadius, colors, spacing, typography } from '../styles/theme';
import { buildConfirmation } from '../utils/confirmation';
import type { ScreenProps } from '../navigation/types';

/** How often the payment is asked about while pending. */
const POLL_INTERVAL_MS = 4000;

type PaymentState = 'checking' | 'pending' | 'failed' | 'review' | 'not-found';

type Translator = (key: MessageKey) => string;

/**
 * Payment wait.
 *
 * The app opens the checkout in the system browser (`Linking.openURL`), so it
 * cannot know when it ends: Mercado Pago returns the patient to the website
 * (`back_urls` points at `FRONTEND_URL`) and from there there is no way to
 * notify the app. The truth is asked to the backend, the only one receiving the
 * webhook: this screen polls `GET /payments/status/:id` until the payment is
 * resolved.
 *
 * Polling stops on unmount; while the screen stays mounted the timer keeps
 * going, which is exactly what is needed when the patient comes back from the
 * browser.
 */
export function PaymentScreen({ route, navigation }: ScreenProps<'Payment'>) {
  const { paymentId, booking, patient } = route.params;
  const { t } = useI18n();

  const [state, setState] = useState<PaymentState>('checking');
  const [error, setError] = useState<string | null>(null);
  /** Changing this key restarts the effect: it is the "check again" button. */
  const [attempt, setAttempt] = useState(0);

  const goToConfirmation = useCallback(
    (status: PaymentStatusResponse) => {
      const confirmation = buildConfirmation(booking, patient, status);

      if (confirmation) {
        navigation.replace('Confirmation', { confirmation });
        return;
      }

      // Payment approved without an appointment: the backend leaves it for manual
      // review. It is neither an error nor a confirmation, so no screen is invented.
      setState('review');
    },
    [booking, navigation, patient],
  );

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const poll = async () => {
      try {
        const status = await getPaymentStatus(paymentId);
        if (cancelled) return;

        setError(null);

        if (!status.found) {
          setState('not-found');
          return;
        }

        if (status.status === 'PAID') {
          goToConfirmation(status);
          return;
        }

        if (
          status.status === 'FAILED' ||
          status.status === 'REFUNDED' ||
          status.status === 'VOIDED'
        ) {
          setState('failed');
          return;
        }

        setState('pending');
        timer = setTimeout(poll, POLL_INTERVAL_MS);
      } catch (err: unknown) {
        if (cancelled) return;

        // A network failure does not cancel the payment: it is reported and retried,
        // because the patient may be coming back from the browser with poor signal.
        setError(getErrorMessage(err, t));
        timer = setTimeout(poll, POLL_INTERVAL_MS);
      }
    };

    poll();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [attempt, goToConfirmation, paymentId, t]);

  const recheck = () => {
    setError(null);
    setState('checking');
    setAttempt((value) => value + 1);
  };

  const retryPayment = () => {
    // This screen is replaced by the form: the backend validates the slot again
    // before creating a new hold.
    navigation.replace('Booking', booking);
  };

  const goHome = async () => {
    if (state === 'failed') {
      // Best-effort: the payment already failed, but this frees the slot right away
      // instead of waiting the 15 minutes of the temporary hold.
      await markPaymentFailed(paymentId).catch(() => undefined);
    }

    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs', params: { screen: 'Home' } }],
    });
  };

  const content = describeState(state, t);

  return (
    <View style={styles.container}>
      <View
        style={styles.iconRow}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Text style={styles.icon}>{content.icon}</Text>
      </View>

      <Text style={styles.title} accessibilityRole="header">
        {content.title}
      </Text>
      <Text style={styles.description}>{content.description}</Text>

      {state === 'checking' || state === 'pending' ? (
        <View style={styles.checking}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.checkingText}>{t('payment.checking')}</Text>
        </View>
      ) : null}

      {error ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}

      {state === 'failed' || state === 'not-found' ? (
        <Button title={t('common.retry')} onPress={retryPayment} />
      ) : (
        <Button
          title={t('common.retry')}
          variant="secondary"
          onPress={recheck}
        />
      )}

      <Button title={t('common.backHome')} variant="ghost" onPress={goHome} />
    </View>
  );
}

/**
 * Copy and icon of each state.
 *
 * It lives outside the component so the JSX is not full of conditionals; the
 * state is the only input, so no odd combinations are possible.
 */
function describeState(
  state: PaymentState,
  t: Translator,
): { icon: string; title: string; description: string } {
  switch (state) {
    case 'failed':
      return {
        icon: '⚠️',
        title: t('payment.failureTitle'),
        description: t('payment.failureDescription'),
      };
    case 'review':
      return {
        icon: '🕒',
        title: t('payment.reviewTitle'),
        description: t('payment.reviewDescription'),
      };
    case 'not-found':
      return {
        icon: '❔',
        title: t('payment.notFoundTitle'),
        description: t('payment.notFoundDescription'),
      };
    default:
      return {
        icon: '💳',
        title: t('payment.pendingTitle'),
        description: t('payment.pendingDescription'),
      };
  }
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
  title: { ...typography.h1, color: colors.text, textAlign: 'center' },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  checking: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  checkingText: { ...typography.bodySmall, color: colors.textSecondary },
  error: {
    ...typography.bodySmall,
    color: colors.error,
    textAlign: 'center',
    backgroundColor: colors.dangerBg,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
  },
});
