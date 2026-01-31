import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  onPress?: () => void;
};

export default function OfflineIndicator({ onPress }: Props) {
  const [queueCount, setQueueCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    async function update() {
      const raw = await AsyncStorage.getItem('OFFLINE_QUEUE_V1');
      if (!mounted) return;
      try {
        const q = raw ? JSON.parse(raw) : [];
        setQueueCount(q.length || 0);
      } catch {
        setQueueCount(0);
      }
    }
    update();
    const id = setInterval(update, 5000);
    return () => { mounted = false; clearInterval(id); };
  }, []);

  if (queueCount === 0) return null;

  return (
    <TouchableOpacity onPress={onPress} style={styles.container} activeOpacity={0.8}>
      <View style={styles.badge}>
        <MaterialIcons name="cloud-off" size={18} color="#fff" />
        <Text style={styles.count}>{queueCount}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
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
});
