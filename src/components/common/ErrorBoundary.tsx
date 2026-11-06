import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from './Button';
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
        <Text style={styles.title}>Algo salió mal</Text>
        <Text style={styles.description}>
          Tuvimos un problema al mostrar esta pantalla. Puedes intentarlo de
          nuevo.
        </Text>
        <Button title="Reintentar" onPress={this.handleRetry} />
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
