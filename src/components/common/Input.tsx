import React from 'react';
import {
  Text,
  TextInput,
  View,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import { borderRadius, colors, typography } from '../../styles/theme';

export interface InputProps extends TextInputProps {
  label: string;
  error?: string;
}

export function Input({
  label,
  error,
  style,
  ...props
}: InputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...props}
        style={[
          styles.input,
          style,
          error && { borderColor: colors.error, backgroundColor: colors.dangerBg },
        ]}
        placeholderTextColor={colors.textSecondary}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', gap: 6 },
  label: { ...typography.label },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    // Borde de control: `colors.border` (1.69:1) no cumple WCAG 1.4.11.
    borderColor: colors.borderStrong,
    borderRadius: borderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
  },
  error: { fontSize: 12, color: colors.error },
});
