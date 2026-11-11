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
 * App safety net.
 *
 * Without it, any exception during render (an unexpected `undefined` in the
 * backend response, for example) leaves the app on a blank screen with no way
 * back but a restart. In release the user does not see the stack trace, so a
 * clear action is offered.
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
    // In production this should reach your crash reporting service.
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
          This component wraps `I18nProvider` (if the render fails there is no
          context to read), so it translates with the pure function and the
          language left in the HTTP client store.
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
