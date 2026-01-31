import { platformSelect } from '@/src/config/platform';
import { Platform, ViewStyle } from 'react-native';

/**
 * Platform-specific style helpers.
 * Use these when you need shadows, elevation, or touch feedback that differs by platform.
 */

/** Card/panel shadow for iOS (shadow*) and Android (elevation) */
export function cardShadow(androidElevation = 3): Pick<ViewStyle, 'shadowColor' | 'shadowOffset' | 'shadowOpacity' | 'shadowRadius' | 'elevation'> {
  if (Platform.OS === 'android') {
    return { elevation: androidElevation };
  }
  return {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: androidElevation,
  };
}

/** Stronger shadow for modals or floating elements */
export function modalShadow(): Pick<ViewStyle, 'shadowColor' | 'shadowOffset' | 'shadowOpacity' | 'shadowRadius' | 'elevation'> {
  if (Platform.OS === 'android') {
    return { elevation: 8 };
  }
  return {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  };
}

/** Tab bar / bottom nav platform-specific height and shadow */
export function tabBarExtraStyle(): { height?: number; paddingBottom?: number } & ReturnType<typeof cardShadow> {
  const bottomInset = platformSelect({ ios: 34, android: 0, default: 0 });
  return {
    paddingBottom: bottomInset,
    ...cardShadow(5),
  };
}

/** Header style: elevation for Android, subtle shadow for iOS */
export function headerShadow(): Pick<ViewStyle, 'shadowColor' | 'shadowOffset' | 'shadowOpacity' | 'shadowRadius' | 'elevation'> {
  if (Platform.OS === 'android') {
    return { elevation: 2 };
  }
  return {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  };
}
