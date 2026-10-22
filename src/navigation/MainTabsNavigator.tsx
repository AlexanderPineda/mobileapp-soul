import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { HomeScreen } from '../screens/HomeScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import type { MainTabsParamList } from './types';
import { TabIcon } from './TabIcon';

const Tab = createBottomTabNavigator<MainTabsParamList>();

/**
 * Los iconos se definen fuera del componente para evitar recrearlos en cada
 * render (regla `react/no-unstable-nested-components`).
 */
const homeIcon = () => <TabIcon>🏠</TabIcon>;
const profileIcon = () => <TabIcon>👤</TabIcon>;

export function MainTabsNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#4F46E5',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          paddingTop: 8,
          height: 76,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Inicio', tabBarIcon: homeIcon }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Perfil', tabBarIcon: profileIcon }}
      />
    </Tab.Navigator>
  );
}
