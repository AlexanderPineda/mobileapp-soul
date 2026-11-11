import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '../components/common/Button';
import { useI18n } from '../i18n/I18nProvider';
import { colors, spacing, typography } from '../styles/theme';
import type { MainTabScreenProps } from '../navigation/types';

export function ProfileScreen({ navigation }: MainTabScreenProps<'Profile'>) {
  // No header of its own: the system insets are respected at both ends.
  const insets = useSafeAreaInsets();
  const { t } = useI18n();

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.lg },
      ]}
    >
      {/* Decorative emoji: hidden from the screen reader. */}
      <View
        style={styles.iconRow}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Text style={styles.icon}>👤</Text>
      </View>
      <Text style={styles.title}>{t('profile.title')}</Text>
      <Text style={styles.subtitle}>{t('profile.subtitle')}</Text>
      <Button
        title={t('common.backHome')}
        onPress={() => navigation.navigate('Home')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  iconRow: { alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 48 },
  title: { ...typography.h1, color: colors.text },
  subtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
});
