import { useColorScheme } from 'react-native';
import { MD3DarkTheme, MD3LightTheme, type MD3Theme } from 'react-native-paper';
import { Colors } from '@/src/constants/theme';

export type AppColorScheme = 'light' | 'dark';

export function getAppColorScheme(scheme: string | null | undefined): AppColorScheme {
  return scheme === 'dark' ? 'dark' : 'light';
}

/**
 * Centralized theme for React Native Paper (MD3).
 * Keep this small + semantic; screens should avoid hard-coded colors.
 */
export function createPaperTheme(appScheme: AppColorScheme): MD3Theme {
  const base = appScheme === 'dark' ? MD3DarkTheme : MD3LightTheme;
  const c = Colors[appScheme];

  return {
    ...base,
    colors: {
      ...base.colors,
      primary: c.tint,
      onPrimary: appScheme === 'dark' ? '#000' : '#fff',
      background: c.background,
      surface: c.background,
      onSurface: c.text,
      onSurfaceVariant: c.icon,
      outline: appScheme === 'dark' ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.14)',
    },
  };
}

export function usePaperTheme(): MD3Theme {
  const scheme = useColorScheme();
  return createPaperTheme(getAppColorScheme(scheme));
}

