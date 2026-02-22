import React, { useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from './styles';
import { useLiveTracking, initials } from './logic';

export function LiveTracking() {
  const mapRef = useRef<MapView | null>(null);
  const {
    myId,
    visibleDrivers,
    markerRefs,
    webHoverPropsForDriver,
    zoomIn,
    zoomOut,
  } = useLiveTracking(mapRef);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: 41.9981,
          longitude: 21.4254,
          latitudeDelta: 0.08,
          longitudeDelta: 0.08,
        }}
      >
        {visibleDrivers.length === 0 && (
          <Marker coordinate={{ latitude: 41.9981, longitude: 21.4254 }} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false}>
            <View style={styles.noLocationMarker}>
              <Text style={styles.noLocationText}>
                No shared locations yet. Ask users to allow location on login.
              </Text>
            </View>
          </Marker>
        )}

        {visibleDrivers.map((driver) => (
          <Marker
            key={driver.id}
            ref={(ref) => { markerRefs.current[driver.id] = ref; }}
            coordinate={{ latitude: Number(driver.lat), longitude: Number(driver.lng) }}
            title={driver.name ?? 'Unknown'}
            description={driver.role ?? undefined}
            accessibilityLabel={`${driver.name ?? 'Unknown'} location marker`}
            {...webHoverPropsForDriver(driver.id)}
          >
            <View style={driver.id === myId ? styles.myMarker : styles.markerStyle}>
              <Text style={driver.id === myId ? styles.myMarkerText : styles.driverMarkerText}>
                {initials(driver.name)}
              </Text>
            </View>
            <Callout>
              <View style={styles.calloutContainer}>
                <Text style={styles.calloutTitle}>{driver.name ?? 'Unknown'}</Text>
                {!!driver.role && <Text>{driver.role}</Text>}
                {!!driver.last_location_at && <Text>Updated: {driver.last_location_at}</Text>}
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Zoom controls overlay */}
      <View style={styles.zoomControls}>
        <TouchableOpacity style={styles.zoomButton} onPress={zoomIn} accessibilityRole="button" accessibilityLabel="Zoom in" accessibilityHint="Zooms the map in" hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <MaterialCommunityIcons name="plus" size={22} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.zoomButton} onPress={zoomOut} accessibilityRole="button" accessibilityLabel="Zoom out" accessibilityHint="Zooms the map out" hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <MaterialCommunityIcons name="minus" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
