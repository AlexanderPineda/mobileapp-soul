import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FreeSlot } from '../../types';
import { useI18n } from '../../i18n/I18nProvider';
import { borderRadius, colors, spacing, typography } from '../../styles/theme';
import { formatHour } from '../../utils/format';

interface SlotItemProps {
  slot: FreeSlot;
  onSelect: (slot: FreeSlot) => void;
}

export function SlotItem({ slot, onSelect }: SlotItemProps) {
  const { t } = useI18n();
  const count = slot.staffProfileIds.length;

  // Dos claves en lugar de pluralización ICU: `es` y `en` solo distinguen
  // singular y plural en esta frase, y así el diccionario sigue siendo plano.
  const availability =
    count === 1
      ? t('slots.availableOne')
      : t('slots.availableMany', { count });
  const time = formatHour(slot.time);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onSelect(slot)}
      accessibilityRole="button"
      accessibilityLabel={`${time}, ${availability}`}
      accessibilityHint={t('slots.hint')}
    >
      <View style={styles.timeRow}>
        <Text style={styles.timeText}>{time}</Text>
        <Text style={styles.countLabel}>{availability}</Text>
      </View>
      <Text style={styles.hint}>{t('slots.hint')}</Text>
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
