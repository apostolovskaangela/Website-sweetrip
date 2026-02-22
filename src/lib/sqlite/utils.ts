// Helper utilities for working with the local SQLite database
// Add these to src/lib/sqlite/utils.ts

import * as dataService from './dataService';
import { Trip, User, Vehicle } from './models';

/**
 * Get dashboard stats
 */
export async function getDashboardStats() {
  const trips = await dataService.getAllTrips();
  const vehicles = await dataService.getAllVehicles();
  const drivers = await dataService.getDrivers();

  const today = new Date().toISOString().split('T')[0];
  const activeTrips = trips.filter(t => t.status === 'in_progress');
  const completedToday = trips.filter(
    t => t.trip_date === today && t.status === 'completed'
  );

  return {
    activeTrips: activeTrips.length,
    totalVehicles: vehicles.length,
    totalDrivers: drivers.length,
    completedToday: completedToday.length,
    totalDistance: trips.reduce((sum, t) => sum + (t.mileage || 0), 0),
  };
}

/**
 * Get driver with their trips
 */
export async function getDriverWithTrips(driverId: number) {
  const driver = await dataService.getUserById(driverId);
  if (!driver) return null;

  const trips = await dataService.getTripsByDriver(driverId);
  const completedTrips = trips.filter(t => t.status === 'completed');
  const activeTrips = trips.filter(t => t.status === 'in_progress');

  return {
    ...driver,
    trips,
    stats: {
      totalTrips: trips.length,
      completedTrips: completedTrips.length,
      activeTrips: activeTrips.length,
      totalDistance: trips.reduce((sum, t) => sum + (t.mileage || 0), 0),
    },
  };
}

/**
 * Get vehicle with trips and manager
 */
export async function getVehicleWithDetails(vehicleId: number) {
  const vehicle = await dataService.getVehicleById(vehicleId);
  if (!vehicle) return null;

  const trips = await dataService.getTripsByVehicle(vehicleId);
  const manager = vehicle.manager_id
    ? await dataService.getUserById(vehicle.manager_id)
    : null;

  return {
    ...vehicle,
    manager,
    trips,
    stats: {
      totalTrips: trips.length,
      completedTrips: trips.filter(t => t.status === 'completed').length,
      activeTrips: trips.filter(t => t.status !== 'completed').length,
      totalDistance: trips.reduce((sum, t) => sum + (t.mileage || 0), 0),
    },
  };
}

/**
 * Search trips by criteria
 */
export async function searchTrips(criteria: {
  driverId?: number;
  vehicleId?: number;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  let trips = await dataService.getAllTrips();

  if (criteria.driverId) {
    trips = trips.filter(t => t.driver_id === criteria.driverId);
  }

  if (criteria.vehicleId) {
    trips = trips.filter(t => t.vehicle_id === criteria.vehicleId);
  }

  if (criteria.status) {
    trips = trips.filter(t => t.status === criteria.status);
  }

  if (criteria.dateFrom) {
    trips = trips.filter(t => t.trip_date >= criteria.dateFrom!);
  }

  if (criteria.dateTo) {
    trips = trips.filter(t => t.trip_date <= criteria.dateTo!);
  }

  return trips.sort(
    (a, b) =>
      new Date(b.trip_date).getTime() - new Date(a.trip_date).getTime()
  );
}

/**
 * Create a trip with stops in one operation
 */
export async function createTripWithStops(
  trip: Omit<Trip, 'id'>,
  stops: Array<{ destination: string; stop_order: number; notes?: string }>
) {
  const createdTrip = await dataService.createTrip(trip);

  for (const stop of stops) {
    await dataService.createTripStop({
      trip_id: createdTrip.id,
      destination: stop.destination,
      stop_order: stop.stop_order,
      notes: stop.notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  return createdTrip;
}

/**
 * Get trips for a manager (including their vehicles' trips)
 */
export async function getManagerTrips(managerId: number) {
  const vehicles = await dataService.getVehiclesByManager(managerId);
  const vehicleIds = vehicles.map(v => v.id);

  const trips = await dataService.getAllTrips();
  return trips.filter(t => vehicleIds.includes(t.vehicle_id));
}

/**
 * Get statistics for a manager
 */
export async function getManagerStats(managerId: number) {
  const trips = await getManagerTrips(managerId);
  const vehicles = await dataService.getVehiclesByManager(managerId);
  const drivers = await dataService.getUsersByManager(managerId);

  const activeTrips = trips.filter(t => t.status === 'in_progress');
  const completedTrips = trips.filter(t => t.status === 'completed');

  return {
    vehicleCount: vehicles.length,
    driverCount: drivers.length,
    totalTrips: trips.length,
    activeTrips: activeTrips.length,
    completedTrips: completedTrips.length,
    totalDistance: trips.reduce((sum, t) => sum + (t.mileage || 0), 0),
    averageDistance: trips.length > 0 
      ? trips.reduce((sum, t) => sum + (t.mileage || 0), 0) / trips.length 
      : 0,
  };
}

/**
 * Reset database to initial state
 */
export async function resetDatabase() {
  console.warn('⚠️ Resetting database to initial state');
  return dataService.resetDatabase();
}

/**
 * Export database state
 */
export async function exportDatabase() {
  const state = await dataService.getDatabase_State();
  return JSON.stringify(state, null, 2);
}

/**
 * Get all data with relationships loaded
 */
export async function getAllDataWithRelations() {
  const trips = await dataService.getAllTrips();
  const vehicles = await dataService.getAllVehicles();
  const users = await dataService.getAllUsers();

  return {
    trips: await Promise.all(
      trips.map(t => dataService.getTripWithRelations(t.id))
    ),
    vehicles: await Promise.all(
      vehicles.map(async v => {
        const manager = v.manager_id
          ? await dataService.getUserById(v.manager_id)
          : null;
        return { ...v, manager };
      })
    ),
    users,
  };
}
