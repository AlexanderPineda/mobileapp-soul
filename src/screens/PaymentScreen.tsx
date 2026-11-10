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

/** Cada cuánto se pregunta por el pago mientras está pendiente. */
const POLL_INTERVAL_MS = 4000;

type PaymentState = 'checking' | 'pending' | 'failed' | 'review' | 'not-found';

type Translator = (key: MessageKey) => string;

/**
 * Espera del pago.
 *
 * La app abre el checkout en el navegador del sistema (`Linking.openURL`), así
 * que no puede saber cuándo termina: Mercado Pago devuelve al paciente a la web
 * (`back_urls` apunta a `FRONTEND_URL`) y desde ahí no hay forma de avisar a la
 * app. La verdad se consulta al backend, que es el único que recibe el webhook:
 * esta pantalla sondea `GET /payments/status/:id` hasta que el pago se resuelve.
 *
 * El sondeo se detiene al desmontar; mientras la pantalla siga montada, el
 * temporizador continúa, que es justo lo que hace falta cuando el paciente
 * vuelve del navegador.
 */
export function PaymentScreen({ route, navigation }: ScreenProps<'Payment'>) {
  const { paymentId, booking, patient } = route.params;
  const { t } = useI18n();

  const [state, setState] = useState<PaymentState>('checking');
  const [error, setError] = useState<string | null>(null);
  /** Cambiar esta clave reinicia el efecto: es el botón "volver a comprobar". */
  const [attempt, setAttempt] = useState(0);

  const goToConfirmation = useCallback(
    (status: PaymentStatusResponse) => {
      const confirmation = buildConfirmation(booking, patient, status);

      if (confirmation) {
        navigation.replace('Confirmation', { confirmation });
        return;
      }

      // Pago aprobado sin cita: el backend la deja en revisión manual. No es un
      // error y tampoco una confirmación, así que no se inventa una pantalla.
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

        // Un fallo de red no cancela el pago: se avisa y se reintenta, porque el
        // paciente puede estar volviendo del navegador sin buena señal.
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
    // Se reemplaza esta pantalla por el formulario: el backend vuelve a validar
    // el horario antes de crear una reserva nueva.
    navigation.replace('Booking', booking);
  };

  const goHome = async () => {
    if (state === 'failed') {
      // Best-effort: el pago ya falló, pero esto libera el horario al instante
      // en lugar de esperar los 15 minutos de la reserva temporal.
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
 * Textos e icono de cada estado.
 *
 * Vive fuera del componente para que el JSX no quede lleno de condicionales; el
 * estado es la única entrada, así que no hay combinaciones raras posibles.
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
