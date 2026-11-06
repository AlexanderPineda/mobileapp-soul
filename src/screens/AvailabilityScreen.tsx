import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';

import { api } from '../api/apiClient';
import { FreeSlot, FreeSlotsResult } from '../types';
import { SERVICE_TYPES } from '../types';
import { SlotItem } from '../components/availability/SlotItem';
import { EmptyState } from '../components/common/EmptyState';
import { colors, spacing, typography } from '../styles/theme';
import { formatDate, hasStarted, toISODate } from '../utils/format';
import type { ScreenProps } from '../navigation/types';

export function AvailabilityScreen({
  route,
  navigation,
}: ScreenProps<'Availability'>) {
  const { centerId, staffProfileId: preselectedStaffProfileId } = route.params;

  const [date, setDate] = useState<string>(() => toISODate(new Date()));
  const [serviceTypeIndex, setServiceTypeIndex] = useState(0);
  const [slots, setSlots] = useState<FreeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const serviceType = SERVICE_TYPES[serviceTypeIndex];
  // La modalidad y la duración dependen del servicio elegido.
  const modality = serviceType.modality;
  const duration = serviceType.durationMinutes;

  const loadSlots = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.get<FreeSlotsResult>('/public/availability/slots', {
        date,
        durationMinutes: duration,
        centerId,
        modality,
        staffProfileId: preselectedStaffProfileId,
      });
      // El backend ya descarta el pasado; se filtra otra vez por si el listado
      // queda obsoleto mientras la pantalla está abierta.
      const now = new Date();
      setSlots((result.slots ?? []).filter((slot) => !hasStarted(slot.startTime, now)));
    } catch (err: unknown) {
      setError((err as Error).message);
      setSlots([]);
    } finally {
      setLoading(false);
    }
  }, [date, duration, centerId, modality, preselectedStaffProfileId]);

  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  const nextDays = useMemo(() => {
    const base = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(base);
      d.setDate(d.getDate() + i);
      return { value: toISODate(d), label: formatDate(d) };
    });
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Horarios disponibles</Text>
        <Text style={styles.subtitle}>
          Elige la modalidad del servicio y un día para reservar.
        </Text>
      </View>

      <View style={styles.pickerSection}>
        <Text style={styles.label}>Servicio</Text>
        <Picker
          selectedValue={String(serviceTypeIndex)}
          onValueChange={(itemValue: string) => {
            setServiceTypeIndex(Number(itemValue));
          }}
          style={styles.picker}
        >
          {SERVICE_TYPES.map((st, idx) => (
            <Picker.Item key={st.value} label={st.label} value={String(idx)} />
          ))}
        </Picker>
      </View>

      <View style={styles.pickerSection}>
        <Text style={styles.label}>Día</Text>
        <Picker
          selectedValue={date}
          onValueChange={(itemValue: string) => setDate(itemValue)}
          style={styles.picker}
        >
          {nextDays.map((d) => (
            <Picker.Item key={d.value} label={d.label} value={d.value} />
          ))}
        </Picker>
      </View>

      <Text style={styles.info}>
        Servicio: {serviceType.label} · Duración: {duration} min ·{' '}
        {modality === 'VIRTUAL' ? 'Virtual' : 'Presencial'}
      </Text>

      {error ? (
        <EmptyState
          title="No se pudieron cargar los horarios"
          description={error}
          actionLabel="Reintentar"
          onAction={loadSlots}
        />
      ) : loading ? (
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Cargando horarios…</Text>
        </View>
      ) : slots.length === 0 ? (
        <EmptyState
          title="No hay horarios disponibles"
          description="Intenta otro día o cambia el servicio."
        />
      ) : (
        <FlatList
          data={slots}
          keyExtractor={(item) => item.time}
          renderItem={({ item }) => (
            <SlotItem
              slot={item}
              onSelect={(slot) =>
                navigation.navigate('Booking', {
                  centerId,
                  modality,
                  date,
                  duration,
                  time: slot.time,
                  startTime: slot.startTime,
                  staffProfileId: preselectedStaffProfileId,
                  serviceType: serviceType.value,
                  serviceLabel: serviceType.label,
                  patientName: '',
                  patientLastName: '',
                  patientEmail: '',
                })
              }
            />
          )}
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
  pickerSection: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  label: { ...typography.label },
  picker: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: colors.borderRadius.md,
    paddingHorizontal: 12,
    height: 50,
  },
  info: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  list: { padding: spacing.lg, flexGrow: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { ...typography.body, color: colors.textSecondary },
});

export default AvailabilityScreen;
