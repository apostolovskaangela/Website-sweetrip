import type { MD3Theme } from 'react-native-paper';

export function getBrandGradient(theme: MD3Theme): string[] {
  // Keep the "Sweetrip" look, but support a true dark variant.
  if (theme.dark) {
    return ['#0B1220', '#0A2540', '#1B0E2B'];
  }
  return ['hsl(217, 91%, 35%)', 'hsl(200, 94%, 55%)', 'hsl(25, 95%, 53%)'];
}

