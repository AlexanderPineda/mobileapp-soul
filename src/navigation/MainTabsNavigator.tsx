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

/** Tab bar content height, without the system inset. */
const TAB_BAR_HEIGHT = 60;

/**
 * Icons are defined outside the component to avoid recreating them on every
 * render (`react/no-unstable-nested-components` rule).
 */
const homeIcon = () => <TabIcon>🏠</TabIcon>;
const profileIcon = () => <TabIcon>👤</TabIcon>;

export function MainTabsNavigator() {
  /**
   * With edge-to-edge on (Android 15+ and `edgeToEdgeEnabled=true`) the system
   * navigation bar is drawn over the app. When setting a fixed `height` the
   * bottom inset has to be added by hand; otherwise the labels end up covered on
   * iPhones with a home indicator and on Android with gesture navigation.
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
