import React, { useEffect, useMemo, useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import MapView, { Callout, Marker } from 'react-native-maps';
import { useLiveDrivers } from '@/src/hooks/useLiveDrivers';
import { useAuth } from '@/src/hooks/useAuth';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from './styles';

function initials(name?: string) {
  const cleaned = (name ?? '').trim();
  if (!cleaned) return 'U';
  const parts = cleaned.split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || 'U';
}

export function LiveTracking() {
  const { user } = useAuth();
  const myId = Number(user?.id);
  const { drivers } = useLiveDrivers(myId);
  const mapRef = useRef<MapView | null>(null);
  const ZOOM_STEP = 1;

  const zoomIn = async () => {
    if (!mapRef.current) return;
    const camera = await mapRef.current.getCamera();
    mapRef.current.animateCamera(
      { zoom: (camera.zoom ?? 0) + ZOOM_STEP },
      { duration: 200 }
    );
  };

  const zoomOut = async () => {
    if (!mapRef.current) return;
    const camera = await mapRef.current.getCamera();
    mapRef.current.animateCamera(
      { zoom: Math.max((camera.zoom ?? 0) - ZOOM_STEP, 0) },
      { duration: 200 }
    );
  };


  // Filter only drivers with valid coordinates
  const visibleDrivers = drivers.filter(
    d => d.lat != null && d.lng != null
  );

  const coords = useMemo(
    () =>
      visibleDrivers.map((d) => ({
        latitude: Number(d.lat),
        longitude: Number(d.lng),
      })),
    [visibleDrivers]
  );

  // Auto-fit camera like Find My when we have markers
  useEffect(() => {
    if (!mapRef.current) return;
    if (coords.length === 0) return;
    mapRef.current.fitToCoordinates(coords, {
      edgePadding: { top: 80, right: 80, bottom: 80, left: 80 },
      animated: true,
    });
  }, [coords]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}        // uses absoluteFill
        initialRegion={{
          latitude: 41.9981,
          longitude: 21.4254,
          latitudeDelta: 0.08,
          longitudeDelta: 0.08,
        }}
      >
        {visibleDrivers.length === 0 && (
          <Marker
            coordinate={{ latitude: 41.9981, longitude: 21.4254 }}
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges={false}
          >
            <View style={{ padding: 10, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 10 }}>
              <Text style={{ color: 'white' }}>
                No shared locations yet. Ask users to allow location on login.
              </Text>
            </View>
          </Marker>
        )}
        {visibleDrivers.map((driver) => (
          <Marker
            key={driver.id}
            coordinate={{
              latitude: Number(driver.lat),
              longitude: Number(driver.lng),
            }}
          >
            <View style={driver.id === myId ? styles.myMarker : styles.markerStyle}>
              <Text style={driver.id === myId ? styles.myMarkerText : styles.driverMarkerText}>
                {initials(driver.name)}
              </Text>
            </View>
            <Callout>
              <View style={{ maxWidth: 240 }}>
                <Text style={{ fontWeight: '700' }}>{driver.name ?? 'Unknown'}</Text>
                {!!driver.role && <Text>{driver.role}</Text>}
                {!!driver.last_location_at && <Text>Updated: {driver.last_location_at}</Text>}
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Zoom controls overlay */}
      <View style={styles.zoomControls}>
        <TouchableOpacity style={styles.zoomButton} onPress={zoomIn}>
          <MaterialCommunityIcons name="plus" size={22} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.zoomButton} onPress={zoomOut}>
          <MaterialCommunityIcons name="minus" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>

  );
}

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   map: { flex: 1 },
//   center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
// });
