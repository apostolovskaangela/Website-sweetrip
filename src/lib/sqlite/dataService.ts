/**
 * Local Data Service - Simulates API calls using local db.json
 * This service provides in-memory data management with localStorage support
 */

import { Role, Trip, TripStop, User, Vehicle } from './models';

interface Database {
  users: User[];
  vehicles: Vehicle[];
  trips: Trip[];
  trip_stops: TripStop[];
  roles: Role[];
}

let dbData: Database | null = null;
let nextIds: { [key: string]: number } = {};
const STORAGE_KEY = 'SWEETTRIP_LOCAL_DB_V4';
const REMOTE_DB_URL = '/api/db';

function hasLocalStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function toFiniteId(value: unknown): number | null {
  const n = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : value == null ? NaN : Number(value);
  return Number.isFinite(n) ? n : null;
}

function maxFiniteId(items: { id: unknown }[] | null | undefined): number {
  const ids = (items ?? [])
    .map((i) => toFiniteId((i as any)?.id))
    .filter((n): n is number => n != null && n !== 0);
  return ids.length ? Math.max(...ids) : 0;
}

function sanitizeIds(db: Database) {
  // Normalize shape for older cached DBs (avoid "arr is not iterable")
  (db as any).users = Array.isArray((db as any).users) ? (db as any).users : [];
  (db as any).vehicles = Array.isArray((db as any).vehicles) ? (db as any).vehicles : [];
  (db as any).trips = Array.isArray((db as any).trips) ? (db as any).trips : [];
  (db as any).trip_stops = Array.isArray((db as any).trip_stops) ? (db as any).trip_stops : [];
  (db as any).roles = Array.isArray((db as any).roles) ? (db as any).roles : [];

  // If any entries have invalid ids (null/undefined/NaN/0), assign new ones
  // and keep referential integrity for trip_stops.trip_id.
  const tripIdMap = new Map<any, number>();

  let maxTripId = maxFiniteId(db.trips as any);
  for (const t of db.trips as any[]) {
    const current = toFiniteId(t?.id);
    if (current == null || current === 0) {
      const next = ++maxTripId;
      tripIdMap.set(t?.id, next);
      t.id = next;
    }
  }

  // Trip stops
  let maxStopId = maxFiniteId(db.trip_stops as any);
  for (const s of db.trip_stops as any[]) {
    const sid = toFiniteId(s?.id);
    if (sid == null || sid === 0) {
      s.id = ++maxStopId;
    }
    const tid = toFiniteId(s?.trip_id);
    if (tid == null || tid === 0) {
      // if it was null/0, we can't know which trip it belonged to; keep as-is
      // (better than attaching to the wrong trip). UI won't show these stops anyway.
      continue;
    }
  }

  // Users/Vehicles/Roles: ensure ids are finite and non-zero (no cross-table refs used in this local layer)
  const fixTable = (arr: unknown, key: keyof typeof nextIds) => {
    const rows: any[] = Array.isArray(arr) ? (arr as any[]) : [];
    let maxId = maxFiniteId(rows);
    for (const row of rows) {
      const id = toFiniteId(row?.id);
      if (id == null || id === 0) row.id = ++maxId;
    }
    nextIds[key] = maxId;
  };

  fixTable((db as any).users, 'users');
  fixTable((db as any).vehicles, 'vehicles');
  fixTable((db as any).roles, 'roles');

  // Persist any fixes
  persistDb();
}

function persistDb() {
  if (!dbData) return;

  // Always keep a local cache for faster loads / offline fallback.
  if (hasLocalStorage()) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(dbData));
    } catch {
      // ignore quota / disabled storage
    }
  }

  // In production we persist to a shared server DB so other devices see changes.
  // Failures are ignored to keep the app usable offline.
  if (typeof import.meta !== 'undefined' && (import.meta as any).env?.PROD) {
    try {
      fetch(REMOTE_DB_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ db: dbData }),
      }).catch(() => {});
    } catch {
      // ignore
    }
  }
}

function tryLoadFromStorage(): Database | null {
  if (!hasLocalStorage()) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Database;
  } catch {
    return null;
  }
}

function isValidDatabaseShape(value: any): value is Database {
  return (
    value &&
    Array.isArray(value.users) &&
    Array.isArray(value.vehicles) &&
    Array.isArray(value.trips) &&
    Array.isArray(value.trip_stops) &&
    Array.isArray(value.roles)
  );
}

/**
 * Initialize the local database from db.json
 */
