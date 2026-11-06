import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { borderRadius, colors } from '../../styles/theme';

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
  const isDisabled = Boolean(disabled || loading);
  const isOnBrand = variant === 'primary' || variant === 'danger';
  const contentColor = isOnBrand ? colors.surface : colors.text;

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return { backgroundColor: colors.primary };
      case 'secondary':
        return {
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.primary,
        };
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
        return {
          paddingVertical: 8,
          paddingHorizontal: 12,
          borderRadius: borderRadius.sm,
        };
      case 'md':
        return {
          paddingVertical: 12,
          paddingHorizontal: 16,
          borderRadius: borderRadius.md,
        };
      case 'lg':
        return {
          paddingVertical: 16,
          paddingHorizontal: 24,
          borderRadius: borderRadius.md,
        };
      default:
        return {};
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.button,
        getVariantStyles(),
        getSizeStyles(),
        isDisabled && styles.disabled,
        style,
      ]}
      testID={testID}
      activeOpacity={0.8}
      accessibilityRole="button"
      // Se mantiene el título aunque se muestre el spinner: si no, VoiceOver y
      // TalkBack anuncian un botón sin nombre mientras se envía el formulario.
      accessibilityLabel={title}
      accessibilityState={{ disabled: isDisabled, busy: Boolean(loading) }}
    >
      {loading ? (
        <ActivityIndicator color={contentColor} />
      ) : (
        <Text style={[styles.text, { color: contentColor }]}>{title}</Text>
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
  /** Sin esto un botón deshabilitado se ve exactamente igual que uno activo. */
  disabled: { opacity: 0.6 },
  text: {
    fontSize: 15,
    fontWeight: '600',
  },
});
