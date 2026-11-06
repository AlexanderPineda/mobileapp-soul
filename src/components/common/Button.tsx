import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { colors, borderRadius } from '../../styles/theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  testID?: string;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled,
  loading,
  style,
  testID,
}: ButtonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return { backgroundColor: colors.primary };
      case 'secondary':
        return { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.primary };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          // Borde de control visible (3.03:1); `colors.border` es decorativo.
          borderColor: colors.borderStrong,
        };
      case 'danger':
        return { backgroundColor: colors.error };
      default:
        return {};
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { paddingVertical: 8, paddingHorizontal: 12, borderRadius: borderRadius.sm };
      case 'md':
        return { paddingVertical: 12, paddingHorizontal: 16, borderRadius: borderRadius.md };
      case 'lg':
        return { paddingVertical: 16, paddingHorizontal: 24, borderRadius: borderRadius.md };
      default:
        return {};
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.button, getVariantStyles(), getSizeStyles(), style]}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator color={colors.surface} />
      ) : (
        <Text
          style={[
            styles.text,
            { color: variant === 'primary' || variant === 'danger' ? colors.surface : colors.text },
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 48,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  text: {
    fontSize: 15,
    fontWeight: '600',
  },
});
