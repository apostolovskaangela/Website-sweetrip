import * as Location from 'expo-location';

import axiosClient from '@/src/services/axiosClient';

let subscription: Location.LocationSubscription | null = null;

export async function requestForegroundLocationPermission(): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
}

export async function startUserForegroundTracking(): Promise<void> {
  // Avoid starting multiple watchers.
  if (subscription) return;

  // Send an initial position (best effort)
  try {
    const current = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    await axiosClient.post('/driver/update-location', {
      lat: current.coords.latitude,
      lng: current.coords.longitude,
    });
  } catch (e) {
    // Ignore (permissions/timeout/etc.)
    console.log( `Error updating location ${e}`)
  }

  subscription = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.High,
      timeInterval: 5000,
      distanceInterval: 10,
    },
    (loc) => {
      axiosClient
        .post('/driver/update-location', {
          lat: loc.coords.latitude,
          lng: loc.coords.longitude,
        })
        .catch(() => {});
    }
  );
}

export function stopUserForegroundTracking() {
  subscription?.remove();
  subscription = null;
}

// Backwards-compatible exports (older code paths in this repo)
export const startDriverForegroundTracking = startUserForegroundTracking;
export const stopDriverForegroundTracking = stopUserForegroundTracking;

