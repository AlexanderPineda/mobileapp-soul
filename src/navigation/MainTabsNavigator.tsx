import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HomeScreen } from '../screens/HomeScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { useI18n } from '../i18n/I18nProvider';
import type { MainTabsParamList } from './types';
import { TabIcon } from './TabIcon';
import { colors } from '../styles/theme';

const Tab = createBottomTabNavigator<MainTabsParamList>();

/** Altura del contenido de la tab bar, sin el inset del sistema. */
const TAB_BAR_HEIGHT = 60;

/**
 * Los iconos se definen fuera del componente para evitar recrearlos en cada
 * render (regla `react/no-unstable-nested-components`).
 */
const homeIcon = () => <TabIcon>🏠</TabIcon>;
const profileIcon = () => <TabIcon>👤</TabIcon>;

export function MainTabsNavigator() {
  /**
   * Con edge-to-edge activo (Android 15+ y `edgeToEdgeEnabled=true`) la barra de
   * navegación del sistema se dibuja encima de la app. Al fijar `height` hay que
   * sumar el inset inferior a mano; de lo contrario las etiquetas quedan tapadas
   * en los iPhone con home indicator y en Android con navegación por gestos.
   */
  const insets = useSafeAreaInsets();
  const { t } = useI18n();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingTop: 8,
          paddingBottom: insets.bottom + 8,
          height: TAB_BAR_HEIGHT + insets.bottom,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: t('home.tab'), tabBarIcon: homeIcon }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: t('profile.tab'), tabBarIcon: profileIcon }}
      />
    </Tab.Navigator>
  );
}
