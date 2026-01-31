import Offline, { OfflineRequest } from '@/src/services/offline';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import PendingItemCard from './PendingItemCard';

export default function OfflineQueueScreen() {
  const [items, setItems] = useState<OfflineRequest[]>([]);

  async function load() {
    const raw = await AsyncStorage.getItem('OFFLINE_QUEUE_V1');
    if (!raw) { setItems([]); return; }
    try {
      setItems(JSON.parse(raw));
    } catch { setItems([]); }
  }

  useEffect(() => { load(); const id = setInterval(load, 3000); return () => clearInterval(id); }, []);

  async function handleRetry(id: string) {
    // attempt to process queue and then reload
    await Offline.processQueue();
    await load();
  }

  async function handleRemove(id: string) {
    const raw = await AsyncStorage.getItem('OFFLINE_QUEUE_V1');
    if (!raw) return;
    try {
      const q: OfflineRequest[] = JSON.parse(raw);
      const filtered = q.filter(i => i.id !== id);
      await AsyncStorage.setItem('OFFLINE_QUEUE_V1', JSON.stringify(filtered));
      setItems(filtered);
    } catch (e) { if (__DEV__) console.warn(e); }
  }

  async function clearAll() {
    Alert.alert('Clear queue', 'Remove all pending offline requests?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: async () => { await Offline.clearQueue(); load(); } },
    ]);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Offline Queue</Text>
        <TouchableOpacity onPress={clearAll} style={styles.clearBtn}><Text style={styles.clearText}>Clear All</Text></TouchableOpacity>
      </View>
      {items.length === 0 ? (
        <View style={styles.empty}><Text style={styles.emptyText}>No pending requests</Text></View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <PendingItemCard id={item.id} method={item.method} url={item.url} body={item.body} onRetry={handleRetry} onRemove={handleRemove} />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F5F7FA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  title: { fontSize: 20, fontWeight: '700' },
  clearBtn: { backgroundColor: '#D9534F', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  clearText: { color: '#fff', fontWeight: '700' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: '#666' },
});
