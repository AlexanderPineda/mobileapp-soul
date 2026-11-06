import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { api } from '../api/apiClient';
import { Center } from '../types';
import { CenterCard } from '../components/centers/CenterCard';
import { EmptyState } from '../components/common/EmptyState';
import { colors, spacing, typography } from '../styles/theme';
import type { MainTabScreenProps } from '../navigation/types';

export function HomeScreen({ navigation }: MainTabScreenProps<'Home'>) {
  // La tab no tiene header propio: el inset superior se aplica aquí para que el
  // título no quede debajo de la barra de estado con edge-to-edge.
  const insets = useSafeAreaInsets();
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
        setError((err as Error).message);
        setCenters([]);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    loadCenters();
  }, [loadCenters]);

  const selectCenter = (center: Center) => {
    navigation.navigate('TherapistList', { centerId: center.id });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Encuentra tu centro</Text>
        <Text style={styles.subtitle}>
          Elige un centro para ver los terapeutas y horarios disponibles.
        </Text>
      </View>

      {error ? (
        <EmptyState
          title="No se pudieron cargar los centros"
          description={error}
          actionLabel="Reintentar"
          onAction={loadCenters}
        />
      ) : loading ? (
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Cargando centros…</Text>
        </View>
      ) : centers.length === 0 ? (
        <EmptyState
          title="Aún no hay centros disponibles"
          description="Comunícate con el administrador del sitio para conocer la ubicación de los centros."
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
  title: { ...typography.h1, color: colors.text },
  subtitle: { ...typography.body, color: colors.textSecondary },
  list: { padding: spacing.lg },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { ...typography.body, color: colors.textSecondary },
});
