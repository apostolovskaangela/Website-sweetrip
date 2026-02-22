import React from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

import { WebThemeContext } from '@/src/web/theme/WebThemeProvider';

export function AuthShell({ children }: { children: React.ReactNode }) {
  const themeCtx = React.useContext(WebThemeContext);
  const scheme = themeCtx?.scheme ?? 'light';
  const isDark = scheme === 'dark';

  const bg = isDark
    ? 'linear-gradient(135deg, #061022 0%, #0b1220 42%, #071b1f 100%)'
    : 'linear-gradient(135deg, #0b1220 0%, #10335e 35%, #00ffcc 160%)';

  return (
    <Box
      sx={{
        minHeight: '100%',
        position: 'relative',
        px: 2,
        py: { xs: 4, sm: 6 },
        backgroundImage: bg,
        overflow: 'hidden',
      }}
    >
      {/* subtle glow */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          opacity: isDark ? 0.35 : 0.55,
          background:
            'radial-gradient(900px 420px at 18% 12%, rgba(0,122,255,0.45), transparent 60%), radial-gradient(900px 420px at 78% 20%, rgba(0,255,204,0.35), transparent 60%)',
        }}
      />

      <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Tooltip title="Toggle theme">
          <IconButton
            onClick={() => themeCtx?.toggle?.()}
            sx={{
              color: 'rgba(255,255,255,0.92)',
              backgroundColor: 'rgba(255,255,255,0.12)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.16)',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.18)' },
            }}
          >
            {isDark ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ position: 'relative' }}>{children}</Box>
    </Box>
  );
}

