import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Marker style for other drivers
  markerStyle: {
    backgroundColor: '#001F3F', // dark blue
    padding: 6,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 28,
    minHeight: 28,
  },
  driverMarkerText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },

  // Marker style for yourself (optional)
  myMarker: {
    backgroundColor: '#FF4136', // red/orange
    padding: 6,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 28,
    minHeight: 28,
  },
  myMarkerText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  zoomControls: {
    position: 'absolute',
    top: 16,
    right: 16,
    gap: 10,
    zIndex: 1000,           // make sure it's on top of the map
    elevation: 1000,        // needed for Android
  },
  zoomButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noLocationMarker: {
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 10
  },
  noLocationText: {
    color: 'white',
  },
  calloutContainer: {
    maxWidth: 240,
  },
  calloutTitle: {
    fontWeight: '700',
  }

});
