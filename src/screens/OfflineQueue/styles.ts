import { StyleSheet } from 'react-native';
import { MD3Theme } from 'react-native-paper';

export const makeStyles = (theme: MD3Theme) =>
  StyleSheet.create({
  containerQueue: { flex: 1, padding: 16, backgroundColor: theme.colors.elevation.level1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: { fontSize: 20, fontWeight: '700' },
  clearBtn: {
    backgroundColor: theme.colors.error,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  clearText: { color: '#fff', fontWeight: '700' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: theme.colors.onSurfaceVariant },
});
