import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { api } from '../api/apiClient';
import { getErrorMessage } from '../api/errors';
import { Center } from '../types';
import { CenterCard } from '../components/centers/CenterCard';
import { EmptyState } from '../components/common/EmptyState';
import { LanguageToggle } from '../components/common/LanguageToggle';
import { useI18n } from '../i18n/I18nProvider';
import { colors, spacing, typography } from '../styles/theme';
import type { MainTabScreenProps } from '../navigation/types';

export function HomeScreen({ navigation }: MainTabScreenProps<'Home'>) {
  // The tab has no header of its own: the top inset is applied here so the
  // title does not end up under the status bar with edge-to-edge.
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const [centers, setCenters] = useState<Center[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCenters = React.useCallback(() => {
    setLoading(true);
    setError(null);

    api
      .get<Center[]>('/public/centers')
      .then((data) => {
        setCenters(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        setError(getErrorMessage(err, t));
        setCenters([]);
        setLoading(false);
      });
  }, [t]);

  useEffect(() => {
    loadCenters();
  }, [loadCenters]);

  const selectCenter = (center: Center) => {
    navigation.navigate('TherapistList', { centerId: center.id });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{t('home.title')}</Text>
          <LanguageToggle />
        </View>
        <Text style={styles.subtitle}>{t('home.subtitle')}</Text>
      </View>

      {error ? (
        <EmptyState
          title={t('home.errorTitle')}
          description={error}
          actionLabel={t('common.retry')}
          onAction={loadCenters}
        />
      ) : loading ? (
        <View style={styles.loading}>
          <Text style={styles.loadingText}>{t('home.loading')}</Text>
        </View>
      ) : centers.length === 0 ? (
        <EmptyState
          title={t('home.emptyTitle')}
          description={t('home.emptyDescription')}
        />
      ) : (
        <FlatList
          data={centers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <CenterCard center={item} onSelect={selectCenter} />}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: spacing.lg, gap: spacing.sm },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  title: { ...typography.h1, color: colors.text, flex: 1 },
  subtitle: { ...typography.body, color: colors.textSecondary },
  list: { padding: spacing.lg },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { ...typography.body, color: colors.textSecondary },
});
