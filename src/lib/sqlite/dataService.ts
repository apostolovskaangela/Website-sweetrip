/**
 * Local Data Service - Simulates API calls using local db.json
 * This service provides in-memory data management with localStorage support
 */

import { User, Vehicle, Trip, TripStop, Role } from './models';

interface Database {
  users: User[];
  vehicles: Vehicle[];
  trips: Trip[];
  trip_stops: TripStop[];
  roles: Role[];
}

let dbData: Database | null = null;
let nextIds: { [key: string]: number } = {};

/**
 * Initialize the local database from db.json
 */
export async function initializeLocalDatabase(): Promise<void> {
  try {
    // For Expo, we'll use a public/api/db.json file
    const response = await fetch('/api/db.json');
    if (!response.ok) {
      throw new Error(`Failed to load db.json: ${response.statusText}`);
    }

    const data = await response.json();
    dbData = data;

    // Calculate next IDs for each table
    nextIds = {
      users: Math.max(...(dbData?.users?.map(u => u.id) || [0])) + 1,
      vehicles: Math.max(...(dbData?.vehicles?.map(v => v.id) || [0])) + 1,
      trips: Math.max(...(dbData?.trips?.map(t => t.id) || [0])) + 1,
      trip_stops: Math.max(...(dbData?.trip_stops?.map(ts => ts.id) || [0])) + 1,
      roles: Math.max(...(dbData?.roles?.map(r => r.id) || [0])) + 1,
    };

    console.log('✅ Local database initialized successfully');
  } catch (error) {
    console.error('Error initializing local database:', error);
    throw error;
  }
}

/**
 * Get the current database state
 */
function getDatabase(): Database {
  if (!dbData) {
    throw new Error('Database not initialized. Call initializeLocalDatabase() first');
  }
  return dbData;
}

/**
 * Get next ID for a table
 */
function getNextId(table: string): number {
  return (nextIds[table] = (nextIds[table] || 1) + 1);
}

/**
 * Find an item by predicate
 */
function findOne<T>(array: T[], predicate: (item: T) => boolean): T | null {
  return array.find(predicate) || null;
}

/**
 * Find all items by predicate
 */
function findMany<T>(array: T[], predicate: (item: T) => boolean): T[] {
  return array.filter(predicate);
}

// ============== USER OPERATIONS ==============

export async function getAllUsers(): Promise<User[]> {
  const db = getDatabase();
  return [...db.users];
}

export async function getUserById(id: number): Promise<User | null> {
  const db = getDatabase();
  return findOne(db.users, u => u.id === id);
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const db = getDatabase();
  return findOne(db.users, u => u.email === email);
}

export async function getUsersByRole(roleId: number): Promise<User[]> {
  const db = getDatabase();
  return findMany(db.users, u => u.role_id === roleId);
}

export async function getDrivers(): Promise<User[]> {
  const db = getDatabase();
  return findMany(db.users, u => u.role_id === 4);
}

export async function getManagers(): Promise<User[]> {
  const db = getDatabase();
  return findMany(db.users, u => u.role_id === 2);
}

export async function getUsersByManager(managerId: number): Promise<User[]> {
  const db = getDatabase();
  return findMany(db.users, u => u.manager_id === managerId);
}

export async function createUser(user: Omit<User, 'id'>): Promise<User> {
  const db = getDatabase();
  const newUser: User = {
    ...user,
    id: getNextId('users'),
  };
  db.users.push(newUser);
  return newUser;
}

export async function updateUser(id: number, updates: Partial<User>): Promise<User | null> {
  const db = getDatabase();
  const user = findOne(db.users, u => u.id === id);
  if (!user) return null;
  Object.assign(user, updates);
  return user;
}

export async function deleteUser(id: number): Promise<boolean> {
  const db = getDatabase();
  const index = db.users.findIndex(u => u.id === id);
  if (index === -1) return false;
  db.users.splice(index, 1);
  return true;
}

// ============== VEHICLE OPERATIONS ==============

export async function getAllVehicles(): Promise<Vehicle[]> {
  const db = getDatabase();
  return [...db.vehicles];
}

export async function getVehicleById(id: number): Promise<Vehicle | null> {
  const db = getDatabase();
  return findOne(db.vehicles, v => v.id === id);
}

export async function getVehiclesByManager(managerId: number): Promise<Vehicle[]> {
  const db = getDatabase();
  return findMany(db.vehicles, v => v.manager_id === managerId);
}

export async function getActiveVehicles(): Promise<Vehicle[]> {
  const db = getDatabase();
  return findMany(db.vehicles, v => (v.is_active as any) === 1 || v.is_active === true);
}

export async function getVehiclesByRegistration(registration: string): Promise<Vehicle | null> {
  const db = getDatabase();
  return findOne(db.vehicles, v => v.registration_number === registration);
}

export async function createVehicle(vehicle: Omit<Vehicle, 'id'>): Promise<Vehicle> {
  const db = getDatabase();
  const newVehicle: Vehicle = {
    ...vehicle,
    id: getNextId('vehicles'),
  };
  db.vehicles.push(newVehicle);
  return newVehicle;
}

export async function updateVehicle(id: number, updates: Partial<Vehicle>): Promise<Vehicle | null> {
  const db = getDatabase();
  const vehicle = findOne(db.vehicles, v => v.id === id);
  if (!vehicle) return null;
  Object.assign(vehicle, updates);
  return vehicle;
}

export async function deleteVehicle(id: number): Promise<boolean> {
  const db = getDatabase();
  const index = db.vehicles.findIndex(v => v.id === id);
  if (index === -1) return false;
  db.vehicles.splice(index, 1);
  return true;
}

// ============== TRIP OPERATIONS ==============

export async function getAllTrips(): Promise<Trip[]> {
  const db = getDatabase();
  return [...db.trips];
}

