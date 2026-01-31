import { Dimensions, PixelRatio, Platform } from 'react-native';

/**
 * Platform-specific integration config.
 * Use these flags and helpers for consistent behavior across iOS, Android, and Web.
 */

export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';
export const isWeb = Platform.OS === 'web';

/** Current platform for conditional logic */
export const platform = Platform.OS as 'ios' | 'android' | 'web';

/**
 * Platform.select with typed return.
 * Usage: platformSelect({ ios: 20, android: 24, default: 16 })
 */
export function platformSelect<T>(config: {
  ios?: T;
  android?: T;
  web?: T;
  default: T;
}): T {
  return Platform.select(config) ?? config.default;
}

/** Safe area bottom inset (e.g. for tab bar) - 0 on Android, 34 on iOS with home indicator */
export const safeAreaBottomInset = platformSelect({
  ios: 34,
  android: 0,
  web: 0,
  default: 0,
});

/** Default horizontal padding for screens */
export const screenPaddingHorizontal = platformSelect({
  ios: 16,
  android: 16,
  web: 24,
  default: 16,
});

/** Status bar style: 'light-content' | 'dark-content' */
export const statusBarStyle = platformSelect({
  ios: 'dark-content' as const,
  android: 'dark-content' as const,
  default: 'dark-content' as const,
});

/** Whether the device has a notch / dynamic island (simplified) */
export const hasNotch = isIOS; // Can be refined with react-native-device-info if needed

/** Normalize size for different pixel densities */
export function normalize(size: number): number {
  const { width: SCREEN_WIDTH } = Dimensions.get('window');
  const scale = SCREEN_WIDTH / 375;
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
}
