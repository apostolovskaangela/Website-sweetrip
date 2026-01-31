import axiosClient from '@/src/services/axiosClient';
import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
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
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const intervalIdRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const API_BASE =
      Platform.OS === 'android'
        ? 'http://10.0.2.2:8000/api/driver'
        : 'http://192.168.1.103:8000/api/driver';

    async function requestLocationPermission() {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationGranted(status === 'granted');
      return status === 'granted';
    }

    function fetchDrivers() {
      axiosClient
        .get<LiveDriver[]>(`${API_BASE}/live-positions`)
        .then((res) => {
          if (__DEV__) console.log('📍 Fetched drivers:', res.data);
          setDrivers(res.data);
        })
        .catch((err) => console.error('Error fetching driver positions:', err));
    }

    async function startLocationTracking() {
      const granted = await requestLocationPermission();
      if (!granted) return;

      try {
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        await axiosClient.post(`${API_BASE}/update-location`, {
          lat: currentLocation.coords.latitude,
          lng: currentLocation.coords.longitude,
        });
      } catch (err) {
        console.error('Error sending driver location:', err);
      }

      const sub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (location) => {
          if (__DEV__) console.log('🧭 Updated location:', location.coords);
          axiosClient
            .post(`${API_BASE}/update-location`, {
              lat: location.coords.latitude,
              lng: location.coords.longitude,
            })
            .catch((err) => console.error('Error sending driver location:', err));
        }
      );
      subscriptionRef.current = sub;
    }

    fetchDrivers();
    intervalIdRef.current = setInterval(fetchDrivers, pollingInterval);
    startLocationTracking();

    return () => {
      if (intervalIdRef.current != null) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
      if (subscriptionRef.current != null) {
        subscriptionRef.current.remove();
        subscriptionRef.current = null;
      }
    };
  }, [driverId, pollingInterval]);

  return { drivers, locationGranted };
}
