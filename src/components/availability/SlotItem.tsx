import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FreeSlot } from '../../types';
import { borderRadius, colors, spacing, typography } from '../../styles/theme';
import { formatHour } from '../../utils/format';

interface SlotItemProps {
  slot: FreeSlot;
  onSelect: (slot: FreeSlot) => void;
}

export function SlotItem({ slot, onSelect }: SlotItemProps) {
  const count = slot.staffProfileIds.length;
  const plural = count !== 1 ? 's' : '';

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onSelect(slot)}
      accessibilityRole="button"
      accessibilityLabel={`${formatHour(slot.time)}, ${count} terapeuta${
        count === 1 ? '' : 's'
      } disponible${count === 1 ? '' : 's'}`}
    >
      <View style={styles.timeRow}>
        <Text style={styles.timeText}>{formatHour(slot.time)}</Text>
        <Text style={styles.countLabel}>
          {count} terapeuta{plural} disponible{plural}
        </Text>
      </View>
      <Text style={styles.hint}>Toque para reservar</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    // Borde de control visible (3.03:1): cada tarjeta es pulsable.
    borderColor: colors.borderStrong,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.xs,
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  timeText: { ...typography.h3, color: colors.primary },
  countLabel: { ...typography.bodySmall, color: colors.success },
  hint: { ...typography.caption, color: colors.textSecondary },
});
