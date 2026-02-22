import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosClient from './axiosClient';

const QUEUE_KEY = 'OFFLINE_QUEUE_V1';

export type OfflineRequest = {
  id: string;
  method: 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  body?: any;
  headers?: Record<string, string>;
  timestamp: number;
};

async function getQueue(): Promise<OfflineRequest[]> {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  return raw ? JSON.parse(raw) : [];
}

async function saveQueue(queue: OfflineRequest[]) {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export async function enqueueRequest(req: Omit<OfflineRequest, 'id' | 'timestamp'>) {
  const queue = await getQueue();
  const item: OfflineRequest = {
    ...req,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    timestamp: Date.now(),
  };
  queue.push(item);
  await saveQueue(queue);
  if (__DEV__) console.log('🔁 Enqueued offline request', item);
  return item.id;
}

export async function processQueue(limit = 10) {
  const queue = await getQueue();
  if (!queue.length) return;

  if (__DEV__) console.log(`🔄 Processing offline queue (${queue.length})`);

  const remaining: OfflineRequest[] = [];

  for (const item of queue.slice(0, limit)) {
    try {
      const config: any = {
        method: item.method,
        url: item.url,
        data: item.body,
        headers: item.headers || {},
      };
      await axiosClient.request(config);
      if (__DEV__) console.log('✅ Synced offline request', item.id, item.method, item.url);
    } catch (err: unknown) {
      // Keep the item for later retry
      const msg = err instanceof Error ? err.message : String(err);
      if (__DEV__) console.warn('⏳ Failed to sync request, will retry later', item.id, msg);
      remaining.push(item);
    }
  }

  // append any unprocessed items beyond the slice + those that failed
  const rest = queue.slice(limit).concat(remaining);
  await saveQueue(rest);
}

let syncInterval: NodeJS.Timeout | null = null;

export function startBackgroundSync(intervalMs = 30_000) {
  // avoid multiple intervals
  if (syncInterval) return;
  // run immediately then schedule
  processQueue().catch(() => {});
  syncInterval = setInterval(() => {
    processQueue().catch(() => {});
  }, intervalMs) as unknown as NodeJS.Timeout;
}

export function stopBackgroundSync() {
  if (syncInterval) {
    clearInterval(syncInterval as any);
    syncInterval = null;
  }
}

export async function clearQueue() {
  await saveQueue([]);
}

export default {
  enqueueRequest,
  processQueue,
  startBackgroundSync,
  stopBackgroundSync,
  clearQueue,
};
