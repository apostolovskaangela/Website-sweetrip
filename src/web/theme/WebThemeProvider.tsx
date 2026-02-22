import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';

export type ThemeMode = 'system' | 'light' | 'dark';
export type AppColorScheme = 'light' | 'dark';

type ThemeContextValue = {
  mode: ThemeMode;
  scheme: AppColorScheme;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
};

const STORAGE_KEY = 'APP_THEME_MODE_V1';

export const WebThemeContext = createContext<ThemeContextValue | null>(null);

function getSystemScheme(): AppColorScheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ? 'dark' : 'light';
}

export const WebThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [systemScheme, setSystemScheme] = useState<AppColorScheme>(getSystemScheme());

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw === 'light' || raw === 'dark' || raw === 'system') setModeState(raw);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mq) return;
    const onChange = () => setSystemScheme(getSystemScheme());
    onChange();
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  const scheme: AppColorScheme = useMemo(() => (mode === 'system' ? systemScheme : mode), [mode, systemScheme]);

  const muiTheme = useMemo(() => {
    const light = {
      background: '#F6F8FC',
      paper: '#FFFFFF',
      text: '#0b1220',
    };
    const dark = {
      background: '#0b1220',
      paper: '#0f172a',
      text: '#E5E7EB',
    };
    const c = scheme === 'dark' ? dark : light;

    return createTheme({
      palette: {
        mode: scheme,
        primary: { main: '#007AFF' },
        secondary: { main: '#00FFCC' },
        background: {
          default: c.background,
          paper: c.paper,
        },
        text: {
          primary: c.text,
        },
      },
      shape: { borderRadius: 12 },
      typography: {
        fontFamily:
          '"Inter", ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
        h4: { fontWeight: 900, letterSpacing: -0.6 },
        h5: { fontWeight: 900, letterSpacing: -0.4 },
        h6: { fontWeight: 800, letterSpacing: -0.2 },
        button: { textTransform: 'none', fontWeight: 800 },
      },
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            body: {
              backgroundColor: c.background,
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              borderRadius: 20,
              border: `1px solid ${alpha(c.text, scheme === 'dark' ? 0.14 : 0.08)}`,
              boxShadow: scheme === 'dark' ? '0 20px 40px rgba(0,0,0,0.45)' : '0 18px 40px rgba(11,18,32,0.12)',
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: 20,
              border: `1px solid ${alpha(c.text, scheme === 'dark' ? 0.14 : 0.08)}`,
              boxShadow: scheme === 'dark' ? '0 20px 40px rgba(0,0,0,0.38)' : '0 18px 40px rgba(11,18,32,0.10)',
            },
          },
        },
        MuiButton: {
          styleOverrides: {
            root: {
              borderRadius: 14,
              paddingTop: 10,
              paddingBottom: 10,
            },
            contained: {
              boxShadow: '0 12px 24px rgba(0,122,255,0.28)',
            },
          },
        },
        MuiAppBar: {
          styleOverrides: {
            root: {
              backgroundImage:
                scheme === 'dark'
                  ? 'linear-gradient(180deg, rgba(15,23,42,0.78) 0%, rgba(15,23,42,0.62) 100%)'
                  : 'linear-gradient(180deg, rgba(255,255,255,0.78) 0%, rgba(255,255,255,0.62) 100%)',
              backdropFilter: 'blur(14px)',
              borderBottom: `1px solid ${alpha(c.text, scheme === 'dark' ? 0.16 : 0.08)}`,
            },
          },
        },
        MuiDrawer: {
          styleOverrides: {
            paper: {
              borderRight: `1px solid ${alpha(c.text, scheme === 'dark' ? 0.16 : 0.08)}`,
            },
          },
        },
      },
    });
  }, [scheme]);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
  }, []);

  const toggle = useCallback(() => {
    setMode(scheme === 'dark' ? 'light' : 'dark');
  }, [scheme, setMode]);

  return (
    <WebThemeContext.Provider value={{ mode, scheme, setMode, toggle }}>
      <ThemeProvider theme={muiTheme}>{children}</ThemeProvider>
    </WebThemeContext.Provider>
  );
};

