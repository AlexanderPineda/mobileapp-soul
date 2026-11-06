import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Center } from '../../types';
import { borderRadius, colors, spacing, typography } from '../../styles/theme';

interface CenterCardProps {
  center: Center;
  onSelect: (center: Center) => void;
}

export function CenterCard({ center, onSelect }: CenterCardProps) {
  return (
    <TouchableOpacity onPress={() => onSelect(center)} style={styles.card}>
      <View style={styles.iconRow}>
        <Text style={styles.icon}>📍</Text>
      </View>
      <Text style={styles.name}>{center.name}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.sm,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  iconRow: { alignItems: 'center' },
  icon: { fontSize: 22 },
  name: { ...typography.h3, color: colors.text },
});
