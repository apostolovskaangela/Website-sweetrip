import React from 'react';
import { ScrollView, StyleProp, useWindowDimensions, View, ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';
import { screenPaddingHorizontal } from '@/src/config/platform';

type Props = {
  children: React.ReactNode;
  /**
   * When true, wraps content in a ScrollView.
   * Default: false (regular View).
   */
  scroll?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

export function Screen({ children, scroll = false, style, contentStyle, accessibilityLabel }: Props) {
  const theme = useTheme();
  const { width } = useWindowDimensions();

  const maxWidth = width >= 860 ? 920 : undefined;
  const horizontalPadding = width >= 860 ? screenPaddingHorizontal : screenPaddingHorizontal;

  const baseContainer: ViewStyle = {
    flex: 1,
    backgroundColor: theme.colors.background,
  };

  const inner: ViewStyle = {
    flexGrow: 1,
    paddingHorizontal: horizontalPadding,
    paddingVertical: 16,
    alignSelf: maxWidth ? 'center' : 'stretch',
    width: maxWidth ? '100%' : 'auto',
    maxWidth,
  };

  if (scroll) {
    return (
      <ScrollView
        style={[baseContainer, style]}
        contentContainerStyle={[inner, contentStyle]}
        accessibilityLabel={accessibilityLabel}
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <View style={[baseContainer, style]} accessibilityLabel={accessibilityLabel}>
      <View style={[inner, contentStyle]}>{children}</View>
    </View>
  );
}

