import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    marginRight: 8,
  },
  badge: {
    backgroundColor: '#D9534F',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  count: {
    color: '#fff',
    marginLeft: 6,
    fontWeight: '600',
  },
  card: {
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  left: { flex: 1, paddingRight: 8 },
  method: { fontWeight: '700', marginBottom: 4 },
  url: { color: '#666' },
  body: { color: '#999', marginTop: 6, fontSize: 12 },
  actions: { flexDirection: 'row' },
  actionBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: '#007AFF',
    borderRadius: 6,
    marginLeft: 8,
  },
  remove: { backgroundColor: '#D9534F' },
  actionText: { color: '#fff', fontWeight: '600' },
});
