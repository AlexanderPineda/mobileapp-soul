import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';

import { api } from '../api/apiClient';
import { getErrorMessage } from '../api/errors';
import type {
  CatalogService,
  FreeSlot,
  FreeSlotsResult,
  ServiceTypeOption,
} from '../types';
import { SlotItem } from '../components/availability/SlotItem';
import { EmptyState } from '../components/common/EmptyState';
import { useI18n } from '../i18n/I18nProvider';
import { borderRadius, colors, spacing, typography } from '../styles/theme';
import { hasStarted, toISODate } from '../utils/format';
import { toServiceOptions } from '../utils/service-catalog';
import type { ScreenProps } from '../navigation/types';

export function AvailabilityScreen({
  route,
  navigation,
}: ScreenProps<'Availability'>) {
  const { centerId, staffProfileId: preselectedStaffProfileId } = route.params;
  const { t, formatDate, formatAmount } = useI18n();

  const [services, setServices] = useState<ServiceTypeOption[]>([]);
  const [servicesStatus, setServicesStatus] = useState<
    'loading' | 'ready' | 'empty' | 'error'
  >('loading');
  const [servicesError, setServicesError] = useState<string | null>(null);

  const [date, setDate] = useState<string>(() => toISODate(new Date()));
  const [serviceTypeIndex, setServiceTypeIndex] = useState(0);
  const [slots, setSlots] = useState<FreeSlot[]>([]);
  /**
   * `false` when the centre has no slots configured for that service and
   * modality. It is kept apart from "no openings that day" so the patient is not
   * sent to try days that will have no slots either.
   */
  const [configured, setConfigured] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Catalogue from the backend.
   *
   * There used to be a fixed list of four services and one of them did not exist
   * in the database: on payment the backend answered 400 "The selected service is
   * not available". With the catalogue, what is offered is exactly what can be
   * charged, and a new service shows up without republishing the app.
   */
  const loadServices = useCallback(async () => {
    setServicesStatus('loading');
    setServicesError(null);

    try {
      const catalog = await api.get<CatalogService[]>('/services/active');
      const options = toServiceOptions(catalog);

      setServices(options);
      setServiceTypeIndex(0);
      setServicesStatus(options.length > 0 ? 'ready' : 'empty');
    } catch (err: unknown) {
      setServicesError(getErrorMessage(err, t));
      setServices([]);
      setServicesStatus('error');
    }
  }, [t]);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const serviceType = services[serviceTypeIndex];
  // Modality and duration depend on the chosen service.
  const modality = serviceType?.modality ?? 'PRESENCIAL';
  const duration = serviceType?.durationMinutes ?? 45;

  const loadSlots = useCallback(async () => {
    // Without a catalogue there is no service or duration to query yet.
    if (!serviceType) return;

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
      // The backend already drops the past; it is filtered again in case the list
      // becomes stale while the screen is open.
      const now = new Date();
      setConfigured(result.configured);
      setSlots((result.slots ?? []).filter((slot) => !hasStarted(slot.startTime, now)));
    } catch (err: unknown) {
      setError(getErrorMessage(err, t));
      setSlots([]);
    } finally {
      setLoading(false);
    }
  }, [
    date,
    duration,
    centerId,
    modality,
    preselectedStaffProfileId,
    serviceType,
    t,
  ]);

  useEffect(() => {
    if (serviceType) loadSlots();
  }, [serviceType, loadSlots]);

  const nextDays = useMemo(() => {
    const base = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(base);
      d.setDate(d.getDate() + i);
      return { value: toISODate(d), label: formatDate(d) };
    });
  }, [formatDate]);

  /** The price is shown because it is charged before confirming the appointment. */
  const serviceLabelWithPrice = (option: ServiceTypeOption) =>
    `${option.label} · ${formatAmount(option.price, option.currency)}`;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('availability.title')}</Text>
        <Text style={styles.subtitle}>{t('availability.subtitle')}</Text>
      </View>

      {servicesStatus === 'error' ? (
        <EmptyState
          title={t('availability.servicesErrorTitle')}
          description={servicesError ?? undefined}
          actionLabel={t('common.retry')}
          onAction={loadServices}
        />
      ) : servicesStatus === 'empty' ? (
        <EmptyState
          title={t('availability.noServicesTitle')}
          description={t('availability.noServicesDescription')}
        />
      ) : (
        <>
          <View style={styles.pickerSection}>
            <Text style={styles.label}>{t('availability.service')}</Text>
            <Picker
              selectedValue={String(serviceTypeIndex)}
              onValueChange={(itemValue: string) => {
                setServiceTypeIndex(Number(itemValue));
              }}
              style={styles.picker}
              enabled={servicesStatus === 'ready'}
            >
              {services.map((st, idx) => (
                <Picker.Item
                  key={st.value}
                  label={serviceLabelWithPrice(st)}
                  value={String(idx)}
                />
              ))}
            </Picker>
          </View>

          <View style={styles.pickerSection}>
            <Text style={styles.label}>{t('availability.day')}</Text>
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

          {serviceType ? (
            <Text style={styles.info}>
              {t('availability.info', {
                service: serviceType.label,
                duration,
                modality:
                  modality === 'VIRTUAL'
                    ? t('modality.virtual')
                    : t('modality.onsite'),
              })}
            </Text>
          ) : null}

          {error ? (
            <EmptyState
              title={t('availability.errorTitle')}
              description={error}
              actionLabel={t('common.retry')}
              onAction={loadSlots}
            />
          ) : loading || servicesStatus === 'loading' ? (
            <View style={styles.loading}>
              <Text style={styles.loadingText}>
                {servicesStatus === 'loading'
                  ? t('availability.loadingServices')
                  : t('availability.loading')}
              </Text>
            </View>
          ) : !configured ? (
            <EmptyState
              title={t('availability.notConfiguredTitle')}
              description={t('availability.notConfiguredDescription')}
            />
          ) : slots.length === 0 || !serviceType ? (
            <EmptyState
              title={t('availability.emptyTitle')}
              description={t('availability.emptyDescription')}
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
                      price: serviceType.price,
                      currency: serviceType.currency,
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
        </>
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
    // Control border (3.03:1). `colors.border` is the decorative hairline and
    // does not meet WCAG 1.4.11 over the app surfaces.
    borderColor: colors.borderStrong,
    borderRadius: borderRadius.md,
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
