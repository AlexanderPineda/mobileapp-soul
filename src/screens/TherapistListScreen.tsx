import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { api } from '../api/apiClient';
import { getErrorMessage } from '../api/errors';
import { StaffProfile } from '../types';
import { TherapistCard } from '../components/therapists/TherapistCard';
import { EmptyState } from '../components/common/EmptyState';
import { useI18n } from '../i18n/I18nProvider';
import { colors, spacing, typography } from '../styles/theme';
import type { ScreenProps } from '../navigation/types';

export function TherapistListScreen({
  route,
  navigation,
}: ScreenProps<'TherapistList'>) {
  const { centerId } = route.params;
  const { t } = useI18n();

  const [therapists, setTherapists] = useState<StaffProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTherapists = React.useCallback(() => {
    setLoading(true);
    setError(null);

    api
      .get<StaffProfile[]>('/public/therapists', { centerId })
      .then((data) => {
        setTherapists(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        setError(getErrorMessage(err, t));
        setTherapists([]);
        setLoading(false);
      });
  }, [centerId, t]);

  useEffect(() => {
    loadTherapists();
  }, [loadTherapists]);

  const selectTherapist = (therapist: StaffProfile) => {
    navigation.navigate('Availability', {
      centerId,
      staffProfileId: therapist.id,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('therapists.title')}</Text>
        <Text style={styles.subtitle}>{t('therapists.subtitle')}</Text>
      </View>

      {error ? (
        <EmptyState
          title={t('therapists.errorTitle')}
          description={error}
          actionLabel={t('common.retry')}
          onAction={loadTherapists}
        />
      ) : loading ? (
        <View style={styles.loading}>
          <Text style={styles.loadingText}>{t('therapists.loading')}</Text>
        </View>
      ) : therapists.length === 0 ? (
        <EmptyState
          title={t('therapists.emptyTitle')}
          description={t('therapists.emptyDescription')}
        />
      ) : (
        <FlatList
          data={therapists}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <TherapistCard therapist={item} onSelect={selectTherapist} />}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: spacing.lg, gap: spacing.sm },
  title: { ...typography.h1, color: colors.text },
  subtitle: { ...typography.body, color: colors.textSecondary },
  list: { padding: spacing.lg },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { ...typography.body, color: colors.textSecondary },
});
