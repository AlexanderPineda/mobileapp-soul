import React from 'react';
import { StyleSheet, Text, TextStyle } from 'react-native';

export function TabIcon({ children, style }: { children: React.ReactNode; style?: TextStyle }) {
  return <Text style={[styles.element, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  element: {
    textAlign: 'center',
  },
});
