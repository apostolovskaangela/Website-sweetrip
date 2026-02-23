import { storage } from '@/src/services/storage';
import * as dataService from '@/src/lib/sqlite/dataService';

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
  const raw = await storage.getItem(QUEUE_KEY);
  return raw ? JSON.parse(raw) : [];
}

async function saveQueue(queue: OfflineRequest[]) {
  await storage.setItem(QUEUE_KEY, JSON.stringify(queue));
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
      await applyOfflineRequest(item);
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

export async function processQueueItem(id: string) {
  const queue = await getQueue();
  const idx = queue.findIndex((q) => q.id === id);
  if (idx < 0) return false;

  const item = queue[idx];
  try {
    await applyOfflineRequest(item);
    if (__DEV__) console.log('✅ Synced offline request', item.id, item.method, item.url);
    const next = queue.filter((q) => q.id !== id);
    await saveQueue(next);
    return true;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (__DEV__) console.warn('⏳ Failed to sync request, will retry later', item.id, msg);
    return false;
  }
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
  processQueueItem,
  startBackgroundSync,
  stopBackgroundSync,
  clearQueue,
};

async function applyOfflineRequest(item: OfflineRequest) {
  // The app currently enqueues only a small set of mutations.
  // Apply them directly to the local data store (no axios / no react-native).
  const url = item.url;

  if (item.method === 'POST' && url === '/trips') {
    const body = item.body ?? {};
    // If already applied locally (e.g. created while offline), treat as success.
    if (body?.trip_number) {
      const existing = await dataService.getTripByNumber(String(body.trip_number));
      if (existing) return;
    }
    const created = await dataService.createTrip({
      trip_number: body.trip_number,
      vehicle_id: Number(body.vehicle_id),
      driver_id: Number(body.driver_id),
      a_code: body.a_code,
      destination_from: body.destination_from,
      destination_to: body.destination_to,
      status: body.status || 'not_started',
      mileage: body.mileage,
      driver_description: body.driver_description,
      admin_description: body.admin_description,
      trip_date: body.trip_date,
      invoice_number: body.invoice_number,
      amount: body.amount,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as any);

    if (Array.isArray(body.stops)) {
      for (const stop of body.stops) {
        if (!stop?.destination) continue;
        await dataService.createTripStop({
          trip_id: created.id,
          destination: stop.destination,
          stop_order: Number(stop.stop_order ?? 1),
          notes: stop.notes,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as any);
      }
    }

    return;
  }

  const tripPut = url.match(/^\/trips\/(\d+)$/);
  if (item.method === 'PUT' && tripPut) {
    const id = Number(tripPut[1]);
    const updated = await dataService.updateTrip(id, item.body ?? {});
    if (!updated) throw new Error(`Trip ${id} not found`);
    return;
  }

  const tripDelete = url.match(/^\/trips\/(\d+)$/);
  if (item.method === 'DELETE' && tripDelete) {
    const id = Number(tripDelete[1]);
    const ok = await dataService.deleteTrip(id);
    if (!ok) throw new Error(`Trip ${id} not found`);
    return;
  }

  throw new Error(`Unsupported offline request: ${item.method} ${url}`);
}
