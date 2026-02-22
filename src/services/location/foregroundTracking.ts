import { AuthRepository } from '@/src/context/Auth/repository';
import * as dataService from '@/src/lib/sqlite/dataService';

let watchId: number | null = null;

export async function requestForegroundLocationPermission(): Promise<boolean> {
  // On the web, permissions are handled by the browser prompt when requesting position.
  return typeof navigator !== 'undefined' && !!navigator.geolocation;
}

async function updateLocation(lat: number, lng: number) {
  const user = await AuthRepository.getUser();
  if (!user) return;
  await dataService.updateUser(user.id, {
    last_latitude: lat as any,
    last_longitude: lng as any,
    last_location_at: new Date().toISOString() as any,
  } as any);
}

export async function startUserForegroundTracking(): Promise<void> {
  // Avoid starting multiple watchers.
  if (watchId != null) return;
  if (typeof navigator === 'undefined' || !navigator.geolocation) return;

  // Initial update (best effort)
  try {
    await new Promise<void>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          updateLocation(pos.coords.latitude, pos.coords.longitude).catch(() => {});
          resolve();
        },
        (err) => reject(err),
        { enableHighAccuracy: true, timeout: 5000 }
      );
    });
  } catch {
    // ignore
  }

  watchId = navigator.geolocation.watchPosition(
    (pos) => {
      updateLocation(pos.coords.latitude, pos.coords.longitude).catch(() => {});
    },
    () => {
      // ignore
    },
    { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
  );
}

export function stopUserForegroundTracking() {
  if (watchId != null && typeof navigator !== 'undefined' && navigator.geolocation) {
    navigator.geolocation.clearWatch(watchId);
  }
  watchId = null;
}

// Backwards-compatible exports (older code paths in this repo)
export const startDriverForegroundTracking = startUserForegroundTracking;
export const stopDriverForegroundTracking = stopUserForegroundTracking;

