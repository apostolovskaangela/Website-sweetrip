import React, { useMemo, useRef } from 'react';
import { Animated } from 'react-native';
import { IconButton, useTheme } from 'react-native-paper';
import { useThemeMode } from '@/src/hooks/useThemeMode';

type Props = {
  size?: number;
  accessibilityLabel?: string;
};

export function ThemeToggleButton({ size = 22, accessibilityLabel = 'Toggle dark mode' }: Props) {
  const theme = useTheme();
  const { scheme, toggle } = useThemeMode();
  const rotation = useRef(new Animated.Value(0)).current;

  const icon = scheme === 'dark' ? 'white-balance-sunny' : 'weather-night';

  const rotate = useMemo(
    () =>
      rotation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '90deg'],
      }),
    [rotation]
  );

  return (
    <Animated.View style={{ transform: [{ rotate }] }}>
      <IconButton
        icon={icon}
        size={size}
        onPress={() => {
          rotation.setValue(0);
          Animated.timing(rotation, { toValue: 1, duration: 180, useNativeDriver: true }).start(() => {
            rotation.setValue(0);
          });
          toggle();
        }}
        accessibilityLabel={accessibilityLabel}
        iconColor={theme.colors.onSurface}
      />
    </Animated.View>
  );
}

