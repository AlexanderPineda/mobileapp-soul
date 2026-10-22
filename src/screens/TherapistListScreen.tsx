import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { api } from '../api/apiClient';
import { StaffProfile } from '../types';
import { TherapistCard } from '../components/therapists/TherapistCard';
import { EmptyState } from '../components/common/EmptyState';
import { colors, spacing, typography } from '../styles/theme';

export function TherapistListScreen({
  route,
  navigation,
}: {
  route: any;
  navigation: any;
}) {
  const { centerId } = route.params as { centerId: string };

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
        setError((err as Error).message);
        setTherapists([]);
        setLoading(false);
      });
  }, [centerId]);

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
        <Text style={styles.title}>Terapeutas</Text>
        <Text style={styles.subtitle}>
          Elige un terapeuta para ver sus disponibilidad.
        </Text>
      </View>

      {error ? (
        <EmptyState
          title="No se pudieron cargar los terapeutas"
          description={error}
          actionLabel="Reintentar"
          onAction={loadTherapists}
        />
      ) : loading ? (
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Cargando terapeutas…</Text>
        </View>
      ) : therapists.length === 0 ? (
        <EmptyState
          title="No hay terapeutas disponibles"
          description="Este centro aún no tiene terapeutas activos."
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
