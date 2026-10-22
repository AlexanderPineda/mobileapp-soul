import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { colors, typography } from '../../styles/theme';

export interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {actionLabel && onAction ? (
        <Text style={styles.button} onPress={onAction}>{actionLabel}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  title: { ...typography.h3, color: colors.text },
  description: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
  button: { ...typography.body, color: colors.primary, fontSize: 15, fontWeight: '600' },
});
