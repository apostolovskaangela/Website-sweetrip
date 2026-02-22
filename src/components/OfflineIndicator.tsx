import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useIsOffline } from '@/src/hooks/useIsOffline';
import { styles } from './styles';

type Props = {
  onPress?: () => void;
};

export default function OfflineIndicator({ onPress }: Props) {
  const [queueCount, setQueueCount] = useState(0);
  const isOffline = useIsOffline();

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

  if (!isOffline || queueCount === 0) return null;

  return (
    <TouchableOpacity onPress={onPress} style={styles.container} activeOpacity={0.8}>
      <View style={styles.badge}>
        <MaterialIcons name="cloud-off" size={18} color="#fff" />
        <Text style={styles.count}>{queueCount}</Text>
      </View>
    </TouchableOpacity>
  );
}
