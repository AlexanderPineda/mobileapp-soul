import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { useI18n } from '../../i18n/I18nProvider';
import { borderRadius, colors, spacing } from '../../styles/theme';

/**
 * Botón ES/EN.
 *
 * La app no tiene menú de ajustes: el idioma se cambia donde el paciente lo
 * necesita, en la primera pantalla, igual que el selector de `/agendar` en el
 * web. El objetivo táctil es de 44 puntos (WCAG 2.5.5) y el estado se anuncia
 * con `accessibilityLabel`, no solo con el texto "ES".
 */
export function LanguageToggle() {
  const { locale, toggleLocale, t } = useI18n();

  return (
    <Pressable
      onPress={toggleLocale}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={t('language.change')}
      accessibilityHint={t(locale === 'es' ? 'language.en' : 'language.es')}
      hitSlop={8}
      testID="language-toggle"
    >
      <Text style={styles.text}>{locale.toUpperCase()}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 44,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  pressed: { backgroundColor: colors.surfaceInset },
  text: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
});
