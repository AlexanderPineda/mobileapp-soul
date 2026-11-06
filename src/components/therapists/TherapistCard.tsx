import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { StaffProfile } from '../../types';
import { borderRadius, colors, spacing, typography } from '../../styles/theme';

interface TherapistCardProps {
  therapist: StaffProfile;
  onSelect: (therapist: StaffProfile) => void;
}

export function TherapistCard({ therapist, onSelect }: TherapistCardProps) {
  const initials =
    `${therapist.user?.firstName?.[0] ?? ''}${therapist.user?.lastName?.[0] ?? ''}`.toUpperCase();
  const name = `${therapist.user?.firstName ?? ''} ${therapist.user?.lastName ?? ''}`.trim();
  const displayName = name || 'Terapeuta';
  const specialty = therapist.specialty;

  return (
    <TouchableOpacity
      onPress={() => onSelect(therapist)}
      style={styles.card}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={
        specialty ? `${displayName}, ${specialty}` : displayName
      }
      accessibilityHint="Ver sus horarios disponibles"
    >
      <View style={styles.avatarRow}>
        {/* El avatar es decorativo: el nombre ya va en la etiqueta. */}
        <View
          style={styles.avatar}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <Text style={styles.avatarText}>{initials || '👤'}</Text>
        </View>
        <View>
          <Text style={styles.name}>{displayName}</Text>
          {specialty ? <Text style={styles.specialty}>{specialty}</Text> : null}
        </View>
      </View>
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
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 16, fontWeight: '700', color: colors.primary },
  name: { ...typography.h3, color: colors.text },
  specialty: { ...typography.bodySmall, color: colors.textSecondary },
});
