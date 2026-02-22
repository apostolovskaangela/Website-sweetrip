import React, { useEffect, useRef } from 'react';
import { Animated, StyleProp, ViewStyle } from 'react-native';

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** milliseconds */
  durationMs?: number;
  /** pixels */
  fromY?: number;
};

export function FadeIn({ children, style, durationMs = 240, fromY = 10 }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(fromY)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: durationMs, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: durationMs, useNativeDriver: true }),
    ]).start();
  }, [durationMs, fromY, opacity, translateY]);

  return (
    <Animated.View style={[{ opacity, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  );
}

