import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { createPaperTheme, getAppColorScheme, type AppColorScheme } from '@/src/theme/paperTheme';

export type ThemeMode = 'system' | 'light' | 'dark';

type ThemeContextValue = {
  mode: ThemeMode;
  scheme: AppColorScheme;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
};

const STORAGE_KEY = 'APP_THEME_MODE_V1';

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!mounted) return;
        if (raw === 'light' || raw === 'dark' || raw === 'system') {
          setModeState(raw);
        }
      })
      .finally(() => {
        if (mounted) setHydrated(true);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const scheme: AppColorScheme = useMemo(() => {
    const sys = getAppColorScheme(systemScheme);
    return mode === 'system' ? sys : mode;
  }, [mode, systemScheme]);

  const theme = useMemo(() => createPaperTheme(scheme), [scheme]);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  }, []);

  const toggle = useCallback(() => {
    // Toggle against the currently effective scheme (not the stored mode).
    setMode(scheme === 'dark' ? 'light' : 'dark');
  }, [scheme, setMode]);

  // Avoid theme "flash" on startup by still rendering, but with stable default.
  // `hydrated` is kept for future enhancements (e.g., splash sync) without breaking.
  void hydrated;

  return (
    <ThemeContext.Provider value={{ mode, scheme, setMode, toggle }}>
      <PaperProvider theme={theme}>
        <StatusBar barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'} />
        {children}
      </PaperProvider>
    </ThemeContext.Provider>
  );
};

