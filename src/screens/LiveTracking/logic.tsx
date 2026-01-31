import { useEffect, useState } from 'react';
import { socketService } from '@/src/services/realtime/socket';

/* -----------------------------
 * Types
 * ----------------------------- */

export interface LiveDriver {
  driverId: number;
  name?: string;
  latitude: number;
  longitude: number;
}

interface DriverLocationMessage {
  type: 'driver_location_update';
  payload: {
    driverId: number;
    latitude: number;
    longitude: number;
    name?: string;
  };
}

/* -----------------------------
 * Hook
 * ----------------------------- */

export function useLiveDrivers(token: string) {
  const [drivers, setDrivers] = useState<Record<number, LiveDriver>>({});

  useEffect(() => {
    if (!token) return;

    const socket = socketService.connect(token);

    socket.onmessage = (event) => {
      try {
        const message: DriverLocationMessage = JSON.parse(event.data);

        if (message.type !== 'driver_location_update') return;

        const { driverId, latitude, longitude, name } = message.payload;

        setDrivers((prev) => ({
          ...prev,
          [driverId]: {
            driverId,
            latitude,
            longitude,
            name,
          },
        }));
      } catch (err) {
        console.warn('Invalid WS message:', err);
      }
    };

    return () => {
      socketService.disconnect();
    };
  }, [token]);

  return Object.values(drivers);
}
