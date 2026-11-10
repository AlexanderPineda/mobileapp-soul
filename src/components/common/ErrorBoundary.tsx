import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from './Button';
import { getRequestLocale } from '../../i18n/locale';
import { translate } from '../../i18n/messages';
import { colors, spacing, typography } from '../../styles/theme';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Red de seguridad de la app.
 *
 * Sin esto, cualquier excepción durante el render (un `undefined` inesperado en
 * la respuesta del backend, por ejemplo) deja la app en pantalla blanca y sin
 * forma de recuperarse salvo reiniciando. En release el usuario no ve el stack
 * trace, así que se ofrece una acción clara.
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // En producción esto debe llegar a tu servicio de crash reporting.
    console.error('Error no controlado en la app:', error, info.componentStack);
  }

  private handleRetry = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;

    if (!error) {
      return this.props.children;
    }

    return (
      <View style={styles.container}>
        {/*
          Este componente envuelve al `I18nProvider` (si falla el render no hay
          contexto que leer), así que traduce con la función pura y el idioma que
          quedó en el store del cliente HTTP.
        */}
        <Text style={styles.title}>
          {translate(getRequestLocale(), 'errorBoundary.title')}
        </Text>
        <Text style={styles.description}>
          {translate(getRequestLocale(), 'errorBoundary.description')}
        </Text>
        <Button
          title={translate(getRequestLocale(), 'common.retry')}
          onPress={this.handleRetry}
        />
      </View>
    );
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
  title: { ...typography.h1, color: colors.text, textAlign: 'center' },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
