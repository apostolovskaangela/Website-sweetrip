import * as Location from 'expo-location';
import { socketService } from '../realtime/socket';

export async function startDriverTracking(driverId: number) {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') return;

  await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.High,
      timeInterval: 3000, // every 3s
      distanceInterval: 10, // or every 10m
    },
    (location) => {
      socketService.send({
        type: 'driver_location_update',
        payload: {
          driverId,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          timestamp: Date.now(),
        },
      });
    }
  );
}
