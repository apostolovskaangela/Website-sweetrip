import React from 'react';
import { Chip } from '@mui/material';

type Props = {
  status?: string | null;
  label?: string | null;
  size?: 'small' | 'medium';
};

function statusColor(status: string | null | undefined): 'default' | 'warning' | 'info' | 'success' {
  switch (status) {
    case 'not_started':
      return 'warning';
    case 'in_process':
    case 'in_progress':
      return 'info';
    case 'started':
      return 'info';
    case 'completed':
      return 'success';
    default:
      return 'default';
  }
}

function pretty(status: string | null | undefined) {
  if (!status) return 'Unknown';
  return status.replace(/_/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
}

export function StatusChip({ status, label, size = 'small' }: Props) {
  return (
    <Chip
      size={size}
      color={statusColor(status)}
      label={label || pretty(status)}
      variant={statusColor(status) === 'default' ? 'outlined' : 'filled'}
      sx={{
        fontWeight: 700,
        borderRadius: 999,
      }}
    />
  );
}

