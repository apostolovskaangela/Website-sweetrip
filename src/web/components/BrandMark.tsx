import React from 'react';
import { Box } from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

export function BrandMark({ size = 56, variant = 'gradient' }: { size?: number; variant?: 'gradient' | 'orange' }) {
  const bg =
    variant === 'orange'
      ? 'linear-gradient(135deg, #ff7a18 0%, #ffb347 100%)'
      : 'linear-gradient(135deg, rgba(0,122,255,1) 0%, rgba(0,255,204,1) 120%)';
  const iconColor = variant === 'orange' ? '#ffffff' : '#0b1220';

  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: '16px',
        display: 'grid',
        placeItems: 'center',
        background: bg,
        boxShadow:
          variant === 'orange' ? '0 10px 22px rgba(255,122,24,0.22)' : '0 10px 26px rgba(0,122,255,0.28)',
      }}
    >
      <LocalShippingIcon sx={{ color: iconColor, fontSize: Math.round(size * 0.58) }} />
    </Box>
  );
}

