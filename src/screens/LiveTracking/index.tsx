import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useLiveDrivers } from '@/src/hooks/useLiveDrivers';
import { useAuth } from '@/src/hooks/useAuth';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from './styles';

export function LiveTracking() {
  const { user } = useAuth(); // logged-in driver
  const { drivers, locationGranted } = useLiveDrivers(user?.id);

  if (!locationGranted) {
    return (
      <View style={styles.center}>
        <Text>Please allow location permissions to start tracking</Text>
      </View>
    );
  }

  // Filter only drivers with valid coordinates
  const visibleDrivers = drivers.filter(
    d => d.lat != null && d.lng!= null
  );

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 41.9981,
          longitude: 21.4254,
          latitudeDelta: 0.08,
          longitudeDelta: 0.08,
        }}
      >
        {!locationGranted ? (
          <View style={styles.center}>
            <Text>Please allow location sharing to be visible on the map</Text>
          </View>
        ) : (
          drivers.map((driver) => (
            <Marker
              key={driver.id}
              coordinate={{
                latitude: Number(driver.lat),
                longitude: Number(driver.lng),
              }}
            >
              <View style={styles.markerStyle}>
                <Text style={{ color: 'white', fontWeight: 'bold' }}>
                  {driver.name?.split(' ').map(n => n[0]).join('') || 'U'}
                </Text>
              </View>
            </Marker>
          ))
        )}

      </MapView>
    </View>
  );
}

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   map: { flex: 1 },
//   center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
// });
