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

  return (
    <TouchableOpacity onPress={() => onSelect(therapist)} style={styles.card}>
      <View style={styles.avatarRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials || '♀'}</Text>
        </View>
        <View>
          <Text style={styles.name}>{name || 'Terapeuta'}</Text>
          {therapist.specialty ? <Text style={styles.specialty}>{therapist.specialty}</Text> : null}
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
