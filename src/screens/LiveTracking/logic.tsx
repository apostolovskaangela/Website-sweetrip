import { useEffect, useMemo, useRef } from 'react';
import { Platform } from 'react-native';
import { useLiveDrivers } from '@/src/hooks/useLiveDrivers';
import { useAuth } from '@/src/hooks/useAuth';
import type MapViewType from 'react-native-maps';

/* -----------------------------
 * Types
 * ----------------------------- */
export interface Driver {
  id: number;
  name?: string;
  role?: string;
  lat?: number | null;
  lng?: number | null;
  last_location_at?: string;
}

/* -----------------------------
 * Helpers
 * ----------------------------- */
export function initials(name?: string) {
  const cleaned = (name ?? '').trim();
  if (!cleaned) return 'U';
  const parts = cleaned.split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || 'U';
}

/* -----------------------------
 * Hook
 * ----------------------------- */
export function useLiveTracking(mapRef: React.RefObject<MapViewType | null>) {
  const { user } = useAuth();
  const myId = Number(user?.id);
  const { drivers } = useLiveDrivers(myId);
  const markerRefs = useRef<Record<number, { showCallout?: () => void; hideCallout?: () => void } | null>>({});

  const ZOOM_STEP = 1;

  const visibleDrivers = drivers.filter(d => d.lat != null && d.lng != null);

  const coords = useMemo(
    () => visibleDrivers.map(d => ({ latitude: Number(d.lat), longitude: Number(d.lng) })),
    [visibleDrivers]
  );

  useEffect(() => {
    if (!mapRef.current || coords.length === 0) return;
    mapRef.current.fitToCoordinates(coords, {
      edgePadding: { top: 80, right: 80, bottom: 80, left: 80 },
      animated: true,
    });
  }, [coords, mapRef]);

  const webHoverPropsForDriver = (driverId: number) => {
    if (Platform.OS !== 'web') return {};
    return {
      onMouseEnter: () => markerRefs.current[driverId]?.showCallout?.(),
      onMouseLeave: () => markerRefs.current[driverId]?.hideCallout?.(),
    } as any;
  };

  const zoomIn = async () => {
    if (!mapRef.current) return;
    const camera = await mapRef.current.getCamera();
    mapRef.current.animateCamera({ zoom: (camera.zoom ?? 0) + ZOOM_STEP }, { duration: 200 });
  };

  const zoomOut = async () => {
    if (!mapRef.current) return;
    const camera = await mapRef.current.getCamera();
    mapRef.current.animateCamera({ zoom: Math.max((camera.zoom ?? 0) - ZOOM_STEP, 0) }, { duration: 200 });
  };

  return {
    myId,
    visibleDrivers,
    markerRefs,
    webHoverPropsForDriver,
    zoomIn,
    zoomOut,
    coords,
  };
}
