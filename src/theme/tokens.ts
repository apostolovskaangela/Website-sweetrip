import { normalize } from '@/src/config/platform';

export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
} as const;

export const space = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  '2xl': 32,
} as const;

export const type = {
  title: normalize(28),
  h1: normalize(24),
  h2: normalize(20),
  body: normalize(16),
  caption: normalize(13),
} as const;

