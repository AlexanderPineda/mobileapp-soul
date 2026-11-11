import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { useI18n } from '../../i18n/I18nProvider';
import { borderRadius, colors, spacing } from '../../styles/theme';

/**
 * ES/EN button.
 *
 * The app has no settings menu: the language is changed where the patient needs
 * it, on the first screen, just like the `/agendar` selector on the web. The
 * touch target is 44 points (WCAG 2.5.5) and the state is announced with
 * `accessibilityLabel`, not just with the "ES" text.
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
