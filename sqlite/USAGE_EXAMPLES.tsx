// Example usage of SQLite database in React Native

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { databaseService } from './sqlite/init';
import { RepositoryFactory } from './sqlite/repositories';
import { Trip, User, Vehicle } from './sqlite/models';
import { SQLiteDatabase } from 'expo-sqlite';

export default function App() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [drivers, setDrivers] = useState<User[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  async function initializeApp() {
    try {
      // Initialize database
      await databaseService.initialize();

      // Get database and repositories
      const db = databaseService.getDatabase();
      const factory = new RepositoryFactory(db);

      // Load data
      const userRepo = factory.getUserRepository();
      const vehicleRepo = factory.getVehicleRepository();
      const tripRepo = factory.getTripRepository();

      const driversData = await userRepo.findDrivers();
      const vehiclesData = await vehicleRepo.findActive();
      const tripsData = await tripRepo.findAll();

      setDrivers(driversData);
      setVehicles(vehiclesData);
      setTrips(tripsData);
    } catch (error) {
      console.error('Error initializing app:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MDA App - SQLite Database</Text>

      <Text style={styles.sectionTitle}>Drivers ({drivers.length})</Text>
      <FlatList
        data={drivers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <Text>{item.name} - {item.email}</Text>}
        scrollEnabled={false}
      />

      <Text style={styles.sectionTitle}>Vehicles ({vehicles.length})</Text>
      <FlatList
        data={vehicles}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Text>{item.registrationNumber} - {item.notes}</Text>
        )}
        scrollEnabled={false}
      />

      <Text style={styles.sectionTitle}>Trips ({trips.length})</Text>
      <FlatList
        data={trips}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Text>
            {item.tripNumber}: {item.destinationFrom} → {item.destinationTo}
          </Text>
        )}
        scrollEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
});

// ============================================
// More Advanced Examples
// ============================================

/**
 * Example: Create a new trip with stops
 */
export async function createTripWithStops(
  tripNumber: string,
  vehicleId: number,
  driverId: number,
  destinationFrom: string,
  destinationTo: string,
  stops: string[]
) {
  const db = databaseService.getDatabase();
  const factory = new RepositoryFactory(db);
  const tripRepo = factory.getTripRepository();
  const stopRepo = factory.getTripStopRepository();

  // Create trip
  const tripId = await tripRepo.create({
    trip_number: tripNumber,
    vehicle_id: vehicleId,
    driver_id: driverId,
    destination_from: destinationFrom,
    destination_to: destinationTo,
    status: 'not_started',
    trip_date: new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  } as any);

  // Create trip stops
  for (let i = 0; i < stops.length; i++) {
    await stopRepo.create({
      trip_id: tripId,
      destination: stops[i],
      stop_order: i + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as any);
  }

  return tripId;
}

/**
 * Example: Get all trips for a specific driver with relations
 */
export async function getDriverTripsWithDetails(driverId: number) {
  const db = databaseService.getDatabase();
  const factory = new RepositoryFactory(db);
  const tripRepo = factory.getTripRepository();

  const trips = await tripRepo.findByDriverId(driverId);

  // Fetch full relations for each trip
  const tripsWithRelations = await Promise.all(
    trips.map((trip) => tripRepo.findWithRelations(trip.id))
  );

  return tripsWithRelations;
}

/**
 * Example: Get manager's active trips
 */
export async function getManagerActiveSummary(managerId: number) {
  const db = databaseService.getDatabase();
  const factory = new RepositoryFactory(db);

  const tripRepo = factory.getTripRepository();
  const vehicleRepo = factory.getVehicleRepository();
  const userRepo = factory.getUserRepository();

  const activeTrips = await tripRepo.getActiveTripsByManager(managerId);
  const vehicles = await vehicleRepo.findByManagerId(managerId);
  const drivers = await userRepo.findDriversByManagerId(managerId);

  return {
    activeTripsCount: activeTrips.length,
    activeTrips,
    vehicles,
    drivers,
  };
}

/**
 * Example: Update trip status
 */
export async function updateTripStatus(tripId: number, newStatus: string) {
  const db = databaseService.getDatabase();
  const factory = new RepositoryFactory(db);
  const tripRepo = factory.getTripRepository();

  await tripRepo.updateStatus(tripId, newStatus);

  // Return updated trip
  return tripRepo.findWithRelations(tripId);
}

/**
 * Example: Search trips by date range
 */
export async function searchTripsByDateRange(
  startDate: string,
  endDate: string
) {
  const db = databaseService.getDatabase();
  const factory = new RepositoryFactory(db);
  const tripRepo = factory.getTripRepository();

  const trips = await tripRepo.findByDateRange(startDate, endDate);

  // Optionally add relations
  const tripsWithRelations = await Promise.all(
    trips.map((trip) => tripRepo.findWithRelations(trip.id))
  );

  return tripsWithRelations;
}

/**
 * Example: Get dashboard stats
 */
export async function getDashboardStats() {
  const db = databaseService.getDatabase();
  const factory = new RepositoryFactory(db);

  const userRepo = factory.getUserRepository();
  const vehicleRepo = factory.getVehicleRepository();
  const tripRepo = factory.getTripRepository();

  const totalUsers = await userRepo.count();
  const totalDrivers = (await userRepo.findDrivers()).length;
  const totalVehicles = await vehicleRepo.count();
  const totalTrips = await tripRepo.count();
  const completedTrips = (await tripRepo.findByStatus('completed')).length;
  const inProgressTrips = (await tripRepo.findByStatus('in_progress')).length;

  return {
    totalUsers,
    totalDrivers,
    totalVehicles,
    totalTrips,
    completedTrips,
    inProgressTrips,
    pendingTrips: totalTrips - completedTrips - inProgressTrips,
  };
}
