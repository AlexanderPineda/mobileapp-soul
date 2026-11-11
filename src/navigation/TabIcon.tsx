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
    // `allowFontScaling={false}`: with a high Dynamic Type the emoji overflows the
    // fixed tab bar height and breaks the layout. The emoji is decorative: the
    // tab label is already provided by `title` in the navigator.
    <Text
      style={[styles.element, style]}
      allowFontScaling={false}
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  element: {
    textAlign: 'center',
  },
});