export async function initializeLocalDatabase(): Promise<void> {
  try {
    const stored = tryLoadFromStorage();

    // PROD: prefer shared remote DB; fallback to local cache / static seed.
    const isProd = typeof import.meta !== 'undefined' && (import.meta as any).env?.PROD;
    if (isProd) {
      try {
        const remote = await fetch(REMOTE_DB_URL);
        if (remote.ok) {
          const data = await remote.json();
          if (isValidDatabaseShape(data)) {
            dbData = data;
          }
        }
      } catch {
        // ignore; will fall back below
      }
    }

    if (!dbData && stored && isValidDatabaseShape(stored)) {
      dbData = stored;
    } else if (!dbData && stored && hasLocalStorage()) {
      // Corrupted/partial cached DB from an older version → clear cache
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
    }

    if (!dbData) {
      // Seed from static file
      const response = await fetch('/api/db.json');
      if (!response.ok) {
        throw new Error(`Failed to load db.json: ${response.statusText}`);
      }
      const data = await response.json();
      dbData = data;
      persistDb();
    }

    if (!dbData) {
      throw new Error('Failed to initialize database');
    }

    // Fix up any invalid/missing ids from older cached DBs.
    sanitizeIds(dbData);

    // Calculate next IDs for each table
    nextIds = {
      users: maxFiniteId(dbData?.users as any),
      vehicles: maxFiniteId(dbData?.vehicles as any),
      trips: maxFiniteId(dbData?.trips as any),
      trip_stops: maxFiniteId(dbData?.trip_stops as any),
      roles: maxFiniteId(dbData?.roles as any),
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
  const current = nextIds[table] ?? 0;
  const next = current + 1;
  nextIds[table] = next;
  return next;
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
  persistDb();
  return newUser;
}

export async function updateUser(id: number, updates: Partial<User>): Promise<User | null> {
  const db = getDatabase();
  const user = findOne(db.users, u => u.id === id);
  if (!user) return null;
  Object.assign(user, updates);
  persistDb();
  return user;
}

export async function deleteUser(id: number): Promise<boolean> {
  const db = getDatabase();

  // Prevent deleting a driver that has trips (avoids orphaning trip.driver_id references)
  const hasTrips = db.trips.some((t: any) => String((t as any)?.driver_id) === String(id));
  if (hasTrips) {
    throw new Error('Cannot delete driver: driver has trips assigned');
  }

  const index = db.users.findIndex(u => u.id === id);
  if (index === -1) return false;
  db.users.splice(index, 1);
  persistDb();
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
  const reg = (vehicle.registration_number ?? '').trim();
  if (reg) {
    const exists = findOne(
      db.vehicles,
      (v) => String(v.registration_number ?? '').trim().toLowerCase() === reg.toLowerCase()
    );
    if (exists) {
      throw new Error('Registration number already exists');
    }
  }
  const newVehicle: Vehicle = {
    ...vehicle,
    id: getNextId('vehicles'),
  };
  db.vehicles.push(newVehicle);
  persistDb();
  return newVehicle;
}

export async function updateVehicle(id: number, updates: Partial<Vehicle>): Promise<Vehicle | null> {
  const db = getDatabase();
  const vehicle = findOne(db.vehicles, v => v.id === id);
  if (!vehicle) return null;
  if (updates.registration_number != null) {
    const reg = String(updates.registration_number ?? '').trim();
    if (reg) {
      const exists = findOne(
        db.vehicles,
        (v) =>
          v.id !== id && String(v.registration_number ?? '').trim().toLowerCase() === reg.toLowerCase()
      );
      if (exists) {
        throw new Error('Registration number already exists');
      }
    }
  }
  Object.assign(vehicle, updates);
  persistDb();
  return vehicle;
}

export async function deleteVehicle(id: number): Promise<boolean> {
  const db = getDatabase();

  // Prevent deleting vehicles that are referenced by trips
  const hasTrips = db.trips.some((t: any) => String((t as any)?.vehicle_id) === String(id));
  if (hasTrips) {
    throw new Error('Cannot delete vehicle: vehicle is used by existing trips');
  }

  const index = db.vehicles.findIndex(v => v.id === id);
  if (index === -1) return false;
  db.vehicles.splice(index, 1);
  persistDb();
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
  const tripNumber = String((trip as any).trip_number ?? '').trim();
  if (!tripNumber) {
    throw new Error('Trip number is required');
  }
  const exists = findOne(
    db.trips,
    (t) => String((t as any).trip_number ?? '').trim().toLowerCase() === tripNumber.toLowerCase()
  );
  if (exists) {
    throw new Error('Trip number already exists');
  }
  const newTrip: Trip = {
    ...trip,
    id: getNextId('trips'),
  };
  db.trips.push(newTrip);
  persistDb();
  return newTrip;
}

export async function updateTrip(id: number, updates: Partial<Trip>): Promise<Trip | null> {
  const db = getDatabase();
  const trip = findOne(db.trips, t => t.id === id);
  if (!trip) return null;
  if ((updates as any).trip_number != null) {
    const tripNumber = String((updates as any).trip_number ?? '').trim();
    if (!tripNumber) {
      throw new Error('Trip number is required');
    }
    const exists = findOne(
      db.trips,
      (t) =>
        t.id !== id && String((t as any).trip_number ?? '').trim().toLowerCase() === tripNumber.toLowerCase()
    );
    if (exists) {
      throw new Error('Trip number already exists');
    }
  }
  Object.assign(trip, updates);
  persistDb();
  return trip;
}

export async function deleteTrip(id: number): Promise<boolean> {
  const db = getDatabase();
  const index = db.trips.findIndex(t => t.id === id);
  if (index === -1) return false;
  db.trips.splice(index, 1);
  
  // Also delete associated trip stops
  while (true) {
    const stopIndex = db.trip_stops.findIndex((ts) => ts.trip_id === id);
    if (stopIndex === -1) break;
    db.trip_stops.splice(stopIndex, 1);
  }
  
  persistDb();
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
  persistDb();
  return newStop;
}

export async function updateTripStop(id: number, updates: Partial<TripStop>): Promise<TripStop | null> {
  const db = getDatabase();
  const stop = findOne(db.trip_stops, ts => ts.id === id);
  if (!stop) return null;
  Object.assign(stop, updates);
  persistDb();
  return stop;
}

export async function deleteTripStop(id: number): Promise<boolean> {
  const db = getDatabase();
  const index = db.trip_stops.findIndex(ts => ts.id === id);
  if (index === -1) return false;
  db.trip_stops.splice(index, 1);
  persistDb();
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
