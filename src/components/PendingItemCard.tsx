import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  id: string;
  method: string;
  url: string;
  body?: any;
  onRetry?: (id: string) => void;
  onRemove?: (id: string) => void;
};

export default function PendingItemCard({ id, method, url, body, onRetry, onRemove }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.left}>
        <Text style={styles.method}>{method}</Text>
        <Text numberOfLines={1} style={styles.url}>{url}</Text>
        {body ? <Text numberOfLines={1} style={styles.body}>{JSON.stringify(body)}</Text> : null}
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => onRetry?.(id)} style={styles.actionBtn}>
          <Text style={styles.actionText}>Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onRemove?.(id)} style={[styles.actionBtn, styles.remove]}>
          <Text style={styles.actionText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  actionBtn: { paddingHorizontal: 8, paddingVertical: 6, backgroundColor: '#007AFF', borderRadius: 6, marginLeft: 8 },
  remove: { backgroundColor: '#D9534F' },
  actionText: { color: '#fff', fontWeight: '600' },
});
