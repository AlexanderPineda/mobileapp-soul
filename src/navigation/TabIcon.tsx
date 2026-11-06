import React from 'react';
import { StyleSheet, Text, TextStyle } from 'react-native';

export function TabIcon({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: TextStyle;
}) {
  return (
    // `allowFontScaling={false}`: con Dynamic Type alto el emoji desborda la
    // altura fija de la tab bar y rompe el layout.
    <Text style={[styles.element, style]} allowFontScaling={false}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  element: {
    textAlign: 'center',
  },
});
