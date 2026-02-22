import React, { useMemo, useRef } from 'react';
import { Animated, StyleProp, ViewStyle } from 'react-native';
import { Button, useTheme } from 'react-native-paper';

type Props = React.ComponentProps<typeof Button> & {
  containerStyle?: StyleProp<ViewStyle>;
};

/**
 * A themed primary button with subtle press animation.
 * Uses React Native Paper for platform-correct visuals + accessibility.
 */
export function PrimaryButton({ containerStyle, style, onPressIn, onPressOut, ...rest }: Props) {
  const theme = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  const animatedStyle = useMemo(
    () => ({
      transform: [{ scale }],
    }),
    [scale]
  );

  return (
    <Animated.View style={[animatedStyle, containerStyle as any]}>
      <Button
        mode="contained"
        onPressIn={(e) => {
          Animated.spring(scale, { toValue: 0.98, useNativeDriver: true, speed: 40, bounciness: 0 }).start();
          onPressIn?.(e);
        }}
        onPressOut={(e) => {
          Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 0 }).start();
          onPressOut?.(e);
        }}
        style={[
          {
            borderRadius: 12,
            backgroundColor: theme.colors.primary,
          },
          style,
        ]}
        {...rest}
      />
    </Animated.View>
  );
}

