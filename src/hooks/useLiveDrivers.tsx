import axiosClient from '@/src/services/axiosClient';
import { useEffect, useRef, useState } from 'react';

export interface LiveDriver {
  id: number;
  name?: string;
  role?: string;
  lat: string | number;
  lng: string | number;
  last_location_at?: string;
}

export function useLiveDrivers(_driverId?: number, interval = 5000) {
  const [drivers, setDrivers] = useState<LiveDriver[]>([]);
  const intervalIdRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    function fetchDrivers() {
      axiosClient
        .get<LiveDriver[]>(`/driver/live-positions`)
        .then((res) => {
          if (__DEV__) console.log('📍 Fetched drivers:', res.data);
          setDrivers(res.data);
        })
        .catch((err) => console.error('Error fetching driver positions:', err));
    }

    fetchDrivers();
    intervalIdRef.current = setInterval(fetchDrivers, interval);

    return () => {
      if (intervalIdRef.current != null) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    };
  }, [interval]);

  return { drivers };
}