export async function getTripById(id: number): Promise<Trip | null> {
  const db = getDatabase();
  return findOne(db.trips, t => t.id === id);
}

export async function getTripByNumber(tripNumber: string): Promise<Trip | null> {
  const db = getDatabase();
  return findOne(db.trips, t => t.trip_number === tripNumber);
}

export async function getTripsByDriver(driverId: number): Promise<Trip[]> {
  const db = getDatabase();
  return findMany(db.trips, t => t.driver_id === driverId).sort(
    (a, b) => new Date(b.trip_date).getTime() - new Date(a.trip_date).getTime()
  );
}

export async function getTripsByVehicle(vehicleId: number): Promise<Trip[]> {
  const db = getDatabase();
  return findMany(db.trips, t => t.vehicle_id === vehicleId).sort(
    (a, b) => new Date(b.trip_date).getTime() - new Date(a.trip_date).getTime()
  );
}

export async function getTripsByStatus(status: string): Promise<Trip[]> {
  const db = getDatabase();
  return findMany(db.trips, t => t.status === status).sort(
    (a, b) => new Date(b.trip_date).getTime() - new Date(a.trip_date).getTime()
  );
}

export async function getTripsByDate(date: string): Promise<Trip[]> {
  const db = getDatabase();
  return findMany(db.trips, t => t.trip_date === date);
}

export async function getTripsByDateRange(startDate: string, endDate: string): Promise<Trip[]> {
  const db = getDatabase();
  return findMany(
    db.trips,
    t => t.trip_date >= startDate && t.trip_date <= endDate
  ).sort((a, b) => new Date(b.trip_date).getTime() - new Date(a.trip_date).getTime());
}

export async function createTrip(trip: Omit<Trip, 'id'>): Promise<Trip> {
  const db = getDatabase();
  const newTrip: Trip = {
    ...trip,
    id: getNextId('trips'),
  };
  db.trips.push(newTrip);
  return newTrip;
}

export async function updateTrip(id: number, updates: Partial<Trip>): Promise<Trip | null> {
  const db = getDatabase();
  const trip = findOne(db.trips, t => t.id === id);
  if (!trip) return null;
  Object.assign(trip, updates);
  return trip;
}

export async function deleteTrip(id: number): Promise<boolean> {
  const db = getDatabase();
  const index = db.trips.findIndex(t => t.id === id);
  if (index === -1) return false;
  db.trips.splice(index, 1);
  
  // Also delete associated trip stops
  const stopIndex = db.trip_stops.findIndex(ts => ts.trip_id === id);
  while (stopIndex !== -1) {
    db.trip_stops.splice(stopIndex, 1);
  }
  
  return true;
}

export async function updateTripStatus(id: number, status: string): Promise<Trip | null> {
  return updateTrip(id, { status } as Partial<Trip>);
}

export async function getActiveTripsForManager(managerId: number): Promise<Trip[]> {
  const db = getDatabase();
  return findMany(
    db.trips,
    t => {
      const vehicle = findOne(db.vehicles, v => v.id === t.vehicle_id);
      return vehicle?.manager_id === managerId && t.status !== 'completed';
    }
  ).sort((a, b) => new Date(b.trip_date).getTime() - new Date(a.trip_date).getTime());
}

export async function getTripWithRelations(id: number) {
  const db = getDatabase();
  const trip = findOne(db.trips, t => t.id === id);
  if (!trip) return null;

  const driver = findOne(db.users, u => u.id === trip.driver_id);
  const vehicle = findOne(db.vehicles, v => v.id === trip.vehicle_id);
  const stops = findMany(db.trip_stops, ts => ts.trip_id === trip.id).sort((a, b) => a.stop_order - b.stop_order);
  const creator = trip.created_by ? findOne(db.users, u => u.id === trip.created_by) : undefined;

  return {
    ...trip,
    driver,
    vehicle,
    stops,
    creator,
  };
}

// ============== TRIP STOP OPERATIONS ==============

export async function getTripStopsByTrip(tripId: number): Promise<TripStop[]> {
  const db = getDatabase();
  return findMany(db.trip_stops, ts => ts.trip_id === tripId).sort(
    (a, b) => a.stop_order - b.stop_order
  );
}

export async function createTripStop(stop: Omit<TripStop, 'id'>): Promise<TripStop> {
  const db = getDatabase();
  const newStop: TripStop = {
    ...stop,
    id: getNextId('trip_stops'),
  };
  db.trip_stops.push(newStop);
  return newStop;
}

export async function updateTripStop(id: number, updates: Partial<TripStop>): Promise<TripStop | null> {
  const db = getDatabase();
  const stop = findOne(db.trip_stops, ts => ts.id === id);
  if (!stop) return null;
  Object.assign(stop, updates);
  return stop;
}

export async function deleteTripStop(id: number): Promise<boolean> {
  const db = getDatabase();
  const index = db.trip_stops.findIndex(ts => ts.id === id);
  if (index === -1) return false;
  db.trip_stops.splice(index, 1);
  return true;
}

// ============== ROLE OPERATIONS ==============

export async function getAllRoles(): Promise<Role[]> {
  const db = getDatabase();
  return [...db.roles];
}

export async function getRoleById(id: number): Promise<Role | null> {
  const db = getDatabase();
  return findOne(db.roles, r => r.id === id);
}

export async function getRoleByName(name: string): Promise<Role | null> {
  const db = getDatabase();
  return findOne(db.roles, r => r.name === name);
}

// ============== UTILITY ==============

export async function resetDatabase(): Promise<void> {
  console.warn('⚠️ Resetting database to initial state');
  await initializeLocalDatabase();
}

export async function getDatabase_State(): Promise<Database> {
  return getDatabase();
}
