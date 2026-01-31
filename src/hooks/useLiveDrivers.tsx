import { useEffect, useState } from 'react';
import axiosClient from '@/src/services/axiosClient';
import * as Location from 'expo-location';
import { Platform } from 'react-native';

export interface LiveDriver {
  id: number;
  name?: string;
  lat: string | number;
  lng: string | number;
  last_location_at?: string;
}

export function useLiveDrivers(driverId: number, pollingInterval = 5000) {
  const [drivers, setDrivers] = useState<LiveDriver[]>([]);
  const [locationGranted, setLocationGranted] = useState(false);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    let locationSubscription: Location.LocationSubscription;

    const API_BASE =
      Platform.OS === 'android'
        ? 'http://10.0.2.2:8000/api/driver'
        : 'http://192.168.1.103:8000/api/driver';

    async function requestLocationPermission() {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationGranted(status === 'granted');
      return status === 'granted';
    }

    async function fetchDrivers() {
      try {
        const res = await axiosClient.get<LiveDriver[]>(`${API_BASE}/live-positions`);
        console.log('📍 Fetched drivers:', res.data);
        setDrivers(res.data);
      } catch (err) {
        console.error('Error fetching driver positions:', err);
      }
    }

    async function startLocationTracking() {
      const granted = await requestLocationPermission();
      if (!granted) return;

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      try {
        await axiosClient.post(`${API_BASE}/update-location`, {
          lat: currentLocation.coords.latitude,
          lng: currentLocation.coords.longitude,
        });
      } catch (err) {
        console.error('Error sending driver location:', err);
      }

      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        async (location) => {
          console.log('🧭 Updated location:', location.coords);
          try {
            await axiosClient.post(`${API_BASE}/update-location`, {
              lat: location.coords.latitude,
              lng: location.coords.longitude,
            });
          } catch (err) {
            console.error('Error sending driver location:', err);
          }
        }
      );
    }

    fetchDrivers();
    intervalId = setInterval(fetchDrivers, pollingInterval);
    startLocationTracking();

    return () => {
      clearInterval(intervalId);
      locationSubscription?.remove();
    };
  }, [driverId, pollingInterval]);

  return { drivers, locationGranted };
}
