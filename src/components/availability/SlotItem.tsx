import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FreeSlot } from '../../types';
import { colors, typography, spacing } from '../../styles/theme';
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
      style={[styles.container, count > 0 && styles.available]}
      onPress={() => onSelect(slot)}
      disabled={count === 0}
    >
      <View style={styles.timeRow}>
        <Text style={styles.timeText}>{slot.time}</Text>
        <Text style={styles.timeLabel}>{formatHour(slot.time)}</Text>
      </View>
      <View style={styles.countRow}>
        <Text style={styles.countNumber}>{count}</Text>
        <Text style={styles.countLabel}>
          {count} terapeuta{plural} disponible{plural} · toque para reservar
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: colors.borderRadius.md,
    padding: spacing.md,
    gap: spacing.sm,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  available: {
    borderWidth: 1,
    borderColor: colors.primary,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  timeText: { ...typography.h3, color: colors.primary },
  timeLabel: { ...typography.bodySmall, color: colors.textSecondary },
  countRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  countNumber: { ...typography.h3, color: colors.success },
  countLabel: { ...typography.bodySmall, color: colors.textSecondary },
});

export default SlotItem;
