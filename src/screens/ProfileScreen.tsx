import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../components/common/Button';
import { colors, spacing, typography } from '../styles/theme';
import type { MainTabScreenProps } from '../navigation/types';

export function ProfileScreen({ navigation }: MainTabScreenProps<'Profile'>) {
  return (
    <View style={styles.container}>
      <View style={styles.iconRow}>
        <Text style={styles.icon}>👤</Text>
      </View>
      <Text style={styles.title}>Perfil</Text>
      <Text style={styles.subtitle}>
        Esta versión de la app no incluye el perfil de paciente. Pronto podrás
        ver tu historial de citas y datos de contacto.
      </Text>
      <Button
        title="Volver al inicio"
        onPress={() => navigation.goBack()}
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
